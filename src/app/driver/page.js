'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '../../lib/supabaseClient';
import { subscribeDriverToPush } from '../../lib/webPush';
import DriverBottomNav from '../../components/DriverBottomNav';

const Map = dynamic(() => import('../../components/Map'), { ssr: false, loading: () => <div style={{ background: '#eee', height: '100%' }} /> });

export default function DriverDashboard() {
  const router = useRouter();
  // step can be: 'offline', 'online', 'incoming', 'pickup', 'waiting', 'enroute', 'completed'
  const [step, setStep] = useState('offline');
  // vehicleType can be: 'particular', 'taxi', 'blanca'
  const [vehicleType, setVehicleType] = useState('blanca');
  const [countdown, setCountdown] = useState(12);
  const [pin, setPin] = useState(['', '', '', '']);
  const [driverLoc, setDriverLoc] = useState([3.8850, -77.0250]); // Buenaventura real (antes 4.88, mal ubicado — mismo bug de la app de pasajeros)
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentOfferId, setCurrentOfferId] = useState(null);
  const [riderProfile, setRiderProfile] = useState(null);
  const [pinError, setPinError] = useState(false);
  const [user, setUser] = useState(null);
  const [tripSummary, setTripSummary] = useState(null);
  const [todayStats, setTodayStats] = useState({ total: 0, count: 0 });
  const [riderRatingStars, setRiderRatingStars] = useState(5);
  const [submittingRiderRating, setSubmittingRiderRating] = useState(false);
  // Tiempo real de espera al pasajero. Antes era un "1:42" fijo en pantalla.
  const [waitSeconds, setWaitSeconds] = useState(0);

  useEffect(() => {
    if (step !== 'waiting') { setWaitSeconds(0); return; }
    const t = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (!currentTrip?.rider_id) { setRiderProfile(null); return; }
    supabase.from('profiles').select('first_name, last_name').eq('id', currentTrip.rider_id).single()
      .then(({ data }) => setRiderProfile(data));
  }, [currentTrip?.rider_id]);

  // Transmite la posición real del conductor a driver_locations mientras
  // está en línea o en un viaje activo, para que el pasajero pueda verlo
  // moverse en su mapa. Si el navegador no da permiso de ubicación (o no
  // hay GPS, como en pruebas de escritorio), se sigue enviando la última
  // posición conocida para no dejar el mapa del pasajero completamente
  // vacío — mejor una posición estática que ninguna.
  const isActiveForTracking = step !== 'offline';
  useEffect(() => {
    if (!user || !isActiveForTracking) return;

    const upsertLocation = (lat, lon, heading, speed) => {
      setDriverLoc([lat, lon]);
      supabase.from('driver_locations').upsert({
        driver_id: user.id,
        location: `SRID=4326;POINT(${lon} ${lat})`,
        heading: heading ?? null,
        speed: speed ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'driver_id' }).then(({ error }) => {
        if (error) console.error('Error actualizando ubicación:', error);
      });
    };

    if (!navigator.geolocation) {
      upsertLocation(driverLoc[0], driverLoc[1]);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => upsertLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.heading, pos.coords.speed),
      () => upsertLocation(driverLoc[0], driverLoc[1]),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isActiveForTracking]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data?.user);
      if (data?.user) {
        // Asegurar que el conductor exista en driver_profiles para que la Foreign Key no falle al aceptar viajes
        await supabase.from('driver_profiles').upsert({ id: data.user.id, status: 'offline' }, { onConflict: 'id' });
      }
    });
  }, []);

  // Listen for new trips when online
  useEffect(() => {
    if (step === 'online' && user) {
      // Antes esto escuchaba CUALQUIER trips INSERT con status='requested' —
      // es decir, todo conductor en línea se enteraba de TODOS los viajes
      // pedidos en Buenaventura, sin importar a quién se lo asignó
      // assign-driver realmente. Ahora escucha solo las ofertas que el
      // backend le mandó específicamente a este conductor via trip_offers.
      const channel = supabase
        .channel(`trip_offers:driver_id=eq.${user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trip_offers', filter: `driver_id=eq.${user.id}` }, async (payload) => {
          const offer = payload.new;
          if (offer.status !== 'pending') return;
          const { data: trip } = await supabase.from('trips').select('*').eq('id', offer.trip_id).single();
          if (!trip || trip.status !== 'requested') return;
          setCurrentTrip(trip);
          setCurrentOfferId(offer.id);
          const secondsLeft = Math.max(1, Math.round((new Date(offer.expires_at).getTime() - Date.now()) / 1000));
          setCountdown(secondsLeft);
          setStep('incoming');
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); }
    }
  }, [step, user]);

  // Suscribe a push la primera vez que el conductor se conecta, para que
  // le lleguen notificaciones de viajes nuevos incluso con la pestaña en
  // segundo plano o el celular bloqueado (Realtime por sí solo requiere
  // que la pestaña esté activa).
  useEffect(() => {
    if (step === 'online' && user) {
      subscribeDriverToPush(user.id);
    }
  }, [step, user]);

  // Handle incoming countdown — si se agota el tiempo, la oferta se marca
  // 'expired' del lado del conductor. Nota: el backend todavía no re-ofrece
  // el viaje al siguiente conductor más cercano automáticamente (eso
  // requeriría un cron/scheduled function aparte); por ahora el pasajero se
  // queda esperando hasta que otro conductor lo tome o cancele.
  useEffect(() => {
    let timer;
    if (step === 'incoming' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && step === 'incoming') {
      const tripId = currentTrip?.id;
      if (currentOfferId) {
        supabase.from('trip_offers').update({ status: 'expired', responded_at: new Date().toISOString() }).eq('id', currentOfferId);
      }
      // Igual que al rechazar: el viaje pasa al siguiente conductor.
      if (tripId) {
        supabase.functions.invoke('reoffer-trip', { body: { trip_id: tripId } })
          .catch((e) => console.error('Error re-ofreciendo el viaje:', e));
      }
      setStep('online');
      setCountdown(15);
      setCurrentTrip(null);
      setCurrentOfferId(null);
    }
    return () => clearInterval(timer);
  }, [step, countdown, currentOfferId, currentTrip?.id]);

  const triggerIncoming = () => {
    setCountdown(12);
    setStep('incoming');
  };

  const renderMap = (type) => {
    const markers = [{ position: driverLoc, popup: 'Mi Ubicación' }];
    if (currentTrip && (step === 'incoming' || step === 'pickup')) {
      // pickup_location viene como GeoJSON {coordinates:[lon,lat]} desde
      // Supabase/PostGIS — hay que voltear el orden para Leaflet [lat,lon].
      const coords = currentTrip.pickup_location?.coordinates;
      const passengerLoc = coords ? [coords[1], coords[0]] : driverLoc;
      markers.push({ position: passengerLoc, popup: 'Pasajero' });
    }
    
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: type === 'dark' ? '#1c1c1c' : '#f0f0f0', transition: 'all 0.5s ease' }}>
        <Map center={driverLoc} zoom={15} markers={markers} />
        {type === 'dark' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10 }}></div>}
        
        {/* Pulse effect for online */}
        {type === 'pulse' && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, pointerEvents: 'none' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(15,138,109,0.1)', border: '1px dashed rgba(15,138,109,0.5)', animation: 'trPulse 3s infinite' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--jade)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 4px rgba(255,255,255,1)' }}></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif' }}>
      
      {/* Vehicle Type Switcher */}
      {(step === 'offline' || step === 'online') && (
        <div style={{ position: 'absolute', top: '24px', left: '16px', zIndex: 40 }}>
          <button 
            onClick={() => {
              // Cycle through vehicle types for demo purposes
              const types = ['particular', 'taxi', 'blanca'];
              setVehicleType(types[(types.indexOf(vehicleType) + 1) % types.length]);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', borderRadius: '99px', padding: '6px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', font: '700 11px Manrope,sans-serif', color: '#666', border: '1px solid #eaeae8' }}
          >
            <span>🚗</span> {vehicleType === 'particular' ? 'Particular' : vehicleType === 'taxi' ? 'Taxi' : 'Placa Blanca'}
          </button>
        </div>
      )}

      {/* Top Bar for Offline / Online */}
      {(step === 'offline' || step === 'online') && (
        <div style={{ position: 'absolute', top: '70px', left: '16px', right: '16px', zIndex: 30, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Avatar and Status Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', borderRadius: '99px', padding: '6px 16px 6px 6px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 12px Manrope,sans-serif', color: '#111' }}>
                YM
              </div>
              {step === 'offline' ? (
                <div style={{ font: '700 13px Manrope,sans-serif', color: '#111' }}>• Estás desconectado</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ font: '800 13px Manrope,sans-serif', color: '#fff', background: '#0f8a6d', padding: '4px 10px', borderRadius: '99px' }}>• En línea</div>
                  <div style={{ font: '700 13px Manrope,sans-serif', color: '#111' }}>Buscando viajes</div>
                </div>
              )}
            </div>

            <button style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </button>
          </div>

          {/* Contextual Banners based on Vehicle Type */}
          {vehicleType === 'blanca' && (
            <div onClick={() => router.push('/driver/intermunicipal')} style={{ background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', overflow: 'hidden', position: 'relative', border: '1px solid #eaeae8' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '100px', height: '100px', opacity: 0.8 }}>
                <img src="/images/3d_calendar.png" alt="Agenda 3D" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
                <div style={{ display: 'inline-flex', background: '#0f8a6d', color: '#fff', font: '800 10px Manrope,sans-serif', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>EXCLUSIVO</div>
                <div style={{ font: '800 16px Manrope,sans-serif', color: '#111', marginBottom: '2px' }}>Viajes a Cali</div>
                <div style={{ font: '600 13px Manrope,sans-serif', color: '#666', maxWidth: '70%' }}>Acepta reservas para viajes a Cali</div>
              </div>
            </div>
          )}

          {vehicleType === 'taxi' && (
            <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', overflow: 'hidden', position: 'relative', border: '1px solid #eaeae8' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '100px', height: '100px', opacity: 0.8 }}>
                <img src="/images/3d_car.png" alt="Taxi 3D" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
                <div style={{ display: 'inline-flex', background: '#eab308', color: '#fff', font: '800 10px Manrope,sans-serif', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>AEROPUERTO</div>
                <div style={{ font: '800 16px Manrope,sans-serif', color: '#111', marginBottom: '2px' }}>Cola de Taxis</div>
                <div style={{ font: '600 13px Manrope,sans-serif', color: '#666', maxWidth: '70%' }}>Únete a la fila y mira tu turno</div>
              </div>
            </div>
          )}

          {vehicleType === 'particular' && (
            <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', overflow: 'hidden', position: 'relative', border: '1px solid #eaeae8' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '100px', height: '100px', opacity: 0.8 }}>
                <img src="/images/3d_moto.png" alt="Moto 3D" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
                <div style={{ display: 'inline-flex', background: '#c8402f', color: '#fff', font: '800 10px Manrope,sans-serif', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>ALTA DEMANDA</div>
                <div style={{ font: '800 16px Manrope,sans-serif', color: '#111', marginBottom: '2px' }}>Centro de la Ciudad</div>
                <div style={{ font: '600 13px Manrope,sans-serif', color: '#666', maxWidth: '70%' }}>Múltiples solicitudes de TurCarro</div>
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* Online specific overlays */}
      {step === 'online' && (
        <div style={{ position: 'absolute', top: '220px', left: '16px', zIndex: 30 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '8px 12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ font: '700 13px Manrope,sans-serif', color: '#c98a1e' }}>✦ Zona alta demanda</div>
            <div style={{ font: '800 13px Manrope,sans-serif', color: '#111' }}>×1,4</div>
          </div>
        </div>
      )}

      {/* Background Map Rendering */}
      {step === 'offline' && renderMap('light')}
      {step === 'online' && renderMap('pulse')}
      {step === 'incoming' && renderMap('dark')}
      {(step === 'pickup' || step === 'waiting' || step === 'enroute') && renderMap('light')}

      {/* Offline Bottom Sheet */}
      {step === 'offline' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '0', width: '100%', padding: '16px', zIndex: 20 }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 -4px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ font: '800 22px Manrope,sans-serif', color: '#111', marginBottom: '8px' }}>¿Listo para manejar?</div>
            <div style={{ font: '500 14px/1.4 Manrope,sans-serif', color: '#666', marginBottom: '24px' }}>Conéctate para empezar a recibir solicitudes cerca de El Piñal.</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eaeae8' }}>
              <div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Hoy</div>
                <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>$0</div>
              </div>
              <div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Esta semana</div>
                <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>$486K</div>
              </div>
              <div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Calificación</div>
                <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>4,92</div>
              </div>
            </div>

            <button 
              onClick={() => setStep('online')}
              style={{ width: '100%', height: '56px', borderRadius: '16px', background: '#0f8a6d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 16px Manrope,sans-serif' }}
            >
              • Conectarme
            </button>
          </div>
        </div>
      )}

      {/* Online Bottom Sheet */}
      {step === 'online' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '0', width: '100%', padding: '16px', zIndex: 20 }}>
          <div style={{ background: 'var(--bg)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--sh)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ font: '700 12px Manrope,sans-serif', color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ganancias de hoy</div>
                <div style={{ font: '800 32px Manrope,sans-serif', color: 'var(--tx)', letterSpacing: '-0.03em' }}>$68.400</div>
              </div>
              <button onClick={() => router.push('/driver/earnings')} style={{ background: 'var(--sf)', padding: '8px 16px', borderRadius: '99px', font: '700 13px Manrope,sans-serif', color: 'var(--tx)' }}>
                Detalle &gt;
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--bd2)' }}>
              <div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: 'var(--mu)' }}>Viajes</div>
                <div style={{ font: '800 16px Manrope,sans-serif', color: 'var(--tx)' }}>7</div>
              </div>
              <div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: 'var(--mu)' }}>En línea</div>
                <div style={{ font: '800 16px Manrope,sans-serif', color: 'var(--tx)' }}>4h 12m</div>
              </div>
              <div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: 'var(--mu)' }}>Aceptación</div>
                <div style={{ font: '800 16px Manrope,sans-serif', color: 'var(--tx)' }}>94%</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <button 
                onClick={() => setStep('offline')}
                style={{ height: '56px', borderRadius: '16px', background: 'var(--bg)', border: '2px solid var(--bd2)', color: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 15px Manrope,sans-serif' }}
              >
                Desconectarme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Request (Full Screen Overlay) */}
      {step === 'incoming' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(25,25,25,0.7)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Countdown */}
          <div style={{ marginTop: '60px', alignSelf: 'center', width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #333', borderTopColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 32px Manrope,sans-serif', color: '#fff', animation: 'trSpin 1s linear infinite' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', animation: 'trSpin 1s linear infinite reverse' }}>
              {countdown}
            </div>
          </div>

          <div style={{ alignSelf: 'center', marginTop: '40px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#c98a1e', color: '#fff', padding: '4px 8px', borderRadius: '4px', font: '800 12px Manrope,sans-serif', marginBottom: '12px' }}>
              ✦ Solicitud de viaje
            </div>
            <div style={{ font: '800 48px Manrope,sans-serif', color: '#fff', letterSpacing: '-0.03em' }}>${currentTrip?.fare_estimated?.toLocaleString() || '17.400'}</div>
            <div style={{ font: '600 14px Manrope,sans-serif', color: '#aaa', marginTop: '4px' }}>TurCarro · Aprox 5 min</div>
          </div>

          <div style={{ marginTop: 'auto', background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 16px Manrope,sans-serif' }}>
                  {riderProfile?.first_name ? riderProfile.first_name[0] + (riderProfile.last_name?.[0] || '') : '🧍'}
                </div>
                <div>
                  <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>
                    {riderProfile ? `${riderProfile.first_name || ''} ${riderProfile.last_name || ''}`.trim() : 'Cargando...'}
                  </div>
                </div>
              </div>
              <div style={{ background: '#e7f3ef', color: '#0f8a6d', padding: '6px 12px', borderRadius: '6px', font: '800 12px Manrope,sans-serif' }}>
                {currentTrip?.payment_method === 'cash' ? 'Efectivo' : (currentTrip?.payment_method || 'Prepago')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '3px solid #0f8a6d', marginTop: '4px' }}></div>
                <div>
                  <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>{currentTrip?.pickup_address || 'Origen'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', background: '#111', marginTop: '4px' }}></div>
                <div>
                  <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>{currentTrip?.dropoff_address || 'Destino'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <button onClick={async () => {
                const tripId = currentTrip?.id;
                if (currentOfferId) {
                  await supabase.from('trip_offers').update({ status: 'rejected', responded_at: new Date().toISOString() }).eq('id', currentOfferId);
                }
                // Pasa el viaje al siguiente conductor más cercano. Si no
                // queda ninguno, reoffer-trip lo cancela para que el pasajero
                // salga del "Buscando conductor..." en vez de esperar sin fin.
                if (tripId) {
                  supabase.functions.invoke('reoffer-trip', { body: { trip_id: tripId } })
                    .catch((e) => console.error('Error re-ofreciendo el viaje:', e));
                }
                setStep('online');
                setCurrentTrip(null);
                setCurrentOfferId(null);
              }} style={{ height: '56px', borderRadius: '16px', border: '2px solid #eaeae8', color: '#111', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Rechazar
              </button>
              <button onClick={async () => {
                if (!currentTrip || !user) return;
                // .eq('status','requested') + .select() evita que dos
                // conductores en línea a la vez "ganen" el mismo viaje: si
                // otro ya lo aceptó primero, data vuelve vacío en vez de
                // sobreescribir silenciosamente su driver_id.
                const { data, error } = await supabase
                  .from('trips')
                  .update({ status: 'matched', driver_id: user.id })
                  .eq('id', currentTrip.id)
                  .eq('status', 'requested')
                  .select();
                if (error) { alert("Error de Base de Datos al aceptar: " + error.message); return; }
                if (!data || data.length === 0) {
                  alert("Otro conductor ya aceptó este viaje.");
                  setStep('online');
                  setCurrentTrip(null);
                  setCurrentOfferId(null);
                  return;
                }
                if (currentOfferId) {
                  await supabase.from('trip_offers').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', currentOfferId);
                }
                setCurrentTrip(data[0]);
                setStep('pickup');
              }} style={{ height: '56px', borderRadius: '16px', background: '#0f8a6d', color: '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation (Pickup) */}
      {step === 'pickup' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
          {/* Top Banner */}
          <div style={{ background: '#0f8a6d', color: '#fff', padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto' }}>
            {/* Antes aquí había una navegación falsa ("450 m", "Continúa por
                Calle 5", "3 min"): no hay motor de rutas, así que eran
                valores fijos que podían mandar al conductor por donde no era.
                Se muestra la dirección real de recogida. */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" style={{ flex: 'none' }}><polyline points="12 19 12 5"/><polyline points="5 12 12 5 19 12"/></svg>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '600 12px Manrope,sans-serif', opacity: 0.9 }}>Vas a recoger en</div>
                <div style={{ font: '800 18px Manrope,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentTrip?.pickup_address || 'Punto de recogida'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', pointerEvents: 'auto', boxShadow: '0 -4px 32px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 16px Manrope,sans-serif' }}>
                  {riderProfile?.first_name ? riderProfile.first_name[0] + (riderProfile.last_name?.[0] || '') : '🧍'}
                </div>
                <div>
                  <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>
                    {riderProfile ? `${riderProfile.first_name || ''} ${riderProfile.last_name || ''}`.trim() : 'Cargando...'}
                  </div>
                  <div style={{ font: '500 13px Manrope,sans-serif', color: '#666' }}>{currentTrip?.pickup_address || 'Origen'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #eaeae8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</button>
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #eaeae8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#0f8a6d', font: '600 13px Manrope,sans-serif' }}>
              Pídele el PIN al pasajero antes de arrancar — lo confirmas en la siguiente pantalla.
            </div>

            <button onClick={async () => {
              if (!currentTrip || !user) return;
              const { error } = await supabase.from('trips').update({ status: 'arrived' }).eq('id', currentTrip.id);
              if (error) { alert("Error: " + error.message); return; }
              setStep('waiting');
            }} style={{ width: '100%', height: '56px', borderRadius: '16px', background: '#111', color: '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Llegué al punto de recogida
            </button>
          </div>
        </div>
      )}

      {/* Waiting for Passenger & PIN */}
      {step === 'waiting' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
          
          <div style={{ background: '#fff', padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: '700 16px Manrope,sans-serif', color: '#c98a1e' }}>
              🕒 Esperando al pasajero
            </div>
            <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>
              {Math.floor(waitSeconds / 60)}:{String(waitSeconds % 60).padStart(2, '0')}
            </div>
          </div>

          <div style={{ marginTop: 'auto', background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', pointerEvents: 'auto', boxShadow: '0 -4px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ font: '800 20px Manrope,sans-serif', color: '#111', marginBottom: '8px' }}>Confirma el PIN</div>
            <div style={{ font: '500 14px Manrope,sans-serif', color: '#666', marginBottom: '24px' }}>Ingresa los 4 dígitos que te muestra el pasajero en su app.</div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {[0, 1, 2, 3].map(i => (
                <input 
                  key={i}
                  type="text"
                  maxLength={1}
                  placeholder={i === 3 ? "" : "4"}
                  value={pin[i]}
                  onChange={(e) => {
                    const newPin = [...pin];
                    newPin[i] = e.target.value;
                    setPin(newPin);
                  }}
                  style={{ width: '60px', height: '60px', borderRadius: '12px', border: '1px solid #0f8a6d', textAlign: 'center', font: '800 24px Manrope,sans-serif', color: '#111' }}
                />
              ))}
            </div>

            {pinError && (
              <div style={{ color: '#c8402f', font: '700 13px Manrope,sans-serif', marginBottom: '12px' }}>PIN incorrecto. Confírmalo con el pasajero.</div>
            )}

            <div style={{ background: '#faf0dd', padding: '12px', borderRadius: '8px', color: '#c98a1e', font: '600 12px Manrope,sans-serif', marginBottom: '24px', display: 'flex', gap: '8px' }}>
              <span>ℹ️</span> Después de 3 minutos empieza a cobrarse espera: $350 por minuto.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={async () => {
                if (!currentTrip || !user) return;
                const { error } = await supabase.from('trips').update({
                  status: 'cancelled',
                  cancellation_reason: 'El pasajero no apareció',
                  cancelled_by: 'driver',
                  cancelled_at: new Date().toISOString(),
                }).eq('id', currentTrip.id);
                if (error) { alert("Error: " + error.message); return; }
                setStep('online');
                setCurrentTrip(null);
                setCurrentOfferId(null);
                setPin(['', '', '', '']);
              }} style={{ font: '700 15px Manrope,sans-serif', color: '#c8402f' }}>No apareció</button>
              <button onClick={async () => {
                if (!currentTrip || !user) return;
                if (pin.join('') !== currentTrip.pin_code) {
                  setPinError(true);
                  return;
                }
                setPinError(false);
                const { error } = await supabase.from('trips').update({ status: 'in_progress' }).eq('id', currentTrip.id);
                if (error) { alert("Error: " + error.message); return; }
                setStep('enroute');
              }} style={{ padding: '0 32px', height: '56px', borderRadius: '16px', background: '#0f8a6d', color: '#fff', font: '800 16px Manrope,sans-serif' }}>
                Iniciar viaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation (Enroute to Destination) */}
      {step === 'enroute' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
          {/* Top Banner */}
          <div style={{ background: '#111', color: '#fff', padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
              <div>
                <div style={{ font: '800 24px Manrope,sans-serif' }}>1,2 km</div>
                <div style={{ font: '600 15px Manrope,sans-serif', opacity: 0.9 }}>Gira a la derecha en Cra. 1</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ font: '800 20px Manrope,sans-serif' }}>17 min</div>
              <div style={{ font: '600 12px Manrope,sans-serif', opacity: 0.9 }}>al destino</div>
            </div>
          </div>

          <div style={{ position: 'absolute', right: '16px', top: '160px', background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', pointerEvents: 'auto', textAlign: 'center' }}>
            <div style={{ font: '800 20px Manrope,sans-serif', color: '#111' }}>42</div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#666' }}>KM/H</div>
          </div>

          <div style={{ marginTop: 'auto', background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', pointerEvents: 'auto', boxShadow: '0 -4px 32px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 16px Manrope,sans-serif' }}>
                  {riderProfile?.first_name ? riderProfile.first_name[0] + (riderProfile.last_name?.[0] || '') : '🧍'}
                </div>
                <div>
                  <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>{currentTrip?.dropoff_address || 'Destino'}</div>
                  <div style={{ font: '500 13px Manrope,sans-serif', color: '#666' }}>{riderProfile?.first_name || 'Pasajero'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>${(currentTrip?.fare_estimated || 0).toLocaleString('es-CO')}</div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: '#0f8a6d' }}>
                  {currentTrip?.payment_method === 'cash' ? 'Efectivo' : (currentTrip?.payment_method || 'Prepago')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fbeceb', color: '#c8402f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </button>
              <button onClick={async () => {
                if (!currentTrip || !user) return;
                const { data, error } = await supabase.functions.invoke('complete-trip', {
                  body: { trip_id: currentTrip.id },
                });
                if (error) {
                  const body = await error.context?.json?.().catch(() => null);
                  alert("Error al finalizar: " + (body?.error || error.message));
                  return;
                }
                setTripSummary(data.summary);
                const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
                const { data: todayEarnings } = await supabase
                  .from('earnings')
                  .select('net_earning')
                  .eq('driver_id', user.id)
                  .gte('created_at', startOfDay.toISOString());
                if (todayEarnings) {
                  setTodayStats({
                    total: todayEarnings.reduce((s, e) => s + Number(e.net_earning), 0),
                    count: todayEarnings.length,
                  });
                }
                setStep('completed');
              }} style={{ flex: 1, height: '56px', borderRadius: '16px', background: '#111', color: '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Finalizar viaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Trip Screen */}
      {step === 'completed' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: '#fff', padding: '60px 24px 24px', display: 'flex', flexDirection: 'column', animation: 'trFade .3s ease' }}>
          
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0f8a6d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          
          <div style={{ font: '800 14px Manrope,sans-serif', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ganaste en este viaje</div>
          <div style={{ font: '800 48px Manrope,sans-serif', color: '#111', letterSpacing: '-0.03em', marginBottom: '40px' }}>${(tripSummary?.net_earning || 0).toLocaleString('es-CO')}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid #eaeae8', paddingBottom: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ font: '600 14px Manrope,sans-serif', color: '#666' }}>Tarifa</div>
              <div style={{ font: '700 14px Manrope,sans-serif', color: '#111' }}>${(tripSummary?.fare || 0).toLocaleString('es-CO')}</div>
            </div>
            {tripSummary?.dynamic_bonus > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ font: '600 14px Manrope,sans-serif', color: '#666' }}>Dinámica</div>
                <div style={{ font: '700 14px Manrope,sans-serif', color: '#111' }}>${tripSummary.dynamic_bonus.toLocaleString('es-CO')}</div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ font: '600 14px Manrope,sans-serif', color: '#666' }}>Propina</div>
              <div style={{ font: '700 14px Manrope,sans-serif', color: '#111' }}>${(tripSummary?.tip || 0).toLocaleString('es-CO')}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ font: '700 14px Manrope,sans-serif', color: '#c8402f' }}>Comisión Turapp {tripSummary?.commission_rate ?? 22}%</div>
              <div style={{ font: '800 14px Manrope,sans-serif', color: '#c8402f' }}>-${(tripSummary?.commission_amount || 0).toLocaleString('es-CO')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Tu pago</div>
            <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>${(tripSummary?.net_earning || 0).toLocaleString('es-CO')}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: '#f4f4f3', borderRadius: '12px', padding: '16px' }}>
              <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Hoy</div>
              <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>${todayStats.total.toLocaleString('es-CO')}</div>
            </div>
            <div style={{ background: '#f4f4f3', borderRadius: '12px', padding: '16px' }}>
              <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Viajes hoy</div>
              <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>{todayStats.count}</div>
            </div>
          </div>

          <div style={{ font: '800 15px Manrope,sans-serif', color: '#111', marginBottom: '16px' }}>Califica a {riderProfile?.first_name || 'tu pasajero'}</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'auto' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} onClick={() => setRiderRatingStars(i)} style={{ flex: 1, height: '48px', borderRadius: '8px', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={i <= riderRatingStars ? '#f5a623' : '#d1d1d1'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </button>
            ))}
          </div>

          <button
            disabled={submittingRiderRating}
            onClick={async () => {
              setSubmittingRiderRating(true);
              try {
                if (currentTrip?.id) {
                  const { error } = await supabase.functions.invoke('rate-trip', {
                    body: { trip_id: currentTrip.id, rating: riderRatingStars, target: 'rider' },
                  });
                  if (error) {
                    const body = await error.context?.json?.().catch(() => null);
                    throw new Error(body?.error || error.message);
                  }
                }
              } catch (err) {
                alert('No se pudo enviar la calificación: ' + err.message);
              } finally {
                setSubmittingRiderRating(false);
              }
              setCurrentTrip(null);
              setCurrentOfferId(null);
              setRiderProfile(null);
              setTripSummary(null);
              setPin(['', '', '', '']);
              setPinError(false);
              setRiderRatingStars(5);
              setStep('online');
            }}
            style={{ width: '100%', height: '56px', borderRadius: '16px', background: '#0f8a6d', color: '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '32px', opacity: submittingRiderRating ? 0.6 : 1 }}
          >
            {submittingRiderRating ? 'Enviando...' : 'Volver a recibir viajes'}
          </button>
        </div>
      )}

      {/* Bottom Nav is hidden during an active trip or completed screen */}
      {(step === 'offline' || step === 'online') && <DriverBottomNav />}
    </div>
  );
}

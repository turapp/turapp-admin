'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { caliService } from '../../../lib/caliService';

// Las horas a las que de verdad sale gente para Cali. Escribir una hora a mano
// en un celular, manejando, es la forma más rápida de que nadie publique.
const HORAS = ['05:00', '06:00', '07:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export default function IntermunicipalPage() {
  const router = useRouter();
  const [direction, setDirection] = useState('toCali');

  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [vehiculo, setVehiculo] = useState(null);

  // Publicar salida
  const [abierto, setAbierto] = useState(false);
  const [hora, setHora] = useState('06:00');
  const [manana, setManana] = useState(false);
  const [precio, setPrecio] = useState(60000);
  const [puestos, setPuestos] = useState(4);
  const [publicando, setPublicando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const cargar = async (uid) => {
    const trips = await caliService.getDriverDepartures(uid);
    setDepartures(trips);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }
      setUser(u);
      setVehiculo(await caliService.getVehiculoCali(u.id));
      cargar(u.id);
    })();
  }, []);

  const publicar = async () => {
    if (!user) return;
    setPublicando(true);
    try {
      const [h, m] = hora.split(':').map(Number);
      const cuando = new Date();
      if (manana) cuando.setDate(cuando.getDate() + 1);
      cuando.setHours(h, m, 0, 0);
      if (cuando <= new Date()) {
        throw new Error('Esa hora ya pasó. Escoge una más tarde o publícala para mañana.');
      }
      await caliService.publicarSalida({
        driverId: user.id,
        vehicleId: vehiculo?.id ?? null,
        salidaISO: cuando.toISOString(),
        precio: Number(precio),
        puestos: Number(puestos),
      });
      setAbierto(false);
      setAviso('Tu salida quedó publicada. Ya la están viendo en Buenaventura y en Cali.');
      setTimeout(() => setAviso(null), 4000);
      cargar(user.id);
    } catch (e) {
      setAviso(e.message);
      setTimeout(() => setAviso(null), 5000);
    } finally {
      setPublicando(false);
    }
  };

  const currentTrips = departures; // Currently not filtering by direction for simplicity

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#f4f4f3', color: '#111', paddingBottom: '40px', fontFamily: 'Manrope, sans-serif' }}>

      {/* Plan Cali — el gancho va arriba, donde el conductor ya está pensando
          en cuánto le queda de cada salida. */}
      <button onClick={() => router.push('/driver/plan-cali')}
        style={{ width: 'calc(100% - 40px)', margin: '12px 20px 0', textAlign: 'left', border: 'none', cursor: 'pointer', padding: '15px 17px', borderRadius: '17px', background: 'linear-gradient(135deg,#1a1330 0%,#3d2168 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '22px', flex: 'none' }}>🚐</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '800 14.5px Manrope,sans-serif', letterSpacing: '-.02em' }}>Quédate con el 100% de tus pasajeros</div>
          <div style={{ font: '500 11.5px/1.4 Manrope,sans-serif', opacity: .78, marginTop: '2px' }}>
            Plan mensual sin comisión. Mira desde cuántos pasajeros te conviene.
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ flex: 'none', opacity: .7 }}><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      
      {/* Header */}
      <div style={{ background: '#fff', padding: '60px 24px 24px', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', position: 'relative', zIndex: 10 }}>
        
        <button onClick={() => router.back()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ font: '800 28px Manrope,sans-serif', color: '#111', letterSpacing: '-0.02em', marginBottom: '8px' }}>Viajes a Cali</div>
            <div style={{ font: '600 15px Manrope,sans-serif', color: '#666' }}>Tus reservas intermunicipales</div>
          </div>
          <div style={{ width: '80px', height: '80px', marginTop: '-20px' }}>
            <img src="/images/3d_clock_car.png" alt="Intermunicipal" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 12px rgba(0,0,0,0.1))' }} />
          </div>
        </div>

        {/* Direction Switcher */}
        <div style={{ display: 'flex', background: '#f4f4f3', borderRadius: '12px', padding: '4px', marginTop: '32px' }}>
          <button 
            onClick={() => setDirection('toCali')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: '8px', 
              background: direction === 'toCali' ? '#fff' : 'transparent',
              color: direction === 'toCali' ? '#111' : '#666',
              font: '700 14px Manrope,sans-serif',
              boxShadow: direction === 'toCali' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Hacia Cali
          </button>
          <button 
            onClick={() => setDirection('toBua')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: '8px', 
              background: direction === 'toBua' ? '#fff' : 'transparent',
              color: direction === 'toBua' ? '#111' : '#666',
              font: '700 14px Manrope,sans-serif',
              boxShadow: direction === 'toBua' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Hacia B/ventura
          </button>
        </div>
      </div>

      {/* Publicar salida. Antes no existía en ninguna pantalla: el conductor
          podía mirar Viajes a Cali pero nunca ofrecer una salida suya. */}
      <div style={{ padding: '20px 16px 0' }}>
        <button onClick={() => setAbierto(true)}
          style={{ width: '100%', height: '56px', borderRadius: '18px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(145deg,#2fbf99 0%,#0f8a6d 55%,#075441 100%)', color: '#fff',
            font: '800 15px Manrope,sans-serif', boxShadow: '0 10px 24px rgba(15,138,109,.34)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
          <span style={{ fontSize: '18px' }}>＋</span> Publicar una salida
        </button>
        {!vehiculo && (
          <div style={{ marginTop: '10px', padding: '11px 14px', borderRadius: '13px', background: 'rgba(201,138,30,.11)', font: '600 11.5px/1.45 Manrope,sans-serif', color: '#8a6d1e' }}>
            Todavía no tienes un vehículo registrado. Puedes publicar, pero Operaciones te lo va a pedir.
          </div>
        )}
      </div>

      {/* Trips List */}
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ font: '800 18px Manrope,sans-serif', color: '#111', marginBottom: '8px' }}>Tus salidas</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666', font: '600 14px Manrope' }}>Cargando tus salidas...</div>
        ) : currentTrips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '26px 20px', color: '#666', background: '#fff', borderRadius: '20px' }}>
            <div style={{ font: '800 15px Manrope,sans-serif', color: '#111', marginBottom: '5px' }}>Todavía no has publicado ninguna</div>
            <div style={{ font: '500 12.5px/1.5 Manrope,sans-serif' }}>
              Publica la hora a la que sales y los pasajeros separan puesto con el 30% por adelantado.
            </div>
          </div>
        ) : currentTrips.map((trip) => {
          const timeObj = new Date(trip.departure_time);
          let hours = timeObj.getHours();
          const ampm = hours >= 12 ? 'P. M.' : 'A. M.';
          hours = hours % 12;
          hours = hours ? hours : 12; 
          const minutes = timeObj.getMinutes().toString().padStart(2, '0');
          const timeStr = `${hours}:${minutes} ${ampm}`;
          
          const totalSeats = trip.total_seats || trip.cali_seats?.length || 4;
          const availableSeats = trip.cali_seats?.filter(s => s.status === 'available').length ?? totalSeats;
          const isFull = availableSeats === 0;
          const paxCount = totalSeats - availableSeats;
          // `price_block` no existe en la tabla: la columna es `current_price`.
          // Con undefined esto mostraba "$NaN" en cada tarjeta.
          const totalEstimated = paxCount * Number(trip.current_price ?? 0);

          return (
            <div key={trip.id} style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e7f3ef', color: '#0f8a6d', padding: '4px 10px', borderRadius: '8px', font: '800 11px Manrope,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px' }}>📅</span> Programado
                  </div>
                  <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>{timeStr}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ font: '800 20px Manrope,sans-serif', color: '#111' }}>${totalEstimated.toLocaleString('es-CO')}</div>
                  <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>
                    Vendido · ${Number(trip.current_price ?? 0).toLocaleString('es-CO')} el puesto
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderTop: '1px solid #eaeae8', borderBottom: '1px solid #eaeae8', marginBottom: '24px' }}>
                <div>
                  <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Pasajeros</div>
                  <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>{paxCount} personas</div>
                </div>
                <div style={{ width: '1px', background: '#eaeae8' }}></div>
                <div>
                  <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Ocupación</div>
                  <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>{paxCount}/{totalSeats}</div>
                </div>
              </div>

              <button onClick={() => router.push(`/driver/intermunicipal/active?id=${trip.id}`)} style={{ width: '100%', height: '56px', borderRadius: '16px', background: isFull ? '#f4f4f3' : '#111', color: isFull ? '#aaa' : '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isFull ? 'Viaje completo' : 'Aceptar viaje'}
              </button>
            </div>
          );
        })}

      </div>

      {aviso && (
        <div style={{ position: 'absolute', bottom: '24px', left: '16px', right: '16px', zIndex: 90,
          background: '#111', color: '#fff', padding: '13px 16px', borderRadius: '15px',
          font: '600 12.5px/1.45 Manrope,sans-serif', boxShadow: '0 10px 28px rgba(0,0,0,.28)', animation: 'trUp .25s ease' }}>
          {aviso}
        </div>
      )}

      {/* ---- Publicar salida ---- */}
      {abierto && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(15,15,15,.5)', display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => e.target === e.currentTarget && setAbierto(false)}>
          <div className="tr-sb" style={{ width: '100%', maxHeight: '88%', overflowY: 'auto', background: '#fff', borderRadius: '26px 26px 0 0', padding: '22px 20px 24px', animation: 'trUpS .28s cubic-bezier(.32,.72,0,1)' }}>

            <div style={{ width: '38px', height: '4px', borderRadius: '99px', background: '#e2e2df', margin: '0 auto 18px' }} />
            <div style={{ font: '800 21px Manrope,sans-serif', letterSpacing: '-.03em', marginBottom: '4px' }}>¿A qué hora sales?</div>
            <div style={{ font: '500 12.5px/1.5 Manrope,sans-serif', color: '#666', marginBottom: '18px' }}>
              Los pasajeros de Buenaventura y de Cali la ven de una y separan puesto con el 30%.
            </div>

            <div style={{ display: 'flex', gap: '7px', marginBottom: '16px' }}>
              {[['Hoy', false], ['Mañana', true]].map(([txt, val]) => (
                <button key={txt} onClick={() => setManana(val)}
                  style={{ flex: 1, height: '42px', borderRadius: '13px', cursor: 'pointer',
                    border: manana === val ? 'none' : '1px solid #eaeae8',
                    background: manana === val ? '#111' : '#fff', color: manana === val ? '#fff' : '#666',
                    font: '700 13px Manrope,sans-serif' }}>
                  {txt}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '7px', marginBottom: '20px' }}>
              {HORAS.map((h) => (
                <button key={h} onClick={() => setHora(h)}
                  style={{ height: '40px', borderRadius: '11px', cursor: 'pointer',
                    border: hora === h ? 'none' : '1px solid #eaeae8',
                    background: hora === h ? '#0f8a6d' : '#fff', color: hora === h ? '#fff' : '#444',
                    font: '700 12px Manrope,sans-serif' }}>
                  {h}
                </button>
              ))}
            </div>

            <div style={{ font: '700 11px Manrope,sans-serif', color: '#888', letterSpacing: '.1em', marginBottom: '9px' }}>PRECIO POR PUESTO</div>
            <div style={{ display: 'flex', gap: '7px', marginBottom: '20px' }}>
              {[50000, 55000, 60000, 70000].map((p) => (
                <button key={p} onClick={() => setPrecio(p)}
                  style={{ flex: 1, height: '44px', borderRadius: '13px', cursor: 'pointer',
                    border: precio === p ? 'none' : '1px solid #eaeae8',
                    background: precio === p ? '#111' : '#fff', color: precio === p ? '#fff' : '#444',
                    font: '800 12.5px Manrope,sans-serif' }}>
                  ${(p / 1000)}k
                </button>
              ))}
            </div>

            <div style={{ font: '700 11px Manrope,sans-serif', color: '#888', letterSpacing: '.1em', marginBottom: '9px' }}>PUESTOS DISPONIBLES</div>
            <div style={{ display: 'flex', gap: '7px', marginBottom: '20px' }}>
              {[3, 4, 5, 6, 7].map((n) => (
                <button key={n} onClick={() => setPuestos(n)}
                  style={{ flex: 1, height: '44px', borderRadius: '13px', cursor: 'pointer',
                    border: puestos === n ? 'none' : '1px solid #eaeae8',
                    background: puestos === n ? '#111' : '#fff', color: puestos === n ? '#fff' : '#444',
                    font: '800 13px Manrope,sans-serif' }}>
                  {n}
                </button>
              ))}
            </div>

            {/* Lo que se lleva si la llena. Es el número por el que decide. */}
            <div style={{ padding: '14px 16px', borderRadius: '15px', background: '#f0faf7', marginBottom: '18px' }}>
              <div style={{ font: '600 11.5px Manrope,sans-serif', color: '#0f8a6d', marginBottom: '3px' }}>Si la llenas</div>
              <div style={{ font: '800 22px Manrope,sans-serif', letterSpacing: '-.03em' }}>
                ${(precio * puestos).toLocaleString('es-CO')}
              </div>
              <div style={{ font: '500 11.5px/1.45 Manrope,sans-serif', color: '#666', marginTop: '4px' }}>
                Menos la comisión del 15%, o completo si tienes el Plan Cali.
              </div>
            </div>

            <button onClick={publicar} disabled={publicando}
              style={{ width: '100%', height: '54px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                background: '#0f8a6d', color: '#fff', font: '800 15px Manrope,sans-serif', opacity: publicando ? .6 : 1 }}>
              {publicando ? 'Publicando…' : `Publicar salida ${manana ? 'de mañana' : 'de hoy'} a las ${hora}`}
            </button>
            <button onClick={() => setAbierto(false)}
              style={{ width: '100%', height: '44px', marginTop: '8px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#888', font: '700 13px Manrope,sans-serif' }}>
              Ahora no
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import DriverBottomNav from '../../../components/DriverBottomNav';

export default function DriverAccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [docsStatus, setDocsStatus] = useState({ pending: 0, total: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: veh }, { data: docs }] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, rating, total_trips, avatar_url').eq('id', user.id).single(),
        supabase.from('vehicles').select('make, model, plate').eq('driver_id', user.id).eq('is_active', true).single(),
        supabase.from('driver_documents').select('status').eq('driver_id', user.id),
      ]);

      setProfile(prof);
      setVehicle(veh);
      const pending = (docs || []).filter(d => d.status !== 'approved').length;
      setDocsStatus({ pending, total: (docs || []).length });
    }
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSupportTicket = async () => {
    const message = prompt('¿En qué te podemos ayudar? Describe tu problema.');
    if (!message) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('tickets').insert({ user_id: user.id, subject: 'Soporte conductor', message, status: 'open' });
    if (error) { alert('No se pudo enviar: ' + error.message); return; }
    alert('Listo, tu solicitud fue enviada. Te contactaremos pronto.');
  };

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fdfdfc', color: '#111', paddingBottom: '100px', fontFamily: 'Manrope, sans-serif', animation: 'trFade .3s ease' }}>

      {/* Header */}
      <div style={{ padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ font: '800 32px/1.1 Manrope,sans-serif', letterSpacing: '-0.04em', color: '#111', marginBottom: '8px' }}>
            {profile ? `${profile.first_name || ''}` : '···'}<br/>{profile?.last_name || ''}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', padding: '6px 10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#111"><path d="M8 12.8l-4.4 2.3.8-4.9L.8 6.7l4.9-.7L8 1.5l2.3 4.5 4.9.7-3.6 3.5.8 4.9L8 12.8z"></path></svg>
            <div style={{ font: '700 13px Manrope,sans-serif', color: '#111' }}>{Number(profile?.rating || 5).toFixed(2)}</div>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ccc' }}></div>
            <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>{profile?.total_trips || 0} viajes</div>
          </div>
        </div>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', overflow: 'hidden', border: '2px solid #fff', font: '800 24px Manrope,sans-serif', color: '#666' }}>
          {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Driver" /> : (profile?.first_name?.[0] || '🧍')}
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>

        {/* Vehicle Info (Premium Dark Card) */}
        <div style={{ background: 'linear-gradient(135deg, #111 0%, #222 100%)', borderRadius: '24px', padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)', borderRadius: '50%' }}></div>

          <div style={{ zIndex: 2 }}>
            <div style={{ font: '600 12px Manrope,sans-serif', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Vehículo Activo</div>
            <div style={{ font: '800 22px Manrope,sans-serif', color: '#fff', marginBottom: '8px' }}>
              {vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() : 'Sin vehículo registrado'}
            </div>
            {vehicle?.plate && (
              <div style={{ font: '700 14px Manrope,sans-serif', color: '#fff', background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 10px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                {vehicle.plate}
              </div>
            )}
          </div>
          <div style={{ width: '100px', height: '60px', zIndex: 2 }}>
            <img src="/images/car.png" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }} alt="Car" />
          </div>
        </div>

        {/* Trae conductores — el gancho de crecimiento del lado del conductor.
            Va antes del menú porque es lo que queremos que vea primero. */}
        <button onClick={() => router.push('/driver/referidos')}
          style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', marginBottom: '16px', padding: '17px 19px', borderRadius: '20px', background: 'linear-gradient(135deg,#0d2b22 0%,#0f8a6d 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: '13px' }}>
          <div style={{ fontSize: '24px', flex: 'none' }}>🚕</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.02em' }}>Trae conductores y gana</div>
            <div style={{ font: '500 11.5px/1.45 Manrope,sans-serif', opacity: .8, marginTop: '3px' }}>
              Comisión por cada viaje que hagan, sin límite de tiempo.
            </div>
          </div>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ flex: 'none', opacity: .7 }}><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Servicios — lo primero, porque es lo que define cuánto puede
            trabajar. Un conductor que solo hace taxi está dejando plata. */}
        <button onClick={() => router.push('/driver/servicios')}
          style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', marginBottom: '12px', padding: '17px 19px', borderRadius: '20px', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', gap: '13px' }}>
          <div style={{ fontSize: '24px', flex: 'none' }}>🧩</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.02em' }}>Qué quieres hacer</div>
            <div style={{ font: '500 11.5px/1.45 Manrope,sans-serif', opacity: .72, marginTop: '3px' }}>
              Taxi, Cali, mandados o encomiendas. Puedes hacer varios.
            </div>
          </div>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ flex: 'none', opacity: .7 }}><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={() => router.push('/driver/onboarding')} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Documentos</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#888' }}>Soat, Licencia, Revisión</div>
            </div>
            <div style={{ background: docsStatus.pending === 0 && docsStatus.total > 0 ? '#e0f2f1' : '#faf0dd', color: docsStatus.pending === 0 && docsStatus.total > 0 ? '#0f8a6d' : '#c98a1e', padding: '6px 10px', borderRadius: '8px', font: '800 12px Manrope,sans-serif' }}>
              {docsStatus.total === 0 ? 'Sin subir' : docsStatus.pending === 0 ? 'Al día' : `${docsStatus.pending} pendiente${docsStatus.pending > 1 ? 's' : ''}`}
            </div>
          </button>

          <button onClick={() => router.push('/driver/wallet')} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="15" r="1.5" fill="#111" stroke="none"/></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Billetera</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#888' }}>Saldo, retiros, movimientos</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <button onClick={handleSupportTicket} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Soporte</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#888' }}>Ayuda con viajes o pagos</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <button onClick={handleLogout} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginTop: '8px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left', font: '800 16px Manrope,sans-serif', color: '#ef4444' }}>Cerrar sesión</div>
          </button>
        </div>

      </div>

      <DriverBottomNav />
    </div>
  );
}

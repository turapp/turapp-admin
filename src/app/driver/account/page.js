'use client';

import React from 'react';
import DriverBottomNav from '../../../components/DriverBottomNav';

export default function DriverAccountPage() {
  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fdfdfc', color: '#111', paddingBottom: '100px', fontFamily: 'Manrope, sans-serif', animation: 'trFade .3s ease' }}>
      
      {/* Header */}
      <div style={{ padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ font: '800 32px/1.1 Manrope,sans-serif', letterSpacing: '-0.04em', color: '#111', marginBottom: '8px' }}>Carlos<br/>Ramírez</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', padding: '6px 10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#111"><path d="M8 12.8l-4.4 2.3.8-4.9L.8 6.7l4.9-.7L8 1.5l2.3 4.5 4.9.7-3.6 3.5.8 4.9L8 12.8z"></path></svg>
            <div style={{ font: '700 13px Manrope,sans-serif', color: '#111' }}>4.98</div>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ccc' }}></div>
            <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>1,245 viajes</div>
          </div>
        </div>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', overflow: 'hidden', border: '2px solid #fff' }}>
          <img src="/images/avatar2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Driver" />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* Vehicle Info (Premium Dark Card) */}
        <div style={{ background: 'linear-gradient(135deg, #111 0%, #222 100%)', borderRadius: '24px', padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
          {/* subtle glow */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)', borderRadius: '50%' }}></div>
          
          <div style={{ zIndex: 2 }}>
            <div style={{ font: '600 12px Manrope,sans-serif', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Vehículo Activo</div>
            <div style={{ font: '800 22px Manrope,sans-serif', color: '#fff', marginBottom: '8px' }}>Chevrolet Spark</div>
            <div style={{ font: '700 14px Manrope,sans-serif', color: '#fff', background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 10px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
              KJH-987
            </div>
          </div>
          <div style={{ width: '100px', height: '60px', zIndex: 2 }}>
            <img src="/images/car.png" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }} alt="Car" />
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Documentos</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#888' }}>Soat, Licencia, Revisión</div>
            </div>
            <div style={{ background: '#e0f2f1', color: '#0f8a6d', padding: '6px 10px', borderRadius: '8px', font: '800 12px Manrope,sans-serif' }}>Al día</div>
          </button>
          
          <button style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Preferencias</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#888' }}>Navegación, Audio</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          
          <button style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Soporte</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#888' }}>Ayuda con viajes o pagos</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <button style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '20px', background: '#fff', border: '1px solid #eaeae8', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginTop: '8px', cursor: 'pointer' }}>
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

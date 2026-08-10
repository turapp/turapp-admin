'use client';

import React from 'react';
import DriverBottomNav from '../../../components/DriverBottomNav';

export default function HistoryPage() {
  const trips = [
    { time: '9:22', ampm: 'a.m.', loc: 'Terminal Marítimo', car: 'TurCarro · 8,2 km · Diego C.', price: '$14.790', star: '5,0', tag: 'DINÁMICA ×1,4' },
    { time: '8:47', ampm: 'a.m.', loc: 'Hotel Cosmos Pacífico', car: 'TurCarro · 3,1 km · Luisa R.', price: '$7.640', star: '5,0' },
    { time: '8:12', ampm: 'a.m.', loc: 'Universidad del Pacífico', car: 'TurConfort · 11 km · Andrés M.', price: '$16.220', star: '4,0' },
    { time: '7:38', ampm: 'a.m.', loc: 'Calle 6 #3-24', car: 'El pasajero no apareció', price: '$2.000', noShow: true },
    { time: '7:05', ampm: 'a.m.', loc: 'Hospital Luis Ablanque', car: 'TurCarro · 4,2 km · Nury P.', price: '$9.880', star: '5,0' },
    { time: '6:32', ampm: 'a.m.', loc: 'Muelle El Piñal', car: 'TurEnvío · 2,4 km', price: '$6.470', star: '5,0' },
  ];

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', paddingBottom: '100px', fontFamily: 'Manrope, sans-serif' }}>
      
      {/* Header */}
      <div style={{ padding: '40px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '800 24px Manrope,sans-serif' }}>Historial</div>
      </div>

      {/* Summary */}
      <div style={{ padding: '0 16px 24px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, background: '#f4f4f3', borderRadius: '12px', padding: '16px' }}>
          <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Viajes hoy</div>
          <div style={{ font: '800 20px Manrope,sans-serif', color: '#111' }}>8</div>
        </div>
        <div style={{ flex: 1, background: '#f4f4f3', borderRadius: '12px', padding: '16px' }}>
          <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Tarifa promedio</div>
          <div style={{ font: '800 20px Manrope,sans-serif', color: '#111' }}>$10.4K</div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: '0 16px' }}>
        {trips.map((t, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: idx === trips.length - 1 ? 'none' : '1px solid #eaeae8' }}>
            
            {/* Time Column */}
            <div style={{ width: '40px', textAlign: 'center', paddingTop: '2px' }}>
              <div style={{ font: '800 14px Manrope,sans-serif', color: '#111' }}>{t.time}</div>
              <div style={{ font: '600 10px Manrope,sans-serif', color: '#aaa', marginTop: '2px' }}>{t.ampm}</div>
            </div>

            {/* Content Column */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ font: '800 15px Manrope,sans-serif', color: '#111', marginBottom: '2px' }}>{t.loc}</div>
                <div style={{ font: '500 12px Manrope,sans-serif', color: '#666', marginBottom: '6px' }}>{t.car}</div>
                
                {t.tag && (
                  <div style={{ display: 'inline-flex', background: '#e7f3ef', color: '#0f8a6d', padding: '2px 6px', borderRadius: '4px', font: '800 9px Manrope,sans-serif', letterSpacing: '0.05em' }}>
                    {t.tag}
                  </div>
                )}
                {t.noShow && (
                  <div style={{ display: 'inline-flex', background: '#faf0dd', color: '#c98a1e', padding: '2px 6px', borderRadius: '4px', font: '800 9px Manrope,sans-serif', letterSpacing: '0.05em' }}>
                    NO APARECIÓ
                  </div>
                )}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ font: '800 15px Manrope,sans-serif', color: t.noShow ? '#c98a1e' : '#111', marginBottom: '2px' }}>{t.price}</div>
                {!t.noShow && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', color: '#666', font: '700 11px Manrope,sans-serif' }}>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="#0f8a6d"><path d="M8 12.8l-4.4 2.3.8-4.9L.8 6.7l4.9-.7L8 1.5l2.3 4.5 4.9.7-3.6 3.5.8 4.9L8 12.8z"></path></svg>
                    {t.star}
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      <DriverBottomNav />
    </div>
  );
}

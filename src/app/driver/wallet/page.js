'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '80px' }}>
      
      {/* HEADER */}
      <div style={{ padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '800 28px Manrope,sans-serif', letterSpacing: '-0.02em' }}>Billetera</div>
        <button onClick={() => router.push('/driver/plan')} style={{ display: 'inline-flex', background: '#f4f4f3', color: '#111', font: '800 12px Manrope,sans-serif', padding: '8px 12px', borderRadius: '12px', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Plan Gratuito
        </button>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* MAIN BALANCE CARD */}
        <div style={{ background: '#0a0a0a', borderRadius: '32px', padding: '32px 24px', color: '#fff', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.15)' }}>
          {/* Subtle glow / gradient */}
          <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ font: '700 11px Manrope,sans-serif', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>Disponible para retirar</div>
            <div style={{ font: '800 48px Manrope,sans-serif', letterSpacing: '-0.03em', marginBottom: '32px' }}>$742.400</div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ background: '#fff', color: '#111', font: '800 15px Manrope,sans-serif', padding: '16px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>Retirar</button>
              <button style={{ background: '#222', color: '#fff', font: '800 15px Manrope,sans-serif', padding: '16px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>Movimientos</button>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', padding: '0 8px' }}>
          <div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Hoy</div>
            <div style={{ font: '800 18px Manrope,sans-serif' }}>$182K</div>
          </div>
          <div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Este mes</div>
            <div style={{ font: '800 18px Manrope,sans-serif' }}>$1,24M</div>
          </div>
          <div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Viajes</div>
            <div style={{ font: '800 18px Manrope,sans-serif' }}>28</div>
          </div>
        </div>

        {/* BAR CHART */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #eaeae8', padding: '24px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ font: '800 16px Manrope,sans-serif' }}>Últimos 7 días</div>
            <div style={{ font: '800 13px Manrope,sans-serif', color: '#0f8a6d' }}>+18%</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px' }}>
            {/* Chart Bars */}
            {[
              { day: 'L', h: '30%', active: false },
              { day: 'M', h: '40%', active: false },
              { day: 'M', h: '35%', active: false },
              { day: 'J', h: '60%', active: true },
              { day: 'V', h: '80%', active: true },
              { day: 'S', h: '85%', active: true },
              { day: 'D', h: '25%', active: false },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '10%' }}>
                <div style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: b.h, background: b.active ? '#0f8a6d' : '#f0f0f0', borderRadius: '4px' }}></div>
                </div>
                <div style={{ font: '700 10px Manrope,sans-serif', color: '#888' }}>{b.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HELD MONEY (Dinero Retenido) */}
        <div style={{ background: '#FFF4E0', borderRadius: '24px', padding: '20px 24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ font: '800 14px Manrope,sans-serif', color: '#c98a1e', marginBottom: '4px' }}>Dinero retenido</div>
            <div style={{ font: '600 11px/1.4 Manrope,sans-serif', color: '#c98a1e', maxWidth: '180px' }}>
              Reservas de salidas que aún no han ocurrido. Se liberan cuando termina cada viaje.
            </div>
          </div>
          <div style={{ font: '800 24px Manrope,sans-serif', color: '#c98a1e' }}>$96.000</div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div style={{ font: '800 18px Manrope,sans-serif', marginBottom: '16px' }}>Movimientos</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e7f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f8a6d" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: '800 15px Manrope,sans-serif' }}>Viaje liquidado · 4 puestos</div>
              <div style={{ font: '600 12px Manrope,sans-serif', color: '#888' }}>Hoy 11:40 a.m.</div>
            </div>
            <div style={{ font: '800 16px Manrope,sans-serif', color: '#0f8a6d' }}>+$272.000</div>
          </div>

          <div style={{ height: '1px', background: '#eaeae8', margin: '0 8px' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D4D" strokeWidth="2.5"><line x1="19" y1="5" x2="5" y2="19"/><polyline points="19 14 19 5 10 5"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: '800 15px Manrope,sans-serif' }}>Comisión 15%</div>
              <div style={{ font: '600 12px Manrope,sans-serif', color: '#888' }}>Hoy 11:40 a.m.</div>
            </div>
            <div style={{ font: '800 16px Manrope,sans-serif', color: '#FF4D4D' }}>-$48.000</div>
          </div>

          <div style={{ height: '1px', background: '#eaeae8', margin: '0 8px' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.8 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF4E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c98a1e" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: '800 15px Manrope,sans-serif' }}>Reservas retenidas · 08:00</div>
              <div style={{ font: '600 12px Manrope,sans-serif', color: '#888' }}>Se libera a las 11:10 a.m.</div>
            </div>
            <div style={{ font: '800 16px Manrope,sans-serif', color: '#c98a1e' }}>$96.000</div>
          </div>

        </div>

      </div>
    </div>
  );
}

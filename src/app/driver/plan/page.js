'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('free'); // 'free' or 'premium'
  const [isPaying, setIsPaying] = useState(false);

  const handleUpgrade = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setCurrentPlan('premium');
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '80px' }}>
      
      {/* HEADER */}
      <div style={{ padding: '60px 24px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.back()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ font: '800 24px Manrope,sans-serif', letterSpacing: '-0.02em' }}>Tu plan</div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* FREE PLAN */}
        <div style={{ background: '#f8f8f8', borderRadius: '24px', padding: '32px 24px', marginBottom: '24px', position: 'relative', border: '1px solid #eaeae8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ font: '800 20px Manrope,sans-serif' }}>Plan Gratuito</div>
            {currentPlan === 'free' && <div style={{ background: '#e0e0e0', color: '#666', font: '800 10px Manrope,sans-serif', padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>ACTUAL</div>}
          </div>
          <div style={{ font: '800 28px Manrope,sans-serif', marginBottom: '8px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            15% <span style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>de comisión por viaje</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '16px', height: '2px', background: '#ccc', marginTop: '10px' }}></div>
              <div style={{ font: '500 13px Manrope,sans-serif', color: '#666' }}>15% de comisión sobre cada viaje completado</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '16px', height: '2px', background: '#ccc', marginTop: '10px' }}></div>
              <div style={{ font: '500 13px Manrope,sans-serif', color: '#666' }}>Visibilidad estándar en la lista de salidas</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '16px', height: '2px', background: '#ccc', marginTop: '10px' }}></div>
              <div style={{ font: '500 13px Manrope,sans-serif', color: '#666' }}>Soporte en menos de 24 horas</div>
            </div>
          </div>
        </div>

        {/* PREMIUM PLAN */}
        <div style={{ background: '#0a0a0a', borderRadius: '32px', padding: '32px 24px', color: '#fff', marginBottom: '24px', boxShadow: currentPlan === 'premium' ? '0 16px 40px rgba(15,138,109,0.3)' : '0 16px 40px rgba(0,0,0,0.15)', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ font: '800 22px Manrope,sans-serif' }}>Turapp Premium</div>
            <div style={{ background: '#0f8a6d', color: '#fff', font: '800 10px Manrope,sans-serif', padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
              {currentPlan === 'premium' ? 'ACTUAL' : 'PREMIUM'}
            </div>
          </div>
          <div style={{ font: '800 36px Manrope,sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'baseline', gap: '8px', letterSpacing: '-0.02em' }}>
            $60.000 <span style={{ font: '600 13px Manrope,sans-serif', color: '#aaa', letterSpacing: '0' }}>al mes</span>
          </div>
          <div style={{ font: '800 14px Manrope,sans-serif', color: '#0f8a6d', marginBottom: '24px' }}>0% de comisión</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px', marginBottom: '32px' }}>
            {[
              '0% de comisión: recibes el 100% de cada viaje',
              'Tus salidas aparecen primero en la lista',
              'Insignia Premium visible para los pasajeros',
              'Soporte prioritario, respuesta en menos de 1 hora',
              'Retiros el mismo día y sin límite'
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0f8a6d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ font: '600 13px Manrope,sans-serif' }}>{text}</div>
              </div>
            ))}
          </div>

          {currentPlan === 'free' ? (
            <button 
              onClick={handleUpgrade} 
              disabled={isPaying}
              style={{ width: '100%', padding: '18px', background: '#fff', color: '#111', font: '800 16px Manrope,sans-serif', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isPaying ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', border: '3px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Procesando pago...
                </div>
              ) : 'Pasarme a Premium'}
            </button>
          ) : (
            <button disabled style={{ width: '100%', padding: '18px', background: '#333', color: '#fff', font: '800 16px Manrope,sans-serif', borderRadius: '16px' }}>
              Plan Activo
            </button>
          )}

        </div>

        {/* SAVINGS SUMMARY */}
        <div style={{ background: '#e7f3ef', borderRadius: '24px', padding: '24px', color: '#0f8a6d' }}>
          <div style={{ font: '800 15px Manrope,sans-serif', marginBottom: '16px' }}>Tu cuenta este mes</div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1, borderRight: '1px solid #cce5dd' }}>
              <div style={{ font: '600 12px Manrope,sans-serif', marginBottom: '4px' }}>Con plan gratuito</div>
              <div style={{ font: '800 18px Manrope,sans-serif' }}>-$186.400</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 12px Manrope,sans-serif', marginBottom: '4px' }}>Con Premium</div>
              <div style={{ font: '800 18px Manrope,sans-serif' }}>-$60.000</div>
            </div>
          </div>
          <div style={{ font: '600 12px/1.4 Manrope,sans-serif' }}>
            Con tu volumen actual, Premium te deja <span style={{ font: '800' }}>$126.400 más</span> cada mes.
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

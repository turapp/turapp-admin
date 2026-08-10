'use client';

import React, { useState } from 'react';
import DriverBottomNav from '../../../components/DriverBottomNav';

export default function EarningsPage() {
  const [tab, setTab] = useState('Semana');

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', paddingBottom: '100px', fontFamily: 'Manrope, sans-serif' }}>
      
      {/* Header */}
      <div style={{ padding: '40px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '800 24px Manrope,sans-serif' }}>Ganancias</div>
        <button style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{ display: 'flex', background: '#f4f4f3', borderRadius: '12px', padding: '4px' }}>
          {['Día', 'Semana', 'Mes'].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '8px',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#111' : '#666',
                font: '700 14px Manrope,sans-serif',
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Total */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ font: '600 13px Manrope,sans-serif', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total • {tab.toLowerCase()}</div>
        <div style={{ font: '800 40px Manrope,sans-serif', color: '#111', letterSpacing: '-0.03em', marginBottom: '8px' }}>$486.200</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', font: '700 13px Manrope,sans-serif', color: '#0f8a6d' }}>
          <span>↑</span> 9% más que la semana pasada
        </div>
      </div>

      {/* Bar Chart (Semana Mockup) */}
      <div style={{ padding: '0 16px 32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', gap: '8px' }}>
        {[
          { label: 'L', val: 40, txt: '$48K' },
          { label: 'M', val: 65, txt: '$75K' },
          { label: 'M', val: 50, txt: '$56K' },
          { label: 'J', val: 70, txt: '$79K' },
          { label: 'V', val: 100, txt: '$104K', active: true },
          { label: 'S', val: 90, txt: '$96K' },
          { label: 'D', val: 30, txt: '$32K' },
        ].map((day, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ font: '600 10px Manrope,sans-serif', color: '#aaa', visibility: day.val > 0 ? 'visible' : 'hidden' }}>{day.txt}</div>
            <div style={{ 
              width: '100%', 
              height: `${day.val}px`, 
              background: day.active ? '#0f8a6d' : '#eaeae8', 
              borderRadius: '6px',
              minHeight: '4px'
            }}></div>
            <div style={{ font: '700 12px Manrope,sans-serif', color: day.active ? '#111' : '#aaa' }}>{day.label}</div>
          </div>
        ))}
      </div>

      {/* Breakdown List */}
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eaeae8' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: '#f4f4f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            </div>
            <div>
              <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Tarifas de viajes</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#666' }}>42 viajes</div>
            </div>
          </div>
          <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>$521.800</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eaeae8' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: '#f4f4f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px' }}>✨</span>
            </div>
            <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Propinas</div>
          </div>
          <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>$34.500</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eaeae8' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: '#f4f4f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px', color: '#0f8a6d' }}>⚡</span>
            </div>
            <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Dinámica y bonos</div>
          </div>
          <div style={{ font: '800 15px Manrope,sans-serif', color: '#0f8a6d' }}>$48.400</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', background: '#fbeceb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px' }}>📉</span>
            </div>
            <div>
              <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Comisión Turapp</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: '#666' }}>22%</div>
            </div>
          </div>
          <div style={{ font: '800 15px Manrope,sans-serif', color: '#c8402f' }}>-$118.500</div>
        </div>

      </div>

      {/* Streak Bonus */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ background: '#e7f3ef', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ font: '800 15px Manrope,sans-serif', color: '#0f8a6d', marginBottom: '4px' }}>Bono de racha</div>
            <div style={{ font: '500 12px Manrope,sans-serif', color: '#0f8a6d', opacity: 0.8 }}>Completa 12 viajes hoy y gana $25.000 extra</div>
          </div>
          <div style={{ font: '800 24px Manrope,sans-serif', color: '#0f8a6d' }}>2/12</div>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
}

'use client';

import React from 'react';
import DriverBottomNav from '../../../components/DriverBottomNav';

export default function PerformancePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', paddingBottom: '100px', fontFamily: 'Manrope, sans-serif' }}>
      
      {/* Header */}
      <div style={{ padding: '40px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '800 24px Manrope,sans-serif' }}>Desempeño</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ font: '600 16px Manrope,sans-serif', color: '#666' }}>Próximamente...</div>
      </div>

      <DriverBottomNav />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function CaliPage() {
  const { lang } = useAppContext();
  const [filter, setFilter] = useState(0);

  const t = lang === 'en' ? {
    search: 'Search by plate or driver...',
    newBtn: 'Schedule Route'
  } : {
    search: 'Buscar placa o conductor...',
    newBtn: 'Programar Ruta'
  };

  const filters = [
    { label: lang==='en'?'All':'Todos', count: 12 },
    { label: lang==='en'?'Boarding':'Abordando', count: 3 },
    { label: lang==='en'?'En route':'En ruta', count: 7 },
    { label: lang==='en'?'Completed':'Completados', count: 2 }
  ];

  const cols = lang === 'en'
    ? ['DEPARTURE', 'DRIVER (WHITE PLATE)', 'ROUTE', 'SEATS', 'STATUS', '']
    : ['SALIDA', 'CONDUCTOR (PLACA BLANCA)', 'RUTA', 'PUESTOS', 'ESTADO', ''];

  const ST = {
    board: { label: lang==='en'?'Boarding':'Abordando', dot:'var(--brand)', tx:'var(--brand)' },
    enroute: { label: lang==='en'?'En route':'En ruta', dot:'var(--amber)', tx:'var(--amber)' },
    done: { label: lang==='en'?'Completed':'Completado', dot:'var(--jade)', tx:'var(--jade)' }
  };

  const rows = [
    { time:'06:30 AM', initials:'JR', driver:'Jhon Riascos', plate:'KHT-29B', brand:'Chevrolet Express', route:'Buenaventura → Cali', seats: 4, max: 4, st:'enroute' },
    { time:'07:00 AM', initials:'MC', driver:'Marta Caicedo', plate:'WBD-84F', brand:'Renault Trafic', route:'Cali → Buenaventura', seats: 3, max: 4, st:'enroute' },
    { time:'07:30 AM', initials:'YM', driver:'Yeison Mosquera', plate:'WBC-41D', brand:'Nissan NV350', route:'Buenaventura → Cali', seats: 4, max: 4, st:'board' },
    { time:'08:00 AM', initials:'LA', driver:'Luis Ablanque', plate:'WBA-11C', brand:'Chevrolet Express', route:'Cali → Buenaventura', seats: 2, max: 4, st:'board' },
    { time:'05:30 AM', initials:'JP', driver:'Juan Pérez', plate:'JHL-91A', brand:'Renault Trafic', route:'Buenaventura → Cali', seats: 4, max: 4, st:'done' },
  ].map(r => Object.assign({}, r, {
    stDot: ST[r.st].dot,
    stTx: ST[r.st].tx,
    stLabel: ST[r.st].label
  }));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 14px', borderRadius: '99px', background: 'var(--bg)', border: '1px solid var(--bd2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--mu)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder={t.search} style={{ flex: 1, font: '500 12px Manrope,sans-serif' }} />
        </div>
        {filters.map((f, i) => {
          const isActive = filter === i;
          return (
            <button
              key={i}
              onClick={() => setFilter(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 16px', borderRadius: '99px', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--inv)' : 'var(--bg)',
                color: isActive ? 'var(--invtx)' : 'var(--mu)',
                border: isActive ? 'none' : '1px solid var(--bd)'
              }}
            >
              <div>{f.label}</div>
              <div style={{ padding: '2px 6px', borderRadius: '99px', background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--sf2)', color: isActive ? '#fff' : 'var(--tx)', font: "600 10px 'IBM Plex Mono',monospace" }}>{f.count}</div>
            </button>
          );
        })}
        <button style={{ height: '36px', padding: '0 16px', borderRadius: '99px', background: 'var(--brand)', color: '#fff', font: '700 12px Manrope,sans-serif', border: 'none', cursor: 'pointer' }}>
          {t.newBtn}
        </button>
      </div>
      <div style={{ borderRadius: '18px', background: 'var(--bg)', border: '1px solid var(--bd2)', overflow: 'hidden', boxShadow: 'var(--sh2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.6fr 1.4fr 1fr 1fr 40px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--bd2)', background: 'var(--sf)' }}>
          {cols.map((c, i) => (
            <div key={i} style={{ font: '800 10.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em', textTransform: 'uppercase' }}>{c}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.6fr 1.4fr 1fr 1fr 40px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--bd2)', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ font: "700 12px 'IBM Plex Mono',monospace", color: 'var(--tx)' }}>{r.time}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px Manrope,sans-serif', flex: 'none', color: 'var(--brand)' }}>{r.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '700 13px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.driver}</div>
                <div style={{ font: "600 11px 'IBM Plex Mono',monospace", color: 'var(--mu)', marginTop: '2px' }}>{r.plate} • {r.brand}</div>
              </div>
            </div>
            <div>
              <div style={{ font: '600 12.5px Manrope,sans-serif', color: 'var(--tx)' }}>{r.route}</div>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px', background: r.seats === r.max ? 'var(--brandS)' : 'var(--sf2)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={r.seats === r.max ? 'var(--brand)' : 'var(--tx)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span style={{ font: "700 11.5px 'IBM Plex Mono',monospace", color: r.seats === r.max ? 'var(--brand)' : 'var(--tx)' }}>{r.seats}/{r.max}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: r.stDot }}></div>
              <div style={{ font: '700 11.5px Manrope,sans-serif', color: r.stTx }}>{r.stLabel}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mu)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

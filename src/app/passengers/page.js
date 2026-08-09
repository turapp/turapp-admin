'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function PassengersPage() {
  const { lang } = useAppContext();
  const [filter, setFilter] = useState(0);

  const t = lang === 'en' ? {
    search: 'Search passenger name, email or phone...',
    newBtn: 'Add Passenger',
    active: 'Active',
    blocked: 'Blocked',
    unverified: 'Unverified'
  } : {
    search: 'Buscar pasajero por nombre, email o teléfono...',
    newBtn: 'Añadir Pasajero',
    active: 'Activo',
    blocked: 'Bloqueado',
    unverified: 'No verificado'
  };

  const filters = [
    { label: lang==='en'?'All':'Todos', count: 1250 },
    { label: lang==='en'?'Active':'Activos', count: 1120 },
    { label: lang==='en'?'Blocked':'Bloqueados', count: 45 },
    { label: lang==='en'?'VIP':'VIP', count: 85 }
  ];

  const cols = lang === 'en'
    ? ['PASSENGER', 'RATING', 'TRIPS', 'SPENT', 'STATUS', '']
    : ['PASAJERO', 'CALIFICACIÓN', 'VIAJES', 'GASTO TOTAL', 'ESTADO', ''];

  const rows = [
    { name: 'Ana Gómez', email: 'ana.g@gmail.com', phone: '+57 300 123 4567', rating: '4.9', trips: 145, spent: '$1.2M', st: 'active' },
    { name: 'Carlos Ruiz', email: 'carlos.r@hotmail.com', phone: '+57 310 987 6543', rating: '4.7', trips: 89, spent: '$850K', st: 'active' },
    { name: 'María Valencia', email: 'maria.v@gmail.com', phone: '+57 315 456 7890', rating: '5.0', trips: 210, spent: '$3.5M', st: 'vip' },
    { name: 'Pedro Moreno', email: 'pedro.m@yahoo.com', phone: '+57 320 111 2233', rating: '3.2', trips: 12, spent: '$120K', st: 'blocked' },
    { name: 'Lucía Fernández', email: 'lucia.f@gmail.com', phone: '+57 311 222 3344', rating: '4.8', trips: 56, spent: '$450K', st: 'active' },
  ].map(r => {
    let stDot = 'var(--jade)';
    let stTx = 'var(--jade)';
    let stLabel = t.active;
    if (r.st === 'blocked') {
      stDot = 'var(--red)'; stTx = 'var(--red)'; stLabel = t.blocked;
    } else if (r.st === 'vip') {
      stDot = 'var(--amber)'; stTx = 'var(--amber)'; stLabel = 'VIP';
    }
    return { ...r, stDot, stTx, stLabel };
  });

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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 40px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--bd2)', background: 'var(--sf)' }}>
          {cols.map((c, i) => (
            <div key={i} style={{ font: '800 10.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em', textTransform: 'uppercase' }}>{c}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 40px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--bd2)', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 13px Manrope,sans-serif', flex: 'none', color: 'var(--brand)' }}>
                {r.name.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '700 13px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                <div style={{ font: "600 11px 'IBM Plex Mono',monospace", color: 'var(--mu)', marginTop: '2px' }}>{r.phone} • {r.email}</div>
              </div>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', font: "700 13px 'IBM Plex Mono',monospace", color: 'var(--tx)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--amber)" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                {r.rating}
              </div>
            </div>
            <div style={{ font: "600 13px 'IBM Plex Mono',monospace", color: 'var(--tx)' }}>{r.trips}</div>
            <div style={{ font: "700 13px 'IBM Plex Mono',monospace", color: 'var(--tx)' }}>{r.spent}</div>
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

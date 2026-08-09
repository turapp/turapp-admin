'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function SupportPage() {
  const { lang } = useAppContext();
  const [filter, setFilter] = useState(0);

  const t = lang === 'en' ? {
    search: 'Search tickets...',
    newBtn: 'New Ticket',
    open: 'Open',
    resolved: 'Resolved',
    pending: 'Pending'
  } : {
    search: 'Buscar tickets...',
    newBtn: 'Nuevo Ticket',
    open: 'Abierto',
    resolved: 'Resuelto',
    pending: 'Pendiente'
  };

  const filters = [
    { label: lang==='en'?'All':'Todos', count: 120 },
    { label: lang==='en'?'Open':'Abiertos', count: 45 },
    { label: lang==='en'?'Pending':'Pendientes', count: 12 },
    { label: lang==='en'?'Resolved':'Resueltos', count: 63 }
  ];

  const cols = lang === 'en'
    ? ['TICKET ID', 'SUBJECT', 'USER', 'LAST UPDATE', 'STATUS', '']
    : ['ID TICKET', 'ASUNTO', 'USUARIO', 'ÚLTIMA ACT.', 'ESTADO', ''];

  const rows = [
    { id: '#TK-1023', subject: 'Problema con cobro de tarjeta', user: 'Ana Gómez', type: 'Passenger', date: 'Hoy, 10:30 AM', st: 'open' },
    { id: '#TK-1022', subject: 'Cuenta bloqueada sin razón', user: 'Carlos Ruiz', type: 'Driver', date: 'Ayer, 04:15 PM', st: 'open' },
    { id: '#TK-1021', subject: 'Viaje intermunicipal cancelado', user: 'María Valencia', type: 'Driver', date: '04 Ago, 09:20 AM', st: 'pending' },
    { id: '#TK-1020', subject: 'Cambio de placa de vehículo', user: 'Pedro Moreno', type: 'Driver', date: '03 Ago, 11:10 AM', st: 'resolved' },
    { id: '#TK-1019', subject: 'Objeto olvidado en taxi', user: 'Lucía Fernández', type: 'Passenger', date: '01 Ago, 02:45 PM', st: 'resolved' },
  ].map(r => {
    let stDot = 'var(--amber)';
    let stTx = 'var(--amber)';
    let stLabel = t.pending;
    let stBg = 'var(--amberS)';
    if (r.st === 'open') {
      stDot = 'var(--red)'; stTx = 'var(--red)'; stLabel = t.open; stBg = 'var(--redS)';
    } else if (r.st === 'resolved') {
      stDot = 'var(--jade)'; stTx = 'var(--jade)'; stLabel = t.resolved; stBg = 'var(--jadeS)';
    }
    return { ...r, stDot, stTx, stLabel, stBg };
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
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr 1.5fr 1fr 1fr 40px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--bd2)', background: 'var(--sf)' }}>
          {cols.map((c, i) => (
            <div key={i} style={{ font: '800 10.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em', textTransform: 'uppercase' }}>{c}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr 1.5fr 1fr 1fr 40px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--bd2)', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ font: "700 13px 'IBM Plex Mono',monospace", color: 'var(--brand)' }}>{r.id}</div>
            <div>
              <div style={{ font: '700 13px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--tx)' }}>{r.subject}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 10px Manrope,sans-serif', flex: 'none', color: 'var(--mu)' }}>
                {r.user.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '600 12px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.user}</div>
                <div style={{ font: "600 10px 'IBM Plex Mono',monospace", color: 'var(--mu)', marginTop: '2px' }}>{r.type}</div>
              </div>
            </div>
            <div style={{ font: "500 12px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>{r.date}</div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px', background: r.stBg }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: r.stDot }}></div>
                <span style={{ font: "700 11px 'IBM Plex Mono',monospace", color: r.stTx }}>{r.stLabel}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mu)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

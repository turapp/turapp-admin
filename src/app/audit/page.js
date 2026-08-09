'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function AuditPage() {
  const { lang } = useAppContext();
  const [auditFilter, setAuditFilter] = useState(0);

  const t = lang === 'en' ? {
    retention: '7 days retention'
  } : {
    retention: 'Retención de 7 días'
  };

  const auditFilters = [
    { label: lang==='en'?'All':'Todos' },
    { label: lang==='en'?'Finance':'Finanzas' },
    { label: lang==='en'?'Users':'Usuarios' },
    { label: lang==='en'?'System':'Sistema' }
  ];

  const auditCols = lang === 'en'
    ? ['TIMESTAMP', 'USER', 'ACTION', 'DETAIL', 'IP ADDRESS']
    : ['FECHA Y HORA', 'USUARIO', 'ACCIÓN', 'DETALLE', 'DIRECCIÓN IP'];

  const ACT = {
    auth: { bg:'var(--jadeS)', tx:'var(--jade)' },
    fin: { bg:'var(--amberS)', tx:'var(--amber)' },
    sys: { bg:'var(--redS)', tx:'var(--red)' },
    usr: { bg:'var(--sf2)', tx:'var(--tx)' }
  };

  const auditRows = [
    { at:'14:28:12', initials:'DC', who:'Diego Córdoba', act:'fin', action: lang==='en'?'PAYOUT_APPROVED':'APROBACIÓN_RETIRO', detail: lang==='en'?'Approved $142,500 payout to Yeison Mosquera':'Aprobó retiro por $142.500 a Yeison Mosquera', ip:'190.14.22.84' },
    { at:'13:14:05', initials:'LV', who:'Luis Valencia', act:'auth', action: lang==='en'?'LOGIN_SUCCESS':'LOGIN_EXITOSO', detail: lang==='en'?'Logged in via web app':'Inicio de sesión desde app web', ip:'181.55.102.1' },
    { at:'11:50:22', initials:'SYS', who:'System', act:'sys', action: lang==='en'?'CRON_BACKUP':'BACKUP_PROGRAMADO', detail: lang==='en'?'Database backup completed (4.2GB)':'Backup de base de datos finalizado (4.2GB)', ip:'127.0.0.1' },
    { at:'10:30:18', initials:'DC', who:'Diego Córdoba', act:'usr', action: lang==='en'?'DOC_VERIFIED':'DOC_VERIFICADO', detail: lang==='en'?'Verified SOAT for vehicle KHT29B':'Verificó SOAT del vehículo KHT29B', ip:'190.14.22.84' },
    { at:'09:12:44', initials:'LV', who:'Luis Valencia', act:'usr', action: lang==='en'?'TICKET_CLOSED':'TICKET_CERRADO', detail: lang==='en'?'Closed ticket TK-4819 (App crash)':'Cerró ticket TK-4819 (Cierre de app)', ip:'181.55.102.1' },
    { at:'08:00:00', initials:'SYS', who:'System', act:'fin', action: lang==='en'?'PROMO_EXPIRED':'PROMO_EXPIRADA', detail: lang==='en'?'Promo code LLUVIA20 expired automatically':'Código LLUVIA20 expiró automáticamente', ip:'127.0.0.1' }
  ].map(ar => Object.assign({}, ar, { actBg: ACT[ar.act].bg, actTx: ACT[ar.act].tx }));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
        {auditFilters.map((af, i) => {
          const isActive = auditFilter === i;
          return (
            <button
              key={i}
              onClick={() => setAuditFilter(i)}
              style={{
                height: '34px', padding: '0 14px', borderRadius: '8px', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--inv)' : 'var(--bg)',
                color: isActive ? 'var(--invtx)' : 'var(--mu)',
                border: isActive ? 'none' : '1px solid var(--bd)'
              }}
            >
              {af.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 14px', borderRadius: '9px', background: 'var(--bg)', border: '1px solid var(--bd)', font: "600 12px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>
          {t.retention}
        </div>
      </div>
      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1fr 1.2fr 2fr 0.9fr', gap: '12px', padding: '12px 18px', borderBottom: '1px solid var(--bd2)', background: 'var(--sf)' }}>
          {auditCols.map((ac, i) => (
            <div key={i} style={{ font: '700 10.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em' }}>{ac}</div>
          ))}
        </div>
        {auditRows.map((ar, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.9fr 1fr 1.2fr 2fr 0.9fr', gap: '12px', padding: '12px 18px', borderBottom: '1px solid var(--bd2)', alignItems: 'center' }}>
            <div style={{ font: "500 11px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>{ar.at}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 8.5px Manrope,sans-serif', flex: 'none' }}>{ar.initials}</div>
              <div style={{ font: '600 11.5px Manrope,sans-serif', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ar.who}</div>
            </div>
            <div>
              <div style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '6px', background: ar.actBg, color: ar.actTx, font: "700 10px 'IBM Plex Mono',monospace", whiteSpace: 'nowrap' }}>{ar.action}</div>
            </div>
            <div style={{ font: '500 11.5px/1.45 Manrope,sans-serif', color: 'var(--mu)', minWidth: 0 }}>{ar.detail}</div>
            <div style={{ font: "500 10.5px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>{ar.ip}</div>
          </div>
        ))}
      </div>
    </>
  );
}

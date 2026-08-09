'use client';

import { useAppContext } from '../../context/AppProvider';

export default function PaymentsPage() {
  const { lang } = useAppContext();

  const t = lang === 'en' ? {
    commissionByCat: 'Commission by category',
    payoutQueue: 'Payout queue',
    payoutSub: 'Drivers requesting withdrawal of their balance.',
    approveAll: 'Approve all',
    cashTitle: 'Pending cash deposits',
    cashBody: 'There are 24 drivers who have reached the $50,000 cash limit and must deposit to continue receiving cash trips.',
    seeDebtors: 'See debtors'
  } : {
    commissionByCat: 'Comisiones por categoría',
    payoutQueue: 'Cola de retiros',
    payoutSub: 'Conductores solicitando retiro de saldo a su cuenta bancaria.',
    approveAll: 'Aprobar todos',
    cashTitle: 'Recaudos en efectivo pendientes',
    cashBody: 'Hay 24 conductores que superaron el límite de $50.000 en efectivo y deben hacer recaudo para seguir recibiendo viajes de este tipo.',
    seeDebtors: 'Ver deudores'
  };

  const financeKpis = [
    { label: lang==='en'?'GROSS REVENUE':'FACTURACIÓN BRUTA', value:'$112,4M', sub: lang==='en'?'Last 30 days':'Últimos 30 días', tx:'var(--tx)' },
    { label: lang==='en'?'COMMISSION EARNED':'COMISIÓN RETENIDA', value:'$14,2M', sub: lang==='en'?'Platform net':'Neto de la plataforma', tx:'var(--jade)' },
    { label: lang==='en'?'OUTSTANDING DEBT':'DEUDA CONDUCTORES', value:'$2,8M', sub: lang==='en'?'Pending cash deposits':'Efectivo no depositado', tx:'var(--amber)' },
    { label: lang==='en'?'PAYOUTS PENDING':'RETIROS PENDIENTES', value:'$4,1M', sub: lang==='en'?'To transfer today':'A transferir hoy', tx:'var(--tx)' }
  ];

  const commCols = lang === 'en'
    ? ['CATEGORY','TRIPS','GROSS REV','COMM. RATE','NET COMM.']
    : ['CATEGORÍA','VIAJES','FACT. BRUTA','TASA COM.','COM. NETA'];

  const commRows = [
    { name:'Taxis', bg:'var(--brand)', trips:'18.412', gross:'$42.8M', rate:'10%', net:'$4.28M' },
    { name:'Viajes a Cali', bg:'var(--tx)', trips:'14.880', gross:'$38.4M', rate:'15%', net:'$5.76M' },
    { name:'Tura Favor', bg:'var(--mu)', trips:'912', gross:'$3.0M', rate:'15%', net:'$0.45M' }
  ];

  const payouts = [
    { initials:'YM', name:'Yeison Mosquera', target:'Bancolombia · 4118', amount:'$142.500' },
    { initials:'LV', name:'Luis Valencia', target:'Nequi · 316552', amount:'$84.200' },
    { initials:'JR', name:'Jhon Riascos', target:'Daviplata · 318442', amount:'$210.000' },
    { initials:'MC', name:'Marta Caicedo', target:'Bancolombia · 9912', amount:'$418.000' }
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '16px' }}>
        {financeKpis.map((fk, i) => (
          <div key={i} style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '16px 17px' }}>
            <div style={{ font: '600 11px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.04em', marginBottom: '10px' }}>{fk.label}</div>
            <div style={{ font: "800 24px/1 'IBM Plex Mono',monospace", letterSpacing: '-.035em', color: fk.tx, marginBottom: '7px' }}>{fk.value}</div>
            <div style={{ font: '500 11px Manrope,sans-serif', color: 'var(--mu)' }}>{fk.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '14px', marginBottom: '16px' }}>
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
          <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '18px' }}>{t.commissionByCat}</div>
          <div style={{ borderRadius: '11px', overflow: 'hidden', border: '1px solid var(--bd2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '11px 15px', background: 'var(--sf)' }}>
              {commCols.map((cc, i) => (
                <div key={i} style={{ font: '700 10px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em' }}>{cc}</div>
              ))}
            </div>
            {commRows.map((cr, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '12px 15px', borderTop: '1px solid var(--bd2)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: cr.bg, flex: 'none' }}></div>
                  <div style={{ font: '600 12px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cr.name}</div>
                </div>
                <div style={{ font: "600 11.5px 'IBM Plex Mono',monospace" }}>{cr.trips}</div>
                <div style={{ font: "600 11.5px 'IBM Plex Mono',monospace" }}>{cr.gross}</div>
                <div style={{ font: "600 11.5px 'IBM Plex Mono',monospace", color: 'var(--jade)' }}>{cr.rate}</div>
                <div style={{ font: "700 11.5px 'IBM Plex Mono',monospace" }}>{cr.net}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
          <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '5px' }}>{t.payoutQueue}</div>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginBottom: '16px' }}>{t.payoutSub}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '16px' }}>
            {payouts.map((po, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 12px', borderRadius: '11px', background: 'var(--sf)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 10px Manrope,sans-serif', flex: 'none' }}>{po.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 12px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{po.name}</div>
                  <div style={{ font: '500 10px Manrope,sans-serif', color: 'var(--mu)', marginTop: '1px' }}>{po.target}</div>
                </div>
                <div style={{ font: "700 12px 'IBM Plex Mono',monospace", flex: 'none' }}>{po.amount}</div>
              </div>
            ))}
          </div>
          <button style={{ height: '42px', borderRadius: '10px', background: 'var(--jade)', color: '#fff', font: '700 13px Manrope,sans-serif', width: '100%', border: 'none', cursor: 'pointer' }}>{t.approveAll}</button>
        </div>
      </div>
      <div style={{ borderRadius: '14px', background: 'var(--amberS)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flex: 'none' }}><circle cx="10" cy="10" r="8" stroke="var(--amber)" strokeWidth="1.8"></circle><path d="M10 6v5" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="10" cy="13.8" r="1.1" fill="var(--amber)"></circle></svg>
        <div style={{ flex: 1 }}>
          <div style={{ font: '700 13px Manrope,sans-serif', color: 'var(--amber)', marginBottom: '4px' }}>{t.cashTitle}</div>
          <div style={{ font: '500 11.5px/1.5 Manrope,sans-serif', color: 'var(--amber)', opacity: 0.9 }}>{t.cashBody}</div>
        </div>
        <button style={{ height: '36px', padding: '0 15px', borderRadius: '9px', background: 'var(--amber)', color: '#fff', font: '700 12.5px Manrope,sans-serif', flex: 'none', border: 'none', cursor: 'pointer' }}>{t.seeDebtors}</button>
      </div>
    </>
  );
}

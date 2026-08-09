'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';
import Icon from '../../components/ui/Icon';

export default function ReportsPage() {
  const { lang } = useAppContext();
  const [range, setRange] = useState(1);

  const t = lang === 'en' ? {
    revenueTrend: 'Revenue trend',
    last12: 'Last 12 months',
    demandVsSupply: 'Demand vs Supply',
    demandVsSupplySub: 'Trips requested vs drivers available per hour.',
    served: 'Served',
    requested: 'Requested',
    unservedTitle: 'Highest unserved demand',
    unservedSub: 'Zones with the most missed trips.',
    savedReports: 'Saved reports',
    scheduleReport: 'Schedule report'
  } : {
    revenueTrend: 'Tendencia de ingresos',
    last12: 'Últimos 12 meses',
    demandVsSupply: 'Demanda vs Oferta',
    demandVsSupplySub: 'Viajes solicitados vs conductores disponibles por hora.',
    served: 'Atendidos',
    requested: 'Solicitados',
    unservedTitle: 'Mayor demanda insatisfecha',
    unservedSub: 'Zonas con más viajes perdidos.',
    savedReports: 'Reportes guardados',
    scheduleReport: 'Programar reporte'
  };

  const reportRanges = [
    { label: lang==='en'?'7 days':'7 días' },
    { label: lang==='en'?'30 days':'30 días' },
    { label: lang==='en'?'12 months':'12 meses' }
  ];

  const reportBars = [
    { cap:'$10M', h:'30%', bg:'var(--sf2)', label:'Sep' },
    { cap:'$12M', h:'36%', bg:'var(--sf2)', label:'Oct' },
    { cap:'$15M', h:'45%', bg:'var(--sf2)', label:'Nov' },
    { cap:'$24M', h:'72%', bg:'var(--jade)', label:'Dic' },
    { cap:'$18M', h:'54%', bg:'var(--sf2)', label:'Ene' },
    { cap:'$14M', h:'42%', bg:'var(--sf2)', label:'Feb' },
    { cap:'$16M', h:'48%', bg:'var(--sf2)', label:'Mar' },
    { cap:'$19M', h:'57%', bg:'var(--sf2)', label:'Abr' },
    { cap:'$22M', h:'66%', bg:'var(--sf2)', label:'May' },
    { cap:'$21M', h:'63%', bg:'var(--sf2)', label:'Jun' },
    { cap:'$28M', h:'84%', bg:'var(--jade)', label:'Jul' },
    { cap:'$32M', h:'96%', bg:'var(--tx)', label:'Ago' }
  ];

  const supplyCols = [
    { label:'6a', h:'30%', fill:'28%', bg:'var(--jade)' },
    { label:'8a', h:'60%', fill:'40%', bg:'var(--amber)' },
    { label:'10a', h:'40%', fill:'35%', bg:'var(--jade)' },
    { label:'12p', h:'50%', fill:'45%', bg:'var(--jade)' },
    { label:'4p', h:'80%', fill:'60%', bg:'var(--amber)' },
    { label:'6p', h:'100%', fill:'70%', bg:'var(--red)' },
    { label:'8p', h:'70%', fill:'65%', bg:'var(--jade)' }
  ];

  const unserved = [
    { zone:'Centro Comercial Pacífico', value:'412', pct:'100%', tx:'var(--red)' },
    { zone:'Terminal de Transportes', value:'384', pct:'93%', tx:'var(--red)' },
    { zone:'Barrio Juan XXIII', value:'210', pct:'51%', tx:'var(--amber)' },
    { zone:'Malecón', value:'145', pct:'35%', tx:'var(--tx)' },
    { zone:'Galerías', value:'84', pct:'20%', tx:'var(--mu)' }
  ];

  const savedReports = [
    { name: lang==='en'?'Daily finance summary':'Resumen financiero diario', cadence: lang==='en'?'Sent everyday at 6am':'Enviado diario 6am', glyph:['M3 6.4h16v10.2H3zM3 9.6h16'] },
    { name: lang==='en'?'Driver churn rate':'Tasa de abandono de conductores', cadence: lang==='en'?'Sent on Mondays':'Enviado los lunes', glyph:['M16 14A6 6 0 1 0 4 14M10 2v4M7 3l1.5 1.5'] },
    { name: lang==='en'?'Top 100 riders':'Top 100 pasajeros', cadence: lang==='en'?'Monthly (1st)':'Mensual (día 1)', glyph:['M12 2.4l2.9 6.1 6.7.9-4.9 4.7 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.4 9.4l6.7-.9L12 2.4Z'] }
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '16px' }}>
        {reportRanges.map((rr, i) => {
          const isActive = range === i;
          return (
            <button
              key={i}
              onClick={() => setRange(i)}
              style={{
                height: '34px', padding: '0 14px', borderRadius: '8px', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--inv)' : 'var(--bg)',
                color: isActive ? 'var(--invtx)' : 'var(--mu)',
                border: isActive ? 'none' : '1px solid var(--bd)'
              }}
            >
              {rr.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }}></div>
        <button style={{ height: '36px', padding: '0 15px', borderRadius: '9px', background: 'var(--inv)', color: 'var(--invtx)', font: '700 12.5px Manrope,sans-serif', display: 'flex', alignItems: 'center', gap: '7px', border: 'none', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2.6v7.2M8 9.8 5.2 7M8 9.8 10.8 7M3 12.8h10" stroke="var(--invtx)" strokeWidth="1.6" strokeLinecap="round"></path></svg>
          {t.scheduleReport}
        </button>
      </div>

      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px', marginBottom: '16px' }}>
        <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em' }}>{t.revenueTrend}</div>
        <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '3px', marginBottom: '20px' }}>{t.last12}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '186px' }}>
          {reportBars.map((rb, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ font: "600 9px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>{rb.cap}</div>
              <div style={{ width: '100%', height: rb.h, borderRadius: '5px 5px 2px 2px', background: rb.bg, transformOrigin: 'bottom' }}></div>
              <div style={{ font: '600 9.5px Manrope,sans-serif', color: 'var(--mu)' }}>{rb.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
          <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '4px' }}>{t.demandVsSupply}</div>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginBottom: '20px' }}>{t.demandVsSupplySub}</div>
          <div style={{ position: 'relative', height: '184px' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: '9px' }}>
              {supplyCols.map((sc, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', position: 'relative', height: sc.h, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '5px 5px 2px 2px', background: 'var(--sf2)', transformOrigin: 'bottom' }}></div>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: sc.fill, borderRadius: '5px 5px 2px 2px', background: sc.bg, transformOrigin: 'bottom' }}></div>
                  </div>
                  <div style={{ font: '600 9.5px Manrope,sans-serif', color: 'var(--mu)' }}>{sc.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '9px', height: '9px', borderRadius: '3px', background: 'var(--jade)' }}></div><div style={{ font: '600 11px Manrope,sans-serif', color: 'var(--mu)' }}>{t.served}</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '9px', height: '9px', borderRadius: '3px', background: 'var(--sf2)' }}></div><div style={{ font: '600 11px Manrope,sans-serif', color: 'var(--mu)' }}>{t.requested}</div></div>
          </div>
        </div>

        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
          <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '4px' }}>{t.unservedTitle}</div>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginBottom: '18px' }}>{t.unservedSub}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {unserved.map((us, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '7px' }}>
                  <div style={{ font: '600 12.5px Manrope,sans-serif', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{us.zone}</div>
                  <div style={{ font: "700 12.5px 'IBM Plex Mono',monospace", color: us.tx, flex: 'none' }}>{us.value}</div>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--sf2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: us.pct, background: us.tx, borderRadius: '3px', transformOrigin: 'left' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
        <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '16px' }}>{t.savedReports}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '11px' }}>
          {savedReports.map((sr, i) => (
            <button key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 15px', borderRadius: '12px', background: 'var(--sf)', textAlign: 'left', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon paths={sr.glyph} color="var(--tx)" size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '700 12.5px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--tx)' }}>{sr.name}</div>
                <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '2px' }}>{sr.cadence}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

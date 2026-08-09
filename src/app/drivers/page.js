'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function DriversPage() {
  const { lang } = useAppContext();
  const [driverFilter, setDriverFilter] = useState(1);

  const t = lang === 'en' ? {
    exportCsv: 'Export CSV', showing: 'Showing', of: 'of',
    reviewDocs: 'Review', viewProfile: 'View profile'
  } : {
    exportCsv: 'Exportar CSV', showing: 'Mostrando', of: 'de',
    reviewDocs: 'Revisar', viewProfile: 'Ver perfil'
  };

  const driverFilters = [
    { label: lang==='en'?'All':'Todos', count:'218' },
    { label: lang==='en'?'Pending review':'Pendientes', count:'14' },
    { label: lang==='en'?'Approved':'Aprobados', count:'186' },
    { label: lang==='en'?'Suspended':'Suspendidos', count:'11' },
    { label: lang==='en'?'Expiring docs':'Documentos por vencer', count:'7' }
  ];

  const driverCols = lang === 'en'
    ? ['DRIVER','VEHICLE','CATEGORY','DOCS','STATUS','']
    : ['CONDUCTOR','VEHÍCULO','CATEGORÍA','DOCS','ESTADO',''];

  const doc = (short, state) => ({
    short, name: short,
    bg: state === 'ok' ? 'var(--jadeS)' : (state === 'wait' ? 'var(--amberS)' : (state === 'bad' ? 'var(--redS)' : 'var(--sf2)')),
    tx: state === 'ok' ? 'var(--jade)' : (state === 'wait' ? 'var(--amber)' : (state === 'bad' ? 'var(--red)' : 'var(--mu)'))
  });
  
  const CAT = {
    taxi: { label:'TurTaxi', bg:'var(--amberS)', tx:'var(--amber)' },
    carro: { label:'TurCarro', bg:'var(--sf2)', tx:'var(--tx)' },
    inter: { label:'Intermunicipal', bg:'var(--jadeS)', tx:'var(--jade)' }
  };

  const driverRows = [
    { initials:'OR', name:'Óscar Rentería Valencia', cc:'16.552.114', plate:'WBE72K', car:'Kia Rio 2020', cat:'carro',
      docs:[doc('CC','ok'),doc('LC','ok'),doc('SO','wait'),doc('TM','none')], state: lang==='en'?'Pending review':'Pendiente', stateDot:'var(--amber)', stateTx:'var(--amber)', needsReview:1 },
    { initials:'LV', name:'Luis Valencia Grueso', cc:'16.203.887', plate:'WBT18A', car:'Chevrolet N300 2019', cat:'taxi',
      docs:[doc('CC','ok'),doc('LC','wait'),doc('SO','ok'),doc('TM','ok')], state: lang==='en'?'Pending review':'Pendiente', stateDot:'var(--amber)', stateTx:'var(--amber)', needsReview:1 },
    { initials:'YM', name:'Yeison Mosquera Díaz', cc:'16.482.771', plate:'WBC41D', car:'Chevrolet Spark GT 2019', cat:'carro',
      docs:[doc('CC','ok'),doc('LC','ok'),doc('SO','ok'),doc('TM','ok')], state: lang==='en'?'Active':'Activo', stateDot:'var(--jade)', stateTx:'var(--jade)', approved:1 },
    { initials:'JR', name:'Jhon Riascos Ospina', cc:'16.771.442', plate:'KHT29B', car:'Hyundai Accent 2021', cat:'taxi',
      docs:[doc('CC','ok'),doc('LC','ok'),doc('SO','ok'),doc('TM','ok')], state: lang==='en'?'Active':'Activo', stateDot:'var(--jade)', stateTx:'var(--jade)', approved:1 },
    { initials:'MC', name:'Marta Caicedo Bonilla', cc:'31.884.109', plate:'WBD84F', car:'Renault Logan 2022', cat:'inter',
      docs:[doc('CC','ok'),doc('LC','ok'),doc('SO','ok'),doc('TM','ok')], state: lang==='en'?'Active':'Activo', stateDot:'var(--jade)', stateTx:'var(--jade)', approved:1 },
    { initials:'AG', name:'Andrés Grueso Mina', cc:'16.119.038', plate:'WBM55J', car:'Nissan Versa 2018', cat:'carro',
      docs:[doc('CC','ok'),doc('LC','ok'),doc('SO','bad'),doc('TM','ok')], state: lang==='en'?'Suspended':'Suspendido', stateDot:'var(--red)', stateTx:'var(--red)', approved:1 },
    { initials:'NP', name:'Nury Palacios Rivas', cc:'31.402.556', plate:'WBQ07L', car:'Kia Picanto 2021', cat:'taxi',
      docs:[doc('CC','ok'),doc('LC','ok'),doc('SO','ok'),doc('TM','wait')], state: lang==='en'?'Docs expiring':'Doc. por vencer', stateDot:'var(--amber)', stateTx:'var(--amber)', approved:1 }
  ].map(d => Object.assign({}, d, { category: CAT[d.cat].label, catBg: CAT[d.cat].bg, catTx: CAT[d.cat].tx }));

  const pager = ['‹','1','2','3','›'];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
        {driverFilters.map((df, i) => {
          const isActive = driverFilter === i;
          return (
            <button
              key={i}
              onClick={() => setDriverFilter(i)}
              style={{
                height: '34px', padding: '0 14px', borderRadius: '8px', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--inv)' : 'var(--bg)',
                color: isActive ? 'var(--invtx)' : 'var(--mu)',
                border: isActive ? 'none' : '1px solid var(--bd)'
              }}
            >
              {df.label}
              {df.count && <span style={{ fontFamily: "'IBM Plex Mono',monospace", opacity: 0.7 }}> {df.count}</span>}
            </button>
          );
        })}
        <div style={{ flex: 1 }}></div>
        <button style={{ height: '36px', padding: '0 15px', borderRadius: '9px', background: 'var(--bg)', border: '1px solid var(--bd)', font: '700 12.5px Manrope,sans-serif', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', color: 'var(--tx)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2.6v7.2M8 9.8 5.2 7M8 9.8 10.8 7M3 12.8h10" stroke="var(--tx)" strokeWidth="1.6" strokeLinecap="round"></path></svg>
          {t.exportCsv}
        </button>
      </div>

      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '34px 1.5fr 1fr 1.1fr 0.8fr 0.9fr 168px', gap: '12px', padding: '12px 18px', borderBottom: '1px solid var(--bd2)', background: 'var(--sf)' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.6px solid var(--bd)' }}></div>
          {driverCols.map((dc, i) => (
            <div key={i} style={{ font: '700 10.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em' }}>{dc}</div>
          ))}
        </div>
        
        {driverRows.map((dr, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '34px 1.5fr 1fr 1.1fr 0.8fr 0.9fr 168px', gap: '12px', padding: '13px 18px', borderBottom: '1px solid var(--bd2)', alignItems: 'center' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.6px solid var(--bd)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px Manrope,sans-serif', flex: 'none' }}>{dr.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '700 12.5px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dr.name}</div>
                <div style={{ font: "500 10.5px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>CC {dr.cc}</div>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "600 11.5px 'IBM Plex Mono',monospace", letterSpacing: '.05em' }}>{dr.plate}</div>
              <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '2px' }}>{dr.car}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <div style={{ padding: '3px 8px', borderRadius: '6px', background: dr.catBg, color: dr.catTx, font: '700 10px Manrope,sans-serif', whiteSpace: 'nowrap' }}>{dr.category}</div>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {dr.docs.map((dd, idx) => (
                <div key={idx} title={dd.name} style={{ width: '20px', height: '20px', borderRadius: '5px', background: dd.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 8px Manrope,sans-serif', color: dd.tx }}>{dd.short}</div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: dr.stateDot, flex: 'none' }}></div>
              <div style={{ font: '600 11.5px Manrope,sans-serif', color: dr.stateTx, whiteSpace: 'nowrap' }}>{dr.state}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              {dr.needsReview && (
                <>
                  <button style={{ height: '30px', padding: '0 12px', borderRadius: '8px', background: 'var(--inv)', color: 'var(--invtx)', font: '700 11.5px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer' }}>{t.reviewDocs}</button>
                  <button style={{ height: '30px', width: '30px', borderRadius: '8px', background: 'var(--sf)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3.4" r="1.3" fill="var(--mu)"></circle><circle cx="8" cy="8" r="1.3" fill="var(--mu)"></circle><circle cx="8" cy="12.6" r="1.3" fill="var(--mu)"></circle></svg>
                  </button>
                </>
              )}
              {dr.approved && (
                <>
                  <button style={{ height: '30px', padding: '0 12px', borderRadius: '8px', background: 'var(--sf)', font: '700 11.5px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', color: 'var(--tx)', cursor: 'pointer' }}>{t.viewProfile}</button>
                  <button style={{ height: '30px', width: '30px', borderRadius: '8px', background: 'var(--sf)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3.4" r="1.3" fill="var(--mu)"></circle><circle cx="8" cy="8" r="1.3" fill="var(--mu)"></circle><circle cx="8" cy="12.6" r="1.3" fill="var(--mu)"></circle></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px' }}>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)' }}>{t.showing} 7 {t.of} 218</div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {pager.map((pg, i) => (
              <button key={i} style={{
                width: '30px', height: '30px', borderRadius: '7px', font: "600 11.5px 'IBM Plex Mono',monospace", border: 'none', cursor: 'pointer',
                background: i === 1 ? 'var(--inv)' : 'var(--sf)',
                color: i === 1 ? 'var(--invtx)' : 'var(--mu)'
              }}>
                {pg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function TripsPage() {
  const { lang } = useAppContext();
  const [tripFilter, setTripFilter] = useState(1);

  const t = lang === 'en' ? {
    showing: 'Showing', of: 'of',
  } : {
    showing: 'Mostrando', of: 'de',
  };

  const tripFilters = [
    { label: lang==='en'?'All':'Todos', count:'42.812' },
    { label: lang==='en'?'Completed':'Completados', count:'34.502' },
    { label: lang==='en'?'Cancelled':'Cancelados', count:'4.110' },
    { label: lang==='en'?'In progress':'En curso', count:'42' }
  ];

  const tripCols = lang === 'en'
    ? ['ID','RIDER / TIME','DRIVER / PLATE','ROUTE','CATEGORY','PRICE','STATUS']
    : ['ID','PASAJERO / HORA','CONDUCTOR / PLACA','RUTA','CATEGORÍA','TARIFA','ESTADO'];

  const ST = {
    done: { label: lang==='en'?'Completed':'Completado', dot:'var(--jade)', tx:'var(--jade)' },
    cancel: { label: lang==='en'?'Cancelled':'Cancelado', dot:'var(--amber)', tx:'var(--amber)' },
    live: { label: lang==='en'?'In progress':'En curso', dot:'var(--tx)', tx:'var(--tx)' }
  };

  const CAT = {
    taxi: { label:'Taxis', bg:'var(--brandS)', tx:'var(--brand)' },
    carro: { label:'Viajes a Cali', bg:'var(--sf2)', tx:'var(--tx)' },
    inter: { label:'Tura Favor', bg:'var(--sf2)', tx:'var(--mu)' }
  };

  const tripRows = [
    { id:'TRP-84120', rider:'Diego Córdoba', driver:'Jhon Riascos', plate:'KHT29B', when:'14:22 · Hoy', route:'Centro Comercial Pacífico → B. Juan XXIII', amount:'$14.400', cat:'taxi', st:'done' },
    { id:'TRP-84119', rider:'María Silva', driver:'Yeison Mosquera', plate:'WBC41D', when:'14:18 · Hoy', route:'Terminal de Transportes → B. La Independencia', amount:'$18.500', cat:'carro', st:'live' },
    { id:'TRP-84118', rider:'Carlos Viveros', driver:'Óscar Rentería', plate:'WBE72K', when:'14:15 · Hoy', route:'B. El Cristal → Alcaldía', amount:'$12.000', cat:'carro', st:'cancel' },
    { id:'TRP-84117', rider:'Laura Valencia', driver:'Marta Caicedo', plate:'WBD84F', when:'14:02 · Hoy', route:'Buenaventura → Cali', amount:'$45.000', cat:'inter', st:'done' },
    { id:'TRP-84116', rider:'Andrés Mina', driver:'Luis Valencia', plate:'WBT18A', when:'13:54 · Hoy', route:'B. Lleras → Hospital Distrital', amount:'$15.200', cat:'taxi', st:'done' },
    { id:'TRP-84115', rider:'Diana Portocarrero', driver:'Yeison Mosquera', plate:'WBC41D', when:'13:41 · Hoy', route:'Sena → B. Los Pinos', amount:'$16.800', cat:'carro', st:'done' },
    { id:'TRP-84114', rider:'Juan Ocoró', driver:'Jhon Riascos', plate:'KHT29B', when:'13:28 · Hoy', route:'B. La Playita → Malecón', amount:'$11.500', cat:'taxi', st:'cancel' },
    { id:'TRP-84113', rider:'Ana Grueso', driver:'Marta Caicedo', plate:'WBD84F', when:'13:15 · Hoy', route:'B. Bellavista → Galerías', amount:'$13.400', cat:'carro', st:'done' }
  ].map(tr => Object.assign({}, tr, {
    category: CAT[tr.cat].label, catBg: CAT[tr.cat].bg, catTx: CAT[tr.cat].tx,
    state: ST[tr.st].label, dot: ST[tr.st].dot, stTx: ST[tr.st].tx
  }));

  const pager = ['‹','1','2','3','›'];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
        {tripFilters.map((tf, i) => {
          const isActive = tripFilter === i;
          return (
            <button
              key={i}
              onClick={() => setTripFilter(i)}
              style={{
                height: '34px', padding: '0 14px', borderRadius: '8px', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--inv)' : 'var(--bg)',
                color: isActive ? 'var(--invtx)' : 'var(--mu)',
                border: isActive ? 'none' : '1px solid var(--bd)'
              }}
            >
              {tf.label}
              {tf.count && <span style={{ fontFamily: "'IBM Plex Mono',monospace", opacity: 0.7 }}> {tf.count}</span>}
            </button>
          );
        })}
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 14px', borderRadius: '9px', background: 'var(--bg)', border: '1px solid var(--bd)', font: '600 12px Manrope,sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="2.6" y="4" width="12.8" height="11.4" rx="2" stroke="var(--tx)" strokeWidth="1.5"></rect><path d="M2.6 7.4h12.8M6.4 2.4v3.2M11.6 2.4v3.2" stroke="var(--tx)" strokeWidth="1.5" strokeLinecap="round"></path></svg>
          1 – 4 ago 2026
        </div>
      </div>

      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.3fr 1.6fr 0.9fr 0.9fr 0.9fr', gap: '12px', padding: '12px 18px', borderBottom: '1px solid var(--bd2)', background: 'var(--sf)' }}>
          {tripCols.map((tc, i) => (
            <div key={i} style={{ font: '700 10.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em' }}>{tc}</div>
          ))}
        </div>
        {tripRows.map((tr, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.3fr 1.6fr 0.9fr 0.9fr 0.9fr', gap: '12px', padding: '13px 18px', borderBottom: '1px solid var(--bd2)', alignItems: 'center' }}>
            <div style={{ font: "600 11px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>{tr.id}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: '600 12px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tr.rider}</div>
              <div style={{ font: "500 10px 'IBM Plex Mono',monospace", color: 'var(--mu)', marginTop: '1px' }}>{tr.when}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: '600 12px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tr.driver}</div>
              <div style={{ font: "500 10px 'IBM Plex Mono',monospace", color: 'var(--mu)', marginTop: '1px' }}>{tr.plate}</div>
            </div>
            <div style={{ minWidth: 0, font: '500 11.5px/1.4 Manrope,sans-serif', color: 'var(--mu)' }}>{tr.route}</div>
            <div><div style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '6px', background: tr.catBg, color: tr.catTx, font: '700 10px Manrope,sans-serif', whiteSpace: 'nowrap' }}>{tr.category}</div></div>
            <div style={{ font: "700 12px 'IBM Plex Mono',monospace" }}>{tr.amount}</div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: tr.dot }}></div>
                <div style={{ font: '600 11px Manrope,sans-serif', color: tr.stTx, whiteSpace: 'nowrap' }}>{tr.state}</div>
              </div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px' }}>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)' }}>{t.showing} 8 {t.of} 42.812</div>
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

'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function MapPage() {
  const { lang } = useAppContext();
  const [liveFilter, setLiveFilter] = useState(1);

  const t = {
    rightNow: lang === 'en' ? 'ACTIVE RIGHT NOW' : 'ACTIVO AHORA',
    activeTrips: lang === 'en' ? 'Active trips' : 'Viajes en curso',
    activeTripsSub: lang === 'en' ? 'Live monitoring of critical trips' : 'Monitoreo en vivo de viajes críticos'
  };

  const liveFilters = [
    { label: lang==='en'?'Online':'Conectados', count:'142', dot:'var(--jade)', bg:'var(--bg)', tx:'var(--tx)' },
    { label: lang==='en'?'On trip':'En viaje', count:'84', dot:'var(--tx)', bg:'var(--inv)', tx:'var(--invtx)' },
    { label: lang==='en'?'Idle':'Libres', count:'58', dot:'var(--amber)', bg:'var(--bg)', tx:'var(--tx)' }
  ];

  const liveStats = [
    { k: lang==='en'?'TurTaxi':'TurTaxi', v:'62', tx:'var(--amber)' },
    { k: lang==='en'?'TurCarro':'TurCarro', v:'54', tx:'var(--tx)' },
    { k: lang==='en'?'Intercity':'Intermunicipal', v:'12', tx:'var(--jade)' },
    { k: lang==='en'?'Delivery':'Envíos', v:'14', tx:'var(--mu)' }
  ];

  const activeTrips = [
    { id:'TRP-84119', initials:'YM', driver:'Yeison M.', rider:'María S.', route:'Terminal → La Independencia', amount:'$18.500', stBg:'var(--amberS)', stTx:'var(--amber)', state: lang==='en'?'Delay':'Retraso' },
    { id:'TRP-84122', initials:'LV', driver:'Luis V.', rider:'Carlos G.', route:'Centro → B. Juan XXIII', amount:'$12.000', stBg:'var(--jadeS)', stTx:'var(--jade)', state: lang==='en'?'On time':'A tiempo' },
    { id:'TRP-84125', initials:'MC', driver:'Marta C.', rider:'Diego C.', route:'Cali → Buenaventura', amount:'$45.000', stBg:'var(--jadeS)', stTx:'var(--jade)', state: lang==='en'?'On time':'A tiempo' },
    { id:'TRP-84128', initials:'JR', driver:'Jhon R.', rider:'Laura V.', route:'B. El Cristal → Malecón', amount:'$14.400', stBg:'var(--redS)', stTx:'var(--red)', state: lang==='en'?'SOS':'SOS' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '14px', height: '100%' }}>
      {/* Map Area */}
      <div style={{ borderRadius: '14px', background: 'var(--sf2)', border: '1px solid var(--bd2)', overflow: 'hidden', position: 'relative', minHeight: '620px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Placeholder for map */}
        <div style={{ font: "800 24px 'IBM Plex Mono',monospace", color: 'var(--bd)', letterSpacing: '-.04em' }}>[ MAP MOCKUP ]</div>
        
        <div style={{ position: 'absolute', left: '22%', top: '30%', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,64,47,.34), rgba(200,64,47,0) 70%)' }}></div>
        <div style={{ position: 'absolute', left: '52%', top: '52%', width: '190px', height: '190px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,138,30,.3), rgba(201,138,30,0) 70%)' }}></div>

        <div style={{ position: 'absolute', left: '16px', top: '16px', display: 'flex', gap: '8px' }}>
          {liveFilters.map((lf, i) => {
            const isActive = liveFilter === i;
            return (
              <button
                key={i}
                onClick={() => setLiveFilter(i)}
                style={{
                  height: '36px', padding: '0 14px', borderRadius: '9px', font: '700 12px Manrope,sans-serif', display: 'flex', alignItems: 'center', gap: '8px', border: isActive ? 'none' : '1px solid var(--bd)', cursor: 'pointer',
                  background: isActive ? 'var(--inv)' : 'var(--bg)',
                  color: isActive ? 'var(--invtx)' : 'var(--tx)',
                  boxShadow: 'var(--sh)'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: lf.dot }}></div>
                {lf.label}
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", opacity: 0.65 }}> {lf.count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'absolute', right: '16px', top: '16px', padding: '12px 14px', borderRadius: '11px', background: 'var(--bg)', boxShadow: 'var(--sh)', minWidth: '158px', border: '1px solid var(--bd)' }}>
          <div style={{ font: '600 9.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.1em', marginBottom: '9px' }}>{t.rightNow}</div>
          {liveStats.map((ls, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '3px 0' }}>
              <div style={{ font: '500 11px Manrope,sans-serif', color: 'var(--mu)' }}>{ls.k}</div>
              <div style={{ font: "700 12px 'IBM Plex Mono',monospace", color: ls.tx }}>{ls.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Trips Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '16px 18px' }}>
          <div style={{ font: '800 14px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '4px' }}>{t.activeTrips}</div>
          <div style={{ font: '500 11px Manrope,sans-serif', color: 'var(--mu)' }}>{t.activeTripsSub}</div>
        </div>
        <div className="tr-sb" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {activeTrips.map((at, i) => (
            <div key={i} style={{ borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '13px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '9px' }}>
                <div style={{ font: "600 10.5px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>{at.id}</div>
                <div style={{ padding: '2px 7px', borderRadius: '5px', background: at.stBg, color: at.stTx, font: '700 9.5px Manrope,sans-serif' }}>{at.state}</div>
                <div style={{ flex: 1 }}></div>
                <div style={{ font: "700 12px 'IBM Plex Mono',monospace" }}>{at.amount}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 9.5px Manrope,sans-serif', flex: 'none' }}>{at.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 11.5px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{at.driver} → {at.rider}</div>
                  <div style={{ font: '500 10px Manrope,sans-serif', color: 'var(--mu)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{at.route}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

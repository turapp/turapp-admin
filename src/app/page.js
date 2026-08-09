'use client';

import { useAppContext } from '../context/AppProvider';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';

const HOURS = [
  ['5a',18,2],['6a',52,4],['7a',96,7],['8a',74,5],['9a',48,3],['10a',38,2],
  ['11a',34,2],['12p',46,4],['2p',44,3],['4p',82,6],['6p',100,8],['8p',58,4]
];

export default function Dashboard() {
  const { lang } = useAppContext();

  const kpis = [
    { label: lang==='en'?'TRIPS TODAY':'VIAJES HOY', value:'1.284', delta:'+12%', deltaTx:'var(--jade)', bg:'var(--inv)', tx:'var(--invtx)', glyph: ['M4 12.5 5.8 7h10.4l1.8 5.5v4H4v-4Z'], glCol: 'var(--brand)' },
    { label: lang==='en'?'GROSS REVENUE':'FACTURACIÓN BRUTA', value:'$14,8M', delta:'+9%', deltaTx:'var(--jade)', bg:'var(--brandS)', tx:'var(--tx)', glyph: ['M3 6.4h16v10.2H3zM3 9.6h16'], glCol: 'var(--brand)' },
    { label: lang==='en'?'CANCELLATION RATE':'TASA DE CANCELACIÓN', value:'4,2%', delta:'−0,8pp', deltaTx:'var(--jade)', bg:'var(--sf)', tx:'var(--tx)', glyph: ['M11 3.4a7.6 7.6 0 1 1 0 15.2 7.6 7.6 0 0 1 0-15.2Z','M7.8 7.8l6.4 6.4'], glCol: 'var(--mu)' },
    { label: lang==='en'?'AVG PICKUP TIME':'ESPERA PROMEDIO', value:'3,6 min', delta:'+0,4', deltaTx:'var(--brand)', bg:'var(--brandS)', tx:'var(--tx)', glyph: ['M11 4.4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Z','M11 7.6V11l2.4 1.7'], glCol: 'var(--brand)' }
  ];

  const maxH = 108;
  const hourCols = HOURS.map(h => ({
    label: h[0],
    doneH: Math.round((h[1] / maxH) * 88) + '%',
    cancelH: Math.round((h[2] / maxH) * 88) + '%'
  }));

  const queueCards = [
    { label: lang==='en'?'Driver documents':'Documentos de conductores', sub: lang==='en'?'Oldest waiting 19 h':'El más viejo lleva 19 h', count:'14', tx:'var(--amber)', bg:'var(--amberS)', glyph: ['M6 3.4h8l3 3v12.2H6zM14 3.4v3h3'] },
    { label: lang==='en'?'Open incidents':'Incidentes abiertos', sub: lang==='en'?'2 marked urgent':'2 marcados urgentes', count:'9', tx:'var(--red)', bg:'var(--redS)', glyph: ['M11 3.4 19.6 18H2.4L11 3.4Z','M11 8.4v3.4M11 14.6v.1'] },
    { label: lang==='en'?'Payout requests':'Solicitudes de retiro', sub: lang==='en'?'$2,1M pending':'$2,1M pendientes', count:'4', tx:'var(--jade)', bg:'var(--jadeS)', glyph: ['M11 5.5v10M11 15.5 6.6 11M11 15.5 15.4 11'] },
    { label: lang==='en'?'Plate verification':'Verificación de placas', sub: lang==='en'?'Against city registry':'Contra el registro municipal', count:'6', tx:'var(--mu)', bg:'var(--sf)', glyph: ['M3.4 8h15.2v6H3.4z','M6.4 11h1M10.4 11h1M14.4 11h1'] }
  ];

  const categoryMix = [
    { name:'Taxis', value:'618', pct:'54%', bg:'var(--brand)' },
    { name:'Viajes a Cali', value:'512', pct:'40%', bg:'var(--tx)' },
    { name:'Tura Favor', value:'154', pct:'6%', bg:'var(--mu)' }
  ];

  const topDrivers = [
    { initials:'YM', name:'Yeison Mosquera', plate:'WBC41D', trips:'14 ' + (lang==='en'?'trips':'viajes'), rating:'4,92' },
    { initials:'JR', name:'Jhon Riascos', plate:'KHT29B', trips:'12 ' + (lang==='en'?'trips':'viajes'), rating:'4,89' },
    { initials:'MC', name:'Marta Caicedo', plate:'WBD84F', trips:'11 ' + (lang==='en'?'trips':'viajes'), rating:'4,95' },
    { initials:'LA', name:'Luis Ablanque', plate:'WBA11C', trips:'10 ' + (lang==='en'?'trips':'viajes'), rating:'4,81' }
  ];

  const recentLogs = [
    { text: lang==='en'?'Approved SOAT for plate KHT29B':'Aprobó SOAT de la placa KHT29B', at:'9:52', who:'maria.a', dot:'var(--jade)' },
    { text: lang==='en'?'Suspended driver for unpaid commission':'Suspendió conductor por comisión sin pagar', at:'9:41', who:'sistema', dot:'var(--red)' },
    { text: lang==='en'?'Changed intercity deposit to 50%':'Cambió el abono intermunicipal a 50%', at:'9:12', who:'carlos.v', dot:'var(--amber)' },
    { text: lang==='en'?'Refunded $14,400 on TRP-84120':'Reembolsó $14.400 en TRP-84120', at:'8:47', who:'maria.a', dot:'var(--jade)' }
  ];

  return (
    <>
      {/* Top 4 KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '16px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ borderRadius: '14px', background: k.bg, border: i===0 ? 'none' : '1px solid var(--bd2)', padding: '16px 17px', color: k.tx, boxShadow: i===0 ? 'var(--sh2)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '11px' }}>
              <div style={{ font: '600 11px Manrope,sans-serif', opacity: 0.7, letterSpacing: '.04em' }}>{k.label}</div>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: i===0 ? 'rgba(255,255,255,0.1)' : k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon paths={k.glyph} color={k.glCol} size={15} />
              </div>
            </div>
            <div style={{ font: "800 25px/1 'IBM Plex Mono',monospace", letterSpacing: '-.035em', marginBottom: '8px' }}>{k.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ font: '700 11px Manrope,sans-serif', color: k.deltaTx }}>{k.delta}</div>
              <div style={{ font: '500 11px Manrope,sans-serif', opacity: 0.6 }}>{lang === 'en' ? 'vs yesterday' : 'vs ayer'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Queue row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 366px', gap: '14px', marginBottom: '16px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em' }}>{lang === 'en' ? 'Trips by hour' : 'Viajes por hora'}</div>
              <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '3px' }}>{lang === 'en' ? 'Today · Aug 4, 2026' : 'Hoy · 4 ago 2026'}</div>
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '9px', height: '9px', borderRadius: '3px', background: 'var(--tx)' }}></div><div style={{ font: '600 11px Manrope,sans-serif', color: 'var(--mu)' }}>{lang === 'en' ? 'Completed' : 'Completados'}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '9px', height: '9px', borderRadius: '3px', background: 'var(--brand)' }}></div><div style={{ font: '600 11px Manrope,sans-serif', color: 'var(--mu)' }}>{lang === 'en' ? 'Cancelled' : 'Cancelados'}</div></div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '176px' }}>
            {hourCols.map((hc, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '2px', height: '100%' }}>
                  <div style={{ width: '100%', height: hc.cancelH, background: 'var(--brand)', borderRadius: '3px 3px 0 0', transformOrigin: 'bottom' }}></div>
                  <div style={{ width: '100%', height: hc.doneH, background: 'var(--tx)', borderRadius: '0 0 2px 2px', transformOrigin: 'bottom' }}></div>
                </div>
                <div style={{ font: '600 9.5px Manrope,sans-serif', color: 'var(--mu)' }}>{hc.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={lang === 'en' ? 'Approval queue' : 'Cola de aprobación'} subtitle={lang === 'en' ? 'What needs a human decision today.' : 'Lo que espera decisión de un humano hoy.'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '16px' }}>
            {queueCards.map((qc, i) => (
              <button key={i} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '12px 13px', borderRadius: '11px', background: 'var(--sf)', textAlign: 'left', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: qc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon paths={qc.glyph} color={qc.tx} size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '700 12.5px Manrope,sans-serif', color: 'var(--tx)' }}>{qc.label}</div>
                  <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '1px' }}>{qc.sub}</div>
                </div>
                <div style={{ font: "800 17px 'IBM Plex Mono',monospace", color: qc.tx, flex: 'none' }}>{qc.count}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <Card title={lang === 'en' ? 'Category mix' : 'Mezcla por categoría'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {categoryMix.map((cm, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '3px', background: cm.bg }}></div>
                    <div style={{ font: '600 12.5px Manrope,sans-serif' }}>{cm.name}</div>
                  </div>
                  <div style={{ font: "700 12.5px 'IBM Plex Mono',monospace" }}>{cm.value}</div>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--sf2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: cm.pct, background: cm.bg, borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={lang === 'en' ? 'Top drivers today' : 'Mejores conductores hoy'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginTop: '16px' }}>
            {topDrivers.map((td, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 10.5px Manrope,sans-serif', flex: 'none' }}>{td.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 12.5px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{td.name}</div>
                  <div style={{ font: "500 10.5px 'IBM Plex Mono',monospace", color: 'var(--mu)' }}>{td.plate} · {td.trips}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 'none' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2.4l2.9 6.1 6.7.9-4.9 4.7 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.4 9.4l6.7-.9L12 2.4Z" fill="var(--tx)"></path></svg>
                  <div style={{ font: "700 11.5px 'IBM Plex Mono',monospace" }}>{td.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={lang === 'en' ? 'Recent activity' : 'Actividad reciente'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {recentLogs.map((rl, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: rl.dot, flex: 'none', marginTop: '5px' }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 11.5px/1.4 Manrope,sans-serif' }}>{rl.text}</div>
                  <div style={{ font: "500 10px 'IBM Plex Mono',monospace", color: 'var(--mu)', marginTop: '2px' }}>{rl.at} · {rl.who}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

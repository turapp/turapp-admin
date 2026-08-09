'use client';

import { useState } from 'react';
import { useAppContext } from '../../context/AppProvider';

export default function PromosPage() {
  const { lang } = useAppContext();
  const [promoFilter, setPromoFilter] = useState(0);

  const t = lang === 'en' ? {
    newPromo: 'New promo',
    used: 'USED', cost: 'COST', expires: 'EXPIRES',
    pushCampaign: 'Push notification campaign',
    pushSub2: 'Send instant notifications to active drivers or riders.',
    sendNow: 'Send now',
    schedulePush: 'Schedule...',
    preview: 'PREVIEW',
    audience: 'Target audience size'
  } : {
    newPromo: 'Nueva promo',
    used: 'USOS', cost: 'COSTO', expires: 'VENCE',
    pushCampaign: 'Campaña de Push Notifications',
    pushSub2: 'Envía notificaciones instantáneas a conductores o pasajeros activos.',
    sendNow: 'Enviar ahora',
    schedulePush: 'Programar...',
    preview: 'VISTA PREVIA',
    audience: 'Tamaño de audiencia'
  };

  const promoFilters = [
    { label: lang==='en'?'Active':'Activas' },
    { label: lang==='en'?'Scheduled':'Programadas' },
    { label: lang==='en'?'Expired':'Expiradas' }
  ];

  const PRM = {
    active: { label: lang==='en'?'Active':'Activa', stBg:'var(--jadeS)', stTx:'var(--jade)', bar:'var(--jade)' },
    limit: { label: lang==='en'?'Near limit':'Cerca al límite', stBg:'var(--amberS)', stTx:'var(--amber)', bar:'var(--amber)' },
    done: { label: lang==='en'?'Expired':'Expirada', stBg:'var(--sf2)', stTx:'var(--mu)', bar:'var(--bd)' }
  };

  const promoCards = [
    { title: lang==='en'?'Weekend 50% Off':'Descuento 50% Finde', code:'FINDE50', body: lang==='en'?'Up to $10.000 COP discount for riders on weekends.':'Descuento de hasta $10.000 COP para pasajeros sábados y domingos.', used:'1.428', cost:'$8.2M', expires:'12 Ago', pct:'62%', st:'active' },
    { title: lang==='en'?'New Driver Bonus':'Bono Nuevo Conductor', code:'NUEVOTUR', body: lang==='en'?'Zero commission on the first 20 trips for new drivers.':'Cero comisión en los primeros 20 viajes para conductores nuevos.', used:'84', cost:'$0.00', expires:'30 Sep', pct:'14%', st:'active' },
    { title: lang==='en'?'Rainy Day Surge':'Tarifa Lluvia -20%', code:'LLUVIA20', body: lang==='en'?'20% discount on TurCarro category during rain.':'20% de descuento en la categoría TurCarro durante lluvias.', used:'2.105', cost:'$4.1M', expires:'Hoy', pct:'94%', st:'limit' }
  ].map(pc => Object.assign({}, pc, { state: PRM[pc.st].label, stBg: PRM[pc.st].stBg, stTx: PRM[pc.st].stTx, bar: PRM[pc.st].bar }));

  const pushFields = [
    { label: lang==='en'?'TARGET AUDIENCE':'AUDIENCIA OBJETIVO', value: lang==='en'?'Riders in Buenaventura with 0 trips in the last 15 days':'Pasajeros en Buenaventura con 0 viajes en los últimos 15 días' },
    { label: lang==='en'?'TITLE':'TÍTULO', value: lang==='en'?'Travelling to Cali this weekend?':'¿Viajas a Cali este fin?' },
    { label: lang==='en'?'BODY':'CUERPO DEL MENSAJE', value: lang==='en'?'Book your seat with 50% off and travel safely.':'Reserva tu puesto con el 50% y viaja tranquilo.' }
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '9px' }}>
          {promoFilters.map((pf, i) => {
            const isActive = promoFilter === i;
            return (
              <button
                key={i}
                onClick={() => setPromoFilter(i)}
                style={{
                  height: '34px', padding: '0 14px', borderRadius: '8px', font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                  background: isActive ? 'var(--inv)' : 'var(--bg)',
                  color: isActive ? 'var(--invtx)' : 'var(--mu)',
                  border: isActive ? 'none' : '1px solid var(--bd)'
                }}
              >
                {pf.label}
              </button>
            );
          })}
        </div>
        <button style={{ height: '36px', padding: '0 16px', borderRadius: '9px', background: 'var(--inv)', color: 'var(--invtx)', font: '700 12.5px Manrope,sans-serif', display: 'flex', alignItems: 'center', gap: '7px', border: 'none', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="var(--invtx)" strokeWidth="1.8" strokeLinecap="round"></path></svg>
          {t.newPromo}
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '16px' }}>
        {promoCards.map((pcd, i) => (
          <div key={i} style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', overflow: 'hidden' }}>
            <div style={{ height: '6px', background: pcd.bar }}></div>
            <div style={{ padding: '16px 17px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: '800 19px Manrope,sans-serif', letterSpacing: '-.03em' }}>{pcd.title}</div>
                  <div style={{ font: "600 11px 'IBM Plex Mono',monospace", color: 'var(--mu)', letterSpacing: '.06em', marginTop: '4px' }}>{pcd.code}</div>
                </div>
                <div style={{ padding: '3px 8px', borderRadius: '6px', background: pcd.stBg, color: pcd.stTx, font: '700 9.5px Manrope,sans-serif', flex: 'none' }}>{pcd.state}</div>
              </div>
              <div style={{ font: '500 11.5px/1.5 Manrope,sans-serif', color: 'var(--mu)', marginBottom: '14px', minHeight: '34px' }}>{pcd.body}</div>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                <div><div style={{ font: '500 9.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.06em', marginBottom: '3px' }}>{t.used}</div><div style={{ font: "700 14px 'IBM Plex Mono',monospace" }}>{pcd.used}</div></div>
                <div><div style={{ font: '500 9.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.06em', marginBottom: '3px' }}>{t.cost}</div><div style={{ font: "700 14px 'IBM Plex Mono',monospace" }}>{pcd.cost}</div></div>
                <div><div style={{ font: '500 9.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.06em', marginBottom: '3px' }}>{t.expires}</div><div style={{ font: "700 14px 'IBM Plex Mono',monospace" }}>{pcd.expires}</div></div>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--sf2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pcd.pct, background: pcd.bar, borderRadius: '3px', transformOrigin: 'left' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
        <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '5px' }}>{t.pushCampaign}</div>
        <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginBottom: '18px' }}>{t.pushSub2}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {pushFields.map((pff, i) => (
              <div key={i} style={{ borderRadius: '11px', background: 'var(--sf)', padding: '12px 14px' }}>
                <div style={{ font: '500 10px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.06em', marginBottom: '4px' }}>{pff.label}</div>
                <div style={{ font: '600 12.5px/1.5 Manrope,sans-serif' }}>{pff.value}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '9px', marginTop: '3px' }}>
              <button style={{ height: '38px', padding: '0 16px', borderRadius: '9px', background: 'var(--inv)', color: 'var(--invtx)', font: '700 12.5px Manrope,sans-serif', border: 'none', cursor: 'pointer' }}>{t.sendNow}</button>
              <button style={{ height: '38px', padding: '0 16px', borderRadius: '9px', background: 'var(--sf)', font: '700 12.5px Manrope,sans-serif', border: 'none', cursor: 'pointer', color: 'var(--tx)' }}>{t.schedulePush}</button>
            </div>
          </div>
          <div>
            <div style={{ font: '500 10px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.06em', marginBottom: '10px' }}>{t.preview}</div>
            <div style={{ borderRadius: '14px', background: 'var(--sf)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '12px 13px', borderRadius: '13px', background: 'var(--bg)', boxShadow: 'var(--sh2)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--inv)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', font: '800 12px Manrope,sans-serif', color: 'var(--invtx)', letterSpacing: '-.04em' }}>T</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '700 12px Manrope,sans-serif' }}>{lang === 'en' ? 'Travelling to Cali this weekend?' : '¿Viajas a Cali este fin?'}</div>
                  <div style={{ font: '500 10.5px/1.4 Manrope,sans-serif', color: 'var(--mu)', marginTop: '2px' }}>{lang === 'en' ? 'Book your seat with 50% off and travel safely.' : 'Reserva tu puesto con el 50% y viaja tranquilo.'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)' }}>{t.audience}</div>
                <div style={{ font: "700 11.5px 'IBM Plex Mono',monospace" }}>8.412</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useAppContext } from '../../context/AppProvider';

export default function CmsPage() {
  const { lang } = useAppContext();

  const t = lang === 'en' ? {
    homeCards: 'Home cards',
    homeCardsSub: 'Banners shown in the passenger app home.',
    newCard: 'New card',
    legalDocs: 'Legal documents',
    legalDocsSub: 'Terms, privacy and policies for the apps.',
    strings: 'App Strings',
    stringsSub: 'Text localization override without app update.',
    edit: 'Edit'
  } : {
    homeCards: 'Tarjetas Home',
    homeCardsSub: 'Banners que se muestran en el inicio de la app de pasajeros.',
    newCard: 'Nueva tarjeta',
    legalDocs: 'Documentos Legales',
    legalDocsSub: 'Términos, privacidad y políticas para las apps.',
    strings: 'Textos de la App',
    stringsSub: 'Modificar textos de la app sin necesidad de actualización.',
    edit: 'Editar'
  };

  const ST = {
    on: { label: lang==='en'?'Published':'Publicado', stBg:'var(--jadeS)', stTx:'var(--jade)' },
    off: { label: lang==='en'?'Draft':'Borrador', stBg:'var(--sf2)', stTx:'var(--mu)' }
  };

  const cmsCards = [
    { title: lang==='en'?'Welcome to Turapp':'Bienvenido a Turapp', slot: lang==='en'?'Slot 1 · Appears only to new users':'Slot 1 · Solo para usuarios nuevos', tag:'IMG', tone:'var(--tx)', st:'on' },
    { title: lang==='en'?'50% Off this weekend':'50% Off este fin de semana', slot: lang==='en'?'Slot 2 · Global':'Slot 2 · Global', tag:'GIF', tone:'var(--jade)', st:'on' },
    { title: lang==='en'?'Intercity travel guide':'Guía de viajes intermunicipales', slot: lang==='en'?'Slot 3 · Global':'Slot 3 · Global', tag:'IMG', tone:'var(--amber)', st:'off' },
    { title: lang==='en'?'Win a free trip!':'¡Gana un viaje gratis!', slot: lang==='en'?'Not assigned':'Sin asignar', tag:'LOTTIE', tone:'var(--tx)', st:'off' }
  ].map(cc => Object.assign({}, cc, { state: ST[cc.st].label, stBg: ST[cc.st].stBg, stTx: ST[cc.st].stTx }));

  const cmsLegal = [
    { name: lang==='en'?'Terms and Conditions':'Términos y Condiciones', version:'1.4', when: lang==='en'?'Updated May 2026':'Actualizado mayo 2026', glyph: '📄', st:'on' },
    { name: lang==='en'?'Privacy Policy':'Política de Privacidad', version:'2.1', when: lang==='en'?'Updated Jan 2026':'Actualizado ene 2026', glyph: '🔒', st:'on' },
    { name: lang==='en'?'Driver Agreement':'Acuerdo de Conductores', version:'1.1', when: lang==='en'?'Updated Jun 2026':'Actualizado jun 2026', glyph: '🚗', st:'on' },
    { name: lang==='en'?'Refund Policy':'Política de Reembolsos', version:'1.0', when: lang==='en'?'Draft':'Borrador', glyph: '💰', st:'off' }
  ].map(cl => Object.assign({}, cl, { state: ST[cl.st].label, stBg: ST[cl.st].stBg, stTx: ST[cl.st].stTx }));

  const stringCols = ['KEY', 'ESPAÑOL', 'ENGLISH'];

  const cmsStrings = [
    { key:'home.title', es:'¿A dónde vamos?', en:'Where to?' },
    { key:'home.search', es:'Buscar destino...', en:'Search destination...' },
    { key:'home.saved', es:'Lugares guardados', en:'Saved places' },
    { key:'trip.confirm', es:'Confirmar viaje', en:'Confirm trip' }
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em' }}>{t.homeCards}</div>
              <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '3px' }}>{t.homeCardsSub}</div>
            </div>
            <button style={{ height: '34px', padding: '0 14px', borderRadius: '9px', background: 'var(--inv)', color: 'var(--invtx)', font: '700 12px Manrope,sans-serif', border: 'none', cursor: 'pointer' }}>{t.newCard}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {cmsCards.map((cc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 13px', borderRadius: '11px', background: 'var(--sf)' }}>
                <div style={{ width: '44px', height: '34px', borderRadius: '7px', background: cc.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', font: '800 9px Manrope,sans-serif', color: '#fff' }}>{cc.tag}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '700 12.5px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cc.title}</div>
                  <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cc.slot}</div>
                </div>
                <div style={{ padding: '3px 8px', borderRadius: '6px', background: cc.stBg, color: cc.stTx, font: '700 9.5px Manrope,sans-serif', flex: 'none' }}>{cc.state}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
          <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '5px' }}>{t.legalDocs}</div>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginBottom: '16px' }}>{t.legalDocsSub}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {cmsLegal.map((cl, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 13px', borderRadius: '11px', background: 'var(--sf)' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{cl.glyph}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '700 12.5px Manrope,sans-serif' }}>{cl.name}</div>
                  <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '1px' }}>v{cl.version} · {cl.when}</div>
                </div>
                <div style={{ padding: '3px 8px', borderRadius: '6px', background: cl.stBg, color: cl.stTx, font: '700 9.5px Manrope,sans-serif', flex: 'none' }}>{cl.state}</div>
                <button style={{ height: '28px', padding: '0 11px', borderRadius: '7px', background: 'var(--bg)', font: '700 11px Manrope,sans-serif', flex: 'none', border: '1px solid var(--bd2)', cursor: 'pointer', color: 'var(--tx)' }}>{t.edit}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
        <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '5px' }}>{t.strings}</div>
        <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginBottom: '16px' }}>{t.stringsSub}</div>
        <div style={{ borderRadius: '11px', overflow: 'hidden', border: '1px solid var(--bd2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: '12px', padding: '11px 15px', background: 'var(--sf)' }}>
            {stringCols.map((sc, i) => (
              <div key={i} style={{ font: '700 10px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.06em' }}>{sc}</div>
            ))}
          </div>
          {cmsStrings.map((cs, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: '12px', padding: '12px 15px', borderTop: '1px solid var(--bd2)', alignItems: 'center' }}>
              <div style={{ font: "600 11px 'IBM Plex Mono',monospace", color: 'var(--jade)', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cs.key}</div>
              <div style={{ font: '500 12px Manrope,sans-serif', minWidth: 0 }}>{cs.es}</div>
              <div style={{ font: '500 12px Manrope,sans-serif', color: 'var(--mu)', minWidth: 0 }}>{cs.en}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

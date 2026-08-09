'use client';

import { useAppContext } from '../../context/AppProvider';

export default function VehiclesPage() {
  const { lang } = useAppContext();

  const t = lang === 'en' ? {
    plateRegistry: 'Plate registry',
    plateRegistrySub: 'Vehicles verified against RUNT database',
    expiringTitle: 'SOATs expiring this week',
    expiringBody: 'There are 12 vehicles with SOAT expiring in less than 7 days.',
    notifyDrivers: 'Notify drivers'
  } : {
    plateRegistry: 'Registro de placas',
    plateRegistrySub: 'Vehículos verificados contra base de datos RUNT',
    expiringTitle: 'SOAT por vencer esta semana',
    expiringBody: 'Hay 12 vehículos con SOAT próximo a vencer en menos de 7 días.',
    notifyDrivers: 'Notificar conductores'
  };

  const vehKpis = [
    { label: lang==='en'?'REGISTERED':'REGISTRADOS', value:'1.482', sub: lang==='en'?'Total active fleet':'Flota activa total', tx:'var(--tx)' },
    { label: lang==='en'?'EXPIRING SOAT':'SOAT POR VENCER', value:'12', sub: lang==='en'?'In the next 7 days':'En los próximos 7 días', tx:'var(--amber)' },
    { label: lang==='en'?'RUNT MISMATCH':'ALERTA RUNT', value:'4', sub: lang==='en'?'Requires review':'Requiere revisión manual', tx:'var(--red)' },
    { label: lang==='en'?'AVG YEAR':'MODELO PROMEDIO', value:'2018', sub: lang==='en'?'Fleet age':'Antigüedad de la flota', tx:'var(--tx)' }
  ];

  const vehCols = lang === 'en'
    ? ['PLATE','VEHICLE / OWNER','CATEGORY','SOAT','TECH-MECH','STATUS']
    : ['PLACA','VEHÍCULO / DUEÑO','CATEGORÍA','SOAT','TECNO','ESTADO'];

  const CAT = {
    taxi: { label:'Taxis', bg:'var(--brandS)', tx:'var(--brand)' },
    carro: { label:'Viajes a Cali', bg:'var(--sf2)', tx:'var(--tx)' },
    inter: { label:'Tura Favor', bg:'var(--sf2)', tx:'var(--mu)' }
  };
  const ST = {
    ok: { label: lang==='en'?'Active':'Activo', dot:'var(--jade)', tx:'var(--jade)' },
    wait: { label: lang==='en'?'Expiring':'Por vencer', dot:'var(--amber)', tx:'var(--amber)' },
    bad: { label: lang==='en'?'Suspended':'Suspendido', dot:'var(--red)', tx:'var(--red)' }
  };

  const vehRows = [
    { plate:'WBE72K', plateBg:'var(--amber)', plateTx:'#000', model:'Kia Rio 2020', owner:'Óscar Rentería', cat:'carro', soat:'14 mar 2027', rtm:'22 ago 2026', rtmTx:'var(--tx)', st:'ok' },
    { plate:'WBT18A', plateBg:'var(--sf)', plateTx:'var(--tx)', model:'Chevrolet N300 2019', owner:'Luis Valencia', cat:'taxi', soat:'4 ago 2026', rtm:'11 nov 2026', rtmTx:'var(--tx)', st:'wait' },
    { plate:'WBC41D', plateBg:'var(--amber)', plateTx:'#000', model:'Chevrolet Spark GT 2019', owner:'Yeison Mosquera', cat:'carro', soat:'8 ene 2027', rtm:'4 dic 2026', rtmTx:'var(--tx)', st:'ok' },
    { plate:'KHT29B', plateBg:'var(--sf)', plateTx:'var(--tx)', model:'Hyundai Accent 2021', owner:'Jhon Riascos', cat:'taxi', soat:'12 sep 2026', rtm:'19 sep 2026', rtmTx:'var(--tx)', st:'ok' },
    { plate:'WBD84F', plateBg:'var(--sf)', plateTx:'var(--tx)', model:'Renault Logan 2022', owner:'Marta Caicedo', cat:'inter', soat:'22 oct 2026', rtm:'1 jul 2027', rtmTx:'var(--tx)', st:'ok' },
    { plate:'WBM55J', plateBg:'var(--amber)', plateTx:'#000', model:'Nissan Versa 2018', owner:'Andrés Grueso', cat:'carro', soat:'2 ago 2026', rtm:'Vencido', rtmTx:'var(--red)', st:'bad' }
  ].map(vr => Object.assign({}, vr, {
    category: CAT[vr.cat].label, catBg: CAT[vr.cat].bg, catTx: CAT[vr.cat].tx,
    state: ST[vr.st].label, dot: ST[vr.st].dot, stTx: ST[vr.st].tx
  }));

  const registryRows = [
    { label: lang==='en'?'Verified correct':'Verificados correctos', sub: lang==='en'?'Matches RUNT data':'Coincide con datos RUNT', count:'1.465', tx:'var(--jade)', bg:'var(--jadeS)' },
    { label: lang==='en'?'Mismatched color':'Color diferente', sub: lang==='en'?'User registered wrong color':'Usuario registró color distinto', count:'13', tx:'var(--amber)', bg:'var(--amberS)' },
    { label: lang==='en'?'Suspended plates':'Placas canceladas', sub: lang==='en'?'Cannot circulate':'No aptos para circular', count:'4', tx:'var(--red)', bg:'var(--redS)' }
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '16px' }}>
        {vehKpis.map((vk, i) => (
          <div key={i} style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '16px 17px' }}>
            <div style={{ font: '600 11px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.04em', marginBottom: '10px' }}>{vk.label}</div>
            <div style={{ font: "800 24px/1 'IBM Plex Mono',monospace", letterSpacing: '-.035em', color: vk.tx, marginBottom: '7px' }}>{vk.value}</div>
            <div style={{ font: '500 11px Manrope,sans-serif', color: 'var(--mu)' }}>{vk.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: '14px' }}>
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.4fr 1.1fr 1fr 1.1fr 0.9fr', gap: '12px', padding: '12px 18px', borderBottom: '1px solid var(--bd2)', background: 'var(--sf)' }}>
            {vehCols.map((vc, i) => (
              <div key={i} style={{ font: '700 10.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.07em' }}>{vc}</div>
            ))}
          </div>
          {vehRows.map((vr, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.4fr 1.1fr 1fr 1.1fr 0.9fr', gap: '12px', padding: '13px 18px', borderBottom: '1px solid var(--bd2)', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '6px', background: vr.plateBg, color: vr.plateTx, font: "600 11.5px 'IBM Plex Mono',monospace", letterSpacing: '.06em', justifySelf: 'start' }}>{vr.plate}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ font: '600 12px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vr.model}</div>
                <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '1px' }}>{vr.owner}</div>
              </div>
              <div><div style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '6px', background: vr.catBg, color: vr.catTx, font: '700 10px Manrope,sans-serif', whiteSpace: 'nowrap' }}>{vr.category}</div></div>
              <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)' }}>{vr.soat}</div>
              <div style={{ font: '500 11.5px Manrope,sans-serif', color: vr.rtmTx }}>{vr.rtm}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: vr.dot }}></div>
                <div style={{ font: '600 11px Manrope,sans-serif', color: vr.stTx, whiteSpace: 'nowrap' }}>{vr.state}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
            <div style={{ font: '800 14px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '5px' }}>{t.plateRegistry}</div>
            <div style={{ font: '500 11.5px/1.5 Manrope,sans-serif', color: 'var(--mu)', marginBottom: '16px' }}>{t.plateRegistrySub}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {registryRows.map((rg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 12px', borderRadius: '11px', background: 'var(--sf)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: rg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 12px Manrope,sans-serif' }}>{rg.label}</div>
                    <div style={{ font: '500 10px Manrope,sans-serif', color: 'var(--mu)', marginTop: '1px' }}>{rg.sub}</div>
                  </div>
                  <div style={{ font: "700 14px 'IBM Plex Mono',monospace", color: rg.tx, flex: 'none' }}>{rg.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius: '14px', background: 'var(--amberS)', padding: '16px 18px' }}>
            <div style={{ font: '700 12.5px Manrope,sans-serif', color: 'var(--amber)', marginBottom: '7px' }}>{t.expiringTitle}</div>
            <div style={{ font: '500 11px/1.55 Manrope,sans-serif', color: 'var(--amber)', opacity: 0.9, marginBottom: '12px' }}>{t.expiringBody}</div>
            <button style={{ height: '34px', padding: '0 14px', borderRadius: '8px', background: 'var(--amber)', color: '#fff', font: '700 12px Manrope,sans-serif', border: 'none', cursor: 'pointer' }}>{t.notifyDrivers}</button>
          </div>
        </div>
      </div>
    </>
  );
}

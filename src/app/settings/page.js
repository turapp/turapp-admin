'use client';

import { useAppContext } from '../../context/AppProvider';

export default function SettingsPage() {
  const { lang } = useAppContext();

  const t = lang === 'en' ? {
    fareParams: 'Fare parameters',
    fareParamsSub: 'TurTaxi & TurCarro base values.',
    interParams: 'Intercity parameters',
    interParamsSub: 'Fixed prices and cash deposits.',
    flags: 'Feature flags',
    rolesTitle: 'Roles & Permissions',
    rolesSub: 'Manage what your staff can do.',
    newRole: 'New role'
  } : {
    fareParams: 'Parámetros de tarifa',
    fareParamsSub: 'Valores base para TurTaxi y TurCarro.',
    interParams: 'Parámetros intermunicipales',
    interParamsSub: 'Precios fijos y abonos obligatorios.',
    flags: 'Feature flags',
    rolesTitle: 'Roles y Permisos',
    rolesSub: 'Controla a qué módulos tiene acceso el equipo.',
    newRole: 'Nuevo rol'
  };

  const fareParams = [
    { label: lang==='en'?'Taxis Base fare':'Tarifa base Taxis', value:'$5.500' },
    { label: lang==='en'?'Viajes a Cali Base fare':'Tarifa base Viajes a Cali', value:'$6.500' },
    { label: lang==='en'?'Price per KM':'Valor por Kilómetro', sub: lang==='en'?'Both categories':'Aplica a ambas categorías', value:'$1.200' },
    { label: lang==='en'?'Min trip distance':'Distancia mínima de viaje', value:'1.5 KM' },
    { label: lang==='en'?'Rain Surge multiplier':'Multiplicador lluvia (Surge)', value:'1.2x' },
    { label: lang==='en'?'Cancellation fee':'Tarifa por cancelación', sub: lang==='en'?'After 3 mins':'Después de 3 minutos', value:'$2.000' }
  ];

  const interParams = [
    { label: lang==='en'?'BUN → CALI Price':'Precio BUN → CALI', value:'$45.000', rowBg:'var(--sf)', tx:'var(--tx)', subTx:'var(--mu)' },
    { label: lang==='en'?'Mandatory cash deposit':'Abono obligatorio', sub: lang==='en'?'Required via Nequi to confirm seat.':'Requerido vía Nequi para apartar puesto.', value:'$20.000', rowBg:'var(--amberS)', tx:'var(--amber)', subTx:'var(--amber)' },
    { label: lang==='en'?'Driver Commission':'Comisión por puesto', value:'12%', rowBg:'var(--sf)', tx:'var(--tx)', subTx:'var(--mu)' },
    { label: lang==='en'?'Max seats per vehicle':'Puestos máximos por vehículo', value:'4', rowBg:'var(--sf)', tx:'var(--tx)', subTx:'var(--mu)' }
  ];

  const flags = [
    { label: lang==='en'?'Enable Promocodes':'Habilitar Códigos Promocionales', sub: lang==='en'?'Allows users to enter codes in checkout.':'Permite ingresar códigos en el checkout.', on:true },
    { label: lang==='en'?'Credit Card Payments':'Pagos con Tarjeta de Crédito', sub: lang==='en'?'Wompi integration.':'Integración con Wompi.', on:false },
    { label: lang==='en'?'Driver Registration':'Registro de nuevos conductores', sub: lang==='en'?'If off, no new drivers can apply.':'Si está apagado, no se reciben solicitudes.', on:true },
    { label: lang==='en'?'Intercity booking limit':'Límite de reservas intermunicipales', sub: lang==='en'?'Max 1 active reservation per user.':'Máximo 1 reserva viva por usuario.', on:true },
    { label: lang==='en'?'Surge Pricing algorithm':'Algoritmo de tarifa dinámica', sub: lang==='en'?'Auto increases price when demand is high.':'Aumenta precio automáticamente si hay demanda.', on:false }
  ];

  const permCols = lang === 'en'
    ? ['ROLE', 'DRIVERS', 'TRIPS', 'FINANCE', 'PROMOS', 'SUPPORT', 'SETTINGS']
    : ['ROL', 'CONDUCTORES', 'VIAJES', 'FINANZAS', 'PROMOS', 'SOPORTE', 'CONFIG'];

  const permRows = [
    { role:'Super Admin', cells:['✅','✅','✅','✅','✅','✅'] },
    { role:'Operations Manager', cells:['✅','✅','✅','✅','✅','❌'] },
    { role:'Support L2', cells:['✅','✅','❌','❌','✅','❌'] },
    { role:'Support L1', cells:['👁️','👁️','❌','❌','✅','❌'] }
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
          <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '5px' }}>{t.fareParams}</div>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginBottom: '18px' }}>{t.fareParamsSub}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {fareParams.map((fp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '11px', background: 'var(--sf)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 12.5px Manrope,sans-serif' }}>{fp.label}</div>
                  {fp.sub && <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '2px' }}>{fp.sub}</div>}
                </div>
                <div style={{ height: '32px', padding: '0 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', font: "700 12.5px 'IBM Plex Mono',monospace", flex: 'none' }}>{fp.value}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
            <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '5px' }}>{t.interParams}</div>
            <div style={{ font: '500 11.5px/1.5 Manrope,sans-serif', color: 'var(--mu)', marginBottom: '18px' }}>{t.interParamsSub}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {interParams.map((ip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '11px', background: ip.rowBg }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 12.5px Manrope,sans-serif', color: ip.tx }}>{ip.label}</div>
                    {ip.sub && <div style={{ font: '500 10.5px/1.4 Manrope,sans-serif', color: ip.subTx, marginTop: '2px' }}>{ip.sub}</div>}
                  </div>
                  <div style={{ height: '32px', padding: '0 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', font: "700 12.5px 'IBM Plex Mono',monospace", flex: 'none' }}>{ip.value}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
            <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '16px' }}>{t.flags}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {flags.map((fl, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 12.5px Manrope,sans-serif' }}>{fl.label}</div>
                    <div style={{ font: '500 10.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '2px' }}>{fl.sub}</div>
                  </div>
                  <div style={{ width: '42px', height: '25px', borderRadius: '99px', background: fl.on ? 'var(--jade)' : 'var(--bd2)', padding: '3px', display: 'flex', justifyContent: fl.on ? 'flex-end' : 'flex-start', flex: 'none', transition: 'all .2s', cursor: 'pointer' }}>
                    <div style={{ width: '19px', height: '19px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em' }}>{t.rolesTitle}</div>
            <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: '3px' }}>{t.rolesSub}</div>
          </div>
          <button style={{ height: '36px', padding: '0 15px', borderRadius: '9px', background: 'var(--inv)', color: 'var(--invtx)', font: '700 12.5px Manrope,sans-serif', border: 'none', cursor: 'pointer' }}>{t.newRole}</button>
        </div>
        <div style={{ borderRadius: '11px', overflow: 'hidden', border: '1px solid var(--bd2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(6,1fr)', gap: '10px', padding: '11px 15px', background: 'var(--sf)' }}>
            {permCols.map((pc, i) => (
              <div key={i} style={{ font: '700 10px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.06em', textAlign: i > 0 ? 'center' : 'left' }}>{pc}</div>
            ))}
          </div>
          {permRows.map((pr, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(6,1fr)', gap: '10px', padding: '12px 15px', borderTop: '1px solid var(--bd2)', alignItems: 'center' }}>
              <div style={{ font: '600 12px Manrope,sans-serif', minWidth: 0 }}>{pr.role}</div>
              {pr.cells.map((c, j) => (
                <div key={j} style={{ textAlign: 'center', fontSize: '14px' }}>{c}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

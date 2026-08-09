'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppProvider';
import Icon from './ui/Icon';

const NAV = [
  { title:'OPERACIÓN', titleEn:'OPERATIONS', items:[
    { id:'/', label:'Dashboard', labelEn:'Dashboard', paths:['M3 10.4 11 4l8 6.4V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7.6Z'] },
    { id:'/map', label:'Mapa en vivo', labelEn:'Live map', paths:['M11 3.4c3 0 5.4 2.4 5.4 5.4 0 3.8-5.4 9.2-5.4 9.2S5.6 12.6 5.6 8.8c0-3 2.4-5.4 5.4-5.4Z','M11 10.4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z'] },
    { id:'/trips', label:'Viajes urbanos', labelEn:'Urban trips', paths:['M4 12.5 5.8 7h10.4l1.8 5.5v4H4v-4Z','M7 16.5v1.4M15 16.5v1.4'] },
    { id:'/cali', label:'Viajes a Cali', labelEn:'Cali trips', paths:['M19 11v6H5v-6h14Zm-1-4v2H6V7h12Zm-2-3v1H8V4h8Z'] },
    { id:'/support', label:'Soporte', labelEn:'Support', paths:['M3.4 5h15.2v9.4H8.8L5 17.6v-3.2H3.4V5Z'], badge:'9', badgeBg:'#c8402f' }
  ]},
  { title:'PERSONAS', titleEn:'PEOPLE', items:[
    { id:'/drivers', label:'Conductores', labelEn:'Drivers', paths:['M11 9.4a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6ZM4.6 18.4c0-3.4 2.8-5.8 6.4-5.8s6.4 2.4 6.4 5.8'], badge:'14', badgeBg:'#c98a1e' },
    { id:'/passengers', label:'Pasajeros', labelEn:'Riders', paths:['M8 8.8a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM2.6 17.6c0-3 2.4-5 5.4-5s5.4 2 5.4 5','M15.2 8.2a2.1 2.1 0 1 0 0-4.2','M15.6 12.6c1.9.5 3.2 2.2 3.2 4.6'] },
    { id:'/vehicles', label:'Vehículos y placas', labelEn:'Vehicles and plates', paths:['M4 12.5 5.8 7h10.4l1.8 5.5v4H4v-4Z','M2.6 12.5h16.8'] }
  ]},
  { title:'DINERO', titleEn:'MONEY', items:[
    { id:'/payments', label:'Pagos y comisiones', labelEn:'Payments and commission', paths:['M3 6.4h16v10.2H3zM3 9.6h16'] },
    { id:'/promos', label:'Promos y push', labelEn:'Promos and push', paths:['M12.4 3.5 6 12.4h4.2l-1.2 6.1 6.6-9.3h-4.4l1.2-5.7Z'] },
    { id:'/reports', label:'Reportes', labelEn:'Reports', paths:['M4 16V9.5M9 16V5M14 16v-4M19 16V7.5'] }
  ]},
  { title:'SISTEMA', titleEn:'SYSTEM', items:[
    { id:'/settings', label:'Parámetros y roles', labelEn:'Parameters and roles', paths:['M11 13.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z','M18.4 11c0-.4 0-.8-.1-1.2l1.6-1.2-1.6-2.8-1.9.8a7.4 7.4 0 0 0-2-1.2l-.3-2h-3.2l-.3 2a7.4 7.4 0 0 0-2 1.2l-1.9-.8L5.1 8.6l1.6 1.2a7.4 7.4 0 0 0 0 2.4l-1.6 1.2 1.6 2.8 1.9-.8a7.4 7.4 0 0 0 2 1.2l.3 2h3.2l.3-2a7.4 7.4 0 0 0 2-1.2l1.9.8 1.6-2.8-1.6-1.2c.1-.4.1-.8.1-1.2Z'] },
    { id:'/cms', label:'CMS y contenido', labelEn:'CMS and content', paths:['M5 3.4h9l3 3v12.2H5zM14 3.4v3h3','M7.6 11h6.8M7.6 14h4.4'] },
    { id:'/audit', label:'Logs y auditoría', labelEn:'Logs and audit', paths:['M11 4.4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Z','M11 7.6V11l2.4 1.7'] }
  ]}
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useAppContext();

  return (
    <div className="tr-sb" style={{ width: '236px', flex: 'none', background: 'var(--bg)', borderRight: '1px solid var(--bd2)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: '9px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <div style={{ font: '800 16px/1 Manrope,sans-serif', color: '#fff', letterSpacing: '-.05em' }}>t</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.035em' }}>Turapp Admin</div>
          <div style={{ font: '600 9px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.12em', marginTop: '1px' }}>BUENAVENTURA</div>
        </div>
      </div>

      {NAV.map((group, idx) => (
        <div key={idx} style={{ padding: '10px 12px 4px' }}>
          <div style={{ font: '700 9.5px Manrope,sans-serif', color: 'var(--mu)', letterSpacing: '.1em', padding: '0 10px 10px' }}>
            {lang === 'en' ? group.titleEn : group.title}
          </div>
          {group.items.map((item) => {
            const isActive = pathname === item.id || (pathname.startsWith(item.id) && item.id !== '/');
            return (
              <Link
                key={item.id}
                href={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', height: '38px', padding: '0 12px',
                  borderRadius: '99px', marginBottom: '2px', textAlign: 'left', textDecoration: 'none',
                  background: isActive ? 'var(--brandS)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--tx)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon paths={item.paths} size={16} />
                </div>
                <div style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', font: '700 12.5px Manrope,sans-serif' }}>
                  {lang === 'en' ? item.labelEn : item.label}
                </div>
                {item.badge && (
                  <div style={{ padding: '1px 6px', borderRadius: '99px', background: isActive ? 'var(--brand)' : item.badgeBg, color: '#fff', font: "700 9px 'IBM Plex Mono',monospace", flex: 'none' }}>
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ))}
      <div style={{ flex: 1, minHeight: '14px' }}></div>
      <div style={{ padding: '12px', borderTop: '1px solid var(--bd2)', position: 'sticky', bottom: 0, background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', background: 'var(--sf)' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--sf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px Manrope,sans-serif', flex: 'none' }}>
            MA
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>María Arboleda</div>
            <div style={{ font: '500 10px Manrope,sans-serif', color: 'var(--mu)' }}>{lang === 'en' ? 'Operations · BUE' : 'Operaciones · BUE'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

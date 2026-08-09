'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppContext } from '../context/AppProvider';

const PAGE_TITLES = {
  '/': ['Dashboard', 'Dashboard'],
  '/map': ['Mapa en vivo', 'Live map'],
  '/trips': ['Viajes urbanos', 'Urban trips'],
  '/cali': ['Viajes a Cali', 'Cali trips'],
  '/support': ['Soporte', 'Support'],
  '/drivers': ['Conductores', 'Drivers'],
  '/passengers': ['Pasajeros', 'Riders'],
  '/vehicles': ['Vehículos y placas', 'Vehicles and plates'],
  '/payments': ['Pagos y comisiones', 'Payments and commission'],
  '/promos': ['Promos y push', 'Promos and push'],
  '/reports': ['Reportes', 'Reports'],
  '/settings': ['Parámetros y roles', 'Parameters and roles'],
  '/cms': ['CMS y contenido', 'CMS and content'],
  '/audit': ['Logs y auditoría', 'Logs and audit']
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { lang } = useAppContext();
  
  // Find matching title based on route prefix
  let routeKey = '/';
  if (pathname !== '/') {
    const matchingKey = Object.keys(PAGE_TITLES).find(k => k !== '/' && pathname.startsWith(k));
    if (matchingKey) routeKey = matchingKey;
  }

  const title = PAGE_TITLES[routeKey] ? PAGE_TITLES[routeKey][lang === 'en' ? 1 : 0] : 'Admin';

  return (
    <>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar title={title} />
        <div className="tr-sb" style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {children}
        </div>
      </div>
    </>
  );
}

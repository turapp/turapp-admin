'use client';

import { useAppContext } from '../context/AppProvider';
import Icon from './ui/Icon';

export default function Topbar({ title }) {
  const { theme, toggleTheme, lang } = useAppContext();

  return (
    <div style={{ height: '62px', flex: 'none', background: 'var(--bg)', borderBottom: '1px solid var(--bd2)', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 22px' }}>
      <div style={{ font: '800 18px Manrope,sans-serif', letterSpacing: '-.03em', flex: 'none' }}>
        {title}
      </div>
      <div style={{ width: '1px', height: '22px', background: 'var(--bd)', flex: 'none' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', height: '36px', padding: '0 14px', borderRadius: '99px', background: 'var(--sf)', width: '300px', flex: 'none' }}>
        <svg width="15" height="15" viewBox="0 0 18 18" fill="none" style={{ flex: 'none' }}>
          <circle cx="7.8" cy="7.8" r="5.4" stroke="var(--mu)" strokeWidth="1.8"></circle>
          <path d="m11.9 11.9 3.6 3.6" stroke="var(--mu)" strokeWidth="1.8" strokeLinecap="round"></path>
        </svg>
        <div style={{ flex: 1, font: '500 12.5px Manrope,sans-serif', color: 'var(--mu)' }}>
          {lang === 'en' ? 'Search trip, driver, plate or invoice…' : 'Buscar viaje, conductor, placa o factura…'}
        </div>
        <div style={{ font: "600 9.5px 'IBM Plex Mono',monospace", color: 'var(--mu)', padding: '2px 5px', borderRadius: '4px', background: 'var(--bg)', flex: 'none' }}>
          ⌘K
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 12px', borderRadius: '99px', background: 'var(--jadeS)', flex: 'none' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--jade)', animation: 'trBlink 1.6s ease-in-out infinite' }}></div>
        <div style={{ font: '700 11.5px Manrope,sans-serif', color: 'var(--jade)', whiteSpace: 'nowrap' }}>
          42 {lang === 'en' ? 'drivers online' : 'conductores en línea'}
        </div>
      </div>
      <button 
        onClick={toggleTheme} 
        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--sf)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', transition: 'all 0.2s' }}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M9 2.4v1.8M9 13.8v1.8M2.4 9h1.8M13.8 9h1.8M4.3 4.3l1.3 1.3M12.4 12.4l1.3 1.3M13.7 4.3l-1.3 1.3M5.6 12.4l-1.3 1.3" stroke="var(--tx)" strokeWidth="1.5" strokeLinecap="round"></path>
          <circle cx="9" cy="9" r="2.9" stroke="var(--tx)" strokeWidth="1.5"></circle>
        </svg>
      </button>
      <button style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--sf)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flex: 'none', transition: 'all 0.2s' }}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M9 2.4a4.6 4.6 0 0 1 4.6 4.6c0 3.4 1 4.6 1 4.6H3.4s1-1.2 1-4.6A4.6 4.6 0 0 1 9 2.4Z" stroke="var(--tx)" strokeWidth="1.6" strokeLinejoin="round"></path>
          <path d="M7.4 14.2a1.7 1.7 0 0 0 3.2 0" stroke="var(--tx)" strokeWidth="1.6" strokeLinecap="round"></path>
        </svg>
        <div style={{ position: 'absolute', top: '5px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--red)', border: '1.5px solid var(--sf)' }}></div>
      </button>
    </div>
  );
}

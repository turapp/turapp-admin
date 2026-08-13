'use client';

// Este repo ya es SOLO la app de conductor (driver.turapp.co). El panel de
// administración se separó a su propio repo y despliegue (turapp-dashboard,
// admin.turapp.co), así que aquí no queda sidebar ni topbar de escritorio.
//
// La app de conductor es una experiencia mobile de pantalla completa; en
// escritorio se envuelve en el simulador de iPhone para poder revisarla.
export default function AdminLayout({ children }) {
  return (
    <div id="driver-iphone-wrapper">
      <div id="driver-iphone-wrapper-content" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

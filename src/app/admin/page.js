'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const router = useRouter();
  const [view, setView] = useState('drivers'); // 'drivers' | 'review'
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'admin') {
        router.push('/');
        return;
      }
      loadDrivers();
    } catch (error) {
      console.error(error);
    }
  };

  const loadDrivers = async () => {
    setLoading(true);
    // Cargar perfiles que son conductores, con su estado de aprobacion y vehiculo
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, first_name, last_name, phone, is_approved, avatar_url, created_at,
        vehicles ( plate, category, make, model ),
        driver_profiles ( status )
      `)
      .eq('role', 'driver')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDrivers(data);
    }
    setLoading(false);
  };

  const handleReview = async (driver) => {
    setSelectedDriver(driver);
    setView('review');
    // Cargar documentos del conductor
    const { data, error } = await supabase
      .from('driver_documents')
      .select('*')
      .eq('driver_id', driver.id);
    
    if (!error && data) {
      setDocs(data);
    }
  };

  const approveDriver = async () => {
    if (!selectedDriver) return;
    if (!confirm('¿Estás seguro de aprobar a este conductor?')) return;
    
    setLoading(true);
    await supabase.from('profiles').update({ is_approved: true }).eq('id', selectedDriver.id);
    await supabase.from('driver_documents').update({ status: 'approved' }).eq('driver_id', selectedDriver.id);
    await supabase.from('driver_profiles').update({ status: 'offline' }).eq('id', selectedDriver.id);
    
    alert('Conductor aprobado exitosamente');
    setView('drivers');
    loadDrivers();
  };

  const rejectDriver = async () => {
    if (!selectedDriver) return;
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    setLoading(true);
    await supabase.from('driver_documents').update({ status: 'rejected', rejection_reason: reason }).eq('driver_id', selectedDriver.id);
    
    alert('Conductor rechazado');
    setView('drivers');
    loadDrivers();
  };

  const pendingCount = drivers.filter(d => !d.is_approved).length;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--sf)', color: 'var(--tx)', display: 'flex', fontFamily: 'Manrope, sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '236px', flex: 'none', background: '#fff', borderRight: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ font: '800 15px/1 Manrope', color: '#fff', letterSpacing: '-.05em' }}>T</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '800 15px Manrope', letterSpacing: '-.035em' }}>Turapp</div>
            <div style={{ font: '600 9px Manrope', color: '#888', letterSpacing: '.12em', marginTop: '1px' }}>ADMIN · BUENAVENTURA</div>
          </div>
        </div>

        <div style={{ padding: '10px 12px 4px' }}>
          <div style={{ font: '600 9.5px Manrope', color: '#888', letterSpacing: '.12em', padding: '0 8px 8px' }}>GESTIÓN</div>
          <button onClick={() => setView('drivers')} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: view === 'drivers' ? '#f5f5f5' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div style={{ flex: 1, textAlign: 'left', font: '600 13px Manrope', color: '#111' }}>Conductores</div>
            {pendingCount > 0 && (
              <div style={{ padding: '2px 6px', borderRadius: '99px', background: '#ff3b30', color: '#fff', font: '700 10px Manrope' }}>{pendingCount}</div>
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* TOPBAR */}
        <div style={{ height: '62px', flex: 'none', background: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 22px' }}>
          <div style={{ font: '800 18px Manrope', letterSpacing: '-.03em' }}>{view === 'drivers' ? 'Conductores' : 'Revisión de Documentos'}</div>
        </div>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px', background: '#fafafa' }}>
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', font: '600 14px Manrope', color: '#888' }}>Cargando...</div>
          ) : view === 'drivers' ? (
            
            // LISTA DE CONDUCTORES
            <div style={{ borderRadius: '14px', background: '#fff', border: '1px solid #eaeaea', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 120px', gap: '12px', padding: '12px 18px', borderBottom: '1px solid #eaeaea', background: '#f5f5f5' }}>
                <div style={{ font: '700 10.5px Manrope', color: '#888', letterSpacing: '.07em' }}>CONDUCTOR</div>
                <div style={{ font: '700 10.5px Manrope', color: '#888', letterSpacing: '.07em' }}>VEHÍCULO</div>
                <div style={{ font: '700 10.5px Manrope', color: '#888', letterSpacing: '.07em' }}>FECHA REGISTRO</div>
                <div style={{ font: '700 10.5px Manrope', color: '#888', letterSpacing: '.07em' }}>ESTADO</div>
                <div></div>
              </div>

              {drivers.map(dr => (
                <div key={dr.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 120px', gap: '12px', padding: '13px 18px', borderBottom: '1px solid #eaeaea', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={dr.avatar_url || '/images/3d_avatar.png'} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ font: '700 12.5px Manrope' }}>{dr.first_name || 'Sin nombre'} {dr.last_name || ''}</div>
                      <div style={{ font: '500 10.5px monospace', color: '#888' }}>{dr.phone}</div>
                    </div>
                  </div>
                  <div>
                    {dr.vehicles && dr.vehicles[0] ? (
                      <>
                        <div style={{ font: '600 11.5px monospace', letterSpacing: '.05em' }}>{dr.vehicles[0].plate}</div>
                        <div style={{ font: '500 10.5px Manrope', color: '#888', marginTop: '2px', textTransform: 'capitalize' }}>{dr.vehicles[0].category}</div>
                      </>
                    ) : (
                      <div style={{ font: '500 10.5px Manrope', color: '#888' }}>Sin vehículo</div>
                    )}
                  </div>
                  <div style={{ font: '500 11.5px Manrope', color: '#888' }}>
                    {new Date(dr.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    {dr.is_approved ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0f8a6d' }}></div>
                        <div style={{ font: '600 11.5px Manrope', color: '#0f8a6d' }}>Aprobado</div>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff9500' }}></div>
                        <div style={{ font: '600 11.5px Manrope', color: '#ff9500' }}>Pendiente</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleReview(dr)} style={{ height: '30px', padding: '0 12px', borderRadius: '8px', background: dr.is_approved ? '#f5f5f5' : '#111', color: dr.is_approved ? '#111' : '#fff', font: '700 11.5px Manrope', border: 'none', cursor: 'pointer' }}>
                      {dr.is_approved ? 'Ver Perfil' : 'Revisar'}
                    </button>
                  </div>
                </div>
              ))}
              
              {drivers.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', font: '500 13px Manrope', color: '#888' }}>No hay conductores registrados</div>
              )}
            </div>

          ) : (
            
            // PANTALLA DE REVISIÓN
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '16px' }}>
                <button onClick={() => setView('drivers')} style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M10.5 3.5 5.5 8.5l5 5" stroke="#111" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div style={{ font: '800 17px Manrope', letterSpacing: '-.03em' }}>{selectedDriver?.first_name} {selectedDriver?.last_name}</div>
                {!selectedDriver?.is_approved && (
                  <div style={{ padding: '4px 10px', borderRadius: '7px', background: '#fff3cd', color: '#856404', font: '700 10.5px Manrope' }}>Pendiente de Revisión</div>
                )}
                <div style={{ flex: 1 }}></div>
                {!selectedDriver?.is_approved && (
                  <>
                    <button onClick={rejectDriver} style={{ height: '38px', padding: '0 16px', borderRadius: '9px', background: '#ffe5e5', color: '#d32f2f', font: '700 13px Manrope', border: 'none', cursor: 'pointer' }}>Rechazar</button>
                    <button onClick={approveDriver} style={{ height: '38px', padding: '0 18px', borderRadius: '9px', background: '#0f8a6d', color: '#fff', font: '700 13px Manrope', border: 'none', cursor: 'pointer' }}>Aprobar Conductor</button>
                  </>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>
                
                {/* DOCUMENTOS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {docs.map(doc => (
                    <div key={doc.id} style={{ borderRadius: '14px', background: '#fff', border: '1px solid #eaeaea', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <div style={{ flex: 1, font: '700 13.5px Manrope', textTransform: 'capitalize' }}>{doc.doc_type}</div>
                        <div style={{ padding: '4px 9px', borderRadius: '6px', background: doc.status === 'approved' ? '#d4edda' : doc.status === 'rejected' ? '#f8d7da' : '#e2e3e5', color: doc.status === 'approved' ? '#155724' : doc.status === 'rejected' ? '#721c24' : '#383d41', font: '700 10px Manrope' }}>
                          {doc.status}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ display: 'block', width: '200px', height: '140px', borderRadius: '9px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                          <img src={doc.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </a>
                      </div>
                    </div>
                  ))}
                  {docs.length === 0 && (
                    <div style={{ borderRadius: '14px', background: '#fff', border: '1px solid #eaeaea', padding: '40px', textAlign: 'center', font: '600 13px Manrope', color: '#888' }}>
                      Este conductor no ha subido documentos aún.
                    </div>
                  )}
                </div>

                {/* INFO DEL APLICANTE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ borderRadius: '14px', background: '#fff', border: '1px solid #eaeaea', padding: '18px' }}>
                    <div style={{ font: '800 14px Manrope', letterSpacing: '-.025em', marginBottom: '14px' }}>Datos del Aplicante</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <img src={selectedDriver?.avatar_url || '/images/3d_avatar.png'} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: '700 13.5px Manrope' }}>{selectedDriver?.first_name} {selectedDriver?.last_name}</div>
                        <div style={{ font: '500 11px monospace', color: '#888', marginTop: '2px' }}>{selectedDriver?.phone}</div>
                      </div>
                    </div>
                    
                    {selectedDriver?.vehicles && selectedDriver.vehicles[0] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eaeaea', paddingTop: '10px' }}>
                          <div style={{ font: '500 11.5px Manrope', color: '#888' }}>Placa</div>
                          <div style={{ font: '600 11.5px monospace' }}>{selectedDriver.vehicles[0].plate}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ font: '500 11.5px Manrope', color: '#888' }}>Categoría</div>
                          <div style={{ font: '600 11.5px Manrope', textTransform: 'capitalize' }}>{selectedDriver.vehicles[0].category}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

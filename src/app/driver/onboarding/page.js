'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function OnboardingPage() {
  const router = useRouter();
  
  // Navigation Steps: 1: Login, 2: Vehicle, 3: Documents, 4: Biometrics, 5: Review
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auth States
  const [authStep, setAuthStep] = useState('phone'); // phone, otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  
  // Camera States
  const [cameraMode, setCameraMode] = useState('none');
  const [activeDocument, setActiveDocument] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [biometricProgress, setBiometricProgress] = useState(0);

  // Background Carousel State for Step 1
  const [bgIndex, setBgIndex] = useState(0);
  const bgImages = [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=600&h=800', // Driver at night
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600&h=800', // Car exterior
    'https://images.unsplash.com/photo-1517409252326-0e30573e86c0?auto=format&fit=crop&q=80&w=600&h=800'  // Business passenger
  ];

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setBgIndex((prev) => (prev + 1) % bgImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Document States
  const [docs, setDocs] = useState({
    cedula: 'Aprobado',
    licencia: 'Aprobado',
    soat: 'Aprobado - vence 12/2026',
    propiedad: 'En revisión',
    tecnomecanica: 'Acción requerida',
    tarjeton: 'Requerido',
    planilla: 'Requerido'
  });

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const openDocumentCamera = (docKey) => {
    setActiveDocument(docKey);
    // Para capturar foto usamos el input nativo del dispositivo
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const startBiometricScan = () => {
    setActiveDocument('biometric');
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'user');
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeDocument) return;

    setUploading(true);
    setCameraMode(activeDocument === 'biometric' ? 'biometric' : 'document');
    setIsScanning(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Upload a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${activeDocument}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('driver_documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('driver_documents')
        .getPublicUrl(fileName);

      // Guardar en Base de Datos (Si no es biométrico)
      if (activeDocument !== 'biometric') {
        const { error: dbError } = await supabase.from('driver_documents').upsert({
          driver_id: user.id,
          doc_type: activeDocument,
          file_url: publicUrl,
          status: 'pending'
        }, { onConflict: 'driver_id,doc_type' });
        
        if (dbError) throw dbError;
        setDocs(prev => ({ ...prev, [activeDocument]: 'En revisión' }));
      } else {
        // Guardar selfie biométrica en el perfil
        await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
        
        // Simular progreso biométrico para la UI
        let prog = 0;
        const interval = setInterval(() => {
          prog += 10;
          setBiometricProgress(prog);
          if (prog >= 100) {
            clearInterval(interval);
            finishOnboarding(user.id);
          }
        }, 150);
        return; // Detiene el flujo aquí porque finishOnboarding se encarga
      }
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      alert("Hubo un error subiendo el documento. Intenta de nuevo.");
    } finally {
      if (activeDocument !== 'biometric') {
        setIsScanning(false);
        setCameraMode('none');
        setUploading(false);
        e.target.value = '';
      }
    }
  };

  const finishOnboarding = async (userId) => {
    try {
      // 1. Guardar Vehículo
      await supabase.from('vehicles').insert({
        driver_id: userId,
        plate: 'PDT123', // Demo estático
        plate_type: 'yellow',
        category: vehicleType || 'taxi',
        is_active: true
      });

      // 2. Crear Driver Profile
      await supabase.from('driver_profiles').upsert({
        id: userId,
        status: 'offline',
        is_active: false
      });

      // 3. Actualizar User Profile
      await supabase.from('profiles').update({ role: 'driver', is_approved: false }).eq('id', userId);

      setStep(5);
    } catch (error) {
      console.error("Error finalizando onboarding:", error);
    } finally {
      setIsScanning(false);
      setCameraMode('none');
      setUploading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: '+57' + phone.replace(/\D/g, ''),
        options: {
          data: { role: 'driver' } // Automáticamente asume rol conductor si es nuevo
        }
      });
      if (error) throw error;
      setAuthStep('otp');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al enviar SMS');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: '+57' + phone.replace(/\D/g, ''),
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      setStep(2); // Avanza al onboarding
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Código incorrecto');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: 'Manrope, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Input de archivo invisible para capturar cámara o archivos */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileSelected} 
        style={{ display: 'none' }} 
      />

      {/* GLOBAL CAMERA OVERLAY */}
      {cameraMode !== 'none' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
          
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '60px' }}>
            <div style={{ font: '700 16px Manrope,sans-serif' }}>
              {cameraMode === 'document' ? 'Subiendo Documento...' : 'Procesando Biometría...'}
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cameraMode === 'document' ? (
              <div style={{ width: '85%', height: '60%', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '12px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isScanning && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#0f8a6d', animation: 'trSpin 1s linear infinite' }}></div>
                    <div style={{ font: '600 15px Manrope,sans-serif', color: '#fff' }}>Guardando en la nube...</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: '280px', height: '380px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, #333 0%, #000 100%)', opacity: 0.5 }}></div>
                <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, textAlign: 'center', opacity: 0.5 }}>
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1" style={{ margin: '0 auto' }}><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                </div>
                {isScanning && (
                  <div className="laser-scan" style={{ position: 'absolute', left: 0, right: 0, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2) 50%, #fff 50%, transparent 51%)', backgroundSize: '100% 200%' }}></div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <div style={{ padding: '24px 24px 40px', display: 'flex', gap: '16px' }}>
            {/* Ocultamos el botón "Tomar foto" porque ahora lo disparamos directo desde el input */}
            </div>
          </div>
        </div>
      )}

      {/* 1. LOGIN (Driver Phone Auth) */}
      {step === 1 && (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh', animation: 'trFade .3s ease', background: '#000', color: '#fff', padding: '60px 24px 40px' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            <div style={{ width: '56px', height: '56px', background: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <div style={{ font: '800 24px Manrope,sans-serif', color: '#000' }}>T</div>
            </div>

            <div style={{ font: '800 36px/1.1 Manrope,sans-serif', marginBottom: '16px', letterSpacing: '-0.04em' }}>
              Gana dinero<br/>con Turapp
            </div>
            
            <div style={{ font: '500 16px/1.5 Manrope,sans-serif', color: '#aaa', marginBottom: '40px' }}>
              Regístrate como conductor y maneja tu propio tiempo en Buenaventura y Cali.
            </div>

            {authStep === 'phone' ? (
              <div style={{ animation: 'trSlideL .3s ease' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '56px', borderRadius: '14px', background: '#111', border: '1px solid #333' }}>
                    <div style={{ font: '700 16px Manrope,sans-serif', color: '#fff' }}>+57</div>
                  </div>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="300 000 0000"
                    style={{ flex: 1, height: '56px', borderRadius: '14px', background: '#111', border: '1px solid #333', padding: '0 16px', font: "600 18px 'IBM Plex Mono',monospace", color: '#fff', outline: 'none' }}
                  />
                </div>
                {error && <div style={{ color: '#ff3b30', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
                <button onClick={handleSendOtp} disabled={loading || !phone} style={{ width: '100%', height: '56px', borderRadius: '14px', background: phone ? '#0f8a6d' : '#333', color: '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', transition: 'all 0.2s' }}>
                  {loading ? 'Enviando...' : 'Recibir código por SMS'}
                </button>
              </div>
            ) : (
              <div style={{ animation: 'trSlideL .3s ease' }}>
                <div style={{ font: '500 15px Manrope,sans-serif', color: '#aaa', marginBottom: '16px' }}>Enviado a +57 {phone} <span onClick={() => setAuthStep('phone')} style={{ color: '#0f8a6d', cursor: 'pointer', fontWeight: 700, marginLeft: '8px' }}>Editar</span></div>
                <input 
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  style={{ width: '100%', height: '64px', borderRadius: '14px', background: '#111', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: "600 28px 'IBM Plex Mono',monospace", letterSpacing: '0.3em', color: '#fff', outline: 'none', marginBottom: '16px' }}
                />
                {error && <div style={{ color: '#ff3b30', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} style={{ width: '100%', height: '56px', borderRadius: '14px', background: otp.length >= 6 ? '#0f8a6d' : '#333', color: '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', transition: 'all 0.2s' }}>
                  {loading ? 'Verificando...' : 'Verificar código'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VEHICLE SELECTION */}
      {step === 2 && (
        <div style={{ padding: '60px 24px 40px', display: 'flex', flexDirection: 'column', minHeight: '100vh', animation: 'trFade .3s ease' }}>
          
          <button onClick={() => setStep(1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', marginBottom: '32px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>

          <div style={{ font: '800 32px/1.1 Manrope,sans-serif', marginBottom: '12px', letterSpacing: '-0.03em' }}>
            Elige tu vehículo
          </div>
          <div style={{ font: '500 16px/1.5 Manrope,sans-serif', color: '#666', marginBottom: '40px' }}>
            Selecciona el tipo de servicio que deseas prestar en Turapp.
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>

            {/* Taxi Visual Card */}
            <div onClick={() => setVehicleType('taxi')} style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', border: vehicleType === 'taxi' ? '3px solid #000' : '3px solid transparent', transition: 'all 0.2s ease' }}>
              <div style={{ background: 'linear-gradient(135deg, #fffde7 0%, #ffe082 100%)', padding: '32px 24px' }}>
                <div style={{ font: '800 22px Manrope,sans-serif', color: '#000', marginBottom: '12px' }}>Taxi amarillo</div>
                <div style={{ font: '700 13px Manrope,sans-serif', color: '#b27b00', background: '#fff', display: 'inline-block', padding: '8px 16px', borderRadius: '20px' }}>Taxímetro y aeropuerto</div>
              </div>
            </div>

            {/* Placa Blanca Visual Card */}
            <div onClick={() => setVehicleType('intermunicipal')} style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', border: vehicleType === 'intermunicipal' ? '3px solid #000' : '3px solid transparent', transition: 'all 0.2s ease' }}>
              <div style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)', padding: '32px 24px' }}>
                <div style={{ font: '800 22px Manrope,sans-serif', color: '#000', marginBottom: '12px' }}>Viajes a Cali</div>
                <div style={{ font: '700 13px Manrope,sans-serif', color: '#334e68', background: '#fff', display: 'inline-block', padding: '8px 16px', borderRadius: '20px' }}>Placa blanca exclusiva</div>
              </div>
            </div>

            {/* Tura Favor Visual Card */}
            <div onClick={() => setVehicleType('turafavor')} style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', border: vehicleType === 'turafavor' ? '3px solid #000' : '3px solid transparent', transition: 'all 0.2s ease', display: 'flex' }}>
              <div style={{ background: 'linear-gradient(135deg, #fce5e5 0%, #f8c9c9 100%)', padding: '32px 24px', flex: 1 }}>
                <div style={{ font: '800 22px Manrope,sans-serif', color: '#000', marginBottom: '12px' }}>Tura Favor</div>
                <div style={{ font: '700 13px Manrope,sans-serif', color: '#c92a2a', background: '#fff', display: 'inline-block', padding: '8px 16px', borderRadius: '20px' }}>Envíos y encargos</div>
              </div>
              <div style={{ width: '130px', background: '#f5f5f5' }}>
                <img src="/images/3d_delivery.png" alt="Tura Favor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/rN954bZ.png'; }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button 
              disabled={!vehicleType}
              onClick={() => { if (vehicleType) setStep(3); }} 
              style={{ width: '100%', height: '56px', borderRadius: '16px', background: vehicleType ? '#000' : '#e0e0e0', color: vehicleType ? '#fff' : '#888', font: '800 16px Manrope,sans-serif', border: 'none', transition: 'background 0.2s ease' }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* 3. DOCUMENTS */}
      {step === 3 && (
        <div style={{ padding: '60px 24px 120px', background: '#fff', minHeight: '100vh', animation: 'trFade .3s ease' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '24px' }}>
            <button onClick={() => setStep(2)} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            {vehicleType && (
              <div style={{ background: vehicleType === 'taxi' ? 'linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%)' : vehicleType === 'intermunicipal' ? 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)' : 'linear-gradient(135deg, #FCEEEB 0%, #F8D6D0 100%)', borderRadius: '30px', padding: '6px 16px 6px 8px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <img src={vehicleType === 'taxi' ? '/images/3d_car.png' : vehicleType === 'intermunicipal' ? '/images/3d_clock_car.png' : '/images/3d_delivery.png'} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <div style={{ font: '800 13px Manrope,sans-serif', color: vehicleType === 'taxi' ? '#996A00' : vehicleType === 'intermunicipal' ? '#2A4365' : '#C53030' }}>
                  {vehicleType === 'taxi' ? 'Taxi amarillo' : vehicleType === 'intermunicipal' ? 'Viajes a Cali' : 'Tura Favor'}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ font: '800 32px/1.1 Manrope,sans-serif', marginBottom: '12px', letterSpacing: '-0.03em' }}>Tus documentos</div>
          
          <div style={{ font: '500 16px/1.5 Manrope,sans-serif', color: '#666', marginBottom: '32px' }}>
            La revisión toma menos de 24 horas. Los documentos aprobados tendrán una marca verde.
          </div>

          {/* Progress Top Bar */}
          <div style={{ background: '#f8f8f8', borderRadius: '20px', padding: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #f0f0f0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff', border: '4px solid #0f8a6d', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 18px Manrope,sans-serif', color: '#0f8a6d', boxShadow: '0 4px 12px rgba(15,138,109,0.1)' }}>
              {Object.values(docs).filter(d => d.includes('Aprobado')).length}/{vehicleType === 'taxi' || vehicleType === 'intermunicipal' ? 6 : 5}
            </div>
            <div>
              <div style={{ font: '800 18px Manrope,sans-serif', color: '#111', marginBottom: '2px' }}>Documentos listos</div>
              <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>Completa todos los requisitos para viajar</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
            
            {[
              { key: 'cedula', name: 'Cédula de ciudadanía', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><line x1="15" y1="8" x2="17" y2="8"/><line x1="15" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg> },
              { key: 'licencia', name: 'Licencia de conducción', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 21v-4"/><path d="M16 21v-4"/><circle cx="12" cy="12" r="2"/></svg> },
              { key: 'soat', name: 'SOAT', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { key: 'propiedad', name: 'Tarjeta de propiedad', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
              { key: 'tecnomecanica', name: 'Revisión técnico-mecánica', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
              ...(vehicleType === 'taxi' ? [{ key: 'tarjeton', name: 'Tarjeta de control (Tarjetón)', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> }] : []),
              ...(vehicleType === 'intermunicipal' ? [{ key: 'planilla', name: 'Extracto de contrato (Planilla)', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> }] : [])
            ].map((doc, idx) => {
              const status = docs[doc.key];
              const isApproved = status.includes('Aprobado');
              const isReview = status === 'En revisión';
              const isRequired = status.includes('requerida') || status.includes('Requerido');
              const color = isApproved ? '#0f8a6d' : isReview ? '#f5a623' : isRequired ? '#ff3b30' : '#666';
              
              return (
                <div key={doc.key} onClick={() => !isApproved && !isReview && openDocumentCamera(doc.key)} style={{ background: '#fff', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', cursor: (!isApproved && !isReview) ? 'pointer' : 'default', transition: 'all 0.2s ease' }}>
                  
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: isApproved ? '#e7f3ef' : isReview ? '#fff8e6' : '#f5f5f5', color: isApproved ? '#0f8a6d' : isReview ? '#f5a623' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {doc.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '800 16px/1.2 Manrope,sans-serif', color: '#111', marginBottom: '6px' }}>{doc.name}</div>
                    <div style={{ font: '700 13px Manrope,sans-serif', color: color }}>{status}</div>
                  </div>
                  
                  <div>
                    {isApproved && <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f8a6d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(15,138,109,0.3)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                    {isReview && <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff8e6', color: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #f5a623' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>}
                    {isRequired && <div style={{ background: '#111', padding: '10px 20px', borderRadius: '24px', font: '800 14px Manrope,sans-serif', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Subir</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 100%)', zIndex: 10 }}>
            <button onClick={() => setStep(4)} style={{ width: '100%', height: '56px', borderRadius: '16px', background: '#000', color: '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Continuar <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* 4. BIOMETRIC INTRO STEP */}
      {step === 4 && (
        <div style={{ padding: '60px 24px 40px', background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', animation: 'trFade .3s ease' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            {vehicleType && (
              <div style={{ background: vehicleType === 'taxi' ? 'linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%)' : vehicleType === 'intermunicipal' ? 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)' : 'linear-gradient(135deg, #FCEEEB 0%, #F8D6D0 100%)', borderRadius: '30px', padding: '6px 16px 6px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={vehicleType === 'taxi' ? '/images/3d_car.png' : vehicleType === 'intermunicipal' ? '/images/3d_clock_car.png' : '/images/3d_delivery.png'} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <div style={{ font: '800 13px Manrope,sans-serif', color: vehicleType === 'taxi' ? '#996A00' : vehicleType === 'intermunicipal' ? '#2A4365' : '#C53030' }}>
                  {vehicleType === 'taxi' ? 'Taxi amarillo' : vehicleType === 'intermunicipal' ? 'Viajes a Cali' : 'Tura Favor'}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div className="float-4d" style={{ width: '120px', height: '120px', marginBottom: '40px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', animation: 'pulse 2s infinite' }}></div>
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <div style={{ font: '800 32px/1.1 Manrope,sans-serif', marginBottom: '16px', letterSpacing: '-0.03em' }}>Foto de perfil</div>
            <div style={{ font: '500 16px/1.5 Manrope,sans-serif', color: '#aaa' }}>
              Tomaremos una foto rápida para confirmar tu identidad. Los pasajeros verán esta foto.
            </div>
          </div>

          <button onClick={() => setCameraMode('biometric')} style={{ width: '100%', height: '56px', borderRadius: '12px', background: '#0f8a6d', color: '#fff', font: '700 16px Manrope,sans-serif', marginBottom: '16px', border: 'none' }}>
            Tomar foto
          </button>
        </div>
      )}

      {/* 5. UNDER REVIEW */}
      {step === 5 && (
        <div style={{ padding: '60px 24px 40px', display: 'flex', flexDirection: 'column', minHeight: '100vh', animation: 'trFade .3s ease', background: '#fff' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '40px' }}>
            <button onClick={() => setStep(2)} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            {vehicleType && (
              <div style={{ background: vehicleType === 'taxi' ? 'linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%)' : vehicleType === 'intermunicipal' ? 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)' : 'linear-gradient(135deg, #FCEEEB 0%, #F8D6D0 100%)', borderRadius: '30px', padding: '6px 16px 6px 8px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <img src={vehicleType === 'taxi' ? '/images/3d_car.png' : vehicleType === 'intermunicipal' ? '/images/3d_clock_car.png' : '/images/3d_delivery.png'} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <div style={{ font: '800 13px Manrope,sans-serif', color: vehicleType === 'taxi' ? '#996A00' : vehicleType === 'intermunicipal' ? '#2A4365' : '#C53030' }}>
                  {vehicleType === 'taxi' ? 'Taxi amarillo' : vehicleType === 'intermunicipal' ? 'Viajes a Cali' : 'Tura Favor'}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            
            <div style={{ font: '800 36px/1.1 Manrope,sans-serif', marginBottom: '16px', letterSpacing: '-0.03em' }}>
              Todo listo
            </div>
            <div style={{ font: '500 16px/1.5 Manrope,sans-serif', color: '#666', marginBottom: '32px' }}>
              Revisaremos tu perfil en las próximas horas. Te avisaremos cuando puedas empezar a aceptar viajes.
            </div>

            {/* COUNTDOWN */}
            <div style={{ background: '#f8f8f8', borderRadius: '16px', padding: '24px', marginBottom: '40px', textAlign: 'center' }}>
              <div style={{ font: '600 13px Manrope,sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Tiempo estimado de revisión</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ font: '800 32px Manrope,sans-serif', color: '#111', background: '#fff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>47</div>
                  <div style={{ font: '600 11px Manrope,sans-serif', color: '#aaa', marginTop: '8px' }}>HORAS</div>
                </div>
                <div style={{ font: '800 32px Manrope,sans-serif', color: '#ccc', paddingTop: '8px' }}>:</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ font: '800 32px Manrope,sans-serif', color: '#111', background: '#fff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>59</div>
                  <div style={{ font: '600 11px Manrope,sans-serif', color: '#aaa', marginTop: '8px' }}>MIN</div>
                </div>
                <div style={{ font: '800 32px Manrope,sans-serif', color: '#ccc', paddingTop: '8px' }}>:</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ font: '800 32px Manrope,sans-serif', color: '#111', background: '#fff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>59</div>
                  <div style={{ font: '600 11px Manrope,sans-serif', color: '#aaa', marginTop: '8px' }}>SEG</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '2px', background: '#000', margin: '4px 0 4px 6px' }}></div>
                <div>
                  <div style={{ font: '700 16px Manrope,sans-serif', color: '#000', marginBottom: '4px' }}>Documentos enviados</div>
                  <div style={{ font: '500 14px Manrope,sans-serif', color: '#888' }}>Completado</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '2px', background: '#e0e0e0', margin: '4px 0 4px 6px' }}></div>
                <div>
                  <div style={{ font: '700 16px Manrope,sans-serif', color: '#000', marginBottom: '4px' }}>Revisión de antecedentes</div>
                  <div style={{ font: '500 14px Manrope,sans-serif', color: '#888' }}>En curso</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #e0e0e0' }}></div>
                <div>
                  <div style={{ font: '700 16px Manrope,sans-serif', color: '#aaa', marginBottom: '4px', marginTop: '-2px' }}>Cuenta activa</div>
                </div>
              </div>
            </div>

          </div>

          <button onClick={() => router.push('/driver/intermunicipal/active')} style={{ width: '100%', height: '56px', borderRadius: '12px', background: '#f5f5f5', color: '#000', font: '700 16px Manrope,sans-serif', border: 'none' }}>
            Ir a la pantalla principal
          </button>
        </div>
      )}

      <style>{`
        @keyframes trFade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        .float-4d {
          animation: float 6s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotateX(5deg) rotateY(-5deg); }
          50% { transform: translateY(-10px) rotateX(-5deg) rotateY(5deg); }
          100% { transform: translateY(0px) rotateX(5deg) rotateY(-5deg); }
        }
        .scan-line {
          position: absolute;
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .laser-scan {
          animation: laser 3s linear infinite;
        }
        @keyframes laser {
          0% { background-position: 0 0; }
          100% { background-position: 0 200%; }
        }
      `}</style>
    </div>
  );
}

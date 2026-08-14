'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import DriverBottomNav from '../../../components/DriverBottomNav';
import { SERVICIOS, ORDEN, escenaServicio } from '../../../lib/servicios';

// ============================================================
// SERVICIOS DEL CONDUCTOR
// ============================================================
// La misma persona puede llevar pasajeros en su taxi y hacer un mandado en su
// moto. Y quien solo tiene bicicleta puede hacer domicilios aunque nunca lleve
// pasajeros. Por eso los servicios se piden por separado y Operaciones los
// aprueba uno por uno: cada uno tiene requisitos distintos.
//
// Se muestran los requisitos ANTES de que pida, para que nadie solicite algo
// que no va a poder cumplir y quede esperando una aprobación que no llegará.
//
// Cada tarjeta se ve como su servicio —su color, su pieza 3D, su promesa— y
// sale de lib/servicios.js, el mismo sitio del que come la bienvenida que le
// aparecerá cuando se lo aprueben. Antes esta lista estaba escrita aparte y
// los dos textos ya se habían separado entre sí.

// Único servicio donde tiene sentido preguntar con qué vehículo: en los otros
// el vehículo ya está determinado por el tipo de placa.
const PREGUNTA_VEHICULO = { favor: true };

const VEHICULOS = [
  ['bici', 'Bicicleta', '🚲'],
  ['moto', 'Moto', '🏍️'],
  ['taxi', 'Taxi', '🚕'],
  ['particular', 'Carro', '🚗'],
];

export default function Servicios() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [mios, setMios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busy, setBusy] = useState(null);
  const [eligiendo, setEligiendo] = useState(null);

  const cargar = useCallback(async (uid) => {
    const [{ data: s }, { data: v }] = await Promise.all([
      supabase.from('driver_services').select('*').eq('driver_id', uid),
      supabase.from('vehicles').select('*').eq('driver_id', uid).eq('is_active', true),
    ]);
    setMios(s || []);
    setVehiculos(v || []);
    setCargando(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      cargar(data.user.id);
    });
  }, [cargar]);

  const estadoDe = (id) => {
    const s = mios.find(x => x.servicio === id);
    if (!s) return 'no';
    if (s.aprobado && s.activo) return 'activo';
    if (s.aprobado && !s.activo) return 'pausado';
    return 'revision';
  };

  const solicitar = async (servicio, vehicleId = null) => {
    if (!userId) return;
    setBusy(servicio);
    const existente = mios.find(x => x.servicio === servicio);
    const { error } = existente
      ? await supabase.from('driver_services').update({ activo: true, solicitado: true, vehicle_id: vehicleId ?? existente.vehicle_id }).eq('id', existente.id)
      : await supabase.from('driver_services').insert({ driver_id: userId, servicio, vehicle_id: vehicleId });
    setBusy(null); setEligiendo(null);
    if (error) { alert('No se pudo solicitar: ' + error.message); return; }
    cargar(userId);
  };

  const pausar = async (servicio) => {
    const s = mios.find(x => x.servicio === servicio);
    if (!s) return;
    setBusy(servicio);
    await supabase.from('driver_services').update({ activo: false }).eq('id', s.id);
    setBusy(null);
    cargar(userId);
  };

  const activos = mios.filter(s => s.aprobado && s.activo).length;
  const enRevision = mios.filter(s => s.solicitado && !s.aprobado).length;

  return (
    <>
      <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '90px' }}>

        <div style={{ padding: '56px 20px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div style={{ font: '800 21px Manrope,sans-serif', letterSpacing: '-.03em' }}>Qué quieres hacer</div>
        </div>

        <div style={{ margin: '0 20px', padding: '20px', borderRadius: '20px', background: 'linear-gradient(155deg,#0d2b22 0%,#124234 55%,#0f8a6d 100%)', color: '#fff' }}>
          <div style={{ font: '800 19px/1.35 Manrope,sans-serif', letterSpacing: '-.02em' }}>
            Entre más servicios, más oportunidades
          </div>
          <div style={{ font: '500 12.5px/1.6 Manrope,sans-serif', opacity: .82, marginTop: '8px' }}>
            No tienes que escoger uno solo. Puedes llevar pasajeros en tu taxi y hacer mandados
            en tu moto — o solo domicilios si lo tuyo es la bicicleta.
          </div>
          <div style={{ display: 'flex', gap: '22px', marginTop: '18px' }}>
            <div>
              <div style={{ font: '600 10px Manrope,sans-serif', opacity: .65, letterSpacing: '.1em' }}>ACTIVOS</div>
              <div style={{ font: '800 26px Manrope,sans-serif', letterSpacing: '-.03em', lineHeight: 1.2 }}>{cargando ? '—' : activos}</div>
            </div>
            {enRevision > 0 && (
              <div>
                <div style={{ font: '600 10px Manrope,sans-serif', opacity: .65, letterSpacing: '.1em' }}>EN REVISIÓN</div>
                <div style={{ font: '800 26px Manrope,sans-serif', letterSpacing: '-.03em', lineHeight: 1.2 }}>{enRevision}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ margin: '18px 20px 0' }}>
          {ORDEN.map((id) => {
            const s = SERVICIOS[id];
            const est = estadoDe(s.id);
            const activo = est === 'activo';
            const revision = est === 'revision';
            return (
              <div key={s.id}
                style={{ borderRadius: '20px', marginBottom: '13px', overflow: 'hidden',
                  border: activo ? `2px solid ${s.acento}` : '1px solid #eaeae8',
                  background: '#fff',
                  boxShadow: activo ? `0 10px 26px ${s.acentoSuave.replace('.12', '.28')}` : '0 4px 14px rgba(0,0,0,.05)' }}>

                {/* La cara del servicio: su color y su pieza 3D flotando. Es
                    lo que hace que el conductor reconozca de un vistazo cuál
                    es cuál sin tener que leer. */}
                <div style={{ ...escenaServicio(s), position: 'relative', height: '104px', overflow: 'hidden', padding: '15px 17px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <img src={s.imagen} alt="" style={{
                    position: 'absolute', right: '6px', bottom: '-8px', width: '104px', height: '104px',
                    objectFit: 'contain', opacity: .95, pointerEvents: 'none',
                    filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.32))',
                    animation: 'trFloat 5.4s ease-in-out infinite',
                  }} />
                  <div style={{ position: 'relative', zIndex: 2, maxWidth: '66%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      {activo && <Chip texto="Activo" bg="rgba(255,255,255,.25)" color="#fff" />}
                      {revision && <Chip texto="En revisión" bg="rgba(255,255,255,.25)" color="#fff" />}
                      {est === 'pausado' && <Chip texto="Pausado" bg="rgba(255,255,255,.25)" color="#fff" />}
                    </div>
                    <div style={{ font: '800 17px/1.2 Manrope,sans-serif', letterSpacing: '-.03em', color: '#fff' }}>{s.nombreLargo}</div>
                    <div style={{ font: '600 11.5px/1.4 Manrope,sans-serif', color: 'rgba(255,255,255,.86)', marginTop: '3px' }}>{s.tagline}</div>
                  </div>
                </div>

                <div style={{ padding: '15px 17px 17px' }}>
                <div style={{ font: '500 12.5px/1.55 Manrope,sans-serif', color: '#555' }}>{s.promesa}</div>

                {/* Requisitos antes de pedir, no después de esperar */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '12px 0 0' }}>
                  {s.requisitos.map((r, i) => (
                    <span key={i} style={{ padding: '4px 9px', borderRadius: '99px', background: s.acentoSuave, color: s.acento, font: '600 10.5px Manrope,sans-serif' }}>{r}</span>
                  ))}
                </div>

                {/* Elegir vehículo cuando el servicio lo permite */}
                {eligiendo === s.id && (
                  <div style={{ marginTop: '13px', padding: '13px', borderRadius: '13px', background: '#f7f7f5' }}>
                    <div style={{ font: '700 11.5px Manrope,sans-serif', color: '#666', marginBottom: '9px' }}>¿Con qué lo vas a hacer?</div>
                    <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                      {VEHICULOS.map(([cat, label, ico]) => {
                        const mio = vehiculos.find(v => v.category === cat);
                        return (
                          <button key={cat} onClick={() => solicitar(s.id, mio?.id ?? null)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 13px', borderRadius: '11px', border: '1px solid #eaeae8', background: '#fff', font: '700 12px Manrope,sans-serif', cursor: 'pointer' }}>
                            <span>{ico}</span>{label}
                            {mio && <span style={{ font: '600 10px Manrope,sans-serif', color: '#0f8a6d' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ font: '500 11px/1.45 Manrope,sans-serif', color: '#888', marginTop: '9px' }}>
                      Si no tienes ese vehículo registrado, Operaciones te pedirá los datos al revisar.
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '13px' }}>
                  {est === 'no' && (
                    <button onClick={() => (PREGUNTA_VEHICULO[s.id] ? setEligiendo(eligiendo === s.id ? null : s.id) : solicitar(s.id))} disabled={busy === s.id}
                      style={{ width: '100%', height: '46px', borderRadius: '14px', background: s.acento, color: '#fff', font: '800 13.5px Manrope,sans-serif', border: 'none', cursor: 'pointer', boxShadow: `0 7px 18px ${s.acentoSuave.replace('.12', '.4')}` }}>
                      {busy === s.id ? 'Un momento…' : `Quiero recibir ${s.trabajo.varios}`}
                    </button>
                  )}
                  {revision && (
                    <div style={{ font: '600 12px Manrope,sans-serif', color: '#c98a1e', textAlign: 'center', padding: '10px 0' }}>
                      Operaciones está revisando tus documentos
                    </div>
                  )}
                  {activo && (
                    <button onClick={() => pausar(s.id)} disabled={busy === s.id}
                      style={{ width: '100%', height: '40px', borderRadius: '12px', background: '#fff', color: '#666', font: '700 12.5px Manrope,sans-serif', border: '1px solid #eaeae8', cursor: 'pointer' }}>
                      Pausar por ahora
                    </button>
                  )}
                  {est === 'pausado' && (
                    <button onClick={() => solicitar(s.id)} disabled={busy === s.id}
                      style={{ width: '100%', height: '46px', borderRadius: '14px', background: s.acento, color: '#fff', font: '800 13.5px Manrope,sans-serif', border: 'none', cursor: 'pointer' }}>
                      Reactivar
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ margin: '6px 20px 0', padding: '14px 16px', borderRadius: '13px', background: '#f7f7f5', font: '500 12px/1.55 Manrope,sans-serif', color: '#666' }}>
          Cada servicio se aprueba por separado porque cada uno pide papeles distintos.
          Puedes estar habilitado para mandados mientras todavía te revisan los del taxi.
        </div>
      </div>
      <DriverBottomNav />
    </>
  );
}

function Chip({ texto, bg, color }) {
  return (
    <span style={{ padding: '3px 9px', borderRadius: '99px', background: bg, color, font: '700 10.5px Manrope,sans-serif' }}>{texto}</span>
  );
}

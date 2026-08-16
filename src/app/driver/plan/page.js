'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { usarPlanPro } from '../../../lib/usarPlanPro';

// ============================================================
// TURAPP PRO — suscripción del conductor
// ============================================================
// La persuasión aquí no es una promesa vaga ("¡recibe más viajes!"), sino
// mostrarle SU puntaje real y cuánto le falta. Ver "estás en 55 de 100 y la
// suscripción te suma 30" convence más que cualquier adjetivo, y además es
// verdad: es exactamente lo que calcula puntaje_prioridad() en la base.
//
// Las comodidades están en la misma pantalla a propósito: son puntos GRATIS.
// Que el conductor los active primero genera confianza en que el sistema no
// es solo un peaje.

const COMODIDADES = [
  ['aire_acondicionado', 'Aire acondicionado', '❄️'],
  ['cargador', 'Cargador de celular', '🔌'],
  ['agua', 'Agua para el pasajero', '💧'],
  ['wifi', 'WiFi a bordo', '📶'],
  ['musica_a_gusto', 'Música a gusto del pasajero', '🎵'],
  ['espacio_equipaje', 'Espacio para equipaje', '🧳'],
  ['silla_bebe', 'Silla para bebé', '👶'],
  ['acepta_mascotas', 'Acepta mascotas', '🐾'],
];

const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-CO');

export default function PlanPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [sub, setSub] = useState(null);
  const [puntaje, setPuntaje] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [amen, setAmen] = useState({});
  const [precio, setPrecio] = useState(9990);
  // Precio de entrada: los primeros meses valen menos. `precio` es lo que
  // paga HOY este conductor; `precioNormal` es a lo que sube después.
  const [esPromo, setEsPromo] = useState(false);
  const [precioNormal, setPrecioNormal] = useState(19990);
  const [promoMeses, setPromoMeses] = useState(3);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  // Lo que dejó en comisión estos 30 días — el argumento que de verdad
  // convence, porque es su propio número y no un promedio inventado.
  const pro = usarPlanPro();

  const cargar = useCallback(async (uid) => {
    const [{ data: s }, { data: p }, { data: dp }, { data: a }, { data: cfgs }] = await Promise.all([
      supabase.from('driver_subscriptions').select('*').eq('driver_id', uid).eq('estado', 'activa').order('vence_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('profiles').select('rating').eq('id', uid).single(),
      supabase.from('driver_profiles').select('acceptance_rate').eq('id', uid).single(),
      supabase.from('driver_amenities').select('*').eq('driver_id', uid).maybeSingle(),
      supabase.from('app_settings').select('key, value')
        .in('key', ['suscripcion_precio', 'suscripcion_precio_promo', 'suscripcion_promo_meses']),
    ]);

    const activa = s && new Date(s.vence_at) > new Date();
    setSub(activa ? s : null);
    setAmen(a || {});

    const cfg = Object.fromEntries((cfgs ?? []).map(c => [c.key, Number(c.value)]));
    const normal = Number.isFinite(cfg.suscripcion_precio) ? cfg.suscripcion_precio : 19990;
    setPrecioNormal(normal);
    if (Number.isFinite(cfg.suscripcion_promo_meses)) setPromoMeses(cfg.suscripcion_promo_meses);

    // El precio de HOY lo resuelve la base (precio_suscripcion), para que la
    // app, el panel y el cobro digan el mismo número. Si la función todavía no
    // está aplicada, se cae al precio normal en vez de romper la pantalla.
    const { data: pr } = await supabase.rpc('precio_suscripcion', { p_driver: uid });
    const fila = Array.isArray(pr) ? pr[0] : pr;
    if (fila) {
      setPrecio(Number(fila.precio));
      setEsPromo(fila.es_promo === true);
    } else {
      setPrecio(normal);
      setEsPromo(false);
    }

    // Mismo cálculo que puntaje_prioridad() en la base, replicado aquí para
    // poder desglosarlo visualmente. Si cambia allá, cambiar acá.
    const rating = Number(p?.rating ?? 5);
    const acept = Number(dp?.acceptance_rate ?? 100);
    const nAmen = COMODIDADES.reduce((acc, [k]) => acc + (a?.[k] ? 1 : 0), 0);
    const d = {
      suscripcion: activa ? 30 : 0,
      calificacion: Math.min(30, (rating / 5) * 30),
      aceptacion: Math.min(25, (acept / 100) * 25),
      comodidades: Math.min(15, nAmen * 1.875),
      rating, acept, nAmen,
    };
    setDetalle(d);
    setPuntaje(Math.round(d.suscripcion + d.calificacion + d.aceptacion + d.comodidades));
    setCargando(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      cargar(data.user.id);
    });
  }, [cargar]);

  const alternarComodidad = async (clave) => {
    if (!userId) return;
    const nuevo = !amen[clave];
    setAmen((a) => ({ ...a, [clave]: nuevo }));
    const { error } = await supabase.from('driver_amenities')
      .upsert({ driver_id: userId, [clave]: nuevo, updated_at: new Date().toISOString() }, { onConflict: 'driver_id' });
    if (error) { setAmen((a) => ({ ...a, [clave]: !nuevo })); return; }
    cargar(userId);
  };

  const suscribirse = async () => {
    if (!userId) return;
    setGuardando(true);
    const vence = new Date();
    vence.setMonth(vence.getMonth() + 1);
    // Se congela hasta cuándo le dura el precio de entrada. Va guardado por
    // conductor: si mañana cambia la promoción, quien ya entró conserva la
    // suya. Y el precio se guarda tal cual, no se recalcula después.
    const promoHasta = esPromo ? new Date() : null;
    if (promoHasta) promoHasta.setMonth(promoHasta.getMonth() + promoMeses);

    const { error } = await supabase.from('driver_subscriptions').insert({
      driver_id: userId,
      precio,
      promo_hasta: promoHasta ? promoHasta.toISOString() : null,
      vence_at: vence.toISOString(),
      estado: 'pendiente_pago',   // no se activa hasta que el pago entre de verdad
    });
    setGuardando(false);
    if (error) { alert('No se pudo iniciar la suscripción: ' + error.message); return; }
    alert('Tu solicitud quedó registrada. El cobro se activa cuando conectemos la pasarela de pagos.');
    cargar(userId);
  };

  const faltante = puntaje != null ? 100 - puntaje : 0;

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '90px' }}>

      <div style={{ padding: '56px 20px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ font: '800 21px Manrope,sans-serif', letterSpacing: '-.03em' }}>Tu prioridad</div>
      </div>

      {/* Puntaje real: el argumento de venta más honesto que hay */}
      <div style={{ margin: '0 20px', padding: '20px', borderRadius: '20px', background: 'linear-gradient(160deg,#111 0%,#2a2a2a 100%)', color: '#fff' }}>
        <div style={{ font: '600 11px Manrope,sans-serif', opacity: .7, letterSpacing: '.1em' }}>TU PUNTAJE DE PRIORIDAD</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <div style={{ font: '800 46px Manrope,sans-serif', letterSpacing: '-.04em', lineHeight: 1 }}>
            {cargando ? '—' : puntaje}
          </div>
          <div style={{ font: '600 15px Manrope,sans-serif', opacity: .6, marginBottom: '6px' }}>/ 100</div>
        </div>
        <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,.15)', overflow: 'hidden', margin: '14px 0 10px' }}>
          <div style={{ height: '100%', width: `${puntaje || 0}%`, background: '#0f8a6d', transition: 'width .5s ease' }} />
        </div>
        <div style={{ font: '500 12.5px/1.5 Manrope,sans-serif', opacity: .85 }}>
          Entre más alto tu puntaje, antes te llegan los viajes cuando hay varios conductores cerca.
        </div>
      </div>

      {/* Desglose: qué te suma y qué te falta */}
      {detalle && (
        <div style={{ margin: '16px 20px 0' }}>
          <Barra label="Suscripción Turapp Pro" valor={detalle.suscripcion} max={30}
                 nota={sub ? 'Activa' : `Te faltan 30 puntos`} activo={!!sub} />
          <Barra label="Tu calificación" valor={detalle.calificacion} max={30}
                 nota={`★ ${detalle.rating.toFixed(2)}`} activo />
          <Barra label="Aceptación de viajes" valor={detalle.aceptacion} max={25}
                 nota={`${Math.round(detalle.acept)}%`} activo />
          <Barra label="Comodidades a bordo" valor={detalle.comodidades} max={15}
                 nota={`${detalle.nAmen} de 8`} activo={detalle.nAmen > 0} />
        </div>
      )}

      {/* Suscripción */}
      {!sub && (
        <div style={{ margin: '20px', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 14px 34px rgba(13,43,34,.28)' }}>

          {/* Cabecera oscura con la oferta. El precio es lo más grande de la
              pantalla porque es lo que decide. */}
          <div style={{
            position: 'relative', padding: '22px 20px 20px', color: '#fff',
            background: 'linear-gradient(150deg,#0d2b22 0%,#124234 52%,#0f8a6d 100%)',
          }}>
            {[0, 1, 2].map(k => (
              <div key={k} style={{
                position: 'absolute', right: `${-50 - k * 34}px`, top: `${-56 - k * 24}px`,
                width: `${180 + k * 90}px`, height: `${180 + k * 90}px`, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,.12)', pointerEvents: 'none',
              }} />
            ))}

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', background: 'rgba(255,255,255,.17)', font: '800 9.5px Manrope,sans-serif', letterSpacing: '.1em' }}>
                  ✦ TURAPP PRO
                </div>
                <div style={{ background: 'rgba(255,255,255,.92)', color: '#0d2b22', padding: '4px 10px', borderRadius: '99px', font: '800 10.5px Manrope,sans-serif' }}>+30 puntos</div>
              </div>

              <div style={{ font: '800 23px/1.22 Manrope,sans-serif', letterSpacing: '-.035em', marginBottom: '7px' }}>
                Quédate con el 100%<br />de cada carrera
              </div>
              <div style={{ font: '500 12.5px/1.55 Manrope,sans-serif', opacity: .85, marginBottom: '16px' }}>
                Sin suscripción dejas el <strong>15%</strong> de cada viaje. Con Pro no dejas nada.
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ font: '800 40px Manrope,sans-serif', letterSpacing: '-.045em', lineHeight: 1 }}>{money(precio)}</div>
                <div style={{ font: '600 13px Manrope,sans-serif', opacity: .72 }}>/ mes</div>
                {esPromo && (
                  <div style={{ font: '600 15px Manrope,sans-serif', opacity: .55, textDecoration: 'line-through' }}>{money(precioNormal)}</div>
                )}
              </div>

              {/* Se dice desde el principio a cuánto sube. Enterarse al cuarto
                  mes de que el precio subió es la forma más rápida de que el
                  conductor se vaya y no vuelva. */}
              {esPromo && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '11px', padding: '7px 13px', borderRadius: '99px', background: 'rgba(255,255,255,.16)', font: '700 11.5px Manrope,sans-serif' }}>
                  Los primeros {promoMeses} meses · después {money(precioNormal)}
                </div>
              )}
            </div>
          </div>

          {/* Su propio número: lo que dejó en comisión estos 30 días. */}
          {pro.conviene && (
            <div style={{ padding: '15px 20px', background: '#f0faf7', borderBottom: '1px solid #dcefe8' }}>
              <div style={{ font: '600 11.5px Manrope,sans-serif', color: '#0f8a6d', marginBottom: '3px' }}>
                Estos 30 días dejaste en comisión
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', flexWrap: 'wrap' }}>
                <div style={{ font: '800 24px Manrope,sans-serif', letterSpacing: '-.03em' }}>{money(pro.comisionMes)}</div>
                <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>
                  en {pro.viajesMes} {pro.viajesMes === 1 ? 'viaje' : 'viajes'}
                </div>
              </div>
              <div style={{ font: '600 12px/1.5 Manrope,sans-serif', color: '#444', marginTop: '7px' }}>
                Suscrito habrías pagado {money(precio)}. Te quedabas con{' '}
                <strong style={{ color: '#0f8a6d' }}>{money(pro.ahorro)}</strong> más.
              </div>
            </div>
          )}

          <div style={{ padding: '18px 20px 20px', background: '#fff' }}>

          {[
            ['Prioridad en los momentos de alta demanda', 'Cuando hay pocos carros y muchos pasajeros, tú vas primero'],
            ['Tus comodidades se muestran al pasajero', 'El que ofrece más, se ve más'],
            ['Tu calificación pesa más en el orden', 'El buen servicio se nota antes'],
          ].map(([t, s], i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '11px' }}>
              <div style={{ width: '19px', height: '19px', borderRadius: '50%', background: '#0f8a6d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px Manrope,sans-serif', flex: 'none', marginTop: '1px' }}>✓</div>
              <div>
                <div style={{ font: '700 13px Manrope,sans-serif' }}>{t}</div>
                <div style={{ font: '500 11.5px/1.4 Manrope,sans-serif', color: '#666', marginTop: '2px' }}>{s}</div>
              </div>
            </div>
          ))}

          {faltante > 30 && (
            <div style={{ padding: '11px 13px', borderRadius: '12px', background: '#fff', font: '500 12px/1.5 Manrope,sans-serif', color: '#666', margin: '4px 0 14px' }}>
              Ojo: la suscripción suma 30, pero <strong style={{ color: '#111' }}>no reemplaza el buen servicio</strong>. Un conductor
              sin suscripción con buena calificación y comodidades puede quedar por encima de uno suscrito que atiende mal.
            </div>
          )}

          <button onClick={suscribirse} disabled={guardando}
            style={{ width: '100%', height: '54px', borderRadius: '15px', background: '#0f8a6d', color: '#fff', font: '800 15px Manrope,sans-serif', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,138,109,.32)' }}>
            {guardando ? 'Un momento…' : `Activar por ${money(precio)} al mes`}
          </button>
          <div style={{ font: '500 11px/1.45 Manrope,sans-serif', color: '#888', textAlign: 'center', marginTop: '9px' }}>
            Puedes cancelar cuando quieras. Si cancelas, vuelves al 15% por viaje.
          </div>
          </div>
        </div>
      )}

      {sub && (
        <div style={{ margin: '20px', padding: '18px', borderRadius: '18px', background: '#f0faf7', border: '2px solid #0f8a6d' }}>
          <div style={{ font: '800 16px Manrope,sans-serif', color: '#0f8a6d' }}>Turapp Pro activo</div>
          <div style={{ font: '500 12.5px Manrope,sans-serif', color: '#666', marginTop: '4px' }}>
            Renueva el {new Date(sub.vence_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
          </div>
        </div>
      )}

      {/* Comodidades: puntos gratis */}
      <div style={{ margin: '4px 20px 0' }}>
        <div style={{ font: '800 16px Manrope,sans-serif', letterSpacing: '-.02em' }}>Comodidades a bordo</div>
        <div style={{ font: '500 12.5px/1.5 Manrope,sans-serif', color: '#666', margin: '4px 0 14px' }}>
          Cada una suma casi 2 puntos y <strong style={{ color: '#111' }}>no cuestan nada</strong>. Actívalas solo si de verdad las ofreces:
          el pasajero las ve antes de subirse.
        </div>

        {COMODIDADES.map(([clave, label, icono]) => (
          <div key={clave} onClick={() => alternarComodidad(clave)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', borderRadius: '14px', border: amen[clave] ? '2px solid #0f8a6d' : '1px solid #eaeae8', background: amen[clave] ? '#f0faf7' : '#fff', marginBottom: '8px', cursor: 'pointer' }}>
            <div style={{ fontSize: '19px', flex: 'none' }}>{icono}</div>
            <div style={{ flex: 1, font: '700 13.5px Manrope,sans-serif' }}>{label}</div>
            <div style={{ width: '42px', height: '24px', borderRadius: '99px', background: amen[clave] ? '#0f8a6d' : '#e0e0e0', position: 'relative', flex: 'none', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: '3px', left: amen[clave] ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: '18px 20px 0', padding: '13px 15px', borderRadius: '13px', background: '#fff8ea', font: '500 11.5px/1.5 Manrope,sans-serif', color: '#8a6d1e' }}>
        El cobro de la suscripción todavía no está conectado a una pasarela. Al activarla queda registrada
        como pendiente de pago y no se te cobra nada por ahora.
      </div>
    </div>
  );
}

function Barra({ label, valor, max, nota, activo }) {
  const pct = (valor / max) * 100;
  return (
    <div style={{ marginBottom: '13px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
        <div style={{ font: '700 12.5px Manrope,sans-serif', color: activo ? '#111' : '#999' }}>{label}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          <span style={{ font: '500 11px Manrope,sans-serif', color: '#888' }}>{nota}</span>
          <span style={{ font: "700 12px 'IBM Plex Mono',monospace", color: activo ? '#0f8a6d' : '#c9c9c9' }}>
            {Math.round(valor)}/{max}
          </span>
        </div>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: '#f0f0ee', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: activo ? '#0f8a6d' : '#e0e0e0', transition: 'width .4s ease' }} />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { servicio, escenaServicio } from '../lib/servicios';

// ============================================================
// BIENVENIDA DEL SERVICIO
// ============================================================
// El día que Operaciones le aprueba un servicio, el conductor abre la app y
// esto es lo primero que ve. No es un tutorial genérico: le habla de LO SUYO
// —su taxi, su van a Cali, su bicicleta— con el color y la pieza 3D de ese
// servicio.
//
// Sale una sola vez por servicio. Si mañana le aprueban otro, vuelve a salir,
// pero con la cara del nuevo. Así el que hace taxi y encomiendas recibe dos
// bienvenidas distintas y no una sola mezclada que no le sirve para ninguna.
//
// Se marca como vista en la base (no en el celular) para que no se repita si
// cambia de teléfono. Ver `20260814000001_onboarding_por_servicio.sql`.

export default function OnboardingServicio({ user, onCerrar }) {
  const [pendiente, setPendiente] = useState(null);
  const [i, setI] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const buscar = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('driver_services')
      .select('id, servicio, aprobado_at')
      .eq('driver_id', user.id)
      .eq('aprobado', true)
      .is('onboarding_visto_at', null)
      .order('aprobado_at', { ascending: true })
      .limit(1);
    setPendiente(data?.[0] ?? null);
    setI(0);
  }, [user]);

  useEffect(() => { buscar(); }, [buscar]);

  if (!pendiente) return null;

  const s = servicio(pendiente.servicio);
  // Diapositiva 0 = la bienvenida. Después van los pasos. La última resume.
  const total = s.pasos.length + 2;
  const ultima = i === total - 1;

  const cerrar = async () => {
    setGuardando(true);
    await supabase
      .from('driver_services')
      .update({ onboarding_visto_at: new Date().toISOString() })
      .eq('id', pendiente.id);
    setGuardando(false);
    setPendiente(null);
    onCerrar?.(s.id);
    // Por si le aprobaron dos servicios el mismo día: encadena la siguiente.
    buscar();
  };

  const avanzar = () => (ultima ? cerrar() : setI(i + 1));

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500, background: '#fff', display: 'flex', flexDirection: 'column', animation: 'trFade .25s ease' }}>

      {/* ---- Escena 3D ---- */}
      <div style={{ ...escenaServicio(s), position: 'relative', height: '46%', flex: 'none', overflow: 'hidden' }}>

        {/* Anillos concéntricos: dan profundidad al fondo sin competir con la
            pieza. Es lo mismo que hace el render de una foto de producto. */}
        {[0, 1, 2].map((k) => (
          <div key={k} style={{
            position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%,-50%)',
            width: `${150 + k * 80}px`, height: `${150 + k * 80}px`, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.16)',
          }} />
        ))}

        <button onClick={cerrar} aria-label="Saltar"
          style={{
            position: 'absolute', top: '18px', right: '16px', zIndex: 5,
            padding: '7px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.2)', color: '#fff',
            font: '700 11.5px Manrope,sans-serif', backdropFilter: 'blur(6px)',
          }}>
          Saltar
        </button>

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '26px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '14px',
            padding: '5px 13px', borderRadius: '99px',
            background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(6px)',
            color: '#fff', font: '800 10.5px Manrope,sans-serif', letterSpacing: '.08em', textTransform: 'uppercase',
          }}>
            ✓ Quedaste habilitado
          </div>

          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <img src={s.imagen} alt="" style={{
              width: '100%', height: '100%', objectFit: 'contain',
              filter: 'drop-shadow(0 22px 26px rgba(0,0,0,.34))',
              animation: 'trFloat 4.2s ease-in-out infinite',
            }} />
            {/* La sombra proyectada en el piso. Sin esto la pieza se ve pegada. */}
            <div style={{
              position: 'absolute', bottom: '-6px', left: '50%', marginLeft: '-46px',
              width: '92px', height: '13px', borderRadius: '50%',
              background: 'radial-gradient(closest-side, rgba(0,0,0,.5), transparent)',
              animation: 'trFloatSh 4.2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      {/* ---- Contenido ---- */}
      <div className="tr-sb" style={{
        flex: 1, marginTop: '-24px', borderRadius: '26px 26px 0 0', background: '#fff',
        padding: '24px 22px 0', overflowY: 'auto', position: 'relative', zIndex: 2,
        boxShadow: '0 -10px 30px rgba(0,0,0,.13)',
      }}>
        {/* Progreso: una barra por diapositiva, como las historias. Se sabe
            cuánto falta sin tener que contar. */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {Array.from({ length: total }).map((_, k) => (
            <div key={k} style={{
              flex: 1, height: '3px', borderRadius: '99px',
              background: k <= i ? s.acento : '#eaeae8',
              transition: 'background .25s ease',
            }} />
          ))}
        </div>

        {/* key fuerza el re-montaje: así la animación de entrada corre en
            cada paso y no solo la primera vez. */}
        <div key={i} style={{ animation: 'trSlideL .28s ease' }}>
          {i === 0 && (
            <>
              <div style={{ font: '700 11px Manrope,sans-serif', color: s.acento, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '7px' }}>
                {s.nombreLargo} · {s.ciudad}
              </div>
              <h2 style={{ font: '800 25px/1.2 Manrope,sans-serif', letterSpacing: '-.03em', margin: '0 0 10px' }}>
                {s.tagline}
              </h2>
              <p style={{ font: '500 14px/1.6 Manrope,sans-serif', color: '#666', margin: 0 }}>
                {s.promesa}
              </p>
            </>
          )}

          {i > 0 && i <= s.pasos.length && (
            <>
              <div style={{
                width: '42px', height: '42px', borderRadius: '13px', marginBottom: '15px',
                background: s.acentoSuave, color: s.acento,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '800 17px Manrope,sans-serif',
              }}>
                {i}
              </div>
              <h2 style={{ font: '800 21px/1.25 Manrope,sans-serif', letterSpacing: '-.025em', margin: '0 0 10px' }}>
                {s.pasos[i - 1].titulo}
              </h2>
              <p style={{ font: '500 14px/1.65 Manrope,sans-serif', color: '#666', margin: 0 }}>
                {s.pasos[i - 1].texto}
              </p>
            </>
          )}

          {ultima && (
            <>
              <h2 style={{ font: '800 21px/1.25 Manrope,sans-serif', letterSpacing: '-.025em', margin: '0 0 6px' }}>
                Esto ya lo tienes al día
              </h2>
              <p style={{ font: '500 13px/1.55 Manrope,sans-serif', color: '#888', margin: '0 0 16px' }}>
                Operaciones lo revisó y quedó aprobado. Si algo se vence, te avisamos antes.
              </p>
              {s.requisitos.map((r, k) => (
                <div key={k} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '11px' }}>
                  <span style={{
                    width: '19px', height: '19px', borderRadius: '50%', flex: 'none', marginTop: '1px',
                    background: s.acento, color: '#fff', font: '700 10px Manrope,sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✓</span>
                  <span style={{ font: '600 13px/1.45 Manrope,sans-serif', color: '#333' }}>{r}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ height: '96px' }} />
      </div>

      {/* ---- Acción ---- */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3,
        padding: '14px 22px 22px',
        background: 'linear-gradient(to top, #fff 62%, rgba(255,255,255,0))',
        display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        {i > 0 && (
          <button onClick={() => setI(i - 1)} aria-label="Atrás"
            style={{
              width: '52px', height: '54px', borderRadius: '16px', flex: 'none',
              background: '#f4f4f3', border: 'none', cursor: 'pointer',
              font: '800 16px Manrope,sans-serif', color: '#666',
            }}>←</button>
        )}
        <button onClick={avanzar} disabled={guardando}
          style={{
            flex: 1, height: '54px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            background: s.acento, color: '#fff', font: '800 15px Manrope,sans-serif',
            boxShadow: `0 8px 22px ${s.acentoSuave.replace('.12', '.4')}`,
          }}>
          {guardando ? 'Un momento…' : ultima ? `Empezar a recibir ${s.trabajo.varios}` : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}

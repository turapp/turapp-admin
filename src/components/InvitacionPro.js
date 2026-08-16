'use client';

import { useRouter } from 'next/navigation';
import { usarPlanPro, pesos } from '../lib/usarPlanPro';

// ============================================================
// LA INVITACIÓN A TURAPP PRO
// ============================================================
// Va donde el conductor ya está pensando en plata: ganancias y billetera.
// No repite el discurso de la pantalla del plan — dice UNA cosa, la suya:
// cuánto dejó en comisión y cuánto se habría ahorrado.
//
// Se calla en dos casos, a propósito:
//   · si ya está suscrito, y
//   · si este mes NO le habría convenido.
// Insistirle a alguien a quien no le sirve es la forma más rápida de que
// deje de creer en lo que le decimos después.

export default function InvitacionPro({ variante = 'tarjeta' }) {
  const router = useRouter();
  const p = usarPlanPro();

  if (p.cargando || p.suscrito) return null;

  const ir = () => router.push('/driver/plan');

  // Quien todavía no tiene viajes no puede ver un ahorro, pero sí la oferta.
  const sinDatos = p.viajesMes === 0;

  // ---- Barra delgada, para pantallas que ya están llenas ----
  if (variante === 'barra') {
    return (
      <button onClick={ir} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
        padding: '13px 15px', borderRadius: '16px', cursor: 'pointer', border: 'none',
        background: 'linear-gradient(135deg,#0d2b22 0%,#124234 55%,#0f8a6d 100%)',
        color: '#fff', textAlign: 'left', boxShadow: '0 8px 20px rgba(15,138,109,.26)',
      }}>
        <span style={{ fontSize: '19px', flex: 'none' }}>✦</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: '800 13px Manrope,sans-serif', letterSpacing: '-.02em' }}>
            {p.conviene
              ? `Este mes dejaste ${pesos(p.comisionMes)} en comisión`
              : `Quédate con el 100% de cada carrera`}
          </span>
          <span style={{ display: 'block', font: '500 11px Manrope,sans-serif', opacity: .82, marginTop: '1px' }}>
            {p.conviene
              ? `Con Pro habrías pagado ${pesos(p.precio)}. Te ahorrabas ${pesos(p.ahorro)}.`
              : `${pesos(p.precio)} al mes y no pagas comisión`}
          </span>
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" style={{ flex: 'none', opacity: .75 }}><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    );
  }

  // ---- Tarjeta completa ----
  return (
    <div style={{
      borderRadius: '22px', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(150deg,#0d2b22 0%,#124234 52%,#0f8a6d 100%)',
      color: '#fff', boxShadow: '0 12px 30px rgba(13,43,34,.32)',
    }}>
      {/* Anillos de fondo: profundidad sin competir con el número */}
      {[0, 1].map(k => (
        <div key={k} style={{
          position: 'absolute', right: `${-40 - k * 30}px`, top: `${-50 - k * 20}px`,
          width: `${170 + k * 90}px`, height: `${170 + k * 90}px`, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,.13)', pointerEvents: 'none',
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 2, padding: '19px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '11px',
          padding: '4px 10px', borderRadius: '99px', background: 'rgba(255,255,255,.17)',
          font: '800 9.5px Manrope,sans-serif', letterSpacing: '.1em',
        }}>
          ✦ TURAPP PRO
        </div>

        {p.conviene ? (
          <>
            <div style={{ font: '500 12px Manrope,sans-serif', opacity: .82 }}>Este mes dejaste en comisión</div>
            <div style={{ font: '800 34px Manrope,sans-serif', letterSpacing: '-.04em', lineHeight: 1.1, margin: '2px 0 10px' }}>
              {pesos(p.comisionMes)}
            </div>
            <div style={{ padding: '11px 13px', borderRadius: '13px', background: 'rgba(255,255,255,.13)', marginBottom: '14px' }}>
              <div style={{ font: '600 12px/1.5 Manrope,sans-serif' }}>
                Con Turapp Pro habrías pagado <strong>{pesos(p.precio)}</strong> y te quedabas con{' '}
                <strong>{pesos(p.ahorro)}</strong> más en el bolsillo.
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ font: '800 21px/1.25 Manrope,sans-serif', letterSpacing: '-.03em', marginBottom: '7px' }}>
              Quédate con el 100%<br />de cada carrera
            </div>
            <div style={{ font: '500 12.5px/1.55 Manrope,sans-serif', opacity: .85, marginBottom: '14px' }}>
              {sinDatos
                ? `Sin suscripción dejas el 15% de cada viaje. Con Pro no dejas nada.`
                : `Sin suscripción dejas el 15% de cada viaje. Con Pro pagas ${pesos(p.precio)} al mes y ya.`}
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginBottom: '13px', flexWrap: 'wrap' }}>
          <div style={{ font: '800 27px Manrope,sans-serif', letterSpacing: '-.03em' }}>{pesos(p.precio)}</div>
          <div style={{ font: '600 12px Manrope,sans-serif', opacity: .7 }}>/ mes</div>
          {p.esPromo && (
            <div style={{ font: '600 13px Manrope,sans-serif', opacity: .55, textDecoration: 'line-through' }}>
              {pesos(p.precioNormal)}
            </div>
          )}
        </div>

        {p.esPromo && (
          <div style={{ font: '600 11px Manrope,sans-serif', opacity: .8, marginBottom: '13px' }}>
            Los primeros {p.promoMeses} meses · después {pesos(p.precioNormal)}
          </div>
        )}

        <button onClick={ir} style={{
          width: '100%', height: '48px', borderRadius: '14px', border: 'none', cursor: 'pointer',
          background: '#fff', color: '#0d2b22', font: '800 14px Manrope,sans-serif',
        }}>
          Ver Turapp Pro
        </button>
      </div>
    </div>
  );
}

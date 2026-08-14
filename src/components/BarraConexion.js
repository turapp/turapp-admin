'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SERVICIOS, servicio } from '../lib/servicios';

// ============================================================
// BARRA DE CONEXIÓN
// ============================================================
// Antes decía "• Estás desconectado" y ya. Ahora el conductor ve de un
// vistazo tres cosas que antes tenía que adivinar:
//
//   1. Si está en línea, con un switch de verdad en vez de un texto.
//   2. CON QUÉ servicio está conectado — desde que un conductor puede tener
//      taxi, Cali y encomiendas a la vez, "en línea" solo no significa nada.
//   3. Qué está pasando ahora mismo (buscando, en viaje, sin GPS…).
//
// El patrón visual viene del repartidor de Tura Shop: píldora con punto de
// estado, título, subtítulo y switch. Se mantiene la estética de Turapp.

// Nombre, emoji y color salen de lib/servicios.js, que es de donde los toma
// también el onboarding y las hojas de abajo. Un solo sitio para cambiarlos.
const SERVICIO = Object.fromEntries(
  Object.values(SERVICIOS).map(s => [s.id, [s.nombre, s.emoji]])
);

export default function BarraConexion({ user, enLinea, onCambiar, onServicio, subtitulo, ocupado }) {
  const [servicios, setServicios] = useState([]);
  const [activo, setActivo] = useState(null);
  const [toast, setToast] = useState(null);

  const cargar = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('driver_services')
      .select('servicio, activo, aprobado')
      .eq('driver_id', user.id)
      .eq('aprobado', true);
    const habilitados = (data || []).filter(s => s.activo).map(s => s.servicio);
    setServicios(habilitados);
    setActivo((prev) => prev && habilitados.includes(prev) ? prev : habilitados[0] ?? null);
  }, [user]);

  useEffect(() => { cargar(); }, [cargar]);

  // La pantalla completa (colores, textos, qué se le avisa) sigue al servicio
  // elegido aquí, así que el padre tiene que enterarse — incluso del primero
  // que se selecciona solo al cargar, sin que el conductor toque nada.
  useEffect(() => { if (activo) onServicio?.(activo); }, [activo, onServicio]);

  const avisar = (texto) => {
    setToast(texto);
    setTimeout(() => setToast(null), 2200);
  };

  const alternar = () => {
    if (!enLinea && !activo) { avisar('Todavía no tienes servicios habilitados'); return; }
    onCambiar(!enLinea, activo);
    avisar(!enLinea ? `En línea · ${SERVICIO[activo]?.[0] ?? ''}` : 'Te desconectaste');
  };

  const s = activo ? servicio(activo) : null;
  const titulo = enLinea ? (ocupado ? 'En viaje' : 'En línea') : 'Desconectado';
  const sub = subtitulo ?? (enLinea
    ? (s ? s.trabajo.verbo : 'Buscando')
    : s ? `No estás recibiendo ${s.trabajo.varios}` : 'No estás recibiendo nada');

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        height: '58px', padding: '0 8px 0 12px', borderRadius: '999px',
        background: '#fff', border: '1px solid #eaeae8',
        boxShadow: '0 6px 20px rgba(0,0,0,.07)',
      }}>
        <span style={{
          width: '36px', height: '36px', borderRadius: '50%', flex: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          background: enLinea ? (ocupado ? 'rgba(201,138,30,.13)' : 'rgba(15,138,109,.13)') : '#f4f4f3',
        }}>
          {enLinea ? (activo ? SERVICIO[activo]?.[1] : '📡') : '💤'}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {enLinea && (
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', flex: 'none',
                background: ocupado ? '#c98a1e' : '#0f8a6d',
                animation: 'trBlink 1.6s ease-in-out infinite',
              }} />
            )}
            <span style={{ font: '800 14px Manrope,sans-serif', letterSpacing: '-.02em' }}>{titulo}</span>
          </div>
          <div style={{ font: '500 11.5px Manrope,sans-serif', color: '#888', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sub}
          </div>
        </div>

        <button onClick={alternar} aria-label={enLinea ? 'Desconectarme' : 'Conectarme'}
          style={{
            width: '54px', height: '31px', borderRadius: '99px', padding: '3px', flex: 'none',
            display: 'flex', border: 'none', cursor: 'pointer',
            background: enLinea ? '#0f8a6d' : '#dcdcda',
            transition: 'background .22s ease',
          }}>
          <span style={{
            width: '25px', height: '25px', borderRadius: '50%', background: '#fff',
            transform: enLinea ? 'translateX(23px)' : 'translateX(0)',
            transition: 'transform .22s cubic-bezier(.32,.72,0,1)',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          }} />
        </button>
      </div>

      {/* Con qué servicio. Solo aparece si tiene más de uno: mostrar una sola
          opción sería ruido. */}
      {servicios.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '9px', overflowX: 'auto', paddingBottom: '2px' }}>
          {servicios.map((s) => {
            const sel = activo === s;
            return (
              <button key={s} onClick={() => { setActivo(s); if (enLinea) { onCambiar(true, s); avisar(`Ahora recibes ${SERVICIO[s]?.[0]?.toLowerCase()}`); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px', flex: 'none',
                  height: '32px', padding: '0 13px', borderRadius: '99px', cursor: 'pointer',
                  border: sel ? 'none' : '1px solid #eaeae8',
                  background: sel ? '#111' : '#fff',
                  color: sel ? '#fff' : '#666',
                  font: '700 11.5px Manrope,sans-serif',
                  boxShadow: sel ? '0 3px 10px rgba(0,0,0,.14)' : 'none',
                  transition: 'all .18s ease',
                }}>
                <span>{SERVICIO[s]?.[1]}</span>{SERVICIO[s]?.[0]}
              </button>
            );
          })}
        </div>
      )}

      {servicios.length === 0 && (
        <div style={{ marginTop: '9px', padding: '10px 13px', borderRadius: '12px', background: 'rgba(201,138,30,.1)', font: '600 11.5px/1.45 Manrope,sans-serif', color: '#8a6d1e' }}>
          Todavía no tienes servicios habilitados. Pídelos en tu perfil.
        </div>
      )}

      {toast && (
        <div style={{
          position: 'absolute', top: '68px', left: '50%', transform: 'translateX(-50%)',
          background: '#111', color: '#fff', padding: '9px 16px', borderRadius: '99px',
          font: '700 12px Manrope,sans-serif', whiteSpace: 'nowrap', zIndex: 60,
          boxShadow: '0 8px 24px rgba(0,0,0,.22)', animation: 'trPop .2s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

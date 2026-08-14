'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// ============================================================
// ASISTENTE DEL CONDUCTOR
// ============================================================
// Un taxista está manejando: no puede leer un manual ni escribir párrafos.
// Por eso entra por voz, por texto o mandando una foto — lo que pueda en ese
// momento.
//
// Hoy responde con una guía escrita sobre SU estado real (si está aprobado,
// qué servicios tiene, cuánto le deben). NO es un modelo de lenguaje y no
// inventa: si no sabe algo, lo dice.
//
// Cuando llegue la API key de un LLM, `construirContexto()` ya arma todo el
// estado del conductor listo para mandárselo, y `preguntarAlModelo()` es el
// único punto que hay que conectar. El resto de la interfaz no cambia.

const CONOCIMIENTO = [
  {
    claves: ['no me llegan', 'no recibo', 'sin viajes', 'no suena', 'nada'],
    titulo: 'No te llegan viajes',
    pasos: (e) => [
      e.aprobado ? null : 'Tu cuenta todavía no está aprobada por Operaciones.',
      e.servicios.length ? null : 'No tienes ningún servicio habilitado.',
      e.enLinea ? null : 'Estás desconectado. Activa el switch de arriba.',
      e.gps ? null : 'No estamos recibiendo tu ubicación. Revisa los permisos de GPS.',
      'Si todo lo anterior está bien, puede que no haya pasajeros cerca en este momento.',
    ].filter(Boolean),
  },
  {
    claves: ['cobrar', 'cuanto gano', 'plata', 'pago', 'cuando me pagan', 'saldo'],
    titulo: 'Cómo y cuándo te pagan',
    pasos: () => [
      'Los viajes por Nequi te los paga el pasajero directo: esa plata te queda de una.',
      'Los que pagan con tarjeta entran a Turapp y te los transferimos cada 3 días.',
      'De los viajes por Nequi nos queda debiendo la comisión, y se cruza con lo que te debemos.',
      'En tu billetera ves el neto: si está en verde, es lo que te vamos a transferir.',
    ],
  },
  {
    claves: ['bono', 'propina', 'extra', 'mas plata'],
    titulo: 'El bono del pasajero',
    pasos: () => [
      'Cuando hay pocos carros, el pasajero puede agregar un bono para que lo recojan más rápido.',
      'Ese bono es tuyo completo: Turapp no le cobra comisión.',
      'Te aparece en la solicitud, antes de que aceptes.',
    ],
  },
  {
    claves: ['prioridad', 'primero', 'suscripcion', 'pro', 'puntaje'],
    titulo: 'Cómo conseguir más viajes',
    pasos: () => [
      'Los viajes se ofrecen por puntaje: calificación, aceptación, comodidades y suscripción.',
      'Lo que más sube gratis: aceptar los viajes que te llegan y activar tus comodidades.',
      'La suscripción suma, pero no reemplaza el buen servicio.',
      'Míralo en Mi plan: ahí ves tu puntaje desglosado.',
    ],
  },
  {
    claves: ['documento', 'papeles', 'soat', 'licencia', 'aprobar', 'verificar'],
    titulo: 'Documentos y aprobación',
    pasos: (e) => [
      e.aprobado ? 'Tu cuenta ya está aprobada.' : 'Tu cuenta está en revisión por Operaciones.',
      'Sube cédula, licencia, SOAT y tecnomecánica desde tu perfil.',
      'Cada servicio se aprueba aparte porque pide papeles distintos.',
      'Si un documento se vence, dejas de recibir viajes hasta renovarlo.',
    ],
  },
  {
    claves: ['cali', 'intermunicipal', 'puesto', 'abono'],
    titulo: 'Viajes a Cali',
    pasos: () => [
      'El pasajero abona el 30% al reservar y te paga el resto al abordar.',
      'Si el abono entró por tarjeta, te lo abonamos menos la comisión.',
      'Con el Plan Cali no pagas comisión: te conviene desde 8 pasajeros al mes.',
    ],
  },
  {
    claves: ['encomienda', 'paquete', 'favor', 'enviar'],
    titulo: 'Tura Favor',
    pasos: () => [
      'Son encomiendas dentro de Buenaventura: recoges en un punto y dejas en otro.',
      'No tienes que comprar nada ni poner plata tuya.',
      'Puedes hacerlo en bicicleta, moto o carro.',
    ],
  },
  {
    claves: ['emergencia', 'accidente', 'robo', 'peligro', 'ayuda urgente'],
    titulo: 'Emergencia',
    pasos: () => [
      'Si estás en peligro, llama primero al 123.',
      'Todos los viajes quedan grabados y tu ubicación queda registrada.',
      'Después repórtalo en Soporte para que quede el caso abierto.',
    ],
  },
];

export default function AsistenteIA({ user }) {
  const [abierto, setAbierto] = useState(false);
  const [hilo, setHilo] = useState([]);
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState(null);
  const [grabando, setGrabando] = useState(false);
  const [pensando, setPensando] = useState(false);
  const finRef = useRef(null);
  const fotoRef = useRef(null);
  const recRef = useRef(null);

  const cargarEstado = useCallback(async () => {
    if (!user) return;
    const [{ data: perfil }, { data: dp }, { data: servicios }, { data: saldo }] = await Promise.all([
      supabase.from('profiles').select('first_name, is_approved, rating, total_trips').eq('id', user.id).single(),
      supabase.from('driver_profiles').select('status, current_location').eq('id', user.id).single(),
      supabase.from('driver_services').select('servicio, aprobado, activo').eq('driver_id', user.id),
      supabase.from('driver_balance').select('*').eq('driver_id', user.id).maybeSingle(),
    ]);
    setEstado({
      nombre: perfil?.first_name || '',
      aprobado: perfil?.is_approved === true,
      rating: Number(perfil?.rating ?? 5),
      viajes: perfil?.total_trips ?? 0,
      enLinea: dp?.status === 'online',
      gps: !!dp?.current_location,
      servicios: (servicios || []).filter(s => s.aprobado && s.activo).map(s => s.servicio),
      neto: Number(saldo?.neto ?? 0),
    });
  }, [user]);

  useEffect(() => { if (abierto) cargarEstado(); }, [abierto, cargarEstado]);
  useEffect(() => { finRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [hilo, pensando]);

  // Punto único a reemplazar cuando llegue la API key del modelo.
  const preguntarAlModelo = async (pregunta) => {
    // Sin tildes: el conductor escribe "cuando me pagan" tanto como
    // "cuándo me pagan", y por voz llegan acentuadas casi siempre.
    const q = pregunta.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let mejor = null, puntos = 0;
    for (const item of CONOCIMIENTO) {
      let p = 0;
      for (const c of item.claves) if (q.includes(c)) p += c.split(' ').length * 2;
      if (p > puntos) { puntos = p; mejor = item; }
    }
    if (!mejor) return null;
    return { titulo: mejor.titulo, pasos: mejor.pasos(estado || { servicios: [] }) };
  };

  const enviar = async (preguntaTexto, adjunto) => {
    const pregunta = (preguntaTexto ?? texto).trim();
    if (!pregunta && !adjunto) return;
    setHilo(h => [...h, { yo: pregunta || 'Te mandé una foto', foto: adjunto }]);
    setTexto('');
    setPensando(true);

    const r = adjunto
      ? {
          titulo: 'Recibí tu foto',
          pasos: [
            'Todavía no puedo leer imágenes: falta conectar el modelo.',
            'Si es un documento, súbelo desde tu perfil para que Operaciones lo revise.',
            'Si es un problema en el viaje, cuéntamelo en palabras y te ayudo.',
          ],
        }
      : await preguntarAlModelo(pregunta);

    setPensando(false);
    setHilo(h => [...h, {
      bot: r || {
        titulo: 'De eso todavía no sé',
        pasos: [
          'Puedo ayudarte con: por qué no te llegan viajes, cómo y cuándo te pagan, el bono del pasajero, cómo conseguir más viajes, documentos, Viajes a Cali, encomiendas y emergencias.',
          'Si es algo distinto, escríbele a Soporte desde tu perfil.',
        ],
      },
    }]);
  };

  // Voz: la API del navegador, sin depender de nada externo.
  const alternarVoz = () => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { alert('Tu navegador no permite dictado por voz. Escríbeme y te ayudo igual.'); return; }
    if (grabando) { recRef.current?.stop(); setGrabando(false); return; }

    const rec = new SR();
    rec.lang = 'es-CO';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const dicho = ev.results[0][0].transcript;
      setGrabando(false);
      enviar(dicho);
    };
    rec.onerror = () => { setGrabando(false); };
    rec.onend = () => setGrabando(false);
    recRef.current = rec;
    setGrabando(true);
    rec.start();
  };

  const subirFoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    enviar('', url);
    e.target.value = '';
  };

  const SUGERENCIAS = ['¿Por qué no me llegan viajes?', '¿Cuándo me pagan?', '¿Cómo consigo más viajes?'];

  return (
    <>
      <button onClick={() => setAbierto(true)} aria-label="Asistente"
        style={{
          position: 'absolute', right: '16px', bottom: '92px', zIndex: 300,
          width: '54px', height: '54px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(140deg,#1a1330,#3d2168)', color: '#fff',
          boxShadow: '0 8px 24px rgba(45,27,82,.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        }}>
        ✦
      </button>

      {abierto && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 400, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #eaeae8', display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(140deg,#1a1330,#3d2168)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flex: 'none' }}>✦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.02em' }}>Asistente Turapp</div>
              <div style={{ font: '500 11px Manrope,sans-serif', color: '#888' }}>
                {estado ? `Hola${estado.nombre ? ' ' + estado.nombre : ''} · ${estado.enLinea ? 'estás en línea' : 'estás desconectado'}` : 'Cargando tu estado…'}
              </div>
            </div>
            <button onClick={() => setAbierto(false)} aria-label="Cerrar"
              style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f4f4f3', border: 'none', cursor: 'pointer', flex: 'none', fontSize: '15px' }}>✕</button>
          </div>

          <div className="tr-sb" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {hilo.length === 0 && (
              <>
                <div style={{ padding: '15px', borderRadius: '15px', background: '#f7f7f5', font: '500 12.5px/1.6 Manrope,sans-serif', color: '#444' }}>
                  Pregúntame lo que sea sobre tu trabajo en Turapp. Puedes escribirme,
                  <strong> hablarme</strong> o <strong>mandarme una foto</strong> — lo que puedas en el momento.
                </div>
                <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', letterSpacing: '.1em', margin: '18px 0 9px' }}>LO MÁS PREGUNTADO</div>
                {SUGERENCIAS.map((s, i) => (
                  <button key={i} onClick={() => enviar(s)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '12px', border: '1px solid #eaeae8', background: '#fff', font: '600 12.5px Manrope,sans-serif', marginBottom: '7px', cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </>
            )}

            {hilo.map((m, i) => m.yo !== undefined ? (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div style={{ maxWidth: '82%', padding: '10px 13px', borderRadius: '14px 14px 4px 14px', background: '#111', color: '#fff', font: '600 12.5px Manrope,sans-serif' }}>
                  {m.foto && <img src={m.foto} alt="" style={{ width: '100%', borderRadius: '9px', marginBottom: m.yo ? '7px' : 0 }} />}
                  {m.yo}
                </div>
              </div>
            ) : (
              <div key={i} style={{ marginTop: '10px', padding: '14px 15px', borderRadius: '14px 14px 14px 4px', background: '#f7f7f5' }}>
                <div style={{ font: '800 13px Manrope,sans-serif', marginBottom: '8px' }}>{m.bot.titulo}</div>
                {m.bot.pasos.map((p, k) => (
                  <div key={k} style={{ display: 'flex', gap: '9px', marginBottom: '7px' }}>
                    <span style={{ width: '17px', height: '17px', borderRadius: '50%', background: '#0f8a6d', color: '#fff', font: '700 9.5px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginTop: '2px' }}>{k + 1}</span>
                    <span style={{ font: '500 12.5px/1.55 Manrope,sans-serif', color: '#333' }}>{p}</span>
                  </div>
                ))}
              </div>
            ))}

            {pensando && (
              <div style={{ marginTop: '10px', padding: '13px 15px', borderRadius: '14px', background: '#f7f7f5', font: '500 12.5px Manrope,sans-serif', color: '#888' }}>
                Un momento…
              </div>
            )}
            <div ref={finRef} />
          </div>

          <div style={{ padding: '12px 14px', borderTop: '1px solid #eaeae8', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input ref={fotoRef} type="file" accept="image/*" capture="environment" onChange={subirFoto} style={{ display: 'none' }} />
            <button onClick={() => fotoRef.current?.click()} aria-label="Enviar foto"
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f4f4f3', border: 'none', cursor: 'pointer', flex: 'none', fontSize: '17px' }}>📷</button>
            <button onClick={alternarVoz} aria-label={grabando ? 'Detener' : 'Hablar'}
              style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: 'pointer', flex: 'none', fontSize: '17px',
                background: grabando ? '#c8402f' : '#f4f4f3', color: grabando ? '#fff' : '#111',
                animation: grabando ? 'trBlink 1s ease-in-out infinite' : 'none' }}>
              {grabando ? '⏹' : '🎤'}
            </button>
            <input value={texto} onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviar()}
              placeholder={grabando ? 'Te estoy escuchando…' : 'Escríbeme…'}
              style={{ flex: 1, minWidth: 0, height: '42px', borderRadius: '13px', border: '1px solid #eaeae8', background: '#f7f7f5', padding: '0 13px', font: '500 12.5px Manrope,sans-serif' }} />
            <button onClick={() => enviar()}
              style={{ height: '42px', padding: '0 15px', borderRadius: '13px', background: '#111', color: '#fff', font: '800 12.5px Manrope,sans-serif', border: 'none', cursor: 'pointer', flex: 'none' }}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

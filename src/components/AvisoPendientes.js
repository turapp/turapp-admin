'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { servicio } from '../lib/servicios';

// ============================================================
// LO QUE ESTÁ ESPERANDO AHORA MISMO
// ============================================================
// El conductor desconectado no tenía forma de saber si valía la pena
// conectarse. Veía la misma pantalla a las 3 de la mañana que a las 6 de la
// tarde. Esto le dice, con números reales, qué hay esperando en SU servicio:
//
//   taxi   → cuánta gente está pidiendo carro cerca (presion_demanda)
//   cali   → cuántos puestos lleva vendidos su próxima salida
//   favor  → encomiendas sin dueño, y las puede tomar desde aquí
//
// Es el mismo aviso de "tienes pedidos" del repartidor de Tura Shop, pero
// hablando el idioma de cada servicio: carreras, reservas o encomiendas.

const TAMANO = { envelope: 'Sobre', small_box: 'Paquete', large_box: 'Grande' };

export default function AvisoPendientes({ user, servicioActivo, enLinea, onConectar, coords }) {
  const router = useRouter();
  const [datos, setDatos] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [tomando, setTomando] = useState(null);

  const s = servicio(servicioActivo);

  const cargar = useCallback(async () => {
    if (!user || !servicioActivo) return;

    if (servicioActivo === 'taxi') {
      const [lat, lon] = coords ?? [3.8850, -77.0250];
      const { data } = await supabase.rpc('presion_demanda', { p_lat: lat, p_lon: lon, p_radio: 5000 });
      const d = Array.isArray(data) ? data[0] : data;
      if (!d) return setDatos(null);
      setDatos({ tipo: 'taxi', cantidad: d.solicitudes_activas ?? 0, libres: d.conductores_libres ?? 0, nivel: d.nivel ?? 0 });
      return;
    }

    if (servicioActivo === 'cali') {
      const { data } = await supabase
        .from('cali_departures')
        .select('id, departure_time, total_seats, occupied_seats, current_price')
        .eq('driver_id', user.id)
        .in('status', ['scheduled', 'boarding'])
        .gte('departure_time', new Date().toISOString())
        .order('departure_time', { ascending: true })
        .limit(1);
      setDatos(data?.[0] ? { tipo: 'cali', salida: data[0] } : { tipo: 'cali', salida: null });
      return;
    }

    // Encomiendas: las que nadie ha tomado. Ver la migración
    // 20260814000002 — antes de eso ni siquiera eran visibles.
    const { data } = await supabase
      .from('packages')
      .select('id, size, price, pickup_address, dropoff_address, created_at')
      .is('driver_id', null)
      .eq('status', 'requested')
      .order('created_at', { ascending: true })
      .limit(6);
    setDatos({ tipo: 'favor', lista: data ?? [] });
  }, [user, servicioActivo, coords]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 25000);
    return () => clearInterval(t);
  }, [cargar]);

  const tomar = async (id) => {
    setTomando(id);
    const { error } = await supabase
      .from('packages')
      .update({ driver_id: user.id, status: 'accepted' })
      .eq('id', id)
      .is('driver_id', null);          // si otro se adelantó, no pisa nada
    setTomando(null);
    if (error) { alert('Esa encomienda ya la tomó otro conductor.'); }
    cargar();
  };

  if (!datos) return null;

  // ---- Cuánto hay y cómo se llama ----
  let cantidad = 0, titulo = '', detalle = '', accion = null;

  if (datos.tipo === 'taxi') {
    cantidad = datos.cantidad;
    if (cantidad === 0) return null;
    titulo = cantidad === 1
      ? `Hay 1 persona pidiendo taxi cerca`
      : `Hay ${cantidad} personas pidiendo taxi cerca`;
    detalle = datos.libres === 0
      ? 'No hay ningún carro libre en la zona. Todas son para ti.'
      : datos.libres === 1
        ? 'Solo hay otro carro libre en la zona.'
        : `Hay ${datos.libres} carros libres compitiendo por ellas.`;
    accion = enLinea ? null : { texto: 'Conectarme ya', fn: () => onConectar?.() };
  }

  if (datos.tipo === 'cali') {
    if (!datos.salida) {
      titulo = 'No tienes salidas publicadas';
      detalle = 'Publica tu próxima salida para que los pasajeros la vean y separen puesto.';
      accion = { texto: 'Publicar salida', fn: () => router.push('/driver/intermunicipal') };
    } else {
      const { total_seats, occupied_seats, departure_time } = datos.salida;
      cantidad = occupied_seats ?? 0;
      const hora = new Date(departure_time).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
      const faltan = (total_seats ?? 0) - cantidad;
      titulo = cantidad === 0
        ? `Tu salida de las ${hora} está vacía`
        : `${cantidad} de ${total_seats} puestos vendidos`;
      detalle = cantidad === 0
        ? 'Todavía nadie ha separado. Los pasajeros de Cali también la están viendo.'
        : faltan > 0
          ? `Sales a las ${hora}. Te faltan ${faltan} para llenar.`
          : `Llena. Sales a las ${hora}.`;
      accion = { texto: 'Ver la salida', fn: () => router.push('/driver/intermunicipal') };
    }
  }

  if (datos.tipo === 'favor') {
    cantidad = datos.lista.length;
    if (cantidad === 0) return null;
    titulo = cantidad === 1 ? 'Hay 1 encomienda esperando' : `Hay ${cantidad} encomiendas esperando`;
    detalle = 'Nadie las ha tomado todavía. Ábrelas y quédate con la que te sirva.';
  }

  return (
    <div style={{
      background: '#fff', borderRadius: '20px', overflow: 'hidden',
      border: '1px solid #eaeae8', boxShadow: '0 8px 28px rgba(0,0,0,.09)',
      animation: 'trUp .3s ease',
    }}>
      <div
        onClick={datos.tipo === 'favor' ? () => setAbierto(v => !v) : undefined}
        style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '14px 15px', cursor: datos.tipo === 'favor' ? 'pointer' : 'default' }}>

        {/* Contador. Es el elemento con más peso visual a propósito: es el
            dato por el que el conductor decide si se conecta o no. */}
        <div style={{ position: 'relative', flex: 'none' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '15px',
            background: s.degradado, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '800 19px Manrope,sans-serif', letterSpacing: '-.02em',
            boxShadow: `0 6px 16px ${s.acentoSuave.replace('.12', '.45')}`,
          }}>
            {datos.tipo === 'cali' && !datos.salida ? s.emoji : cantidad}
          </div>
          {cantidad > 0 && (
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px',
              width: '11px', height: '11px', borderRadius: '50%',
              background: s.acento, border: '2px solid #fff',
              animation: 'trBlink 1.4s ease-in-out infinite',
            }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '800 13.5px/1.3 Manrope,sans-serif', letterSpacing: '-.02em', marginBottom: '2px' }}>{titulo}</div>
          <div style={{ font: '500 11.5px/1.4 Manrope,sans-serif', color: '#888' }}>{detalle}</div>
        </div>

        {datos.tipo === 'favor' && (
          <span style={{ flex: 'none', color: '#bbb', font: '700 13px Manrope,sans-serif', transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}>⌄</span>
        )}
      </div>

      {accion && (
        <div style={{ padding: '0 15px 14px' }}>
          <button onClick={accion.fn}
            style={{
              width: '100%', height: '44px', borderRadius: '13px', border: 'none', cursor: 'pointer',
              background: s.acento, color: '#fff', font: '800 13.5px Manrope,sans-serif',
            }}>
            {accion.texto}
          </button>
        </div>
      )}

      {datos.tipo === 'favor' && abierto && (
        <div style={{ borderTop: '1px solid #f0f0ee' }}>
          {datos.lista.map((p) => (
            <div key={p.id} style={{ padding: '13px 15px', borderBottom: '1px solid #f6f6f4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <span style={{
                  font: '700 10px Manrope,sans-serif', letterSpacing: '.06em', textTransform: 'uppercase',
                  color: s.acento, background: s.acentoSuave, padding: '3px 8px', borderRadius: '5px',
                }}>
                  {TAMANO[p.size] ?? p.size}
                </span>
                <span style={{ font: '800 15px Manrope,sans-serif' }}>${Number(p.price).toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: s.acento, font: '700 11px Manrope,sans-serif', flex: 'none' }}>Recoge</span>
                <span style={{ font: '500 11.5px/1.4 Manrope,sans-serif', color: '#555' }}>{p.pickup_address}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <span style={{ color: '#888', font: '700 11px Manrope,sans-serif', flex: 'none' }}>Entrega</span>
                <span style={{ font: '500 11.5px/1.4 Manrope,sans-serif', color: '#555' }}>{p.dropoff_address}</span>
              </div>
              <button onClick={() => tomar(p.id)} disabled={tomando === p.id}
                style={{
                  width: '100%', height: '38px', borderRadius: '11px', cursor: 'pointer',
                  background: '#111', color: '#fff', border: 'none',
                  font: '800 12.5px Manrope,sans-serif', opacity: tomando === p.id ? .6 : 1,
                }}>
                {tomando === p.id ? 'Tomando…' : 'Tomar esta encomienda'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import DriverBottomNav from '../../../components/DriverBottomNav';

// ============================================================
// PLAN CALI
// ============================================================
// La persuasión aquí es una cuenta, no un adjetivo: se le muestra desde qué
// pasajero le conviene la suscripción, calculado con SUS números reales
// (su tarifa vigente y sus pasajeros del mes). Un conductor de Cali sabe
// perfectamente cuántos viajes hace; mentirle en esa cuenta se nota enseguida.

const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-CO');

export default function PlanCali() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [sub, setSub] = useState(null);
  const [precio, setPrecio] = useState(59990);
  const [pctComision, setPctComision] = useState(15);
  const [tarifa, setTarifa] = useState(55000);
  const [pasajerosMes, setPasajerosMes] = useState(0);
  const [pagadoMes, setPagadoMes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async (uid) => {
    const desdeMes = new Date();
    desdeMes.setDate(1); desdeMes.setHours(0, 0, 0, 0);

    const [{ data: s }, { data: cfg }, { data: salidas }] = await Promise.all([
      supabase.from('driver_subscriptions').select('*').eq('driver_id', uid).eq('plan', 'cali')
        .eq('estado', 'activa').order('vence_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('app_settings').select('key, value')
        .in('key', ['suscripcion_cali_precio', 'comision_cali', 'cali_bloque_1']),
      supabase.from('cali_departures').select('id, current_price').eq('driver_id', uid)
        .gte('created_at', desdeMes.toISOString()),
    ]);

    const reglas = Object.fromEntries((cfg || []).map(r => [r.key, Number(r.value)]));
    if (Number.isFinite(reglas.suscripcion_cali_precio)) setPrecio(reglas.suscripcion_cali_precio);
    if (Number.isFinite(reglas.comision_cali)) setPctComision(reglas.comision_cali);
    if (Number.isFinite(reglas.cali_bloque_1)) setTarifa(reglas.cali_bloque_1);

    const activa = s && new Date(s.vence_at) > new Date();
    setSub(activa ? s : null);

    // Cuántos pasajeros movió este mes: es lo que hace la cuenta creíble.
    const ids = (salidas || []).map(d => d.id);
    if (ids.length) {
      const { data: puestos } = await supabase
        .from('cali_seats')
        .select('deposit_paid, balance_due, status')
        .in('departure_id', ids)
        .in('status', ['reserved', 'occupied']);
      setPasajerosMes((puestos || []).length);
      setPagadoMes((puestos || []).reduce((a, p) => a + Number(p.deposit_paid || 0) + Number(p.balance_due || 0), 0));
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
      cargar(data.user.id);
    });
  }, [cargar]);

  const comisionPorPasajero = Math.round(tarifa * pctComision / 100);
  const equilibrio = comisionPorPasajero > 0 ? Math.ceil(precio / comisionPorPasajero) : 0;
  const salidasLlenas = Math.ceil(equilibrio / 4);
  const pagariaEsteMes = pasajerosMes * comisionPorPasajero;
  const ahorro = pagariaEsteMes - precio;

  const suscribirse = async () => {
    if (!userId) return;
    setGuardando(true);
    const vence = new Date();
    vence.setMonth(vence.getMonth() + 1);
    const { error } = await supabase.from('driver_subscriptions').insert({
      driver_id: userId, plan: 'cali', precio,
      vence_at: vence.toISOString(),
      estado: 'pendiente_pago',   // no se activa hasta que el pago entre
    });
    setGuardando(false);
    if (error) { alert('No se pudo iniciar: ' + error.message); return; }
    alert('Tu solicitud quedó registrada. El cobro se activa cuando conectemos la pasarela.');
    cargar(userId);
  };

  return (
    <>
      <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '90px' }}>

        <div style={{ padding: '56px 20px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div style={{ font: '800 21px Manrope,sans-serif', letterSpacing: '-.03em' }}>Viajes a Cali</div>
        </div>

        {/* Encabezado */}
        <div style={{ margin: '0 20px', padding: '24px', borderRadius: '22px', background: 'linear-gradient(155deg,#1a1330 0%,#2d1b52 55%,#3d2168 100%)', color: '#fff' }}>
          <div style={{ font: '800 22px/1.3 Manrope,sans-serif', letterSpacing: '-.03em' }}>
            Quédate con el 100% de tus pasajeros 🚐
          </div>
          <div style={{ font: '500 13px/1.6 Manrope,sans-serif', opacity: .8, marginTop: '10px' }}>
            Hoy pagas {pctComision}% de comisión por cada puesto que vendes. Con el plan mensual
            no pagas comisión, y además apareces de primero en la ruta.
          </div>

          {/* La cuenta: el argumento real */}
          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '15px', background: 'rgba(255,255,255,.1)' }}>
            <div style={{ font: '600 10px Manrope,sans-serif', opacity: .65, letterSpacing: '.1em' }}>DESDE CUÁNDO TE CONVIENE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '7px' }}>
              <div style={{ font: '800 40px Manrope,sans-serif', letterSpacing: '-.04em', lineHeight: 1 }}>{equilibrio}</div>
              <div style={{ font: '600 14px Manrope,sans-serif', opacity: .75 }}>pasajeros al mes</div>
            </div>
            <div style={{ font: '500 12px/1.5 Manrope,sans-serif', opacity: .75, marginTop: '8px' }}>
              Son {salidasLlenas} salida{salidasLlenas === 1 ? '' : 's'} llena{salidasLlenas === 1 ? '' : 's'}.
              Del pasajero {equilibrio + 1} en adelante, todo lo que antes era comisión se te queda.
            </div>
          </div>
        </div>

        {/* Comparación con SUS números */}
        {!cargando && pasajerosMes > 0 && (
          <div style={{ margin: '16px 20px 0', padding: '18px', borderRadius: '18px', border: '2px solid ' + (ahorro > 0 ? '#0f8a6d' : '#eaeae8'), background: ahorro > 0 ? '#f0faf7' : '#fff' }}>
            <div style={{ font: '700 11px Manrope,sans-serif', color: '#666', letterSpacing: '.08em', marginBottom: '10px' }}>
              TUS NÚMEROS DE ESTE MES
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ font: '500 11px Manrope,sans-serif', color: '#666' }}>Pasajeros</div>
                <div style={{ font: "800 22px 'IBM Plex Mono',monospace", marginTop: '2px' }}>{pasajerosMes}</div>
              </div>
              <div>
                <div style={{ font: '500 11px Manrope,sans-serif', color: '#666' }}>Comisión que pagarías</div>
                <div style={{ font: "800 22px 'IBM Plex Mono',monospace", marginTop: '2px' }}>{money(pagariaEsteMes)}</div>
              </div>
            </div>
            <div style={{ marginTop: '13px', padding: '11px 13px', borderRadius: '11px', background: '#fff', font: '600 12.5px/1.5 Manrope,sans-serif', color: ahorro > 0 ? '#0f8a6d' : '#666' }}>
              {ahorro > 0
                ? `Con el plan te habrías ahorrado ${money(ahorro)} este mes.`
                : `Este mes te conviene seguir pagando comisión: te faltan ${equilibrio - pasajerosMes} pasajero${equilibrio - pasajerosMes === 1 ? '' : 's'} para que el plan valga la pena.`}
            </div>
          </div>
        )}

        {/* Las dos opciones */}
        <div style={{ margin: '18px 20px 0' }}>
          <div style={{ font: '800 17px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '12px' }}>Tus dos opciones</div>

          <div style={{ padding: '17px', borderRadius: '16px', border: '1px solid #eaeae8', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ font: '700 15px Manrope,sans-serif' }}>Por comisión</div>
              {!sub && <div style={{ background: '#f4f4f3', color: '#666', padding: '3px 10px', borderRadius: '99px', font: '700 10.5px Manrope,sans-serif' }}>Tu plan actual</div>}
            </div>
            <div style={{ font: "800 24px 'IBM Plex Mono',monospace", margin: '7px 0 4px' }}>{pctComision}%</div>
            <div style={{ font: '500 12px/1.5 Manrope,sans-serif', color: '#666' }}>
              {money(comisionPorPasajero)} por pasajero. Sin cuota fija: si no vendes, no pagas.
            </div>
          </div>

          <div style={{ padding: '19px', borderRadius: '16px', border: '2px solid #0f8a6d', background: '#f0faf7' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ font: '800 16px Manrope,sans-serif' }}>Plan Cali</div>
              {sub
                ? <div style={{ background: '#0f8a6d', color: '#fff', padding: '3px 10px', borderRadius: '99px', font: '700 10.5px Manrope,sans-serif' }}>Activo</div>
                : <div style={{ background: '#0f8a6d', color: '#fff', padding: '3px 10px', borderRadius: '99px', font: '700 10.5px Manrope,sans-serif' }}>Sin comisión</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', margin: '7px 0 12px' }}>
              <div style={{ font: '800 28px Manrope,sans-serif', letterSpacing: '-.03em', color: '#0f8a6d' }}>{money(precio)}</div>
              <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>/ mes</div>
            </div>

            {[
              ['Cero comisión por pasajero', `Te quedas con los ${money(comisionPorPasajero)} de cada puesto`],
              ['Prioridad en la ruta', 'Tus salidas aparecen antes que las demás'],
              ['Sin sorpresas', 'Pagas lo mismo vendas 8 puestos o 40'],
            ].map(([t, sdesc], i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '19px', height: '19px', borderRadius: '50%', background: '#0f8a6d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px Manrope,sans-serif', flex: 'none', marginTop: '1px' }}>✓</div>
                <div>
                  <div style={{ font: '700 13px Manrope,sans-serif' }}>{t}</div>
                  <div style={{ font: '500 11.5px/1.4 Manrope,sans-serif', color: '#666', marginTop: '2px' }}>{sdesc}</div>
                </div>
              </div>
            ))}

            {sub ? (
              <div style={{ marginTop: '6px', font: '600 12.5px Manrope,sans-serif', color: '#0f8a6d' }}>
                Renueva el {new Date(sub.vence_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
              </div>
            ) : (
              <button onClick={suscribirse} disabled={guardando}
                style={{ width: '100%', height: '50px', borderRadius: '14px', background: '#0f8a6d', color: '#fff', font: '800 14.5px Manrope,sans-serif', border: 'none', marginTop: '6px' }}>
                {guardando ? 'Un momento…' : 'Activar Plan Cali'}
              </button>
            )}
          </div>
        </div>

        {/* Honestidad sobre cuándo NO conviene */}
        {!sub && (
          <div style={{ margin: '16px 20px 0', padding: '14px 16px', borderRadius: '13px', background: '#f7f7f5', font: '500 12px/1.55 Manrope,sans-serif', color: '#666' }}>
            Si haces menos de {equilibrio} pasajeros al mes, <strong style={{ color: '#111' }}>te sale más barato seguir
            pagando comisión</strong>. Cambia de plan cuando el volumen te lo pida, no antes.
          </div>
        )}

        <div style={{ margin: '14px 20px 0', padding: '13px 15px', borderRadius: '13px', background: '#fff8ea', font: '500 11.5px/1.5 Manrope,sans-serif', color: '#8a6d1e' }}>
          El cobro todavía no está conectado a una pasarela. Al activarlo queda como pendiente de pago
          y no se te cobra nada por ahora.
        </div>
      </div>
      <DriverBottomNav />
    </>
  );
}

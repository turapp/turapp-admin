'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

// ============================================================
// LO QUE LE CUESTA NO ESTAR SUSCRITO
// ============================================================
// El argumento que convence a un taxista no es "prioridad en horas pico": es
// ver cuánta plata dejó en comisión el mes pasado al lado de lo que habría
// pagado suscrito. Ese número es suyo, no un promedio inventado, y por eso
// pega.
//
// Todo sale de sus propios `earnings`, así que un conductor que apenas empieza
// ve un ahorro pequeño y no se le miente. Si el mes le fue flojo y suscribirse
// NO le convenía, el gancho no se muestra: prometerle un ahorro que no existe
// se devuelve en cancelaciones.

export function usarPlanPro() {
  const [datos, setDatos] = useState({
    cargando: true,
    suscrito: false,
    precio: 9990,          // lo que paga hoy
    precioNormal: 19990,   // a lo que sube después
    esPromo: true,
    promoMeses: 3,
    comisionMes: 0,        // lo que dejó en comisión en 30 días
    viajesMes: 0,
    ahorro: 0,             // comisión − precio, si es positivo
    conviene: false,
  });

  const cargar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setDatos(d => ({ ...d, cargando: false })); return; }

    const desde = new Date(Date.now() - 30 * 864e5).toISOString();
    const [{ data: sub }, { data: cfgs }, { data: gan }] = await Promise.all([
      supabase.from('driver_subscriptions').select('estado, vence_at')
        .eq('driver_id', user.id).eq('estado', 'activa')
        .order('vence_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('app_settings').select('key, value')
        .in('key', ['suscripcion_precio', 'suscripcion_precio_promo', 'suscripcion_promo_meses']),
      supabase.from('earnings').select('commission_amount')
        .eq('driver_id', user.id).gte('created_at', desde),
    ]);

    const cfg = Object.fromEntries((cfgs ?? []).map(c => [c.key, Number(c.value)]));
    const precioNormal = Number.isFinite(cfg.suscripcion_precio) ? cfg.suscripcion_precio : 19990;
    const precioPromo  = Number.isFinite(cfg.suscripcion_precio_promo) ? cfg.suscripcion_precio_promo : 9990;
    const promoMeses   = Number.isFinite(cfg.suscripcion_promo_meses) ? cfg.suscripcion_promo_meses : 3;

    // El precio de hoy lo decide la base, para que app, panel y cobro digan lo
    // mismo. Si la función todavía no está aplicada, se asume el de entrada.
    const { data: pr } = await supabase.rpc('precio_suscripcion', { p_driver: user.id });
    const fila = Array.isArray(pr) ? pr[0] : pr;
    const precio   = fila ? Number(fila.precio) : precioPromo;
    const esPromo  = fila ? fila.es_promo === true : true;

    const comisionMes = (gan ?? []).reduce((a, g) => a + Number(g.commission_amount || 0), 0);
    const suscrito = !!sub && new Date(sub.vence_at) > new Date();
    const ahorro = Math.max(0, comisionMes - precio);

    setDatos({
      cargando: false, suscrito, precio, precioNormal, esPromo, promoMeses,
      comisionMes, viajesMes: (gan ?? []).length, ahorro,
      conviene: !suscrito && ahorro > 0,
    });
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { ...datos, recargar: cargar };
}

export const pesos = (n) => `$${Math.round(Number(n) || 0).toLocaleString('es-CO')}`;

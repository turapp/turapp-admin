import { supabase } from './supabaseClient';

// ============================================================
// VIAJES A CALI — LADO DEL CONDUCTOR
// ============================================================
// Esta copia pedía columnas que no existen: `price_block` (la real es
// `current_price`) y `vehicles ( license_plate )` (la real es `plate`).
// PostgREST respondía con error, el catch devolvía [] y el conductor veía
// "No tienes viajes programados" para siempre — tuviera o no salidas.
//
// Los puestos NO se crean desde aquí: los crea un trigger al insertar la
// salida (migración 20260814000003). Antes no los creaba nadie y cada salida
// publicada nacía sin puestos, así que nadie la podía reservar.

export const caliService = {
  async getDriverDepartures(driverId) {
    const { data, error } = await supabase
      .from('cali_departures')
      .select(`
        id,
        departure_time,
        current_price,
        current_block,
        total_seats,
        occupied_seats,
        status,
        vehicles ( plate, make, model ),
        cali_seats ( id, seat_number, status )
      `)
      .eq('driver_id', driverId)
      .order('departure_time', { ascending: true });

    if (error) {
      console.error('Error cargando salidas del conductor:', error.message, error.details, error.hint);
      return [];
    }
    return data ?? [];
  },

  // Publicar una salida. Hasta ahora no había forma de hacerlo desde ninguna
  // pantalla: el conductor podía ver Viajes a Cali pero nunca ofrecer una.
  async publicarSalida({ driverId, vehicleId, salidaISO, precio, puestos }) {
    const { data, error } = await supabase
      .from('cali_departures')
      .insert({
        driver_id: driverId,
        vehicle_id: vehicleId,
        departure_time: salidaISO,
        current_price: precio,
        price_block_1: precio,
        total_seats: puestos,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async cancelarSalida(departureId) {
    const { error } = await supabase
      .from('cali_departures')
      .update({ status: 'cancelled' })
      .eq('id', departureId);
    if (error) throw new Error(error.message);
  },

  async getSeats(departureId) {
    const { data, error } = await supabase
      .from('cali_seats')
      .select('*')
      .eq('departure_id', departureId)
      .order('seat_number', { ascending: true });

    if (error) {
      console.error('Error cargando puestos:', error.message);
      return [];
    }
    return data ?? [];
  },

  // El vehículo con el que puede hacer viajes a Cali.
  async getVehiculoCali(driverId) {
    const { data } = await supabase
      .from('vehicles')
      .select('id, plate, make, model, category')
      .eq('driver_id', driverId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    return (data ?? []).find(v => v.category === 'cali') ?? (data ?? [])[0] ?? null;
  },

  subscribeToSeats(departureId, callback) {
    const subscription = supabase
      .channel(`seats-${departureId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cali_seats', filter: `departure_id=eq.${departureId}` },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  },
};

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DriverBottomNav from '../../../components/DriverBottomNav';

export default function HistoryPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('trips')
        .select('id, dropoff_address, category, fare_actual, fare_estimated, dynamic_multiplier, status, cancellation_reason, completed_at, cancelled_at, created_at')
        .eq('driver_id', user.id)
        .in('status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(30);

      setTrips(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const todayCount = trips.filter(t => {
    const d = new Date(t.completed_at || t.cancelled_at || t.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const completedFares = trips.filter(t => t.status === 'completed').map(t => Number(t.fare_actual || t.fare_estimated || 0));
  const avgFare = completedFares.length > 0 ? Math.round(completedFares.reduce((a, b) => a + b, 0) / completedFares.length) : 0;

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', paddingBottom: '100px', fontFamily: 'Manrope, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '40px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '800 24px Manrope,sans-serif' }}>Historial</div>
      </div>

      {/* Summary */}
      <div style={{ padding: '0 16px 24px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, background: '#f4f4f3', borderRadius: '12px', padding: '16px' }}>
          <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Viajes hoy</div>
          <div style={{ font: '800 20px Manrope,sans-serif', color: '#111' }}>{todayCount}</div>
        </div>
        <div style={{ flex: 1, background: '#f4f4f3', borderRadius: '12px', padding: '16px' }}>
          <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Tarifa promedio</div>
          <div style={{ font: '800 20px Manrope,sans-serif', color: '#111' }}>{avgFare > 0 ? `$${(avgFare / 1000).toFixed(1)}K` : '—'}</div>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#666', font: '600 14px Manrope,sans-serif' }}>Cargando...</div>
      ) : trips.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#666', font: '600 14px Manrope,sans-serif' }}>Todavía no tienes viajes en tu historial.</div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {trips.map((t, idx) => {
            const when = new Date(t.completed_at || t.cancelled_at || t.created_at);
            const time = when.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
            const [timePart, ampm] = time.split(' ');
            const noShow = t.status === 'cancelled';
            const price = Number(t.fare_actual || t.fare_estimated || 0);
            const isDynamic = Number(t.dynamic_multiplier) > 1;

            return (
              <div key={t.id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: idx === trips.length - 1 ? 'none' : '1px solid #eaeae8' }}>

                <div style={{ width: '40px', textAlign: 'center', paddingTop: '2px' }}>
                  <div style={{ font: '800 14px Manrope,sans-serif', color: '#111' }}>{timePart}</div>
                  <div style={{ font: '600 10px Manrope,sans-serif', color: '#aaa', marginTop: '2px' }}>{ampm}</div>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ font: '800 15px Manrope,sans-serif', color: '#111', marginBottom: '2px' }}>{t.dropoff_address}</div>
                    <div style={{ font: '500 12px Manrope,sans-serif', color: '#666', marginBottom: '6px' }}>{t.category === 'taxi' ? 'Taxi' : 'Particular'}</div>

                    {noShow ? (
                      <div style={{ display: 'inline-flex', background: '#faf0dd', color: '#c98a1e', padding: '2px 6px', borderRadius: '4px', font: '800 9px Manrope,sans-serif', letterSpacing: '0.05em' }}>
                        CANCELADO
                      </div>
                    ) : isDynamic && (
                      <div style={{ display: 'inline-flex', background: '#e7f3ef', color: '#0f8a6d', padding: '2px 6px', borderRadius: '4px', font: '800 9px Manrope,sans-serif', letterSpacing: '0.05em' }}>
                        DINÁMICA ×{Number(t.dynamic_multiplier).toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ font: '800 15px Manrope,sans-serif', color: noShow ? '#c98a1e' : '#111', marginBottom: '2px' }}>
                      {noShow ? '$0' : `$${price.toLocaleString('es-CO')}`}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <DriverBottomNav />
    </div>
  );
}

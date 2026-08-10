'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DriverBottomNav from '../../../components/DriverBottomNav';

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function EarningsPage() {
  const [tab, setTab] = useState('Semana');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]); // últimos 30 días de earnings, filtramos en el cliente por tab
  const [tripCommissionRate, setTripCommissionRate] = useState(22);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const since = new Date();
      since.setDate(since.getDate() - 30);
      since.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('earnings')
        .select('fare, dynamic_bonus, tip, commission_rate, commission_amount, net_earning, created_at')
        .eq('driver_id', user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      setRows(data || []);
      if (data && data.length > 0) setTripCommissionRate(Number(data[0].commission_rate));
      setLoading(false);
    }
    load();
  }, []);

  const rangeStart = useMemo(() => {
    const d = new Date();
    if (tab === 'Día') { d.setHours(0, 0, 0, 0); }
    else if (tab === 'Semana') { d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); }
    else { d.setDate(d.getDate() - 29); d.setHours(0, 0, 0, 0); }
    return d;
  }, [tab]);

  const filtered = useMemo(() => rows.filter(r => new Date(r.created_at) >= rangeStart), [rows, rangeStart]);

  const totals = useMemo(() => filtered.reduce((acc, r) => ({
    fare: acc.fare + Number(r.fare || 0),
    tip: acc.tip + Number(r.tip || 0),
    dynamic_bonus: acc.dynamic_bonus + Number(r.dynamic_bonus || 0),
    commission_amount: acc.commission_amount + Number(r.commission_amount || 0),
    net_earning: acc.net_earning + Number(r.net_earning || 0),
    count: acc.count + 1,
  }), { fare: 0, tip: 0, dynamic_bonus: 0, commission_amount: 0, net_earning: 0, count: 0 }), [filtered]);

  // Barras de los últimos 7 días, siempre (contexto visual fijo aparte del tab elegido)
  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day); next.setDate(next.getDate() + 1);
      const dayTotal = rows
        .filter(r => { const t = new Date(r.created_at); return t >= day && t < next; })
        .reduce((s, r) => s + Number(r.net_earning || 0), 0);
      days.push({ label: DAY_LABELS[day.getDay()], val: dayTotal, isToday: i === 0 });
    }
    return days;
  }, [rows]);
  const maxDay = Math.max(1, ...last7.map(d => d.val));

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', paddingBottom: '100px', fontFamily: 'Manrope, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '40px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '800 24px Manrope,sans-serif' }}>Ganancias</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{ display: 'flex', background: '#f4f4f3', borderRadius: '12px', padding: '4px' }}>
          {['Día', 'Semana', 'Mes'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '8px',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#111' : '#666',
                font: '700 14px Manrope,sans-serif',
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Total */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ font: '600 13px Manrope,sans-serif', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total • {tab.toLowerCase()}</div>
        <div style={{ font: '800 40px Manrope,sans-serif', color: '#111', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          {loading ? '···' : `$${totals.net_earning.toLocaleString('es-CO')}`}
        </div>
        <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>{totals.count} {totals.count === 1 ? 'viaje' : 'viajes'}</div>
      </div>

      {/* Bar Chart — últimos 7 días, siempre visible como contexto */}
      <div style={{ padding: '0 16px 32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', gap: '8px' }}>
        {last7.map((day, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ font: '600 10px Manrope,sans-serif', color: '#aaa', visibility: day.val > 0 ? 'visible' : 'hidden' }}>
              ${Math.round(day.val / 1000)}K
            </div>
            <div style={{
              width: '100%',
              height: `${Math.max(4, (day.val / maxDay) * 120)}px`,
              background: day.isToday ? '#0f8a6d' : '#eaeae8',
              borderRadius: '6px',
              minHeight: '4px'
            }}></div>
            <div style={{ font: '700 12px Manrope,sans-serif', color: day.isToday ? '#111' : '#aaa' }}>{day.label}</div>
          </div>
        ))}
      </div>

      {/* Breakdown List */}
      {loading ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#666', font: '600 14px Manrope,sans-serif' }}>Cargando...</div>
      ) : totals.count === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#666', font: '600 14px Manrope,sans-serif' }}>No tienes viajes completados en este período.</div>
      ) : (
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eaeae8' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', background: '#f4f4f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              </div>
              <div>
                <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Tarifas de viajes</div>
                <div style={{ font: '500 12px Manrope,sans-serif', color: '#666' }}>{totals.count} viajes</div>
              </div>
            </div>
            <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>${totals.fare.toLocaleString('es-CO')}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eaeae8' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', background: '#f4f4f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px' }}>✨</span>
              </div>
              <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Propinas</div>
            </div>
            <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>${totals.tip.toLocaleString('es-CO')}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eaeae8' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', background: '#f4f4f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px', color: '#0f8a6d' }}>⚡</span>
              </div>
              <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Dinámica y bonos</div>
            </div>
            <div style={{ font: '800 15px Manrope,sans-serif', color: '#0f8a6d' }}>${totals.dynamic_bonus.toLocaleString('es-CO')}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', background: '#fbeceb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px' }}>📉</span>
              </div>
              <div>
                <div style={{ font: '700 15px Manrope,sans-serif', color: '#111' }}>Comisión Turapp</div>
                <div style={{ font: '500 12px Manrope,sans-serif', color: '#666' }}>{tripCommissionRate}%</div>
              </div>
            </div>
            <div style={{ font: '800 15px Manrope,sans-serif', color: '#c8402f' }}>-${totals.commission_amount.toLocaleString('es-CO')}</div>
          </div>

        </div>
      )}

      <DriverBottomNav />
    </div>
  );
}

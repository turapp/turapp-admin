'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [planType, setPlanType] = useState('free');
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [heldMoney, setHeldMoney] = useState(0);
  const [movements, setMovements] = useState([]);
  const [last7, setLast7] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: driverProfile }, { data: plan }, { data: earnings }, { data: heldSeats }] = await Promise.all([
        supabase.from('driver_profiles').select('total_earnings').eq('id', user.id).single(),
        supabase.from('driver_plans').select('plan_type').eq('driver_id', user.id).single(),
        supabase.from('earnings').select('net_earning, created_at').eq('driver_id', user.id).order('created_at', { ascending: false }).limit(60),
        supabase.from('cali_seats').select('deposit_paid, cali_departures!inner(driver_id)').eq('cali_departures.driver_id', user.id).eq('status', 'reserved'),
      ]);

      setBalance(Number(driverProfile?.total_earnings || 0));
      setPlanType(plan?.plan_type || 'free');
      setHeldMoney((heldSeats || []).reduce((s, r) => s + Number(r.deposit_paid || 0), 0));
      setMovements((earnings || []).slice(0, 8));

      const now = new Date();
      const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      let todaySum = 0, monthSum = 0, monthCount = 0;
      (earnings || []).forEach(e => {
        const d = new Date(e.created_at);
        if (d >= startOfDay) todaySum += Number(e.net_earning);
        if (d >= startOfMonth) { monthSum += Number(e.net_earning); monthCount++; }
      });
      setTodayTotal(todaySum);
      setMonthTotal(monthSum);
      setTripCount(monthCount);

      const days = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(); day.setDate(day.getDate() - i); day.setHours(0, 0, 0, 0);
        const next = new Date(day); next.setDate(next.getDate() + 1);
        const dayTotal = (earnings || []).filter(e => { const t = new Date(e.created_at); return t >= day && t < next; }).reduce((s, e) => s + Number(e.net_earning), 0);
        days.push({ label: ['D','L','M','M','J','V','S'][day.getDay()], val: dayTotal, isToday: i === 0 });
      }
      setLast7(days);
      setLoading(false);
    }
    load();
  }, []);

  const maxDay = Math.max(1, ...last7.map(d => d.val));

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: '800 28px Manrope,sans-serif', letterSpacing: '-0.02em' }}>Billetera</div>
        <button onClick={() => router.push('/driver/plan')} style={{ display: 'inline-flex', background: '#f4f4f3', color: '#111', font: '800 12px Manrope,sans-serif', padding: '8px 12px', borderRadius: '12px', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {planType === 'premium' ? 'Plan Premium' : 'Plan Gratuito'}
        </button>
      </div>

      <div style={{ padding: '0 24px' }}>

        {/* MAIN BALANCE CARD */}
        <div style={{ background: '#0a0a0a', borderRadius: '32px', padding: '32px 24px', color: '#fff', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ font: '700 11px Manrope,sans-serif', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>Disponible para retirar</div>
            <div style={{ font: '800 48px Manrope,sans-serif', letterSpacing: '-0.03em', marginBottom: '32px' }}>
              {loading ? '···' : `$${balance.toLocaleString('es-CO')}`}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => alert('Los retiros a Nequi/Daviplata todavía no están conectados — próximamente.')} style={{ background: '#fff', color: '#111', font: '800 15px Manrope,sans-serif', padding: '16px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>Retirar</button>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', padding: '0 8px' }}>
          <div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Hoy</div>
            <div style={{ font: '800 18px Manrope,sans-serif' }}>${(todayTotal / 1000).toFixed(0)}K</div>
          </div>
          <div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Este mes</div>
            <div style={{ font: '800 18px Manrope,sans-serif' }}>${(monthTotal / 1000000).toFixed(2)}M</div>
          </div>
          <div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Viajes</div>
            <div style={{ font: '800 18px Manrope,sans-serif' }}>{tripCount}</div>
          </div>
        </div>

        {/* BAR CHART */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #eaeae8', padding: '24px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ font: '800 16px Manrope,sans-serif' }}>Últimos 7 días</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px' }}>
            {last7.map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '10%' }}>
                <div style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${Math.max(4, (b.val / maxDay) * 120)}px`, background: b.isToday ? '#0f8a6d' : '#f0f0f0', borderRadius: '4px' }}></div>
                </div>
                <div style={{ font: '700 10px Manrope,sans-serif', color: '#888' }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HELD MONEY (Dinero Retenido — abonos de Cali sin viajar todavía) */}
        {heldMoney > 0 && (
          <div style={{ background: '#FFF4E0', borderRadius: '24px', padding: '20px 24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ font: '800 14px Manrope,sans-serif', color: '#c98a1e', marginBottom: '4px' }}>Dinero retenido</div>
              <div style={{ font: '600 11px/1.4 Manrope,sans-serif', color: '#c98a1e', maxWidth: '180px' }}>
                Abonos de salidas a Cali que aún no han ocurrido.
              </div>
            </div>
            <div style={{ font: '800 24px Manrope,sans-serif', color: '#c98a1e' }}>${heldMoney.toLocaleString('es-CO')}</div>
          </div>
        )}

        {/* RECENT TRANSACTIONS */}
        <div style={{ font: '800 18px Manrope,sans-serif', marginBottom: '16px' }}>Movimientos</div>

        {loading ? (
          <div style={{ color: '#666', font: '600 14px Manrope,sans-serif' }}>Cargando...</div>
        ) : movements.length === 0 ? (
          <div style={{ color: '#666', font: '600 14px Manrope,sans-serif' }}>Todavía no tienes movimientos.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {movements.map((m, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e7f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f8a6d" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '800 15px Manrope,sans-serif' }}>Viaje liquidado</div>
                    <div style={{ font: '600 12px Manrope,sans-serif', color: '#888' }}>
                      {new Date(m.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {new Date(m.created_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ font: '800 16px Manrope,sans-serif', color: '#0f8a6d' }}>+${Number(m.net_earning).toLocaleString('es-CO')}</div>
                </div>
                {i < movements.length - 1 && <div style={{ height: '1px', background: '#eaeae8', margin: '0 8px' }}></div>}
              </React.Fragment>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { caliService } from '../../../../lib/caliService';

function ActiveIntermunicipalTripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const departureId = searchParams.get('id');

  const [seatStatus, setSeatStatus] = useState({ 
    1: 'available', 
    2: 'available', 
    3: 'available', 
    4: 'available' 
  });
  
  // Real passenger data will be fetched if joined
  const [passengerData, setPassengerData] = useState({});
  const [seatFinance, setSeatFinance] = useState({}); // seat_number -> {deposit_paid, balance_due}
  const [departureInfo, setDepartureInfo] = useState(null); // {departure_time, vehicles:{plate}}
  const [commissionRate, setCommissionRate] = useState(15);

  const [countdown, setCountdown] = useState(30 * 60 + 12);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPassenger, setScannedPassenger] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Sync with Supabase
  useEffect(() => {
    if (!departureId) return;

    const loadData = async () => {
      const dbSeats = await caliService.getSeats(departureId);
      const newStatus = {};
      const newPassengerData = {};
      const newFinance = {};
      dbSeats.forEach(s => {
        newStatus[s.seat_number] = s.status;
        newFinance[s.seat_number] = { deposit_paid: Number(s.deposit_paid || 0), balance_due: Number(s.balance_due || 0) };
        if (s.rider_id) {
          // Si tuviéramos perfiles, los cargaríamos aquí. Por ahora mock.
          newPassengerData[s.seat_number] = {
            name: 'Pasajero ' + s.rider_id.substring(0,4),
            photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
            status: s.status === 'occupied' ? 'Abordado' : 'Reservado',
            ticket: 'TC-' + s.id.substring(0,5).toUpperCase(),
            deposit_paid: Number(s.deposit_paid || 0),
            balance_due: Number(s.balance_due || 0),
          };
        }
      });
      setSeatStatus(prev => ({...prev, ...newStatus}));
      setPassengerData(newPassengerData);
      setSeatFinance(newFinance);
    };

    loadData();

    const unsub = caliService.subscribeToSeats(departureId, (newSeat) => {
      setSeatStatus(prev => ({ ...prev, [newSeat.seat_number]: newSeat.status }));
    });

    supabase.from('cali_departures').select('departure_time, vehicles(plate)').eq('id', departureId).single()
      .then(({ data }) => setDepartureInfo(data));

    return () => unsub();
  }, [departureId]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      const { data: plan } = await supabase.from('driver_plans').select('plan_type, commission_rate').eq('driver_id', data.user.id).single();
      if (plan) setCommissionRate(plan.plan_type === 'premium' ? 0 : Number(plan.commission_rate ?? 15));
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeatClick = (seatId) => {
    const status = seatStatus[seatId];
    if (status === 'reserved' || status === 'occupied') {
      setSelectedSeat(seatId);
    }
  };

  const simulateScan = async (seatId) => {
    setSelectedSeat(null);
    setIsScanning(true);
    setTimeout(async () => {
      setIsScanning(false);
      setScannedPassenger(true);
      
      // Update in Supabase
      if (departureId) {
        // Find seat id
        const dbSeats = await caliService.getSeats(departureId);
        const seatToUpdate = dbSeats.find(s => s.seat_number === seatId);
        if (seatToUpdate) {
          await supabase.from('cali_seats').update({ status: 'occupied' }).eq('id', seatToUpdate.id);
        }
      }
    }, 2000);
  };

  // Calculate pricing based on status — usa el deposit_paid/balance_due real
  // de cada puesto (lo que el pasajero realmente pagó/debe), no un precio
  // fijo por puesto que ignoraba el bloque de precio real de la salida.
  const bookedCount = Object.values(seatStatus).filter(v => v === 'reserved' || v === 'occupied').length;
  const boardedCount = Object.values(seatStatus).filter(v => v === 'occupied').length;

  const financeValues = Object.values(seatFinance);
  const totalReserved = financeValues.reduce((s, f) => s + (f.deposit_paid || 0), 0);
  const totalPending = Object.entries(seatStatus)
    .filter(([num, v]) => v === 'reserved')
    .reduce((s, [num]) => s + (seatFinance[num]?.balance_due || 0), 0);
  const totalPaidToDriver = Object.entries(seatStatus)
    .filter(([num, v]) => v === 'occupied')
    .reduce((s, [num]) => s + (seatFinance[num]?.balance_due || 0), 0);

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <div style={{ padding: '60px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fff' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => router.back()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <div style={{ font: '800 18px Manrope,sans-serif', letterSpacing: '-0.02em', color: '#111' }}>Tu próximo viaje</div>
            <div style={{ font: '500 13px Manrope,sans-serif', color: '#666' }}>Buenaventura → Cali · {departureInfo?.vehicles?.plate || '···'}</div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', background: '#e7f3ef', color: '#0f8a6d', font: '800 10px Manrope,sans-serif', padding: '6px 10px', borderRadius: '8px', letterSpacing: '0.05em', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', background: '#0f8a6d', borderRadius: '50%' }}></div> EN VIVO
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        {/* BLACK COUNTDOWN PILL */}
        <div style={{ background: '#000', borderRadius: '24px', padding: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }}>
          <div>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', letterSpacing: '0.05em', marginBottom: '4px' }}>SALE EN</div>
            <div style={{ font: '800 36px/1 Manrope,sans-serif', letterSpacing: '-0.02em' }}>{formatTime(countdown)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: '700 10px Manrope,sans-serif', color: '#888', letterSpacing: '0.05em', marginBottom: '4px' }}>SALIDA</div>
            <div style={{ font: '800 20px/1 Manrope,sans-serif' }}>
              {departureInfo?.departure_time ? new Date(departureInfo.departure_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }) : '···'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <div style={{ font: '800 18px Manrope,sans-serif', position: 'relative' }}>
            Quedan {4 - bookedCount} cupos
            <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '40px', height: '4px', background: '#0f8a6d', borderRadius: '2px' }}></div>
          </div>
          <div style={{ font: '800 24px Manrope,sans-serif', color: '#0f8a6d' }}>{bookedCount}/4 <span style={{ font: '600 11px Manrope,sans-serif', color: '#888' }}>CUPOS</span></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', marginTop: '40px' }}>
          {/* Top-down Car visualization */}
          <div style={{ width: '260px', height: '480px', position: 'relative' }}>
            
            {/* Wheels */}
            <div style={{ position: 'absolute', top: '70px', left: '-6px', width: '20px', height: '45px', background: '#333', borderRadius: '8px' }}></div>
            <div style={{ position: 'absolute', top: '70px', right: '-6px', width: '20px', height: '45px', background: '#333', borderRadius: '8px' }}></div>
            <div style={{ position: 'absolute', bottom: '70px', left: '-6px', width: '20px', height: '45px', background: '#333', borderRadius: '8px' }}></div>
            <div style={{ position: 'absolute', bottom: '70px', right: '-6px', width: '20px', height: '45px', background: '#333', borderRadius: '8px' }}></div>

            {/* Mirrors */}
            <div style={{ position: 'absolute', top: '150px', left: '-12px', width: '16px', height: '24px', background: '#e0e0e0', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}></div>
            <div style={{ position: 'absolute', top: '150px', right: '-12px', width: '16px', height: '24px', background: '#e0e0e0', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}></div>

            {/* Car Body */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #f8f8f8 0%, #ebebeb 100%)', borderRadius: '100px 100px 80px 80px', boxShadow: '0 20px 40px rgba(0,0,0,0.08), inset 0 2px 10px rgba(255,255,255,1)', overflow: 'hidden' }}>
              
              {/* Windshield */}
              <div style={{ position: 'absolute', top: '40px', left: '20px', right: '20px', height: '60px', background: 'linear-gradient(180deg, #d4d4d4 0%, #e0e0e0 100%)', borderRadius: '40px 40px 10px 10px', opacity: 0.5 }}></div>
              
              {/* Back Window */}
              <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', height: '30px', background: 'linear-gradient(180deg, #e0e0e0 0%, #d4d4d4 100%)', borderRadius: '10px 10px 40px 40px', opacity: 0.5 }}></div>

              {/* Inner Cabin */}
              <div style={{ position: 'absolute', top: '120px', bottom: '80px', left: '16px', right: '16px', background: '#f4f4f3', borderRadius: '40px', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.04)' }}>
                
                {/* Driver Seat */}
                <div style={{ position: 'absolute', top: '24px', left: '16px', width: '80px', height: '80px', background: '#eaeae8', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 11px Manrope,sans-serif', color: '#aaa', opacity: 0.7 }}>CONDUCTOR</div>
                
                {/* Passenger Seats */}
                {[
                  { id: 1, top: '24px', left: 'auto', right: '16px' },
                  { id: 2, top: '160px', left: '16px', right: 'auto' },
                  { id: 3, top: '160px', left: '84px', right: 'auto' },
                  { id: 4, top: '160px', left: '152px', right: 'auto' },
                ].map(s => {
                  const status = seatStatus[s.id];
                  let bg = '#fff';
                  let borderColor = '#e0e0e0';
                  let content = s.id;
                  let color = '#ccc';
                  let isClickable = false;
                  
                  if(status === 'reserved') {
                    bg = '#FFEBEB';
                    borderColor = '#FF4D4D';
                    color = '#FF4D4D';
                    isClickable = true;
                    content = s.id;
                  } else if(status === 'occupied') {
                    bg = '#e7f3ef'; 
                    borderColor = '#0f8a6d'; 
                    color = '#0f8a6d';
                    isClickable = true;
                    content = s.id;
                  }

                  return (
                    <div 
                      key={s.id} 
                      onClick={() => handleSeatClick(s.id)}
                      style={{ 
                        position: 'absolute', 
                        top: s.top, 
                        left: s.left, 
                        right: s.right, 
                        width: s.id === 1 ? '80px' : '60px', 
                        height: '80px', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        font: '800 24px Manrope,sans-serif', 
                        border: `2px solid ${borderColor}`, 
                        background: bg, 
                        color: color, 
                        transition: 'all 0.3s ease',
                        cursor: isClickable ? 'pointer' : 'default',
                        boxShadow: isClickable ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                      }}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div style={{ background: '#f8f8f8', borderRadius: '24px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ font: '800 18px Manrope,sans-serif', color: '#111', marginBottom: '16px' }}>Balance del viaje</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ font: '600 14px Manrope,sans-serif', color: '#666' }}>Pasajeros ({boardedCount} abordados, {bookedCount} reservados)</div>
            <div style={{ font: '800 14px Manrope,sans-serif', color: '#111' }}>${(totalReserved + totalPending).toLocaleString('es-CO')}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ font: '600 14px Manrope,sans-serif', color: '#666' }}>Comisión Turapp ({commissionRate}%)</div>
            <div style={{ font: '800 14px Manrope,sans-serif', color: '#FF4D4D' }}>-${Math.round((totalReserved + totalPending) * commissionRate / 100).toLocaleString('es-CO')}</div>
          </div>

          <div style={{ height: '1px', background: '#e0e0e0', marginBottom: '16px' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ font: '800 16px Manrope,sans-serif', color: '#111' }}>Tu ganancia neta</div>
            <div style={{ font: '800 18px Manrope,sans-serif', color: '#0f8a6d' }}>${Math.round((totalReserved + totalPending) * (1 - commissionRate / 100)).toLocaleString('es-CO')}</div>
          </div>
        </div>

        {commissionRate > 0 && (
          <button onClick={() => router.push('/driver/plan')} style={{ width: '100%', textAlign: 'left', background: 'linear-gradient(135deg, #fff9e6 0%, #ffe082 100%)', borderRadius: '20px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 8px 16px rgba(255,193,7,0.15)', border: 'none', cursor: 'pointer' }}>
            <div style={{ background: '#fff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b27b00', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div>
              <div style={{ font: '800 15px Manrope,sans-serif', color: '#996a00', marginBottom: '4px' }}>Turapp Premium ($60k/mes)</div>
              <div style={{ font: '600 13px/1.4 Manrope,sans-serif', color: '#b27b00' }}>Cámbiate al plan mensual y no pagues el {commissionRate}% de comisión por cada viaje.</div>
            </div>
          </button>
        )}

      </div>

      {/* PASSENGER PREVIEW MODAL / FLOATING CARD */}
      {selectedSeat && passengerData[selectedSeat] && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'fadeIn 0.2s ease' }}>
          
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedSeat(null)}></div>
          
          <div style={{ position: 'relative', background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '340px', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            
            {/* Top part of ticket */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <img src={passengerData[selectedSeat].photo} alt="Passenger" style={{ width: '64px', height: '64px', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                <button onClick={() => setSelectedSeat(null)} style={{ background: '#f5f5f5', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div>
                <div style={{ font: '800 22px Manrope,sans-serif', color: '#111', marginBottom: '6px', letterSpacing: '-0.02em' }}>{passengerData[selectedSeat].name}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ font: '700 12px Manrope,sans-serif', background: seatStatus[selectedSeat] === 'occupied' ? '#e7f3ef' : '#FFEBEB', color: seatStatus[selectedSeat] === 'occupied' ? '#0f8a6d' : '#FF4D4D', padding: '4px 10px', borderRadius: '8px' }}>
                    {seatStatus[selectedSeat] === 'occupied' ? 'Abordado' : 'Reservado'}
                  </div>
                  <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>Asiento {selectedSeat}</div>
                </div>
              </div>
            </div>

            {/* Ticket Perforation */}
            <div style={{ position: 'relative', height: '2px', margin: '0 12px', background: 'repeating-linear-gradient(to right, transparent, transparent 6px, #e0e0e0 6px, #e0e0e0 12px)' }}>
              <div style={{ position: 'absolute', left: '-20px', top: '-11px', width: '24px', height: '24px', borderRadius: '50%', background: '#666' /* approximating overlay */ }}></div>
              <div style={{ position: 'absolute', right: '-20px', top: '-11px', width: '24px', height: '24px', borderRadius: '50%', background: '#666' }}></div>
            </div>

            {/* Bottom part of ticket */}
            <div style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ font: '700 11px Manrope,sans-serif', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>CÓDIGO DE RESERVA</div>
                <div style={{ font: '800 24px monospace', color: '#111', letterSpacing: '4px' }}>{passengerData[selectedSeat].ticket}</div>
              </div>

              <div style={{ background: '#f8f8f8', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ font: '600 14px Manrope,sans-serif', color: '#666' }}>Pago de pasajero</div>
                  <div style={{ font: '800 14px Manrope,sans-serif', color: '#111' }}>${(passengerData[selectedSeat].balance_due || 0).toLocaleString('es-CO')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ font: '600 14px Manrope,sans-serif', color: '#666' }}>Comisión Turapp ({commissionRate}%)</div>
                  <div style={{ font: '800 14px Manrope,sans-serif', color: '#FF4D4D' }}>-${Math.round((passengerData[selectedSeat].balance_due || 0) * commissionRate / 100).toLocaleString('es-CO')}</div>
                </div>
                <div style={{ height: '1px', background: '#e0e0e0', margin: '0 0 12px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ font: '800 14px Manrope,sans-serif', color: '#111' }}>Tu ganancia neta</div>
                  <div style={{ font: '800 14px Manrope,sans-serif', color: '#0f8a6d' }}>
                    ${Math.round((passengerData[selectedSeat].balance_due || 0) * (1 - commissionRate / 100)).toLocaleString('es-CO')}
                  </div>
                </div>
              </div>

              {seatStatus[selectedSeat] !== 'occupied' && (
                <button onClick={() => simulateScan(selectedSeat)} style={{ width: '100%', height: '52px', borderRadius: '16px', background: '#000', color: '#fff', font: '800 15px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
                  Escanear abordaje
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* FAKE SCANNER OVERLAY */}
      {isScanning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ font: '800 24px Manrope,sans-serif', color: '#fff', marginBottom: '32px' }}>Escanea el código</div>
          <div style={{ width: '250px', height: '250px', border: '4px solid rgba(255,255,255,0.2)', position: 'relative' }}>
             {/* Scanner Corners */}
             <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '40px', height: '40px', borderTop: '4px solid #0f8a6d', borderLeft: '4px solid #0f8a6d' }}></div>
             <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '40px', height: '40px', borderTop: '4px solid #0f8a6d', borderRight: '4px solid #0f8a6d' }}></div>
             <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '40px', height: '40px', borderBottom: '4px solid #0f8a6d', borderLeft: '4px solid #0f8a6d' }}></div>
             <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '40px', height: '40px', borderBottom: '4px solid #0f8a6d', borderRight: '4px solid #0f8a6d' }}></div>
             {/* Laser */}
             <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#0f8a6d', boxShadow: '0 0 10px #0f8a6d', animation: 'scan 1.5s linear infinite' }}></div>
          </div>
          <style>{`
            @keyframes scan {
              0% { top: 0; }
              50% { top: 100%; }
              100% { top: 0; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          <div style={{ font: '600 14px Manrope,sans-serif', color: '#aaa', marginTop: '32px' }}>Apuntando al QR del pasajero...</div>
        </div>
      )}

      {scannedPassenger && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px', pointerEvents: 'none' }}>
          <div style={{ background: '#0f8a6d', borderRadius: '24px', padding: '16px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 12px 32px rgba(15,138,109,0.3)', animation: 'slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', pointerEvents: 'auto' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', color: '#0f8a6d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: '800 16px Manrope,sans-serif', marginBottom: '2px' }}>¡Pasajero validado!</div>
              <div style={{ font: '600 13px Manrope,sans-serif', opacity: 0.9 }}>$38.500 registrados</div>
            </div>
            <button onClick={() => setScannedPassenger(false)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', font: '700 14px Manrope,sans-serif', padding: '8px 16px', borderRadius: '99px', border: 'none', cursor: 'pointer' }}>
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ActiveIntermunicipalTrip() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Cargando viaje...</div>}>
      <ActiveIntermunicipalTripContent />
    </Suspense>
  );
}

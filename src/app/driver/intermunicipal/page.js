'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { caliService } from '../../../lib/caliService';

export default function IntermunicipalPage() {
  const router = useRouter();
  const [direction, setDirection] = useState('toCali');

  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepartures() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const trips = await caliService.getDriverDepartures(user.id);
      setDepartures(trips);
      setLoading(false);
    }
    loadDepartures();
  }, []);

  const currentTrips = departures; // Currently not filtering by direction for simplicity

  return (
    <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#f4f4f3', color: '#111', paddingBottom: '40px', fontFamily: 'Manrope, sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: '#fff', padding: '60px 24px 24px', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', position: 'relative', zIndex: 10 }}>
        
        <button onClick={() => router.back()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ font: '800 28px Manrope,sans-serif', color: '#111', letterSpacing: '-0.02em', marginBottom: '8px' }}>Viajes a Cali</div>
            <div style={{ font: '600 15px Manrope,sans-serif', color: '#666' }}>Tus reservas intermunicipales</div>
          </div>
          <div style={{ width: '80px', height: '80px', marginTop: '-20px' }}>
            <img src="/images/3d_clock_car.png" alt="Intermunicipal" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 12px rgba(0,0,0,0.1))' }} />
          </div>
        </div>

        {/* Direction Switcher */}
        <div style={{ display: 'flex', background: '#f4f4f3', borderRadius: '12px', padding: '4px', marginTop: '32px' }}>
          <button 
            onClick={() => setDirection('toCali')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: '8px', 
              background: direction === 'toCali' ? '#fff' : 'transparent',
              color: direction === 'toCali' ? '#111' : '#666',
              font: '700 14px Manrope,sans-serif',
              boxShadow: direction === 'toCali' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Hacia Cali
          </button>
          <button 
            onClick={() => setDirection('toBua')}
            style={{
              flex: 1, padding: '12px 0', borderRadius: '8px', 
              background: direction === 'toBua' ? '#fff' : 'transparent',
              color: direction === 'toBua' ? '#111' : '#666',
              font: '700 14px Manrope,sans-serif',
              boxShadow: direction === 'toBua' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Hacia B/ventura
          </button>
        </div>
      </div>

      {/* Trips List */}
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ font: '800 18px Manrope,sans-serif', color: '#111', marginBottom: '8px' }}>Oportunidades disponibles</div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666', font: '600 14px Manrope' }}>Cargando reservas...</div>
        ) : currentTrips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <div style={{ font: '600 14px Manrope' }}>No tienes viajes programados.</div>
          </div>
        ) : currentTrips.map((trip) => {
          const timeObj = new Date(trip.departure_time);
          let hours = timeObj.getHours();
          const ampm = hours >= 12 ? 'P. M.' : 'A. M.';
          hours = hours % 12;
          hours = hours ? hours : 12; 
          const minutes = timeObj.getMinutes().toString().padStart(2, '0');
          const timeStr = `${hours}:${minutes} ${ampm}`;
          
          const totalSeats = trip.cali_seats?.length || 4;
          const availableSeats = trip.cali_seats?.filter(s => s.status === 'available').length || 0;
          const isFull = availableSeats === 0;
          const paxCount = totalSeats - availableSeats;
          const totalEstimated = paxCount * trip.price_block;
          
          return (
            <div key={trip.id} style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e7f3ef', color: '#0f8a6d', padding: '4px 10px', borderRadius: '8px', font: '800 11px Manrope,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px' }}>📅</span> Programado
                  </div>
                  <div style={{ font: '800 18px Manrope,sans-serif', color: '#111' }}>{timeStr}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ font: '800 20px Manrope,sans-serif', color: '#111' }}>${totalEstimated}</div>
                  <div style={{ font: '600 13px Manrope,sans-serif', color: '#666' }}>Total estimado</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderTop: '1px solid #eaeae8', borderBottom: '1px solid #eaeae8', marginBottom: '24px' }}>
                <div>
                  <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Pasajeros</div>
                  <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>{paxCount} personas</div>
                </div>
                <div style={{ width: '1px', background: '#eaeae8' }}></div>
                <div>
                  <div style={{ font: '600 12px Manrope,sans-serif', color: '#666' }}>Ocupación</div>
                  <div style={{ font: '800 15px Manrope,sans-serif', color: '#111' }}>{paxCount}/{totalSeats}</div>
                </div>
              </div>

              <button onClick={() => router.push(`/driver/intermunicipal/active?id=${trip.id}`)} style={{ width: '100%', height: '56px', borderRadius: '16px', background: isFull ? '#f4f4f3' : '#111', color: isFull ? '#aaa' : '#fff', font: '800 16px Manrope,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isFull ? 'Viaje completo' : 'Aceptar viaje'}
              </button>
            </div>
          );
        })}

      </div>

    </div>
  );
}

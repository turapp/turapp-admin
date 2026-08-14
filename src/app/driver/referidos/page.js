'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import DriverBottomNav from '../../../components/DriverBottomNav';

// ============================================================
// REFERIDOS — CONDUCTOR
// ============================================================
// El conductor invita conductores, no pasajeros: su nicho es otro y lo que
// le mueve también. A un pasajero le sirve un viaje gratis; a un conductor le
// sirve plata y días de suscripción.
//
// Por eso el premio aquí es distinto: comisión recurrente sobre lo que Turapp
// gane de cada conductor que traiga. Entre más maneje su invitado, más gana él
// — que es exactamente el incentivo que hace crecer la flota.

const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-CO');

const ESTADO = {
  pendiente: ['Pendiente', '#c98a1e', 'rgba(201,138,30,.12)'],
  aprobado: ['Aprobado', '#0f8a6d', 'rgba(15,138,109,.12)'],
  pagado: ['Pagado', '#0f8a6d', 'rgba(15,138,109,.12)'],
  rechazado: ['Rechazado', '#c8402f', 'rgba(200,64,47,.12)'],
};

export default function ReferidosConductor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [afiliado, setAfiliado] = useState(null);
  const [referidos, setReferidos] = useState(0);
  const [retiros, setRetiros] = useState([]);
  const [reglas, setReglas] = useState({});
  const [copiado, setCopiado] = useState(false);
  const [monto, setMonto] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [metodo, setMetodo] = useState('nequi');
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async (uid) => {
    let { data: af } = await supabase.from('affiliates').select('*').eq('user_id', uid).maybeSingle();
    if (!af) {
      const { data: nuevo } = await supabase.from('affiliates').insert({ user_id: uid }).select().single();
      af = nuevo;
    }
    if (!af) { setCargando(false); return; }

    const [{ count }, { data: ws }, { data: cfg }] = await Promise.all([
      supabase.from('affiliate_referrals').select('id', { count: 'exact', head: true }).eq('affiliate_id', af.id),
      supabase.from('affiliate_withdrawals').select('*').eq('affiliate_id', af.id).order('created_at', { ascending: false }),
      supabase.from('app_settings').select('key, value').eq('grupo', 'afiliados'),
    ]);

    setAfiliado(af);
    setReferidos(count ?? 0);
    setRetiros(ws || []);
    setReglas(Object.fromEntries((cfg || []).map(r => [r.key, r.value])));
    setCargando(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      setUser(data.user);
      cargar(data.user.id);
    });
  }, [cargar]);

  // El link lleva al onboarding de conductor, no al de pasajero: si un
  // conductor comparte su código, quien entra viene a manejar.
  const link = afiliado ? `https://driver.turapp.co/driver/onboarding?ref=${afiliado.codigo}` : '';
  const disponible = afiliado ? Number(afiliado.total_generado || 0) - Number(afiliado.total_retirado || 0) : 0;
  const minimo = Number(reglas.afiliados_retiro_min ?? 10000);

  const copiar = async () => {
    try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch {}
  };

  const compartir = async () => {
    const texto = `Manejá con Turapp en Buenaventura. Registrate con mi código ${afiliado?.codigo}.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Turapp Conductores', text: texto, url: link }); return; } catch {}
    }
    copiar();
  };

  const pedirRetiro = async (e) => {
    e.preventDefault();
    const m = Number(monto);
    if (!m || m < minimo) { alert(`El retiro mínimo es ${money(minimo)}.`); return; }
    if (m > disponible) { alert('No puedes retirar más de tu saldo disponible.'); return; }
    if (!cuenta.trim()) { alert('Escribe el número de la cuenta donde quieres recibir.'); return; }
    setEnviando(true);
    const { error } = await supabase.from('affiliate_withdrawals').insert({
      affiliate_id: afiliado.id, monto: m, metodo, cuenta: cuenta.trim(),
    });
    setEnviando(false);
    if (error) { alert('No se pudo enviar: ' + error.message); return; }
    setMonto(''); setCuenta('');
    cargar(user.id);
  };

  return (
    <>
      <div className="tr-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff', color: '#111', fontFamily: 'Manrope, sans-serif', paddingBottom: '90px' }}>

        <div style={{ padding: '56px 20px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => router.back()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f4f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div style={{ font: '800 21px Manrope,sans-serif', letterSpacing: '-.03em' }}>Trae conductores</div>
        </div>

        <div style={{ margin: '0 20px', padding: '22px', borderRadius: '22px', background: 'linear-gradient(155deg,#0d2b22 0%,#124234 55%,#0f8a6d 100%)', color: '#fff' }}>
          <div style={{ font: '800 19px/1.35 Manrope,sans-serif', letterSpacing: '-.02em' }}>
            Cada conductor que traigas te deja plata 🚕
          </div>
          <div style={{ font: '500 12.5px/1.55 Manrope,sans-serif', opacity: .8, marginTop: '8px' }}>
            Ganas comisión sobre lo que Turapp reciba de cada conductor que entre con tu código.
            Mientras él siga manejando, tú sigues ganando.
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '18px' }}>
            <div>
              <div style={{ font: '600 10px Manrope,sans-serif', opacity: .65, letterSpacing: '.1em' }}>GANANCIAS</div>
              <div style={{ font: '800 30px Manrope,sans-serif', letterSpacing: '-.04em', lineHeight: 1.15 }}>
                {cargando ? '—' : money(afiliado?.total_generado)}
              </div>
            </div>
            <div>
              <div style={{ font: '600 10px Manrope,sans-serif', opacity: .65, letterSpacing: '.1em' }}>CONDUCTORES</div>
              <div style={{ font: '800 30px Manrope,sans-serif', letterSpacing: '-.04em', lineHeight: 1.15 }}>
                {cargando ? '—' : referidos}
              </div>
            </div>
          </div>

          <div style={{ font: '600 10px Manrope,sans-serif', opacity: .65, letterSpacing: '.1em', margin: '18px 0 7px' }}>TU CÓDIGO</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.12)', borderRadius: '11px', padding: '13px 15px', font: "700 16px 'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>
              {cargando ? '…' : afiliado?.codigo}
            </div>
            <button onClick={copiar} disabled={!link}
              style={{ width: '46px', height: '46px', borderRadius: '11px', background: 'rgba(255,255,255,.16)', border: 'none', color: '#fff', flex: 'none', fontSize: '15px' }}>
              {copiado ? '✓' : '⧉'}
            </button>
          </div>

          <button onClick={compartir} disabled={!link}
            style={{ width: '100%', height: '48px', borderRadius: '13px', background: '#fff', color: '#0d2b22', font: '800 14px Manrope,sans-serif', border: 'none', marginTop: '12px' }}>
            Compartir con otro conductor
          </button>
        </div>

        <div style={{ margin: '22px 20px 0' }}>
          <div style={{ font: '800 17px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '12px' }}>Cómo funciona</div>
          {[
            ['Comparte tu código', 'Con otros taxistas que quieran más carreras.'],
            ['Él se registra y lo aprueban', 'Sube sus documentos y Operaciones lo habilita.'],
            ['Ganas por cada viaje que haga', `${reglas.afiliados_comision ?? 10}% de lo que Turapp reciba de él, sin límite de tiempo.`],
          ].map(([t, s], i) => (
            <div key={i} style={{ display: 'flex', gap: '13px', marginBottom: '14px' }}>
              <div style={{ width: '25px', height: '25px', borderRadius: '50%', background: 'rgba(15,138,109,.12)', color: '#0f8a6d', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 12px Manrope,sans-serif', flex: 'none' }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ font: '700 13.5px Manrope,sans-serif' }}>{t}</div>
                <div style={{ font: '500 12px/1.5 Manrope,sans-serif', color: '#666', marginTop: '2px' }}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ margin: '10px 20px 0', padding: '18px', borderRadius: '18px', background: '#f7f7f5' }}>
          <div style={{ font: '800 17px Manrope,sans-serif', letterSpacing: '-.025em' }}>Retirar</div>
          <div style={{ font: '500 12px/1.5 Manrope,sans-serif', color: '#666', margin: '4px 0 14px' }}>
            Disponible: <strong style={{ color: '#111' }}>{money(disponible)}</strong> · mínimo {money(minimo)}
          </div>
          <form onSubmit={pedirRetiro}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              {['nequi', 'daviplata', 'bancolombia'].map((m) => (
                <button key={m} type="button" onClick={() => setMetodo(m)}
                  style={{ flex: 1, height: '38px', borderRadius: '11px', border: metodo === m ? '2px solid #111' : '1px solid #eaeae8', background: '#fff', font: '700 11.5px Manrope,sans-serif', textTransform: 'capitalize' }}>
                  {m}
                </button>
              ))}
            </div>
            <input value={cuenta} onChange={(e) => setCuenta(e.target.value)} placeholder="Número de cuenta o celular"
              style={{ width: '100%', height: '46px', borderRadius: '12px', border: '1px solid #eaeae8', background: '#fff', padding: '0 14px', font: '600 13.5px Manrope,sans-serif', marginBottom: '9px' }} />
            <input value={monto} onChange={(e) => setMonto(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric"
              placeholder={`Monto (mínimo ${money(minimo)})`}
              style={{ width: '100%', height: '46px', borderRadius: '12px', border: '1px solid #eaeae8', background: '#fff', padding: '0 14px', font: "600 13.5px 'IBM Plex Mono',monospace", marginBottom: '12px' }} />
            <button type="submit" disabled={enviando || disponible < minimo}
              style={{ width: '100%', height: '48px', borderRadius: '13px', background: disponible >= minimo ? '#111' : '#eaeae8', color: disponible >= minimo ? '#fff' : '#999', font: '800 14px Manrope,sans-serif', border: 'none' }}>
              {enviando ? 'Enviando…' : disponible < minimo ? `Necesitas ${money(minimo)}` : 'Solicitar retiro'}
            </button>
          </form>
        </div>

        {retiros.length > 0 && (
          <div style={{ margin: '18px 20px 0' }}>
            <div style={{ font: '800 17px Manrope,sans-serif', letterSpacing: '-.025em', marginBottom: '10px' }}>Mis solicitudes</div>
            {retiros.map((r) => {
              const [label, color, bg] = ESTADO[r.estado] || [r.estado, '#666', '#f4f4f3'];
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 15px', borderRadius: '13px', border: '1px solid #eaeae8', marginBottom: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "700 14px 'IBM Plex Mono',monospace" }}>{money(r.monto)}</div>
                    <div style={{ font: '500 11px Manrope,sans-serif', color: '#666', marginTop: '2px', textTransform: 'capitalize' }}>
                      {r.metodo} · {new Date(r.created_at).toLocaleDateString('es-CO')}
                    </div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '99px', background: bg, color, font: '700 11px Manrope,sans-serif', flex: 'none' }}>{label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <DriverBottomNav />
    </>
  );
}

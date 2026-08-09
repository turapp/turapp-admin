export default function Card({ children, title, subtitle, titleRight, className = "", style = {} }) {
  return (
    <div className={className} style={{ borderRadius: '14px', background: 'var(--bg)', border: '1px solid var(--bd2)', padding: '16px 17px', display: 'flex', flexDirection: 'column', ...style }}>
      {(title || subtitle || titleRight) && (
        <div style={{ display: 'flex', alignItems: titleRight ? 'center' : 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            {title && <div style={{ font: '800 15px Manrope,sans-serif', letterSpacing: '-.025em' }}>{title}</div>}
            {subtitle && <div style={{ font: '500 11.5px Manrope,sans-serif', color: 'var(--mu)', marginTop: title ? '3px' : 0 }}>{subtitle}</div>}
          </div>
          {titleRight && <div>{titleRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default function Icon({ paths, color = "currentColor", size = 17, className = "" }) {
  if (!paths) return null;
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 22 22" 
      fill="none" 
      className={className}
      style={{ flex: 'none' }}
    >
      {paths.map((d, i) => (
        <path 
          key={i} 
          d={d} 
          stroke={color} 
          strokeWidth={1.8} 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      ))}
    </svg>
  );
}

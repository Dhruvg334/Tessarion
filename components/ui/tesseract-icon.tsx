export function TesseractIcon({ size = 24, className = '' }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Outer cube */}
      <rect x="20" y="20" width="60" height="60" />
      {/* Inner cube */}
      <rect x="35" y="35" width="30" height="30" />
      {/* Connecting lines (corners) */}
      <line x1="20" y1="20" x2="35" y2="35" />
      <line x1="80" y1="20" x2="65" y2="35" />
      <line x1="20" y1="80" x2="35" y2="65" />
      <line x1="80" y1="80" x2="65" y2="65" />
    </svg>
  );
}

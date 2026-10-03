export function SpringMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`spring-mark ${className}`} viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <circle className="spring-orbit" cx="80" cy="80" r="66" stroke="currentColor" strokeOpacity=".18" />
      <path d="M26 120H134M80 138V88" stroke="currentColor" strokeWidth="1.3" />
      <g className="spring-leaf-left">
        <path d="M80 98C49 100 37 76 38 55C63 54 81 70 80 98Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M80 98L52 69" stroke="currentColor" strokeOpacity=".45" />
      </g>
      <g className="spring-leaf-right">
        <path d="M80 86C79 58 100 37 123 34C126 59 107 85 80 86Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M80 86L109 48" stroke="currentColor" strokeOpacity=".45" />
      </g>
      <path d="M16 80H24M136 80H144M80 16V24" stroke="currentColor" />
      <circle cx="80" cy="120" r="3" fill="currentColor" />
    </svg>
  );
}

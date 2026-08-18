export function WorkmateLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="WorkMate AI logo">
      <defs>
        <linearGradient id="wm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#wm-grad)" />
      <path
        d="M8 11.5 11.2 21l2.9-6.4L17 21l3.2-9.5"
        fill="none"
        stroke="var(--color-background)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="11" r="2.1" fill="var(--color-background)" />
    </svg>
  );
}

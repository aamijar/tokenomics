type Props = {
  className?: string;
  size?: number;
};

export default function Logo({ className, size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="tok-grad-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#tok-grad-1)" />
      <path
        d="M20 26c0-3.314 2.686-6 6-6h12c3.314 0 6 2.686 6 6s-2.686 6-6 6h-8v10c0 1.105-.895 2-2 2h-2c-1.105 0-2-.895-2-2V26z"
        fill="white"
      />
    </svg>
  );
}

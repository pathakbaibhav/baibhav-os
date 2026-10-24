type Props = {
  d: string;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ d, size = 24, stroke = "currentColor", strokeWidth = 1.7, className }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

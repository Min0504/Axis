/**
 * Axis brand mark — the letter A with a balance scale.
 * Represents "weighing choices" (검증, 선택) in a clean geometric form.
 */
export default function BrandLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // viewBox: "0 0 128 88" — all coordinates stay within bounds (min x=0, max x=128)
  const h = Math.round(size * (88 / 128));
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 128 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* ── A left leg ── */}
      <line x1="64" y1="4" x2="20" y2="84" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      {/* ── A right leg ── */}
      <line x1="64" y1="4" x2="108" y2="84" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />

      {/* ── Balance beam ── */}
      <line x1="8" y1="46" x2="120" y2="46" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />

      {/* ── Fulcrum circle at center ── */}
      <circle cx="64" cy="46" r="7" fill="currentColor" />

      {/* ── Left pan: V-strings from beam end ── */}
      <line x1="8"  y1="46" x2="2"  y2="61" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="8"  y1="46" x2="16" y2="61" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="1"  y1="61" x2="17" y2="61" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M1 61 Q9 73 17 61" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />

      {/* ── Right pan: V-strings from beam end ── */}
      <line x1="120" y1="46" x2="112" y2="61" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="120" y1="46" x2="128" y2="61" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="111" y1="61" x2="127" y2="61" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M111 61 Q119 73 127 61" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

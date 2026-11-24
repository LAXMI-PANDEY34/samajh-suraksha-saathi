export function DocumentIllustration() {
  return (
    <svg className="document-illustration" viewBox="0 0 355 250" role="img" aria-label="A document with its important details brought into focus">
      <g transform="rotate(-11 167 122)">
        <rect className="illustration-back" x="86" y="27" width="148" height="192" rx="6" />
      </g>
      <g transform="rotate(5 178 122)">
        <path className="illustration-sheet" d="M117 20h104l30 31v164a5 5 0 0 1-5 5H117a5 5 0 0 1-5-5V25a5 5 0 0 1 5-5Z" />
        <path className="illustration-back" d="M221 20v26a5 5 0 0 0 5 5h25" />
        <path className="illustration-ink" d="M134 48h39m-39 8h24" />
        <path className="illustration-line" d="M134 83h91m-91 15h77m-77 15h87" />
        <rect className="illustration-highlight" x="130" y="128" width="96" height="13" rx="2" />
        <path className="illustration-line" d="M134 135h88m-88 16h72m-72 15h88" />
        <path className="illustration-ink" d="m134 193 5-7 5 8 9-11 5 7 10-5m27 8h30" />
      </g>
      <g transform="rotate(-13 242 173)">
        <rect className="illustration-handle" x="247" y="188" width="14" height="53" rx="7" transform="rotate(-35 254 188)" />
        <circle className="illustration-lens" cx="231" cy="161" r="38" />
        <path className="illustration-ink" strokeWidth="4" d="m215 162 11 11 22-24" />
      </g>
      <path className="illustration-ink" d="M67 77v12m-6-6h12m203-37v10m-5-5h10M70 185l4 4m-4 0 4-4" opacity=".6" />
      <path className="illustration-ink" d="M284 111c12 8 17 22 13 36" strokeDasharray="3 5" opacity=".4" />
      <path className="illustration-ink" d="m292 143 5 5 5-5" opacity=".4" />
    </svg>
  );
}
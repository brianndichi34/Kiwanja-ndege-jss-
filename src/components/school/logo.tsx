export function SchoolLogo({ src, className = "size-16" }: { src?: string; className?: string }) {
  if (src) {
    return <img src={src} alt="Kiwanja Ndege JSS" className={`rounded-full bg-white object-contain p-0.5 ${className}`} />;
  }

  return (
    <span
      role="img"
      aria-label="Kiwanja Ndege JSS — KNJ"
      className={`inline-grid place-items-center rounded-full border-2 border-brass-soft bg-gradient-to-br from-navy via-info to-brass text-center font-serif font-black tracking-tight text-white shadow-lg ${className}`}
    >
      <span className="text-[0.55em] leading-none">KNJ</span>
    </span>
  );
}

export function SchoolLogo({ src, className = "size-16" }: { src?: string; className?: string }) {
  if (src) {
    return <img src={src} alt="Kiwanja Ndege JSS" className={`rounded-full bg-white object-contain p-0.5 ${className}`} />;
  }

  return <img src="/knj-logo.svg" alt="Kiwanja Ndege JSS — KNJ" className={`rounded-full object-contain ${className}`} />;
}

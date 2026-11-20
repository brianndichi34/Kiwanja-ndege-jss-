export function SchoolLogo({ src, className = "size-16" }: { src?: string; className?: string }) {
  if (src) {
    return <img src={src} alt="Kiwanja Ndege Junior Secondary School" className={`rounded-full bg-white object-contain p-0.5 ${className}`} />;
  }

  return <img src="/logo.png" alt="Kiwanja Ndege Junior Secondary School" className={`rounded-full bg-white object-contain p-0.5 ${className}`} />;
}

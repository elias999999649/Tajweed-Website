type BrandMarkProps = { label?: string };

/**
 * Brand mark: an elongation (madd) wave with a gold diacritic dot — the two
 * gestures at the heart of Tajweed practice. Renders in currentColor and is
 * styled by the surrounding .brand-mark / .footer-mark containers.
 */
export function BrandMark({ label = "Complete Tajweed Guide" }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={label}>
      <path d="M12 13h40v38H12z" fill="none" stroke="currentColor" strokeWidth="3" opacity=".18" />
      <path d="M18 20h23c4 0 7 3 7 7v18H25c-4 0-7-3-7-7V20Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M18 38c0-4 3-7 7-7h23" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 20v22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      <circle cx="25" cy="15" r="3" fill="currentColor" />
      <circle cx="36" cy="15" r="2" fill="currentColor" opacity=".55" />
    </svg>
  );
}

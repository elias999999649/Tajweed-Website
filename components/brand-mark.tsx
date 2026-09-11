type BrandMarkProps = { label?: string };

/**
 * Brand mark: an elongation (madd) wave with a gold diacritic dot — the two
 * gestures at the heart of Tajweed practice. Renders in currentColor and is
 * styled by the surrounding .brand-mark / .footer-mark containers.
 */
export function BrandMark({ label = "Complete Tajweed Guide" }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={label}>
      <path
        d="M8 41c0-9.5 7-19 15.5-19 6 0 8.3 4.2 11.8 4.2 4.1 0 6.2-3 6.2-7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="51" r="3.6" fill="currentColor" opacity=".85" />
    </svg>
  );
}

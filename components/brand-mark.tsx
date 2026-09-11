type BrandMarkProps = { label?: string };

export function BrandMark({ label = "Complete Tajweed Guide" }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={label}>
      <path d="M24 5 6 11v20c5.5.6 11.5 3 18 7.5 6.5-4.5 12.5-6.9 18-7.5V11L24 5Z" fill="currentColor" opacity=".13" />
      <path d="M24 7 7 13v18c5.2.6 10.9 2.8 17 7 6.1-4.2 11.8-6.4 17-7V13L24 7Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 8v29M12 17c4.1.6 8.1 1.9 12 4.1 3.9-2.2 7.9-3.5 12-4.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m18 6 6-3 6 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="24" cy="22" r="1.8" fill="currentColor" />
    </svg>
  );
}

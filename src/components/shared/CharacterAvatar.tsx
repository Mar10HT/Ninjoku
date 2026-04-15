interface Props {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

/** Shared character image with consistent placeholder fallback. */
export function CharacterAvatar({ src, alt, size, className = '' }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
    />
  );
}

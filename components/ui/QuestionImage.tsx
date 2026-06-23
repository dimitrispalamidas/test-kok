'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  getImageUrl,
  getImageUrlFallback,
  hasQuestionImage,
} from '@/lib/images';
import { cn } from '@/lib/utils';

type QuestionImageProps = {
  qphoto: string;
  alt: string;
  className?: string;
};

export function QuestionImage({ qphoto, alt, className }: QuestionImageProps) {
  const [src, setSrc] = useState(() => getImageUrl(qphoto));
  const [usedFallback, setUsedFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(getImageUrl(qphoto));
    setUsedFallback(false);
    setLoaded(false);
  }, [qphoto]);

  return (
    <div
      className={cn(
        'relative mx-auto aspect-video w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-card',
        className
      )}
    >
      {/* Skeleton shimmer — visible until image loads */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
      </div>

      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className={cn(
          'object-contain p-2 transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!usedFallback) {
            setUsedFallback(true);
            setLoaded(false);
            setSrc(getImageUrlFallback(qphoto));
          }
        }}
      />
    </div>
  );
}

export function QuestionImageFromPhoto({
  qphoto,
  alt,
  className,
}: {
  qphoto: string | null;
  alt: string;
  className?: string;
}) {
  if (!hasQuestionImage(qphoto)) {
    return null;
  }

  return <QuestionImage qphoto={qphoto} alt={alt} className={className} />;
}

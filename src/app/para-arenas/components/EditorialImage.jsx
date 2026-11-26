import React from 'react';
import Image from 'next/image';

const FALLBACK_SRC = '/images/hero-beach-tennis.jpg';

export default function EditorialImage({
    src,
    alt,
    className = 'w-full h-full object-cover',
    priority = false,
    sizes = '(max-width: 768px) 100vw, 50vw',
}) {
    return (
        <Image
            src={src || FALLBACK_SRC}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={className}
        />
    );
}

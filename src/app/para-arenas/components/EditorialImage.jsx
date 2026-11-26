'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const FALLBACK_SRC = '/images/hero-beach-tennis.jpg';

export default function EditorialImage({
    src,
    alt,
    className = 'w-full h-full object-cover',
    priority = false,
    sizes = '(max-width: 768px) 100vw, 50vw',
}) {
    const [imgSrc, setImgSrc] = useState(src || FALLBACK_SRC);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={className}
            onError={() => {
                if (imgSrc !== FALLBACK_SRC) {
                    setImgSrc(FALLBACK_SRC);
                }
            }}
        />
    );
}

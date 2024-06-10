'use client';
import React from 'react';
import Image from 'next/image';

export default function WarnIcon() {
    const iconWarnUrl = process.env.NEXT_PUBLIC_WARN_ICON_URL;
    return <Image src={iconWarnUrl} alt="Warn Icon" width="48" height="48" />;
}

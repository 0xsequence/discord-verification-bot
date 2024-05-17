'use client';

import React from 'react';
import Image from 'next/image';

export default function DoneIcon() {
    const iconDoneUrl = process.env.NEXT_PUBLIC_DONE_ICON_URL
    return <Image src={iconDoneUrl} alt="Done Icon" width="48" height="48" />;
}

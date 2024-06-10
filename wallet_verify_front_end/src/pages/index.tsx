/* eslint-disable @next/next/no-img-element */
import {Oxanium} from 'next/font/google';
import ConnectWallet from '@/components/ConnectWallet';
import Error from '@/components/Error';
import Head from 'next/head';
import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';

const oxanium = Oxanium({ subsets: ['latin'] });

export default function Home() {
    const searchParams = useSearchParams();
    const [error, setError] = useState(Boolean);

    useEffect(() => {
        const tokenValue = searchParams.get('token');
        setError(!tokenValue);
    }, [searchParams]);

    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_INDEX_TITLE}</title>
            </Head>
            <main className="w-full h-screen bg-black">
                <div className="h-20 w-full border-solid border-b-2 border-darkgray">
                    <img
                        src={process.env.NEXT_PUBLIC_LOGO_URL}
                        height="93"
                        width="88"
                        alt="Logo"
                        className="pl-6 mx-auto sm:mx-0"
                    />
                </div>
                <div className={`flex items-center justify-center ${oxanium.className}`}>
                    <img
                        className="mt-20 sm:max-w-4xl opacity-20 hidden sm:block"
                        alt="background image"
                        src={process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_URL}
                    />
                    <div className="relative sm:absolute">{error ? <Error /> : <ConnectWallet />}</div>
                </div>
            </main>
        </>
    );
}

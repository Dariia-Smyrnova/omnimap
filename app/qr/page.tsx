// pages/index.js
// dev/omnimap/app/qr/page.tsx
"use client";
import type { NextPage } from 'next';
import Head from 'next/head';
import WhatsAppAuth from '../components/WAuth';
import { useEffect } from 'react';
import { atom, useAtom } from 'jotai'

const sessionIdAtom = atom<string | null>(null);

const Home: NextPage = () => {
    const [sessionId, setSessionId] = useAtom(sessionIdAtom);

    useEffect(() => {
        const storedSessionId = localStorage.getItem('sessionID');
        if (storedSessionId) {
            setSessionId(storedSessionId);
        }
    }, [setSessionId]);
    
    return (
        <>
            <Head>
                <title>WhatsApp Authentication</title>
                <meta name="description" content="WhatsApp Authentication using QR Code" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex flex-col items-center justify-center w-full">
                {!sessionId && <WhatsAppAuth />}
            </main>
        </>
    );
};

export default Home;

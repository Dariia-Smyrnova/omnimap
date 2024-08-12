// pages/index.js
// dev/omnimap/app/qr/page.tsx
"use client";
import type { NextPage } from 'next';
import Head from 'next/head';
import WhatsAppAuth from '../components/WAuth';
import { useEffect, useState } from 'react';
import SendMessage from '../components/SendMessage';


const Home: NextPage = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    useEffect(() => {
        const storedSessionId = localStorage.getItem('sessionID');
        setSessionId(storedSessionId);
    }, []);
    return (
        <div>
            <Head>
                <title>WhatsApp Authentication</title>
                <meta name="description" content="WhatsApp Authentication using QR Code" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                {!sessionId && <WhatsAppAuth />}
                {sessionId && <SendMessage />}
            </main>
        </div>
    );
};

export default Home;

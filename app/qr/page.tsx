// pages/index.js
// dev/omnimap/app/qr/page.tsx
"use client";
import type { NextPage } from 'next';
import Head from 'next/head';
import WhatsAppAuth from '../components/WAuth';
import { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai'
import { useSession } from '@clerk/nextjs';
import { addContactToGoogle, getAllGoogleContacts } from '../auth/google';
import { Button } from '@/components/ui/button';

const sessionIdAtom = atom<string | null>(null);

const Home: NextPage = () => {
    const [sessionId, setSessionId] = useAtom(sessionIdAtom);

    useEffect(() => {
        const storedSessionId = localStorage.getItem('sessionID');
        if (storedSessionId) {
            setSessionId(storedSessionId);
        }
    }, [setSessionId]);
    

    const handleAddContact = async () => {
        addContactToGoogle('Necoo', '+905340224278');
    }

    const [contacts, setContacts] = useState<any[]>([]);

    const handleGetContacts = async () => {
        const contacts = await getAllGoogleContacts();
        setContacts(contacts);
    }
    return (
        <>
            <Head>
                <title>WhatsApp Authentication</title>
                <meta name="description" content="WhatsApp Authentication using QR Code" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex flex-col items-center justify-center w-full">
                {!sessionId && <WhatsAppAuth />}

                {contacts.map((contact, index) => (
                    <div key={index}>
                        <p>{contact.name}</p>
                        <p>{contact.phoneNumber}</p>
                    </div>
                ))}

                
                <Button onClick={handleAddContact}>Add Contact</Button>
                <Button onClick={handleGetContacts}>Get Contacts</Button>
            </main>
        </>
    );
};

export default Home;

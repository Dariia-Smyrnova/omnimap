// dev/omnimap/app/qr/send-message.tsx
"use client";
import { useState } from 'react';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea"
import { useAtom } from 'jotai';
import { enrichAtom, placesAtom } from './PlacesList';
import { env } from '@/env';

import { toast } from "sonner"

import { QRCodeDialog } from './QRCodeDialog';

interface FormData {
    message: string;
}

export default function SendMessage() {
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [places] = useAtom(placesAtom);
    const [isEnriched, setIsEnriched] = useAtom(enrichAtom);
    const form = useForm<FormData>();
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [showQRDialog, setShowQRDialog] = useState(false);


    const validateSessionID = async () => {
        const sessionID = localStorage.getItem('sessionID') as string;
        try {
            const response = await fetch(`${env.NEXT_PUBLIC_WA_SERVICE_URL}/validate-session`, {
                method: 'POST',
                body: JSON.stringify({
                    "SessionID": sessionID,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            console.log("validated: " + response);

            if (!response.ok) {
                console.log('Failed to validate session: ' + response);
            }
            const result = await response.json();
            setIsSessionValid(result.isValid);
        } catch (error) {
            console.error('Error validating session:', error);
            setIsSessionValid(false);
            // setError('Failed to validate session');
        }
    };

    const sendMessage = async (data: FormData) => {
        validateSessionID();
        if (!isSessionValid) {
            console.log("invalid session:" + isSessionValid);
            //setError('Invalid session. Please log in again.');
            setShowQRDialog(true);
        }
        const sessionID = localStorage.getItem('sessionID') as string;
        console.log(sessionID);
        try {
            for (const p of places) {
                const send = async () => {
                    const response = await fetch(`${env.NEXT_PUBLIC_WA_SERVICE_URL}/send`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "Recipient": p.international_phone_number,
                            "Message": data.message,
                            "SessionID": sessionID,
                        }),
                    });


                    if (!response.ok) {
                        throw new Error('Failed to send message: ' + response);
                    }
                    return await response.json();
                }
                await toast.promise(send(), {
                    loading: `Sending message to ${p.name}` + p.international_phone_number,
                    success: 'Message sent!',
                    error: 'Failed to send message!',
                });
                // setStatus(`Message sent: ${result.message}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log(error);
                // setError(error.message);
            } else {
                console.log('An unknown error occurred');
            }
        }
    };

    const handleAuthenticated = () => {
        setIsSessionValid(true);
        setShowQRDialog(false);
    };

    const handleContacts = async () => {
        const sessionID = localStorage.getItem('sessionID');
        try {
            const response = await fetch(`${env.NEXT_PUBLIC_WA_SERVICE_URL}/contacts?sessionID=${sessionID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to get contacts');
            }
            const result = await response.json();
            console.log(result);
            console.log(response);
            setStatus(`Contacts: ${result.contacts}`);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    return (
        <>
            {isEnriched && <div className='flex flex-col items-center justify-center w-full mb-12'>
                <h3 className="text-2xl font-bold mb-4">Send WhatsApp Message</h3>
                {status && <p>Status: {status}</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(sendMessage)} className="space-y-8 w-full">
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="message">Message:</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} id="message" required />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Send to {places.filter(place => place.international_phone_number).length} numbers</Button>
                    </form>
                </Form>
                <QRCodeDialog isOpen={showQRDialog} onClose={handleAuthenticated} />
                {/* <form onSubmit={handleContacts} className='flex flex-col items-left justify-left w-full my-8'>
                    <Button type="submit">Get Contacts</Button>
                </form> */}
            </div>}
        </>
    );
}
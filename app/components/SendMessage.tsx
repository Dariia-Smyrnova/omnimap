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
import { placesAtom } from './FilterContacts';
import { env } from '@/env';

interface FormData {
    message: string;
}

export default function SendMessage() {
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [places] = useAtom(placesAtom);
    const form = useForm<FormData>();

    const handleSubmit = async (data: FormData) => {
        const sessionID = localStorage.getItem('sessionID');
        try {
            for (const p of places) {
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
                    throw new Error('Failed to send message');
                }
                const result = await response.json();
                setStatus(`Message sent: ${result.message}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
        }
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
        <div className='flex flex-col items-center justify-center w-full'>
            <h3 className="text-2xl font-bold mb-4">Send WhatsApp Message</h3>

            {status && <p>Status: {status}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full">
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
                    <Button type="submit">Send to {places.length} contacts</Button>
                </form>
            </Form>

            <form onSubmit={handleContacts} className='flex flex-col items-left justify-left w-full my-8'>
                <Button type="submit">Get Contacts</Button>
            </form>

        </div>
    );
}
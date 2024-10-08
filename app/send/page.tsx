// dev/omnimap/app/qr/send-message.tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { env } from '@/env';


export default function SendMessage() {
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('+905340224278@s.whatsapp.net');
    const [message, setMessage] = useState('halo from web api');

    const handleSubmit = async () => {
        const sessionID = localStorage.getItem('sessionID');
        try {
            const response = await fetch(`${env.NEXT_PUBLIC_WA_SERVICE_URL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "Recipient": phoneNumber,
                    "Message": message,
                    "SessionID": sessionID,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            const result = await response.json();
            // setStatus(`Message sent: ${result.message}`);
            setPhoneNumber('');
            setMessage('');
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    return (
        <div>
            <h1>Send WhatsApp Message</h1>
            <Link href="/qr">Back to QR Scanner</Link>

            {status && <p>Status: {status}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="message">Message:</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type="submit">Send</button>
            </form>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { env } from '@/env';

const WhatsAppAuth: React.FC = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [authStatus, setAuthStatus] = useState<string>('pending');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (sessionId) {
            const eventSource = new EventSource(`${env.NEXT_PUBLIC_WA_SERVICE_URL}/auth-status?sessionID=${sessionId}`);

            eventSource.onmessage = (event) => {
                const status = event.data;
                setAuthStatus(status);

                if (status === 'authenticated') {
                    eventSource.close();
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource failed:', error);
                eventSource.close();
            };

            return () => {
                eventSource.close();
            };
        } else {
            const sessionId = localStorage.getItem('sessionId');
            setSessionId(sessionId);
        }
    }, [sessionId]);

    const generateQRCode = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${env.NEXT_PUBLIC_WA_SERVICE_URL}/generate-qr`, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSessionId(data.sessionID);
            localStorage.setItem('sessionID', data.sessionID);
            setQrCode(data.qrCode);
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            setError('Failed to generate QR code. Please try again.');
        } finally {
            setIsLoading(false);
            console.log('sessionId', sessionId);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">WhatsApp Authentication</h1>
            <button
                onClick={() => generateQRCode()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                disabled={isLoading}
            >
                {isLoading ? 'Generating...' : 'Generate QR Code'}
            </button>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {qrCode && (
                <div className="mb-4">
                    <h2 className="text-xl mb-2">Scan this QR code with WhatsApp</h2>
                    <Image src={`data:image/png;base64,${qrCode}`} alt="QR Code" width={256} height={256} />
                </div>
            )}
            <p className="mb-2">Authentication Status: {authStatus}</p>
        </div>
    );
};

export default WhatsAppAuth;
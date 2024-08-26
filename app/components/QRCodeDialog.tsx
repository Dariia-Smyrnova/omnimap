// components/QRCodeDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WhatsAppAuth from './WAuth';
import { env } from '@/env';
import { Loader2 } from 'lucide-react';

interface QRCodeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QRCodeDialog({ isOpen, onClose }: QRCodeDialogProps) {
    const [authStatus, setAuthStatus] = useState<string>('');
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (sessionId) {
            const eventSource = new EventSource(`${env.NEXT_PUBLIC_WA_SERVICE_URL}/auth-status?sessionID=${sessionId}`);

            eventSource.onmessage = (event) => {
                const status = event.data;
                setAuthStatus(status);

                if (status === 'authenticated') {
                    console.log('authenticated');
                    localStorage.setItem('sessionID', sessionId);
                    eventSource.close();
                    onClose();
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource failed:', error);
                eventSource.close();
            };

            return () => {
                eventSource.close();
            };
        }
    }, [sessionId, onClose]);

    const handleSessionIdUpdate = (newSessionId: string) => {
        setSessionId(newSessionId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Authenticate WhatsApp</DialogTitle>
                </DialogHeader>
                {authStatus !== 'authenticated' && (
                    <>
                        <WhatsAppAuth onSessionIdUpdate={handleSessionIdUpdate} />
                        {authStatus === 'waiting' && (
                            <div className="flex flex-col items-center justify-center mt-4">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p className="mt-2">Waiting for authentication... Please scan the QR code with your WhatsApp.</p>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
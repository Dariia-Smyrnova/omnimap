// pages/index.js
// dev/omnimap/app/qr/page.tsx
"use client";
import type { NextPage } from 'next';
import Head from 'next/head';
import WhatsAppAuth from '../components/WAuth';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>WhatsApp Authentication</title>
        <meta name="description" content="WhatsApp Authentication using QR Code" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <WhatsAppAuth />
      </main>
    </div>
  );
};

export default Home;

// export default function Home() {
//     const [qrCode, setQrCode] = useState('');
//     const [status, setStatus] = useState('');
//     const [error, setError] = useState('');
//     const [clientID, setClientID] = useState<string | null>(null);

//     useEffect(() => {
//         const storedClientID = localStorage.getItem('clientID');
//         setClientID(storedClientID);
//         const ws = new WebSocket('ws://localhost:8080/ws');

//         ws.onopen = () => {
//             console.log('WebSocket connected');
//         };

//         ws.onmessage = (event) => {
//             // const data = JSON.parse(event.data);
//             // console.log(data);
//             // if (data.qrCode) {
//             //     if (!clientID) {
//             //         setQrCode(data.qrCode);
//             //     } else {
//             //         // ws.close();
//             //     }
//             // } else if (data.status) {
//             //     setStatus(data.status);
//             //     if (data.status === 'connected') {
//             //         setQrCode(''); // Clear QR code once connected
//             //         if (data.clientID) {
//             //             console.log("CLIENT ID ", data.clientID);
//             //             localStorage.setItem('clientID', data.clientID);
//             //             setClientID(data.clientID);
//             //         }
//             //     }
//             // } else if (data.error) {
//             //     setError(data.error);
//             // }
//         };

//         ws.onerror = (error) => {
//             console.error('WebSocket error:', error);
//         };

//         ws.onclose = () => {
//             console.log('WebSocket disconnected');
//         };

//         return () => {
//             ws.close();
//         };
//     }, []);

//     return (
//         <div>
//             <h1>WhatsApp QR Code Scanner</h1>
//             <Link href="/qr/send-message">Go to Send Message</Link>
//             {qrCode && (
//                 <div>
//                     <h2>Scan this QR code with WhatsApp:</h2>
//                     <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
//                 </div>
//             )}
//             {status && <p>Status: {status}</p>}
//             {error && <p style={{ color: 'red' }}>Error: {error}</p>}
//         </div>
//     );
// }

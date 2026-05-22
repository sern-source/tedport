'use client';
// Enes Doğanay | 22 Mayıs 2026: Client-side provider sarmalayıcı
// AuthProvider + ToastWrapper burada — layout.jsx server component olarak kalır
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthProvider } from '../src/AuthContext';
import ToastWrapper from '../src/components/ToastWrapper';
import Chatbot from '../src/components/Chatbot';
import LayoutClient from '../src/LayoutClient';

// Enes Doğanay | 22 Mayıs 2026: Embedded modda chatbot gizle — Suspense ile useSearchParams sarılır
function ChatbotConditional() {
    const searchParams = useSearchParams();
    const isEmbedded = searchParams.get('embedded') === '1';
    if (isEmbedded) return null;
    return <Chatbot />;
}

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <LayoutClient>
                {children}
            </LayoutClient>
            <ToastWrapper />
            <Suspense fallback={null}>
                <ChatbotConditional />
            </Suspense>
        </AuthProvider>
    );
}

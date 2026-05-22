'use client';
// Enes Doğanay | 22 Mayıs 2026: Client-side provider sarmalayıcı
// AuthProvider + ToastWrapper burada — layout.jsx server component olarak kalır
import { AuthProvider } from '../src/AuthContext';
import ToastWrapper from '../src/components/ToastWrapper';
import Chatbot from '../src/components/Chatbot';

export default function Providers({ children }) {
    return (
        <AuthProvider>
            {children}
            <ToastWrapper />
            <Chatbot />
        </AuthProvider>
    );
}

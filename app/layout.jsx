// Enes Doğanay | 22 Mayıs 2026: Next.js root layout — index.html + Layout.jsx yerine geçer
// Dark mode flash prevention, Google Fonts, global CSS, providers buraya taşındı
import '../src/index.css';
import Script from 'next/script';
import Providers from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Enes Doğanay | 22 Mayıs 2026: Varsayılan metadata — her sayfa kendi generateMetadata ile override eder
export const metadata = {
    metadataBase: new URL('https://tedport.com'),
    title: {
        default: "Tedport — Türkiye'nin Kurumsal İş Ağı",
        template: '%s | Tedport',
    },
    description: "Doğru firmaları keşfedin, satınalma süreçlerinizi hızlandırın ve uzun vadeli çözüm ortaklıkları kurun — hepsi tek platformda. Ücretsiz üyelik.",
    verification: {
        google: 'ua03-sNf4uIDoygaSGaRL8FXMUiy9bhbp_rPffCN-4o',
    },
    openGraph: {
        type: 'website',
        siteName: 'Tedport',
        title: "Tedport — Türkiye'nin Kurumsal İş Ağı",
        description: "Doğru firmaları keşfedin, satınalma süreçlerinizi hızlandırın ve uzun vadeli çözüm ortaklıkları kurun — hepsi tek platformda. Ücretsiz üyelik.",
        url: 'https://tedport.com',
        images: [{ url: '/tedport-logo-sade.jpg', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Tedport — Türkiye'nin Kurumsal İş Ağı",
        description: "Doğru firmaları keşfedin, satınalma süreçlerinizi hızlandırın ve uzun vadeli çözüm ortaklıkları kurun — hepsi tek platformda. Ücretsiz üyelik.",
        images: ['/tedport-logo-sade.jpg'],
    },
};

// Enes Doğanay | 22 Mayıs 2026: Tema flash önleme — React yüklenmeden ÖNCE çalışır (index.html'den taşındı)
const DARK_MODE_SCRIPT = `(function(){try{var s=localStorage.getItem('tedport-theme');var t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

// Enes Doğanay | 22 Mayıs 2026: Email değişiklik öncesi eski session temizleme (index.html body script'inden taşındı)
const EMAIL_CHANGE_CLEANUP_SCRIPT = `(function(){try{var h=window.location.hash||'';if(h.indexOf('type=email_change')===-1)return;var ls=window.localStorage;var ss=window.sessionStorage;var k,i;k=Object.keys(ls);for(i=0;i<k.length;i++){if(k[i].indexOf('sb-')===0||k[i].indexOf('tedport-auth')===0)ls.removeItem(k[i]);}k=Object.keys(ss);for(i=0;i<k.length;i++){if(k[i].indexOf('sb-')===0||k[i].indexOf('tedport-auth')===0)ss.removeItem(k[i]);}}catch(e){}})();`;

export default function RootLayout({ children }) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <head>
                {/* Enes Doğanay | 22 Mayıs 2026: Tema flash önleme — ilk script, React'tan önce çalışır */}
                <script dangerouslySetInnerHTML={{ __html: DARK_MODE_SCRIPT }} />
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                {/* Enes Doğanay | 11 Mayıs 2026: display=block — ikon font ligature'ları ham metin olarak görünmesini önler */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
                    rel="stylesheet"
                />
            </head>
            <body>
                {/* Enes Doğanay | 22 Mayıs 2026: Email change için eski session temizle — bundle yüklenmeden önce */}
                <script dangerouslySetInnerHTML={{ __html: EMAIL_CHANGE_CLEANUP_SCRIPT }} />
                <Providers>
                    {children}
                </Providers>
                <SpeedInsights />
                {/* Enes Doğanay | 23 Mayıs 2026: Google Analytics 4 — afterInteractive ile sayfa yüklenmesini bloklamaz */}
                {process.env.NEXT_PUBLIC_GA_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                            `}
                        </Script>
                    </>
                )}
            </body>
        </html>
    );
}

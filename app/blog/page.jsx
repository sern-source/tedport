// Enes Doğanay | 3 Haziran 2026: /blog route — blog listesi
import { Suspense } from 'react';
import BlogListPage from '../../src/pages/Blog/BlogListPage';

export const metadata = {
    title: 'Bilgi Merkezi — İhale ve B2B Satınalma Rehberleri',
    description: "Türkiye'de ihale süreci, B2B satınalma stratejileri ve tedarik zinciri yönetimi hakkında kapsamlı rehberler. Tedport Bilgi Merkezi.",
    openGraph: {
        title: 'Bilgi Merkezi | Tedport',
        url: 'https://tedport.com/blog',
        description: "İhale rehberleri, B2B satınalma ipuçları ve dijital dönüşüm içerikleri.",
    },
};

export default function BlogRoute() {
    return <Suspense fallback={null}><BlogListPage /></Suspense>;
}

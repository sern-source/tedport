// Enes Doğanay | 3 Haziran 2026: Blog liste sayfası — hero + kategori filtreler + yazı grid'i
'use client';
import React from 'react';
import Link from 'next/link';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import SharedFooter from '../../components/SharedFooter';
import SEO from '../../components/SEO';
import BlogCard from './components/BlogCard';
import { useBlogList, BLOG_CATEGORIES } from './hooks/useBlogList';
import './BlogListPage.css';

const NAV_ITEMS = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Firmalar', href: '/firmalar' },
    { label: 'İhaleler', href: '/ihaleler' },
    { label: 'Bilgi Merkezi', href: '/blog' },
    { label: 'Hakkımızda', href: '/hakkimizda' },
    { label: 'İletişim', href: '/iletisim' },
];

// Enes Doğanay | 3 Haziran 2026: Yükleniyor iskelet kartları
const SkeletonCard = () => (
    <div className="blog-skeleton">
        <div className="blog-skeleton__accent" />
        <div className="blog-skeleton__body">
            <div className="blog-skeleton__pill" />
            <div className="blog-skeleton__line blog-skeleton__line--title" />
            <div className="blog-skeleton__line" />
            <div className="blog-skeleton__line blog-skeleton__line--short" />
        </div>
        <div className="blog-skeleton__footer" />
    </div>
);

const BlogListPage = () => {
    const { posts, isLoading, hasError, category, handleCategoryChange } = useBlogList();

    return (
        <div className="blog-list-page">
            <SEO
                title="Bilgi Merkezi — İhale ve B2B Satınalma Rehberleri"
                description="Türkiye'de ihale süreci, B2B satınalma stratejileri ve tedarik zinciri yönetimi hakkında kapsamlı rehberler."
            />
            <SharedHeader navItems={NAV_ITEMS} />

            {/* Hero */}
            <section className="blog-hero">
                <div className="blog-hero__inner">
                    <span className="blog-hero__badge">
                        <span className="material-symbols-outlined">auto_stories</span>
                        Bilgi Merkezi
                    </span>
                    <h1 className="blog-hero__title">Sektörü Anlayın,<br />Fırsatları Kaçırmayın</h1>
                    <p className="blog-hero__subtitle">
                        İhale süreçleri, B2B satınalma stratejileri ve tedarik zinciri yönetimi hakkında pratik rehberler.
                    </p>
                </div>
            </section>

            {/* Kategori Filtreler */}
            <div className="blog-filters-bar">
                <div className="blog-filters-inner">
                    {BLOG_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`blog-filter-btn${category === cat ? ' blog-filter-btn--active' : ''}`}
                            onClick={() => handleCategoryChange(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* İçerik */}
            <main className="blog-main">
                {hasError && (
                    <div className="blog-error">
                        <span className="material-symbols-outlined">error</span>
                        Yazılar yüklenirken hata oluştu. Lütfen sayfayı yenileyin.
                    </div>
                )}
                {!hasError && (
                    <div className="blog-grid">
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                            : posts.length === 0
                                ? (
                                    <div className="blog-empty">
                                        <span className="material-symbols-outlined">article</span>
                                        <p>Bu kategoride henüz yazı bulunmuyor.</p>
                                    </div>
                                )
                                : posts.map(post => <BlogCard key={post.id} post={post} />)
                        }
                    </div>
                )}
            </main>

            <SharedFooter />
        </div>
    );
};

export default BlogListPage;

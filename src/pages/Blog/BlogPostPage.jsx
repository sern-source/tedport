// Enes Doğanay | 3 Haziran 2026: Blog tekil yazı sayfası
'use client';
import React from 'react';
import Link from 'next/link';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import SharedFooter from '../../components/SharedFooter';
import SEO from '../../components/SEO';
import BlogCard from './components/BlogCard';
import { useBlogPost } from './hooks/useBlogPost';
import './BlogPostPage.css';

const NAV_ITEMS = [
    { label: 'Anasayfa', href: '/' },
    { label: 'Firmalar', href: '/firmalar' },
    { label: 'İhaleler', href: '/ihaleler' },
    { label: 'Bilgi Merkezi', href: '/blog' },
    { label: 'Hakkımızda', href: '/hakkimizda' },
    { label: 'İletişim', href: '/iletisim' },
];

const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BlogPostPage = ({ slug }) => {
    const { post, related, isLoading, hasError } = useBlogPost(slug);

    return (
        <div className="blog-post-page">
            {post && (
                <SEO
                    title={post.seo_title || post.title}
                    description={post.seo_description || post.summary}
                    canonical={`https://tedport.com/blog/${slug}`}
                />
            )}
            <SharedHeader navItems={NAV_ITEMS} />

            {/* Geri butonu */}
            <div className="blog-post-breadcrumb">
                <div className="blog-post-breadcrumb__inner">
                    <Link href="/blog" className="blog-post-back">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Bilgi Merkezi
                    </Link>
                    {post && (
                        <>
                            <span className="material-symbols-outlined blog-post-breadcrumb__sep">chevron_right</span>
                            <span className="blog-post-breadcrumb__current">{post.category}</span>
                        </>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="blog-post-loading">
                    <div className="blog-post-loading__spinner" />
                    <p>Yazı yükleniyor…</p>
                </div>
            )}

            {hasError && (
                <div className="blog-post-error">
                    <span className="material-symbols-outlined">error</span>
                    <p>Yazı yüklenemedi. <Link href="/blog">Tüm yazılara dön</Link></p>
                </div>
            )}

            {!isLoading && !hasError && post && (
                <>
                    {/* Hero */}
                    <div className="blog-post-hero" style={{ '--hero-color': post.cover_color }}>
                        <div className="blog-post-hero__inner">
                            <span className="blog-post-hero__category">{post.category}</span>
                            <h1 className="blog-post-hero__title">{post.title}</h1>
                            <p className="blog-post-hero__summary">{post.summary}</p>
                            <div className="blog-post-hero__meta">
                                <span>
                                    <span className="material-symbols-outlined">schedule</span>
                                    {post.reading_time} dk okuma
                                </span>
                                <span>
                                    <span className="material-symbols-outlined">calendar_today</span>
                                    {formatDate(post.published_at)}
                                </span>
                                <span>
                                    <span className="material-symbols-outlined">folder</span>
                                    {post.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Yazı içeriği */}
                    <div className="blog-post-layout">
                        <article className="blog-post-content">
                            {/* Güvenli: içerik yalnızca admin seed data'sından gelir */}
                            <div
                                className="blog-prose"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* CTA */}
                            <div className="blog-post-cta">
                                <div className="blog-post-cta__icon">
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                </div>
                                <div className="blog-post-cta__text">
                                    <strong>Tedport ile İhalelere Katılın</strong>
                                    <p>Ücretsiz hesap açın, kendi sektörünüzdeki ihaleleri keşfedin ve büyüme fırsatlarını değerlendirin.</p>
                                </div>
                                <Link href="/register" className="blog-post-cta__btn">
                                    Ücretsiz Başlayın
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </div>
                        </article>
                    </div>

                    {/* İlgili yazılar */}
                    {related.length > 0 && (
                        <section className="blog-related">
                            <div className="blog-related__inner">
                                <h2 className="blog-related__title">İlgili Yazılar</h2>
                                <div className="blog-related__grid">
                                    {related.map(p => <BlogCard key={p.id} post={p} />)}
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}

            <SharedFooter />
        </div>
    );
};

export default BlogPostPage;

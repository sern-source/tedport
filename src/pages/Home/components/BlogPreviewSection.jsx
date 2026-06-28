// Enes Doğanay | 3 Haziran 2026: Ana sayfa "Son Yazılar" bloğu
'use client';
import React from 'react';
import Link from 'next/link';
import './BlogPreviewSection.css';

// Enes Doğanay | 28 Haziran 2026: Rehber kaldırıldı → Mevzuat + Sektör Rehberi eklendi
const CATEGORY_COLORS = {
    'İhale Rehberi':   '#2563eb',
    'Satınalma':       '#059669',
    'Dijital Dönüşüm': '#dc2626',
    'Mevzuat':         '#b45309',
    'Sektör Rehberi':  '#0891b2',
};

// Enes Doğanay | 3 Haziran 2026: Yükleme iskelet kartı
const SkeletonCard = () => (
    <div className="bps-card bps-card--skeleton">
        <div className="bps-card__accent" />
        <div className="bps-card__body">
            <div className="bps-skeleton bps-skeleton--tag" />
            <div className="bps-skeleton bps-skeleton--title" />
            <div className="bps-skeleton bps-skeleton--line" />
            <div className="bps-skeleton bps-skeleton--line bps-skeleton--short" />
        </div>
    </div>
);

const BlogPreviewSection = ({ posts, isLoading }) => {
    // Enes Doğanay | 3 Haziran 2026: Blog data yoksa section'ı gizle
    if (!isLoading && posts.length === 0) return null;

    return (
        <section className="bps-section">
            <div className="container">
                {/* Enes Doğanay | 3 Haziran 2026: Başlık + "Tümünü Gör" linki */}
                <div className="bps-header">
                    <div>
                        <p className="bps-eyebrow">Bilgi Merkezi</p>
                        <h2 className="bps-title">Son Yazılar</h2>
                    </div>
                    <Link href="/blog" className="bps-all-link">
                        Tüm Yazılar
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>

                <div className="bps-grid">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                        : posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="bps-card"
                                style={{ '--accent': post.cover_color || '#2563eb' }}
                            >
                                {/* Enes Doğanay | 3 Haziran 2026: Renkli üst çizgi */}
                                <div className="bps-card__accent" />
                                <div className="bps-card__body">
                                    <div className="bps-card__meta">
                                        <span
                                            className="bps-card__tag"
                                            style={{ color: CATEGORY_COLORS[post.category] || '#2563eb' }}
                                        >
                                            {post.category}
                                        </span>
                                        <span className="bps-card__read">
                                            <span className="material-symbols-outlined">schedule</span>
                                            {post.reading_time} dk
                                        </span>
                                    </div>
                                    <h3 className="bps-card__title">{post.title}</h3>
                                    <p className="bps-card__summary">{post.summary}</p>
                                </div>
                                <div className="bps-card__footer">
                                    <span className="bps-card__cta">
                                        Okumaya devam et
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </span>
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </div>
        </section>
    );
};

export default BlogPreviewSection;

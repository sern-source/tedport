// Enes Doğanay | 3 Haziran 2026: Blog kartı — liste sayfasında gösterilen yazı kartı
'use client';
import React from 'react';
import Link from 'next/link';
import './BlogCard.css';

// Enes Doğanay | 28 Haziran 2026: Rehber kaldırıldı → Mevzuat + Sektör Rehberi eklendi
const CATEGORY_ICONS = {
    'İhale Rehberi':   'gavel',
    'Satınalma':       'shopping_cart',
    'Dijital Dönüşüm': 'bolt',
    'Mevzuat':         'balance',
    'Sektör Rehberi':  'factory',
};

const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BlogCard = ({ post }) => {
    const icon = CATEGORY_ICONS[post.category] || 'article';

    return (
        <Link href={`/blog/${post.slug}`} className="blog-card" style={{ '--accent': post.cover_color }}>
            <div className="blog-card__accent" />
            <div className="blog-card__body">
                <div className="blog-card__category">
                    <span className="material-symbols-outlined">{icon}</span>
                    {post.category}
                </div>
                <h2 className="blog-card__title">{post.title}</h2>
                <p className="blog-card__summary">{post.summary}</p>
            </div>
            <div className="blog-card__footer">
                <div className="blog-card__meta">
                    <span className="blog-card__meta-item">
                        <span className="material-symbols-outlined">schedule</span>
                        {post.reading_time} dk okuma
                    </span>
                    <span className="blog-card__meta-item">
                        <span className="material-symbols-outlined">calendar_today</span>
                        {formatDate(post.published_at)}
                    </span>
                </div>
                <span className="blog-card__cta">
                    Devamını Oku
                    <span className="material-symbols-outlined">arrow_forward</span>
                </span>
            </div>
        </Link>
    );
};

export default BlogCard;

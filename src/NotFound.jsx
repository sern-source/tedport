{/* Enes Doğanay | 16 Nisan 2026: 404 — Sayfa Bulunamadı */}
import React from 'react';
import { Link } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import SharedFooter from './SharedFooter';
import SEO from './SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="Sayfa Bulunamadı" path="/404" noIndex />
      <SharedHeader />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', padding: '2rem',
        fontFamily: 'Inter, sans-serif', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: '#1a56db', marginBottom: '0.5rem' }}>404</div>
        <h1 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>Sayfa Bulunamadı</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '400px' }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link to="/" style={{
          padding: '0.625rem 1.5rem', background: '#1a56db', color: '#fff',
          borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
        }}>
          Ana Sayfaya Dön
        </Link>
      </div>
      <SharedFooter />
    </>
  );
}

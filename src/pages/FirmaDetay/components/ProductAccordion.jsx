// Enes Doğanay | 6 Mayıs 2026: Ürün kategorileri accordion bileşeni
import React from 'react';
import './ProductAccordion.css';

const ProductAccordion = ({ kategoriler, expandedCategories, onToggle }) => (
    <section id="products">
        <h2 className="section-title">Ürün Kategorileri</h2>
        <div className="accordion">
            {kategoriler.map((kategori, idx) => {
                const categoryKey = `cat-${idx}`;
                const isExpanded = expandedCategories.has(categoryKey);
                return (
                    <div key={idx} className="accordion-item">
                        <button
                            className="accordion-button"
                            onClick={() => onToggle(categoryKey)}
                        >
                            <span className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}>▷</span>
                            <span>{kategori.ana_kategori}</span>
                        </button>
                        {isExpanded && (
                            <div className="accordion-content">
                                {kategori.alt_kategoriler && kategori.alt_kategoriler.length > 0 ? (
                                    <div className="accordion-subcategories">
                                        {kategori.alt_kategoriler.map((altKat, altIdx) => (
                                            <div key={altIdx}>
                                                <h4 className="subcategory-title">• {altKat.baslik}</h4>
                                                {altKat.urunler && altKat.urunler.length > 0 && (
                                                    <div className="product-tags-wrap">
                                                        {altKat.urunler.map((urun, urunIdx) => (
                                                            <a
                                                                key={urunIdx}
                                                                href={`/firmalar?search=${encodeURIComponent(urun)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="product-tag"
                                                            >
                                                                {urun}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-subcategory-text">Alt kategori bulunmuyor</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </section>
);

export default ProductAccordion;

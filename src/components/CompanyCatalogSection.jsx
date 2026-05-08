// Enes Doğanay | 6 Mayıs 2026: Ürün kataloğu editör kartı
import React from 'react';
import './CompanyCatalogSection.css';

/* Enes Doğanay | 6 Mayıs 2026: catalog, productDraft, setProductDraft, handlers */
const CompanyCatalogSection = ({ catalog, productDraft, setProductDraft, handlers }) => {
    const {
        addCategory, removeCategory, setCatName,
        addSub, removeSub, setSubName,
        addProduct, removeProduct, handleProductKeyDown
    } = handlers;

    return (
        <div className="cmp-card">
            <div className="cmp-card__head">
                <span className="material-symbols-outlined">category</span>
                <div>
                    <h3>Ürün Kataloğu</h3>
                    <p>
                        Aşağısı, firma detay sayfasındaki accordion yapısıyla <strong>birebir aynıdır</strong>.
                        Her kategori bir accordion başlığı, alt kategoriler kendi içinde, ürünler ise etiket (pill) olarak görünür.
                    </p>
                </div>
                <button type="button" className="cmp-btn cmp-btn--add-category" onClick={addCategory}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Kategori Ekle
                </button>
            </div>

            <div className="cmp-catalog">
                {catalog.length === 0 && (
                    <div className="cmp-catalog__empty">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <strong>Henüz ürün kategorisi yok</strong>
                        <p>Yukarıdaki &ldquo;Kategori Ekle&rdquo; ile ürün hiyerarşinizi oluşturun.</p>
                    </div>
                )}

                {catalog.map((cat, catIdx) => (
                    <div key={cat.id} className="cmp-cat-card">
                        <div className="cmp-cat-header">
                            <span className="cmp-cat-chevron">▼</span>
                            <input
                                className="cmp-cat-name"
                                type="text"
                                value={cat.name}
                                onChange={e => setCatName(cat.id, e.target.value)}
                                placeholder={`Kategori ${catIdx + 1} adı (örn. Demir-Çelik Ürünler)`}
                            />
                            <div className="cmp-cat-header__btns">
                                <button type="button" className="cmp-btn cmp-btn--ghost cmp-btn--sm" onClick={() => addSub(cat.id)}>
                                    <span className="material-symbols-outlined">add</span>
                                    Alt Kategori
                                </button>
                                <button type="button" className="cmp-btn cmp-btn--danger cmp-btn--icon" onClick={() => removeCategory(cat.id)} data-tooltip="Kategoriyi Sil" aria-label="Kategoriyi sil">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>

                        {cat.subs.length > 0 && (
                            <div className="cmp-cat-content">
                                {cat.subs.map((sub, subIdx) => (
                                    <div key={sub.id} className="cmp-sub">
                                        <div className="cmp-sub-header">
                                            <span className="cmp-sub-bullet">•</span>
                                            <input
                                                className="cmp-sub-name"
                                                type="text"
                                                value={sub.name}
                                                onChange={e => setSubName(cat.id, sub.id, e.target.value)}
                                                placeholder={`Alt kategori ${subIdx + 1} adı (örn. Boru Ürünleri)`}
                                            />
                                            <button type="button" className="cmp-btn cmp-btn--danger cmp-btn--icon cmp-btn--sm" onClick={() => removeSub(cat.id, sub.id)} data-tooltip="Alt Kategoriyi Sil" aria-label="Alt kategoriyi sil">
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                        <div className="cmp-products-wrap">
                                            {sub.products.map(prod => (
                                                <span key={prod.id} className="cmp-pill">
                                                    {prod.name}
                                                    {/* Enes Doğanay | 8 Mayıs 2026: aria-label — × işareti screen reader için anlamsız */}
                                                    <button type="button" className="cmp-pill__x" onClick={() => removeProduct(cat.id, sub.id, prod.id)} data-tooltip="Ürünü Kaldır" aria-label={`${prod.name} ürününü kaldır`}>×</button>
                                                </span>
                                            ))}
                                            <label className="cmp-pill-add">
                                                <input
                                                    type="text"
                                                    className="cmp-pill-add__input"
                                                    value={productDraft[sub.id] || ''}
                                                    onChange={e => setProductDraft(p => ({ ...p, [sub.id]: e.target.value }))}
                                                    onKeyDown={e => handleProductKeyDown(e, cat.id, sub.id)}
                                                    placeholder="Ürün adı yaz, Enter ile ekle"
                                                />
                                                <button
                                                    type="button"
                                                    className="cmp-pill-add__btn"
                                                    onClick={() => addProduct(cat.id, sub.id, productDraft[sub.id])}
                                                    disabled={!(productDraft[sub.id] || '').trim()}
                                                    aria-label="Ürün ekle"
                                                >
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {cat.subs.length === 0 && (
                            <div className="cmp-cat-empty">
                                Alt kategori ekleyerek bu kategorinin içini doldurun.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanyCatalogSection;

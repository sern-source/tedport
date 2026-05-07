// Enes Doğanay | 6 Mayıs 2026: Ürün kataloğu editörü için state ve handler'lar
import { useState } from 'react';
import { uid, parseCatalog, serializeCatalog, mapCat, mapSub } from '../utils/companyPanelUtils';

// Enes Doğanay | 6 Mayıs 2026: Katalog state'i ve tüm düzenleme işlemlerini yönetir
export const useCatalogEditor = () => {
    const [catalog, setCatalog] = useState([]);
    const [productDraft, setProductDraft] = useState({});

    // Enes Doğanay | 6 Mayıs 2026: Ham veriyle kataloğu başlatır — useEffect'ten çağrılır
    const init = (raw) => {
        const parsed = parseCatalog(raw);
        setCatalog(parsed);
        setProductDraft({});
        return parsed;
    };

    const addCategory = () =>
        setCatalog(p => [...p, { id: uid(), name: '', subs: [] }]);

    const removeCategory = (cid) =>
        setCatalog(p => p.filter(c => c.id !== cid));

    const setCatName = (cid, v) =>
        setCatalog(p => mapCat(p, cid, c => ({ ...c, name: v })));

    const addSub = (cid) =>
        setCatalog(p => mapCat(p, cid, c => ({
            ...c, subs: [...c.subs, { id: uid(), name: '', products: [] }]
        })));

    const removeSub = (cid, sid) =>
        setCatalog(p => mapCat(p, cid, c => ({
            ...c, subs: c.subs.filter(s => s.id !== sid)
        })));

    const setSubName = (cid, sid, v) =>
        setCatalog(p => mapSub(p, cid, sid, s => ({ ...s, name: v })));

    const addProduct = (cid, sid, name) => {
        const t = String(name || '').trim();
        if (!t) return;
        setCatalog(p => mapSub(p, cid, sid, s => ({ ...s, products: [...s.products, { id: uid(), name: t }] })));
        setProductDraft(p => ({ ...p, [sid]: '' }));
    };

    const removeProduct = (cid, sid, pid) =>
        setCatalog(p => mapSub(p, cid, sid, s => ({
            ...s, products: s.products.filter(pr => pr.id !== pid)
        })));

    // Enes Doğanay | 6 Mayıs 2026: productDraft closure üzerinden okunur — JSX'ten sid verilir
    const handleProductKeyDown = (e, cid, sid) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addProduct(cid, sid, productDraft[sid]);
        }
    };

    return {
        catalog,
        productDraft,
        setProductDraft,
        init,
        getSerialized: () => serializeCatalog(catalog),
        handlers: {
            addCategory, removeCategory, setCatName,
            addSub, removeSub, setSubName,
            addProduct, removeProduct, handleProductKeyDown
        }
    };
};

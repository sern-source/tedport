// Enes Doğanay | 6 Mayıs 2026: Sol panel — ihale listesi, arama, filtreler, sayfalama
import React, { useState, useRef, useEffect } from 'react';
import { getTenderStatus, daysUntil, TOM_PAGE_SIZE } from '../constants/ihaleConstants';

// Enes Doğanay | 9 Mayıs 2026: Sidebar sıralama seçenekleri
const SIDEBAR_SORT_OPTIONS = [
    { value: 'date',         label: 'En Yeni',         icon: 'schedule' },
    { value: 'name-asc',    label: 'A → Z',           icon: 'sort_by_alpha' },
    { value: 'name-desc',   label: 'Z → A',           icon: 'sort_by_alpha' },
    { value: 'deadline',    label: 'Son Başvuru',      icon: 'event_busy' },
    { value: 'offers-desc', label: 'Teklif Sayısı',   icon: 'mail' },
];

const IhaleSidebar = ({ filteredTenders, selectedId, offersByTender, tenderUnreadSet, tenderSearch, setTenderSearch, tenderFilter, setTenderFilter, tenderPage, setTenderPage, sidebarSort, setSidebarSort, onSelectTender, onNewTender }) => {
    const totalPages = Math.ceil(filteredTenders.length / TOM_PAGE_SIZE);
    const visibleTenders = filteredTenders.slice((tenderPage - 1) * TOM_PAGE_SIZE, tenderPage * TOM_PAGE_SIZE);

    // Enes Doğanay | 9 Mayıs 2026: Sıralama dropdown — dışarı tıklayınca kapansın
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef(null);
    useEffect(() => {
        if (!sortOpen) return;
        const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [sortOpen]);

    const activeSortLabel = SIDEBAR_SORT_OPTIONS.find(o => o.value === sidebarSort)?.label || 'Sırala';

    return (
        <aside className="tom-sidebar">
            {/* Enes Doğanay | 7 Mayıs 2026: Sidebar head — compact row, + butonu sağda */}
            <div className="tom-sidebar__head">
                <div className="tom-sidebar__head-top">
                    <h2>İhale Listesi</h2>
                    <span className="tom-sidebar__count">{filteredTenders.length}</span>
                </div>
                <button className="tom-sidebar__add-btn" onClick={onNewTender} aria-label="Yeni ihale oluştur" data-tooltip="Yeni ihale oluştur" data-tooltip-pos="bottom">
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            <div className="tom-sidebar__search">
                <span className="material-symbols-outlined">search</span>
                <input value={tenderSearch} onChange={e => { setTenderSearch(e.target.value); setTenderPage(1); }} placeholder="İhale ara..." />
                {tenderSearch && <button className="tom-sidebar__clear" onClick={() => setTenderSearch('')}><span className="material-symbols-outlined">close</span></button>}
            </div>

            <div className="tom-sidebar__filters">
                {[
                    { key: 'all',    label: 'Tümü',    icon: 'apps' },
                    { key: 'active', label: 'Aktif',   icon: 'check_circle' },
                    { key: 'closed', label: 'Kapandı', icon: 'lock' },
                    { key: 'draft',  label: 'Taslak',  icon: 'edit_note' },
                ].map(f => (
                    <button key={f.key} className={`tom-pill${tenderFilter === f.key ? ' tom-pill--on' : ''}`} onClick={() => { setTenderFilter(f.key); setTenderPage(1); }}>
                        <span className="material-symbols-outlined">{f.icon}</span>{f.label}
                    </button>
                ))}
            </div>

            {/* Enes Doğanay | 9 Mayıs 2026: Sıralama dropdown */}
            <div className="tom-sidebar-sort-wrap" ref={sortRef}>
                <button type="button" className="tom-sidebar-sort-trigger" onClick={() => setSortOpen(p => !p)}>
                    <span className="material-symbols-outlined">sort</span>
                    <span className="tom-sidebar-sort-label">{activeSortLabel}</span>
                    <span className={`material-symbols-outlined tom-sidebar-sort-chevron${sortOpen ? ' open' : ''}`}>expand_more</span>
                </button>
                {sortOpen && (
                    <div className="tom-sidebar-sort-menu">
                        {SIDEBAR_SORT_OPTIONS.map(opt => (
                            <button key={opt.value} type="button"
                                className={`tom-sidebar-sort-option${sidebarSort === opt.value ? ' active' : ''}`}
                                onClick={() => { setSidebarSort(opt.value); setSortOpen(false); setTenderPage(1); }}>
                                <span className="material-symbols-outlined">{opt.icon}</span>
                                {opt.label}
                                {sidebarSort === opt.value && <span className="material-symbols-outlined tom-sidebar-sort-check">check</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="tom-sidebar__list">
                {visibleTenders.length === 0 ? (
                    <div className="tom-empty-mini">
                        <span className="material-symbols-outlined">search_off</span>
                        <p>İhale bulunamadı</p>
                    </div>
                ) : (
                    visibleTenders.map(t => {
                        const st = getTenderStatus(t.durum);
                        const cnt = (offersByTender[String(t.id)] || []).length;
                        const isActive = String(selectedId) === String(t.id);
                        const dl = daysUntil(t.son_basvuru_tarihi);
                        const hasUnread = tenderUnreadSet.has(String(t.id));
                        return (
                            <button key={t.id} className={`tom-tender-card${isActive ? ' tom-tender-card--active' : ''}${hasUnread ? ' tom-tender-card--has-unread' : ''}`} onClick={() => onSelectTender(t.id)}>
                                <div className={`tom-tender-card__bar tom-tender-card__bar--${st.tone}`} />
                                <div className="tom-tender-card__body">
                                    <div className="tom-tender-card__top">
                                        <h3>{t.baslik}</h3>
                                        <span className={`tom-badge tom-badge--${st.tone}`}><span className="material-symbols-outlined">{st.icon}</span>{st.label}</span>
                                    </div>
                                    <div className="tom-tender-card__meta">
                                        <span className={`tom-tender-card__offers tom-offer-count--${cnt === 0 ? 'zero' : cnt <= 3 ? 'amber' : 'green'}`}>
                                            <span className="material-symbols-outlined">mail</span>{cnt} teklif
                                        </span>
                                        {dl !== null && (
                                            <span className={dl <= 3 && dl >= 0 ? 'tom-deadline--urgent' : dl < 0 ? 'tom-deadline--past' : ''}>
                                                <span className="material-symbols-outlined">schedule</span>
                                                {dl > 0 ? `${dl} gün kaldı` : dl === 0 ? 'Son gün!' : 'Süre doldu'}
                                            </span>
                                        )}
                                        {hasUnread && <span className="tom-tender-card__unread-pill"><span className="material-symbols-outlined">forum</span>Yeni Mesaj</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
                {totalPages > 1 && (
                    <div className="pagination-bar pagination-bar--sidebar">
                        <button className="pagination-btn" disabled={tenderPage === 1} onClick={() => setTenderPage(p => p - 1)}><span className="material-symbols-outlined">chevron_left</span></button>
                        <span className="pagination-info">{tenderPage} / {totalPages}</span>
                        <button className="pagination-btn" disabled={tenderPage === totalPages} onClick={() => setTenderPage(p => p + 1)}><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default IhaleSidebar;

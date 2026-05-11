// Enes Doğanay | 6 Mayıs 2026: Teklifler toolbar — sıralama dropdown, filtreler, puan paneli
import React from 'react';

const SORT_OPTIONS = [
    { value: 'score', label: 'Puana Göre', icon: 'workspace_premium' },
    { value: 'price-asc', label: 'Fiyat ↑ (Artan)', icon: 'arrow_upward' },
    { value: 'price-desc', label: 'Fiyat ↓ (Azalan)', icon: 'arrow_downward' },
    { value: 'delivery', label: 'Teslim Süresi', icon: 'local_shipping' },
    { value: 'date', label: 'Tarih (Yeni)', icon: 'schedule' },
];

const SORT_LABEL_MAP = { score: 'Puana Göre', 'price-asc': 'Fiyat ↑ (Artan)', 'price-desc': 'Fiyat ↓ (Azalan)', delivery: 'Teslim Süresi', date: 'Tarih (Yeni)' };

const IhaleOffersToolbar = ({ displayCount, offerFilter, setOfferFilter, sortState, setSortState, sortDropdownRef, showScorePanel, setShowScorePanel, weights, onBalanceChange, setShowScoringInfo, onExportCSV }) => (
    <div className="tom-offers-section">
        <div className="tom-offers-toolbar">
            <div className="tom-offers-toolbar__left">
                <h3>Gelen Teklifler<span className="tom-count-badge">{displayCount}</span></h3>
            </div>
            <div className="tom-offers-toolbar__right">
                {displayCount > 0 && <button className="tom-btn-icon" onClick={onExportCSV} aria-label="Teklifleri CSV olarak indir" data-tooltip="CSV İndir" data-tooltip-pos="bottom"><span className="material-symbols-outlined">download</span></button>}
                <button className={`tom-btn-icon${showScorePanel ? ' tom-btn-icon--active' : ''}`} onClick={() => setShowScorePanel(p => !p)} aria-label="Puanlama Ayarları" data-tooltip="Puanlama Ayarları" data-tooltip-pos="bottom"><span className="material-symbols-outlined">tune</span></button>
                <button className="tom-btn-icon" onClick={() => setShowScoringInfo(true)} aria-label="Akıllı Puanlama Nasıl Çalışır?" data-tooltip="Puanlama Hakkında" data-tooltip-pos="bottom"><span className="material-symbols-outlined">help</span></button>
                <div className="tom-sort-wrap" ref={sortDropdownRef}>
                    <button type="button" className="tom-sort-trigger"
                        onClick={() => setSortState(p => ({ ...p, open: !p.open }))}
                        aria-expanded={sortState.open}
                        aria-haspopup="listbox"
                    >
                        <span className="material-symbols-outlined">sort</span>
                        <span className="tom-sort-label">{SORT_LABEL_MAP[sortState.value] || 'Sırala'}</span>
                        <span className={`material-symbols-outlined tom-sort-chevron${sortState.open ? ' open' : ''}`}>expand_more</span>
                    </button>
                    {sortState.open && (
                        <div className="tom-sort-menu">
                            {SORT_OPTIONS.map(opt => (
                                <button key={opt.value} type="button" className={`tom-sort-option${sortState.value === opt.value ? ' active' : ''}`} onClick={() => setSortState({ open: false, value: opt.value })}>
                                    <span className="material-symbols-outlined">{opt.icon}</span>{opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="tom-offers-filters">
            {[{ key: 'all', label: 'Tümü', icon: 'apps' }, { key: 'gonderildi', label: 'Değerlendiriliyor', icon: 'hourglass_top' }, { key: 'kabul', label: 'Kabul Edildi', icon: 'check_circle' }, { key: 'red', label: 'Reddedildi', icon: 'cancel' }, { key: 'shortlist', label: 'Favoriler', icon: 'star' }].map(f => (
                <button key={f.key} className={`tom-chip${offerFilter === f.key ? ' tom-chip--on' : ''}`} onClick={() => setOfferFilter(f.key)}>
                    <span className="material-symbols-outlined">{f.icon}</span>{f.label}
                </button>
            ))}
        </div>

        {showScorePanel && (
            <div className="tom-score-panel">
                <div className="tom-score-panel__head">
                    <div className="tom-score-panel__head-row">
                        <h4><span className="material-symbols-outlined">tune</span> Akıllı Puanlama Ağırlıkları</h4>
                        {/* Enes Doğanay | 9 Mayıs 2026: Sıfırlama butonu — varsayılan 50/50 ağırlığına döner */}
                        {(weights.price !== 50 || weights.delivery !== 50) && (
                            <button type="button" className="tom-score-reset-btn" onClick={() => onBalanceChange(50)} data-tooltip="Başlangıç konumuna getir" data-tooltip-pos="bottom">
                                <span className="material-symbols-outlined">restart_alt</span>Sıfırla
                            </button>
                        )}
                    </div>
                    <p>Kriterlerin ağırlığını kaydırarak teklifleri kendi önceliklerinize göre sıralayın.</p>
                </div>
                <div className="tom-balance-slider">
                    <div className="tom-balance-slider__labels">
                        <span className="tom-balance-slider__side tom-balance-slider__side--left"><span className="material-symbols-outlined">payments</span>Fiyat</span>
                        <span className="tom-balance-slider__side tom-balance-slider__side--right">Teslim<span className="material-symbols-outlined">local_shipping</span></span>
                    </div>
                    <div className="tom-balance-slider__track-wrap" style={{ '--thumb-pos': `${weights.price}%` }}>
                        <div className="tom-balance-slider__fill-left" style={{ width: `${weights.price}%` }} />
                        <div className="tom-balance-slider__fill-right" style={{ width: `${weights.delivery}%` }} />
                        <input type="range" min="0" max="100" value={weights.price} onChange={e => onBalanceChange(Number(e.target.value))} className="tom-balance-slider__input" />
                    </div>
                    <div className="tom-balance-slider__readout">
                        <span style={{ color: '#059669', fontWeight: 800 }}>{weights.price}%</span>
                        <span className="tom-balance-slider__divider">·</span>
                        <span style={{ color: '#d97706', fontWeight: 800 }}>{weights.delivery}%</span>
                    </div>
                </div>
            </div>
        )}
    </div>
);

export default IhaleOffersToolbar;

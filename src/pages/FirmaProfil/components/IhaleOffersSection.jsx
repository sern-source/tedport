// Enes Doğanay | 6 Mayıs 2026: Teklifler bölümü — toolbar + kart listesi + karşılaştırma
import React, { useState } from 'react';
import IhaleOffersToolbar from './IhaleOffersToolbar';
import IhaleOfferCard from './IhaleOfferCard';
import IhaleCompareTable from './IhaleCompareTable';
import OncekiTekliflerPopup from './OncekiTekliflerPopup';

const IhaleOffersSection = ({ displayOffers, compareList, compareIds, compareHintDismissed, setCompareHintDismissed, selectedTender, displayState, setDisplayState, sortState, setSortState, sortDropdownRef, unread, shortlist, notes, highlightRef, highlightState, statusDropdownId, setStatusDropdownId, showScoringInfo, setShowScoringInfo, offerModals }) => {
    const handleToggleExpand = (id) => setDisplayState(p => ({ ...p, expandedId: p.expandedId === id ? null : id }));
    const handleBalanceChange = (val) => setDisplayState(p => ({ ...p, weights: { price: val, delivery: 100 - val } }));
    // Enes Doğanay | 7 Mayıs 2026: Karşılaştırma temizle — offerModals üzerinden hook'a ilet
    const handleClearCompare = () => offerModals.clearCompare?.();
    // Enes Doğanay | 9 Mayıs 2026: Önceki teklifler popup state
    const [revisionOffer, setRevisionOffer] = useState(null);

    // Enes Doğanay | 7 Mayıs 2026: Hiç teklif yoksa (filtre yokken de boş) toolbar olmadan boş state göster
    const hasAnyOffer = offerModals.rawOfferCount > 0;
    if (!hasAnyOffer) return (
        <div className="tom-empty-state">
            <span className="material-symbols-outlined">inbox</span>
            <h3>{selectedTender?.durum === 'draft' ? 'Bu ihale henüz taslak' : 'Henüz teklif yok'}</h3>
            <p>{selectedTender?.durum === 'draft' ? 'İhaleyi yayınladıktan sonra teklifler burada görünecektir.' : 'Bu ihale için gelen teklif bulunmuyor.'}</p>
        </div>
    );

    return (
        <>
            <IhaleOffersToolbar
                displayCount={displayOffers.length}
                offerFilter={displayState.filter}
                setOfferFilter={(v) => setDisplayState(p => ({ ...p, filter: v, expandedId: null }))}
                sortState={sortState}
                setSortState={setSortState}
                sortDropdownRef={sortDropdownRef}
                showScorePanel={displayState.showScorePanel}
                setShowScorePanel={(fn) => setDisplayState(p => ({ ...p, showScorePanel: typeof fn === 'function' ? fn(p.showScorePanel) : fn }))}
                weights={displayState.weights}
                onBalanceChange={handleBalanceChange}
                showScoringInfo={showScoringInfo}
                setShowScoringInfo={setShowScoringInfo}
                onExportCSV={offerModals.exportOffersCSV}
            />

            {compareIds.length >= 2 && !compareHintDismissed && (
                <div className="tom-compare-hint">
                    {/* Enes Doğanay | 7 Mayıs 2026: CSS sınıf yapısına uygun hint bar */}
                    <div className="tom-compare-hint__icon">
                        <span className="material-symbols-outlined">compare_arrows</span>
                    </div>
                    <div className="tom-compare-hint__content">
                        <strong>{compareIds.length} teklif seçildi</strong>
                        <p>Karşılaştırma tablosunu aşağıda görebilirsiniz.</p>
                    </div>
                    <button type="button" onClick={() => { sessionStorage.setItem('tom_compare_hint_dismissed', '1'); setCompareHintDismissed(true); }} className="tom-compare-hint__dismiss" aria-label="Kapat"><span className="material-symbols-outlined">close</span></button>
                </div>
            )}

            {/* Enes Doğanay | 7 Mayıs 2026: Filtre sonucu boş ama teklifler var — toolbar'ı koru, cool boş state göster */}
            {displayOffers.length === 0 && (() => {
                const FILTER_LABELS = { shortlist: { label: 'Favoriler', icon: 'star' }, kabul: { label: 'Kabul Edildi', icon: 'check_circle' }, red: { label: 'Reddedildi', icon: 'cancel' }, gonderildi: { label: 'Değerlendiriliyor', icon: 'hourglass_top' } };
                const f = FILTER_LABELS[displayState.filter];
                return (
                    <div className="tom-filter-empty">
                        <div className="tom-filter-empty__icon">
                            <span className="material-symbols-outlined">{f?.icon || 'filter_list_off'}</span>
                        </div>
                        <div className="tom-filter-empty__body">
                            <h4>
                                {f ? <><span className="tom-filter-empty__chip"><span className="material-symbols-outlined">{f.icon}</span>{f.label}</span> filtresinde teklif yok</> : 'Bu filtrede teklif yok'}
                            </h4>
                            <p>Diğer teklifleri görmek için filtreyi değiştirin.</p>
                        </div>
                        <button className="tom-filter-empty__reset" onClick={() => setDisplayState(p => ({ ...p, filter: 'all' }))}>
                            <span className="material-symbols-outlined">apps</span>Tümünü Göster
                        </button>
                    </div>
                );
            })()}

            <div className="tom-offer-list">
                {displayOffers.map((offer, idx) => (
                    <IhaleOfferCard
                        key={offer.id}
                        offer={offer}
                        idx={idx}
                        isExpanded={displayState.expandedId === offer.id}
                        isCompare={compareIds.map(String).includes(String(offer.id))}
                        compareCount={compareIds.length}
                        isHighlighted={highlightState.offerId === offer.id}
                        isBest={idx === 0 && displayOffers.length > 1}
                        isShort={shortlist.map(String).includes(String(offer.id))}
                        isUpdating={offerModals.statusUpdating === offer.id}
                        highlightRef={highlightRef}
                        unreadTenderChatIds={unread.ids}
                        unreadTenderChatCounts={unread.counts}
                        notes={notes}
                        compareHintDismissed={compareHintDismissed}
                        statusDropdownId={statusDropdownId}
                        setStatusDropdownId={setStatusDropdownId}
                        onToggleExpand={() => handleToggleExpand(offer.id)}
                        onToggleShortlist={() => offerModals.toggleShortlist(offer.id)}
                        onToggleCompare={() => offerModals.toggleCompare(offer.id)}
                        onOpenContact={() => offerModals.openContact(offer)}
                        onOpenChat={() => offerModals.openTenderChat(offer)}
                        onOpenFile={() => offerModals.openFile(offer)}
                        onAccept={() => offerModals.handleAcceptOffer(offer.id)}
                        onReject={() => offerModals.handleRejectOffer(offer.id)}
                        onStatusConfirm={offerModals.statusConfirm}
                        onNoteChange={offerModals.handleNoteChange}
                        onOpenRevisions={setRevisionOffer}
                    />
                ))}
            </div>

            {compareList.length >= 2 && (
                <IhaleCompareTable
                    compareList={compareList}
                    weights={displayState.weights}
                    onClear={handleClearCompare}
                />
            )}

            {/* Enes Doğanay | 9 Mayıs 2026: Önceki teklifler popup */}
            {revisionOffer && (
                <OncekiTekliflerPopup
                    offer={revisionOffer}
                    onClose={() => setRevisionOffer(null)}
                />
            )}
        </>
    );
};

export default IhaleOffersSection;

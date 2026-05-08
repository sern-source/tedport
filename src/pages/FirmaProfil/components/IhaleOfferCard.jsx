// Enes Doğanay | 6 Mayıs 2026: Tekil teklif kartı — özet satır + genişletilmiş detay
import React from 'react';
import IhaleScoreRing from './IhaleScoreRing';
import { getOfferStatus, renderOfferAmount, formatMoney, timeAgo } from '../constants/ihaleConstants';

const IhaleOfferCard = ({ offer, idx, isExpanded, isCompare, compareCount, isHighlighted, isBest, isShort, isUpdating, highlightRef, unreadTenderChatIds, unreadTenderChatCounts, notes, onToggleExpand, onToggleShortlist, onToggleCompare, compareHintDismissed, onOpenContact, onOpenChat, onOpenFile, onAccept, onReject, statusDropdownId, setStatusDropdownId, onStatusConfirm, onNoteChange }) => {
    const st = getOfferStatus(offer.durum);
    const kalemler = Array.isArray(offer.kalemler) ? offer.kalemler : [];
    const offerDurum = String(offer.durum || '').toLowerCase();

    return (
        <div ref={isHighlighted ? highlightRef : null} className={`tom-offer-card${isExpanded ? ' tom-offer-card--expanded' : ''}${isCompare ? ' tom-offer-card--compare' : ''}${isHighlighted ? ' tom-offer-card--highlight' : ''}${isBest ? ' tom-offer-card--best' : ''}`}>
            <div className={`tom-offer-card__bar tom-offer-card__bar--${st.tone}`} />
            {idx < 3 && <div className={`tom-rank tom-rank--${idx + 1}`}>#{idx + 1}</div>}
            {isBest && <div className="tom-best-badge"><span className="material-symbols-outlined">emoji_events</span>En İyi Teklif</div>}
            <div className="tom-offer-card__body">
                <div className={`tom-offer-card__main${unreadTenderChatIds?.has(offer.id) ? ' tom-offer-card__main--has-unread' : ''}`} onClick={onToggleExpand}>
                    <IhaleScoreRing score={offer._score.overall} />
                    <div className="tom-offer-card__info">
                        <div className="tom-offer-card__company"><strong>{offer.gonderen_firma_adi || offer.gonderen_ad_soyad}</strong><span className="tom-offer-card__email">{offer.gonderen_email}</span></div>
                        <div className="tom-offer-card__metrics">
                            {unreadTenderChatIds?.has(offer.id) && <div className="tom-offer-card__unread-msg-indicator"><span className="material-symbols-outlined">forum</span>{(unreadTenderChatCounts?.[offer.id] || 0) > 0 ? unreadTenderChatCounts[offer.id] : ''} Yeni Mesaj</div>}
                            <div className="tom-metric"><span className="material-symbols-outlined">payments</span><strong>{renderOfferAmount(offer)}</strong>{offer.kdv_dahil !== undefined && <small>{offer.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</small>}</div>
                            <div className="tom-metric"><span className="material-symbols-outlined">local_shipping</span><strong>{offer.teslim_suresi_gun ? `${offer.teslim_suresi_gun} gün` : '—'}</strong></div>
                            <span className={`tom-offer-status tom-offer-status--${st.tone}`}><span className="material-symbols-outlined">{st.icon}</span>{st.label}</span>
                            <span className="tom-offer-card__time">{timeAgo(offer.created_at)}</span>
                        </div>
                    </div>
                    <div className="tom-offer-card__actions" onClick={e => e.stopPropagation()}>
                        <button className={`tom-icon-btn${isShort ? ' tom-icon-btn--starred' : ''}`} onClick={onToggleShortlist} data-tooltip={isShort ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}><span className="material-symbols-outlined">{isShort ? 'star' : 'star_outline'}</span></button>
                        <button className="tom-icon-btn tom-icon-btn--contact" onClick={onOpenContact} data-tooltip="Profili Görüntüle"><span className="material-symbols-outlined">person_search</span></button>
                        {/* Enes Doğanay | 7 Mayıs 2026: Karşılaştır butonu — seçiliyken dolu mor+yazı, limitte disable */}
                        <button
                            className={`tom-compare-btn${isCompare ? ' tom-compare-btn--active' : ''}${!isCompare && !compareHintDismissed ? ' tom-compare-btn--hint' : ''}`}
                            onClick={onToggleCompare}
                            disabled={!isCompare && compareCount >= 3}
                        >
                            <span className="material-symbols-outlined">{isCompare ? 'done' : 'compare_arrows'}</span>
                            <span className="tom-compare-btn__text">{isCompare ? 'Seçildi' : 'Karşılaştır'}</span>
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="tom-offer-card__detail">
                        <div className="tom-score-breakdown"><h4>Puan Detayı</h4>
                            <div className="tom-score-bars">
                                {[{ label: 'Fiyat', val: offer._score.price, cls: 'green' }, { label: 'Teslim', val: offer._score.delivery, cls: 'amber' }].map(b => (
                                    <div key={b.label} className="tom-score-bar"><span>{b.label}</span><div className="tom-bar"><div className={`tom-bar__fill tom-bar__fill--${b.cls}`} style={{ width: `${b.val}%` }} /></div><strong>{b.val}</strong></div>
                                ))}
                            </div>
                        </div>
                        {offer.teslim_aciklamasi && <div className="tom-detail-row"><span className="material-symbols-outlined">info</span><div><small>Teslim Açıklaması</small><p>{offer.teslim_aciklamasi}</p></div></div>}
                        {offer.not_field && <div className="tom-detail-row"><span className="material-symbols-outlined">sticky_note_2</span><div><small>Tedarikçi Notu</small><p>{offer.not_field}</p></div></div>}
                        {kalemler.length > 0 && (
                            <div className="tom-kalemler"><h4><span className="material-symbols-outlined">list_alt</span>Teklif Kalemleri ({kalemler.length})</h4>
                                <div className="tom-kalemler__wrap">
                                    <table><thead><tr><th>Madde</th><th>Miktar</th><th>Birim Fiyat</th><th>Toplam</th><th>Açıklama</th></tr></thead>
                                        <tbody>{kalemler.map((k, i) => { const kCur = k.para_birimi || offer.para_birimi || 'TRY'; const kTotal = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0); return (<tr key={i}><td><strong>{k.madde || '—'}</strong></td><td>{k.miktar || '—'}</td><td>{k.birim_fiyat ? formatMoney(Number(k.birim_fiyat), kCur) : '—'}</td><td>{kTotal ? formatMoney(kTotal, kCur) : '—'}</td><td>{k.aciklama || k.not || '—'}</td></tr>); })}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <div className="tom-offer-card__footer">
                            {(offer.ek_dosya_url || offer.ek_dosya_adi) && <button className="tom-btn tom-btn--outline" onClick={onOpenFile}><span className="material-symbols-outlined">attach_file</span>{offer.ek_dosya_adi || 'Ek Dosya'}</button>}
                            <button className={`tom-btn tom-btn--chat${unreadTenderChatIds?.has(offer.id) ? ' tom-btn--chat-unread' : ''}`} onClick={e => { e.stopPropagation(); onOpenChat(); }}>
                                <span className="material-symbols-outlined">forum</span>Mesaj Gönder
                                {unreadTenderChatIds?.has(offer.id) && <span className="tom-chat-unread-badge">{unreadTenderChatCounts?.[offer.id] || ''}</span>}
                            </button>
                            {offerDurum === 'kabul' && (<div className="tom-offer-card__footer-right"><button className="tom-btn tom-btn--outline" onClick={onOpenContact}><span className="material-symbols-outlined">contact_phone</span>İletişime Geç</button><div className="tom-status-dropdown-wrap"><button className="tom-btn tom-btn--status-change" onClick={() => setStatusDropdownId(statusDropdownId === offer.id ? null : offer.id)}><span className="material-symbols-outlined">swap_horiz</span>Statüyü Değiştir</button>{statusDropdownId === offer.id && <div className="tom-status-dropdown"><button onClick={() => { onStatusConfirm(offer.id, 'gonderildi'); setStatusDropdownId(null); }}><span className="material-symbols-outlined" style={{ color: '#2563eb' }}>hourglass_top</span>Değerlendiriliyor</button><button onClick={() => { onReject(offer.id); setStatusDropdownId(null); }}><span className="material-symbols-outlined" style={{ color: '#dc2626' }}>cancel</span>Reddedildi</button></div>}</div></div>)}
                            {offerDurum === 'red' && (<div className="tom-offer-card__footer-right"><div className="tom-status-dropdown-wrap"><button className="tom-btn tom-btn--status-change" onClick={() => setStatusDropdownId(statusDropdownId === offer.id ? null : offer.id)}><span className="material-symbols-outlined">swap_horiz</span>Statüyü Değiştir</button>{statusDropdownId === offer.id && <div className="tom-status-dropdown"><button onClick={() => { onStatusConfirm(offer.id, 'gonderildi'); setStatusDropdownId(null); }}><span className="material-symbols-outlined" style={{ color: '#2563eb' }}>hourglass_top</span>Değerlendiriliyor</button><button onClick={() => { onAccept(offer.id); setStatusDropdownId(null); }}><span className="material-symbols-outlined" style={{ color: '#059669' }}>check_circle</span>Kabul Et</button></div>}</div></div>)}
                            {!['kabul', 'red'].includes(offerDurum) && (<div className="tom-offer-card__footer-right"><button className="tom-btn tom-btn--reject" onClick={() => onReject(offer.id)} disabled={isUpdating}><span className="material-symbols-outlined">close</span>Reddet</button><button className="tom-btn tom-btn--accept" onClick={() => onAccept(offer.id)} disabled={isUpdating}><span className="material-symbols-outlined">check</span>Kabul Et</button></div>)}
                        </div>
                        <div className="tom-my-note"><label><span className="material-symbols-outlined">edit_note</span>Notum</label><textarea placeholder="Bu teklif için özel notunuzu yazın..." value={notes?.[String(offer.id)] || ''} onChange={e => onNoteChange(offer.id, e.target.value)} rows={3} /></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IhaleOfferCard;

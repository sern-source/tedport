// Enes Doğanay | 8 Mayıs 2026: Karşılaştırma tablosu — kart + tablo tasarımı
import React from 'react';
import { renderOfferAmount, formatDate } from '../constants/ihaleConstants';

// Enes Doğanay | 8 Mayıs 2026: Trabzonspor bordo ve mavisi
const AVATAR_COLORS = ['#6b0c22', '#0c3b8c', '#0d9488', '#d97706', '#7c3aed'];

const getInitials = name => {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

const scoreColor = s => s >= 70 ? '#059669' : s >= 40 ? '#d97706' : '#dc2626';

const ScoreRing = ({ score, color }) => {
    const r = 20, circ = 2 * Math.PI * r;
    const filled = (score / 100) * circ;
    return (
        <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r={r} fill="none" stroke="var(--ring-track, #e2e8f0)" strokeWidth="3.5" />
            <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="3.5"
                strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 26 26)" />
        </svg>
    );
};

const ROWS = [
    { key: 'overall',  label: 'Genel Puan',      icon: 'leaderboard',    type: 'score' },
    { key: 'price',    label: 'Fiyat Skoru',      icon: 'payments',       type: 'score' },
    { key: 'delivery', label: 'Teslim Skoru',     icon: 'local_shipping', type: 'score' },
    { key: 'amount',   label: 'Fiyat',            icon: 'sell',           type: 'amount' },
    { key: 'days',     label: 'Teslim Süresi',    icon: 'schedule',       type: 'days' },
    { key: 'date',     label: 'Teklif Tarihi',    icon: 'calendar_today', type: 'date' },
    { key: 'kalemler', label: 'Teklif Kalemleri', icon: 'list_alt',       type: 'kalemler' },
];

const IhaleCompareTable = ({ compareList, onClear }) => {
    if (compareList.length < 2) return null;

    const scores = compareList.map(o => ({
        overall:  o._score?.overall  ?? 0,
        price:    o._score?.price    ?? 0,
        delivery: o._score?.delivery ?? 0,
    }));
    const best = {
        overall:  Math.max(...scores.map(s => s.overall)),
        price:    Math.max(...scores.map(s => s.price)),
        delivery: Math.max(...scores.map(s => s.delivery)),
        days:     Math.min(...compareList.filter(o => o.teslim_suresi_gun).map(o => o.teslim_suresi_gun)),
    };

    return (
        <div className="tom-compare">
            <div className="tom-compare__head">
                <h3><span className="material-symbols-outlined">compare_arrows</span>Karşılaştırma</h3>
                <button type="button" className="tom-compare__clear" onClick={onClear}>
                    <span className="material-symbols-outlined">close</span>Karşılaştırmayı Kapat
                </button>
            </div>
            <div className="tom-cmp" style={{ '--cmp-cols': compareList.length }}>
                <div className="tom-cmp__cards">
                    {compareList.map((o, idx) => {
                        const name = o.gonderen_firma_adi || o.gonderen_ad_soyad || o.gonderen_email;
                        const sc = scores[idx];
                        const isWinner = sc.overall === best.overall && best.overall > 0;
                        const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                        const ringColor = scoreColor(sc.overall);
                        return (
                            <div key={o.id} className={`tom-cmp__card${isWinner ? ' tom-cmp__card--winner' : ''}`}>
                                {isWinner && (
                                    <div className="tom-cmp__winner-badge">
                                        <span className="material-symbols-outlined">emoji_events</span>En İyi
                                    </div>
                                )}
                                <div className="tom-cmp__avatar" style={{ background: color }}>{getInitials(name)}</div>
                                <div className="tom-cmp__card-name" title={name}>{name}</div>
                                <div className="tom-cmp__ring-wrap">
                                    <ScoreRing score={sc.overall} color={ringColor} />
                                    <span className="tom-cmp__ring-val" style={{ color: ringColor }}>{sc.overall}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="tom-cmp__table">
                    {ROWS.map((row, ri) => (
                        <div key={row.key} className={`tom-cmp__row${ri % 2 === 1 ? ' tom-cmp__row--alt' : ''}`}>
                            <div className="tom-cmp__lbl">
                                <span className="material-symbols-outlined tom-cmp__lbl-icon-ms">{row.icon}</span>
                                <span>{row.label}</span>
                            </div>
                            {compareList.map((o, idx) => {
                                if (row.type === 'score') {
                                    const s = o._score?.[row.key] ?? 0;
                                    const isBest = s === best[row.key] && best[row.key] > 0;
                                    const col = scoreColor(s);
                                    return (
                                        <div key={o.id} className={`tom-cmp__cell${isBest ? ' tom-cmp__cell--best' : ''}`}>
                                            <div className="tom-cmp__score-row">
                                                <span className={`tom-cmp__score-val${isBest ? ' tom-cmp__score-val--best' : ''}`}>{s}</span>
                                                {isBest && <span className="material-symbols-outlined tom-cmp__check">check</span>}
                                            </div>
                                            <div className="tom-cmp__bar-track">
                                                <div className="tom-cmp__bar-fill" style={{ width: `${s}%`, background: col }} />
                                            </div>
                                        </div>
                                    );
                                }
                                if (row.type === 'amount') {
                                    return (
                                        <div key={o.id} className="tom-cmp__cell">
                                            <span className="tom-cmp__amount-val">{renderOfferAmount(o)}</span>
                                            {o.kdv_dahil != null && <span className="tom-cmp__kdv-tag">{o.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</span>}
                                        </div>
                                    );
                                }
                                if (row.type === 'days') {
                                    const isBest = o.teslim_suresi_gun === best.days;
                                    return (
                                        <div key={o.id} className={`tom-cmp__cell${isBest ? ' tom-cmp__cell--best' : ''}`}>
                                            <div className="tom-cmp__days-row">
                                                <span className="tom-cmp__plain-val">{o.teslim_suresi_gun ? `${o.teslim_suresi_gun} gün` : '—'}</span>
                                                {isBest && <span className="tom-cmp__fast-tag">En Hızlı</span>}
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={o.id} className="tom-cmp__cell">
                                        <span className="tom-cmp__plain-val">
                                            {row.type === 'date' ? formatDate(o.created_at) : (Array.isArray(o.kalemler) ? `${o.kalemler.length} kalem` : '—')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IhaleCompareTable;

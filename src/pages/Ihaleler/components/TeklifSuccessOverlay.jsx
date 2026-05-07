// Enes Doğanay | 6 Mayıs 2026: Teklif işlem başarı ekranı
import React from 'react';

const SUCCESS_MAP = {
    draft:         { cls: 'draft',     icon: 'draft',          title: 'Taslak Kaydedildi!',         msg: 'Teklifiniz taslak olarak kaydedildi. İstediğiniz zaman düzenleyip gönderebilirsiniz.' },
    update:        { cls: '',          icon: 'check_circle',   title: 'Teklifiniz Güncellendi!',     msg: 'Teklifiniz başarıyla güncellendi. İhale sahibi güncel teklifinizi görebilir.' },
    withdrawn:     { cls: 'withdrawn', icon: 'remove_circle',  title: 'Teklifiniz Geri Çekildi',     msg: 'Teklifiniz bu ihaleden başarıyla geri çekildi.' },
    draft_deleted: { cls: 'withdrawn', icon: 'delete',         title: 'Taslak Silindi',              msg: 'Taslak teklifiniz başarıyla silindi.' },
    default:       { cls: '',          icon: 'check_circle',   title: 'Teklifiniz Gönderildi!',      msg: 'Teklifiniz ihale sahibine başarıyla iletildi. Durumunu profil sayfanızdan takip edebilirsiniz.' },
};

const TeklifSuccessOverlay = ({ teklifSuccess, setTeklifSuccess }) => {
    if (!teklifSuccess) return null;
    const { cls, icon, title, msg } = SUCCESS_MAP[teklifSuccess] || SUCCESS_MAP.default;
    return (
        <div className="teklif-success-overlay" onClick={() => setTeklifSuccess(false)}>
            <div className={`teklif-success-card${cls ? ` teklif-success-card--${cls}` : ''}`} onClick={e => e.stopPropagation()}>
                <div className={`teklif-success-card__icon${cls ? ` teklif-success-card__icon--${cls}` : ''}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h3>{title}</h3>
                <p>{msg}</p>
                <button className="teklif-success-card__btn" onClick={() => setTeklifSuccess(false)}>Tamam</button>
            </div>
        </div>
    );
};

export default TeklifSuccessOverlay;

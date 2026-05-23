// Enes Doğanay | 6 Mayıs 2026: Ticari elektronik ileti onay modalı
import React from 'react';
import './MarketingModal.css';

const MarketingModal = ({ onClose, onAccept }) => (
    <div className="reg-modal-overlay" onClick={onClose}>
        <div className="reg-modal" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-header">
                <div className="reg-modal-header-inner">
                    <span className="material-symbols-outlined reg-modal-icon reg-modal-icon--orange">mark_email_read</span>
                    <h2>Ticari Elektronik İleti Onay Metni</h2>
                </div>
                <button type="button" className="reg-modal-close" onClick={onClose} aria-label="Kapat">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="reg-modal-body">
                <div className="reg-modal-law-badge">
                    <span className="material-symbols-outlined">balance</span>
                    <span>6563 sayılı Ticari İletişim ve Ticari Elektronik İletiler Hakkında Kanun kapsamında hazırlanmıştır.</span>
                </div>
                <section className="reg-modal-section">
                    <h3>Açık Rıza Beyanı</h3>
                    <p>Tarafıma, Tedport tarafından sunulan ürün ve hizmetlere ilişkin kampanya, tanıtım, fırsat ve bilgilendirme içeriklerinin e-posta ve/veya SMS yoluyla gönderilmesini kabul ediyorum.</p>
                    <p>Bu kapsamında kişisel verilerimin iletişim faaliyetlerinin yürütülmesi amacıyla işlenmesine izin veriyorum.</p>
                </section>
                <div className="reg-modal-notice reg-modal-notice--green">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Bu onay tamamen isteğe bağlıdır. Dilediğiniz zaman <strong>Profil → Bildirim Tercihleri → Pazarlama İletişimi</strong> toggle'ından anında geri alabilirsiniz.</span>
                </div>
            </div>
            <div className="reg-modal-footer reg-modal-footer--split">
                <button type="button" className="reg-modal-decline-btn" onClick={onClose}>Hayır, Teşekkürler</button>
                <button type="button" className="reg-modal-accept-btn" onClick={onAccept}>
                    <span className="material-symbols-outlined">check</span>
                    Evet, Kabul Ediyorum
                </button>
            </div>
        </div>
    </div>
);

export default MarketingModal;

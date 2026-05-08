// Enes Doğanay | 6 Mayıs 2026: Teklif silme onay modal — MyOffersTab alt bileşeni
import React from 'react';

const MyOffersDeleteModal = ({ deleteConfirm, setDeleteConfirm, deleting, handleDeleteOffer }) => {
    if (!deleteConfirm) return null;
    const isDraft = deleteConfirm.durum === 'taslak';
    return (
        <div className="mop-delete-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
            {/* Enes Doğanay | 8 Mayıs 2026: role=dialog + aria-modal — modal semantik erişilebilirlik */}
            <div
                className="mop-delete-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mop-delete-title"
            >
                <div className="mop-delete-modal__icon">
                    <span className="material-symbols-outlined">warning</span>
                </div>
                <h3 id="mop-delete-title">{isDraft ? 'Taslağı Silmek İstediğinize Emin Misiniz?' : 'Teklifinizi Silmek İstediğinize Emin Misiniz?'}</h3>
                <p>Bu işlem geri alınamaz. {isDraft ? 'Taslak teklifiniz' : 'Teklifiniz'} bu ihaleden tamamen silinecektir.</p>
                <div className="mop-delete-modal__actions">
                    <button className="mop-delete-modal__btn mop-delete-modal__btn--cancel" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                        Vazgeç
                    </button>
                    <button className="mop-delete-modal__btn mop-delete-modal__btn--confirm" onClick={handleDeleteOffer} disabled={deleting}>
                        <span className="material-symbols-outlined">delete</span>
                        {deleting ? 'Siliniyor…' : 'Evet, Sil'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyOffersDeleteModal;

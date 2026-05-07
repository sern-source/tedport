// Enes Doğanay | 6 Mayıs 2026: Teklif silme onay modal — MyOffersTab alt bileşeni
import React from 'react';

const MyOffersDeleteModal = ({ deleteConfirm, setDeleteConfirm, deleting, handleDeleteOffer }) => {
    if (!deleteConfirm) return null;
    const isDraft = deleteConfirm.durum === 'taslak';
    return (
        <div className="mop-delete-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
            <div className="mop-delete-modal" onClick={e => e.stopPropagation()}>
                <div className="mop-delete-modal__icon">
                    <span className="material-symbols-outlined">warning</span>
                </div>
                <h3>{isDraft ? 'Taslağı Silmek İstediğinize Emin Misiniz?' : 'Teklifinizi Silmek İstediğinize Emin Misiniz?'}</h3>
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

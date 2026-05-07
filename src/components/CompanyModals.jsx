// Enes Doğanay | 6 Mayıs 2026: Firma silme onay ve kaydetme başarı modalleri
import React from 'react';
import './CompanyModals.css';

/* Enes Doğanay | 6 Mayıs 2026: showDeleteConfirm, setShowDeleteConfirm, deleting, handleDelete, showSaveSuccess, setShowSaveSuccess, firmaAdi */
const CompanyModals = ({ showDeleteConfirm, setShowDeleteConfirm, deleting, handleDelete, showSaveSuccess, setShowSaveSuccess, firmaAdi }) => {
    return (
        <>
            {showDeleteConfirm && (
                <div className="cmp-success-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="cmp-success-card cmp-delete-card" onClick={e => e.stopPropagation()}>
                        <div className="cmp-success-card__icon cmp-delete-card__icon">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        <h3>Firmayı Sil</h3>
                        <p>Bu firma ve ilişkili tüm veriler kalıcı olarak silinecektir. Bu işlem geri alınamaz.</p>
                        <p className="cmp-delete-card__name">{firmaAdi}</p>
                        <div className="cmp-delete-card__actions">
                            <button className="cmp-btn cmp-btn--ghost-modal" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                                Vazgeç
                            </button>
                            <button className="cmp-btn cmp-btn--delete" disabled={deleting} onClick={handleDelete}>
                                <span className="material-symbols-outlined">
                                    {deleting ? 'progress_activity' : 'delete_forever'}
                                </span>
                                {deleting ? 'Siliniyor…' : 'Evet, Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSaveSuccess && (
                <div className="cmp-success-overlay" onClick={() => setShowSaveSuccess(false)}>
                    <div className="cmp-success-card" onClick={e => e.stopPropagation()}>
                        <div className="cmp-success-card__icon">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <h3>Değişiklikler Kaydedildi!</h3>
                        <p>Firma bilgileriniz başarıyla güncellendi.</p>
                        <button className="cmp-success-card__btn" onClick={() => setShowSaveSuccess(false)}>Tamam</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CompanyModals;

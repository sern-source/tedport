// Enes Doğanay | 7 Mayıs 2026: Profil sayfası modalları — şikayet (SharedReportModal), favoriden çıkar, liste sil
import React from 'react';
import SharedReportModal from '../../../components/SharedReportModal';

const ProfileModals = ({ quotesData, favData }) => {
    const { reportModal, setReportModal, reportNeden, setReportNeden, reportAciklama, setReportAciklama, reportSending, submitReport, reportSuccess } = quotesData;
    const { confirmDelete, setConfirmDelete, handleRemoveFavorite, confirmDeleteList, setConfirmDeleteList, handleDeleteList } = favData;

    return (
        <>
            {/* Enes Doğanay | 7 Mayıs 2026: Ortak şikayet modal — z-index 10100 */}
            <SharedReportModal
                open={!!reportModal}
                mesajIcerik={reportModal?.mesajIcerik}
                neden={reportNeden}
                aciklama={reportAciklama}
                sending={reportSending}
                success={reportSuccess}
                onClose={() => setReportModal(null)}
                onChangeNeden={neden => setReportNeden(neden)}
                onChangeAciklama={aciklama => setReportAciklama(aciklama)}
                onSubmit={submitReport}
            />
            {confirmDelete && (
                <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon"><span className="material-symbols-outlined">bookmark_remove</span></div>
                        <h3>Favorilerden Çıkar</h3>
                        <p><strong>{confirmDelete.name}</strong> firmasını favorilerinizden çıkarmak istediğinize emin misiniz?</p>
                        <div className="confirm-actions">
                            <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>Vazgeç</button>
                            <button className="confirm-delete" onClick={() => handleRemoveFavorite(confirmDelete.id)}>Evet, Çıkar</button>
                        </div>
                    </div>
                </div>
            )}
            {confirmDeleteList && (
                <div className="confirm-overlay" onClick={() => setConfirmDeleteList(null)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon danger"><span className="material-symbols-outlined">folder_delete</span></div>
                        <h3>Listeyi Sil</h3>
                        <p><strong>{confirmDeleteList.name}</strong> listesi silinecek. İçindeki {confirmDeleteList.count} favori firma korunacak ve <strong>Tüm Favoriler</strong> alanında kalacak.</p>
                        <div className="confirm-actions">
                            <button className="confirm-cancel" onClick={() => setConfirmDeleteList(null)}>Vazgeç</button>
                            <button className="confirm-delete" onClick={() => handleDeleteList(confirmDeleteList.id)}>Evet, Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileModals;


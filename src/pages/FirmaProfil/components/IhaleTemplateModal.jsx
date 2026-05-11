// Enes Doğanay | 11 Mayıs 2026: İhale şablonları modalı — kaydet ve seç
import React from 'react';
import './IhaleTemplateModal.css';

// Enes Doğanay | 11 Mayıs 2026: Şablon listesi öğesi
const TemplateItem = ({ t, deleteConfirmId, setDeleteConfirmId, onApply, onDelete }) => (
    <div className="itm-item">
        <div className="itm-item__info">
            <span className="itm-item__name">{t.sablon_adi}</span>
            {t.baslik && <span className="itm-item__title">{t.baslik}</span>}
            <div className="itm-item__meta">
                {t.teslim_il && (
                    <span>
                        <span className="material-symbols-outlined">location_on</span>
                        {t.teslim_il}{t.teslim_ilce ? ` / ${t.teslim_ilce}` : ''}
                    </span>
                )}
                {Array.isArray(t.gereksinimler) && t.gereksinimler.length > 0 && (
                    <span>
                        <span className="material-symbols-outlined">checklist</span>
                        {t.gereksinimler.length} gereksinim
                    </span>
                )}
            </div>
        </div>
        <div className="itm-item__actions">
            {deleteConfirmId === t.id ? (
                <>
                    <span className="itm-item__confirm-text">Silinsin mi?</span>
                    <button type="button" className="itm-btn itm-btn--confirm-del" onClick={() => onDelete(t.id)}>Evet</button>
                    <button type="button" className="itm-btn itm-btn--cancel-del" onClick={() => setDeleteConfirmId(null)}>Hayır</button>
                </>
            ) : (
                <>
                    <button type="button" className="itm-btn itm-btn--apply" onClick={() => onApply(t)}>
                        <span className="material-symbols-outlined">download</span>
                        Uygula
                    </button>
                    <button type="button" className="itm-btn itm-btn--del" onClick={() => setDeleteConfirmId(t.id)} title="Şablonu sil">
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </>
            )}
        </div>
    </div>
);

const IhaleTemplateModal = ({
    showModal, modalMode, templates, loading, error,
    saveName, setSaveName, saving, saveSuccess, deleteConfirmId, setDeleteConfirmId,
    onClose, onApplyTemplate, onSaveTemplate, onDeleteTemplate,
    currentForm,
}) => {
    if (!showModal) return null;

    return (
        <div className="itm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="itm-modal">
                {/* Enes Doğanay | 11 Mayıs 2026: Modal başlık */}
                <div className="itm-modal__head">
                    <span className="material-symbols-outlined itm-modal__icon">
                        {modalMode === 'save' ? 'bookmark_add' : 'bookmarks'}
                    </span>
                    <h3>{modalMode === 'save' ? 'Şablon Olarak Kaydet' : 'Şablonlarım'}</h3>
                    <button type="button" className="itm-modal__close" onClick={onClose} aria-label="Kapat">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {error && <div className="itm-error"><span className="material-symbols-outlined">error</span>{error}</div>}

                {/* Enes Doğanay | 11 Mayıs 2026: Kaydetme başarı durumu */}
                {saveSuccess && (
                    <div className="itm-save-success">
                        <span className="material-symbols-outlined itm-save-success__icon">check_circle</span>
                        <p>Şablon başarıyla kaydedildi!</p>
                    </div>
                )}

                {/* Enes Doğanay | 11 Mayıs 2026: Kaydetme modu */}
                {!saveSuccess && modalMode === 'save' ? (
                    <div className="itm-save-form">
                        {currentForm?.baslik && (
                            <div className="itm-save-preview">
                                <span className="material-symbols-outlined">description</span>
                                <div className="itm-save-preview__text">
                                    <span className="itm-save-preview__title">{currentForm.baslik}</span>
                                    {currentForm.gereksinimler?.length > 0 && (
                                        <span className="itm-save-preview__badge">
                                            {currentForm.gereksinimler.length} gereksinim
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        <label className="itm-save-label">Şablon Adı</label>
                        <input
                            className="itm-save-input"
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                            placeholder="Örn: Standart Metal Malzeme Alımı"
                            maxLength={80}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter' && !saving) onSaveTemplate(currentForm); }}
                        />
                        <p className="itm-save-hint">Başlık, açıklama, tür, KDV, teslim yeri ve gereksinimler kaydedilir.</p>
                        <div className="itm-save-actions">
                            <button type="button" className="itm-btn itm-btn--cancel" onClick={onClose}>İptal</button>
                            <button
                                type="button"
                                className="itm-btn itm-btn--save"
                                disabled={saving || !saveName.trim()}
                                onClick={() => onSaveTemplate(currentForm)}
                            >
                                <span className="material-symbols-outlined">bookmark_add</span>
                                {saving ? 'Kaydediliyor…' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Enes Doğanay | 11 Mayıs 2026: Seçim modu — şablon listesi */
                    <div className="itm-list">
                        {loading && (
                            <div className="itm-loading">
                                <span className="material-symbols-outlined itm-spin">progress_activity</span>
                                Yükleniyor…
                            </div>
                        )}
                        {!loading && templates.length === 0 && (
                            <div className="itm-empty">
                                <span className="material-symbols-outlined">bookmarks</span>
                                <p>Henüz şablon oluşturulmadı.</p>
                                <small>İhale formu doldurulurken "Şablon Kaydet" butonuna basarak şablonlarınızı saklayabilirsiniz.</small>
                            </div>
                        )}
                        {templates.map(t => (
                            <TemplateItem
                                key={t.id}
                                t={t}
                                deleteConfirmId={deleteConfirmId}
                                setDeleteConfirmId={setDeleteConfirmId}
                                onApply={t2 => { onApplyTemplate(t2); onClose(); }}
                                onDelete={onDeleteTemplate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IhaleTemplateModal;

// Enes Doğanay | 6 Mayıs 2026: Arama etiketleri bölümü
import React from 'react';
import './CompanyTagSection.css';

/* Enes Doğanay | 6 Mayıs 2026: approvedTags, pendingTagRequest, tagInput, setTagInput, tagSending, tagFeedback, handleTagSubmit, isAdmin */
const CompanyTagSection = ({ approvedTags, pendingTagRequest, tagInput, setTagInput, tagSending, tagFeedback, handleTagSubmit, isAdmin }) => {
    return (
        <div className="cmp-card">
            <div className="cmp-card__head">
                <span className="material-symbols-outlined">label</span>
                <div>
                    <h3>Arama Etiketleri</h3>
                    <p>Firmayı bulmayı kolaylaştıracak anahtar kelimeler. Admin onayından sonra aramada aktif olur.</p>
                </div>
            </div>
            {approvedTags && (
                <div className="cmp-tag-approved">
                    <span className="material-symbols-outlined">check_circle</span>
                    <strong>Aktif etiketler:</strong>
                    <span>{approvedTags}</span>
                </div>
            )}
            {/* Enes Doğanay | 6 Mayıs 2026: Admin modunda bekleyen talep bloğu gösterilmez, direkt form gösterilir */}
            {!isAdmin && pendingTagRequest ? (
                <div className="cmp-tag-pending">
                    <span className="material-symbols-outlined">schedule</span>
                    <div>
                        <strong>Bekleyen talep:</strong>
                        <span>{pendingTagRequest.etiketler}</span>
                    </div>
                </div>
            ) : (
                <div className="cmp-tag-form">
                    <label className="cmp-field">
                        <span>{isAdmin ? 'Etiketler (virgülle ayırın)' : 'Yeni etiket talebi (virgülle ayırın)'}</span>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            placeholder="Örn: CNC işleme, talaşlı imalat, freze, alüminyum döküm"
                            disabled={tagSending}
                        />
                    </label>
                    {tagFeedback.msg && (
                        <div className={`cmp-feedback cmp-feedback--${tagFeedback.type === 'ok' ? 'ok' : 'err'}`}>
                            <span className="material-symbols-outlined">{tagFeedback.type === 'ok' ? 'check_circle' : 'error'}</span>
                            {tagFeedback.msg}
                        </div>
                    )}
                    <button
                        type="button"
                        className="cmp-btn cmp-btn--ghost cmp-btn--sm"
                        onClick={handleTagSubmit}
                        disabled={tagSending || !tagInput.trim()}
                    >
                        <span className="material-symbols-outlined">
                            {tagSending ? 'progress_activity' : (isAdmin ? 'save' : 'send')}
                        </span>
                        {tagSending ? (isAdmin ? 'Kaydediliyor…' : 'Gönderiliyor…') : (isAdmin ? 'Kaydet' : 'Talep Gönder')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompanyTagSection;

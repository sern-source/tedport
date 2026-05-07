// Enes Doğanay | 6 Mayıs 2026: Kurumsal yetkilendirme belgesi indirme + yükleme alanı
import React from 'react';
import { downloadYetkilendirmePdf } from '../utils/authDocUtils';

const CorporateAuthDocUpload = ({ corporateForm, corporateErrors, setField }) => (
    <div className="auth-doc-section">
        <div className="auth-doc-header">
            <span className="material-symbols-outlined auth-doc-icon">verified_user</span>
            <div>
                <strong className="auth-doc-title">Yetkilendirme Belgesi <span className="required-star">*</span></strong>
                <p className="auth-doc-desc">Aşağıdaki belgeyi indirin, eksiksiz doldurun, firma yetkilisi tarafından imzalayıp kaşe vurduktan sonra PDF veya görsel olarak yükleyin.</p>
            </div>
        </div>
        <button type="button" className="auth-doc-download-btn" onClick={downloadYetkilendirmePdf}>
            <span className="material-symbols-outlined">download</span>Yetkilendirme Belgesini İndir
        </button>
        <div className={`auth-doc-upload${corporateErrors.authorizationDoc ? ' auth-doc-upload--error' : ''}`}>
            <label className="auth-doc-upload-area" htmlFor="authDocInput">
                <span className="material-symbols-outlined auth-doc-upload-icon">{corporateForm.authorizationDoc ? 'task' : 'upload_file'}</span>
                <span className="auth-doc-upload-text">{corporateForm.authorizationDoc ? corporateForm.authorizationDoc.name : 'İmzalanmış belgeyi yüklemek için tıklayın (PDF, JPG, PNG)'}</span>
                <input id="authDocInput" type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={e => { if (e.target.files?.[0]) setField('authorizationDoc', e.target.files[0]); }} />
            </label>
            {corporateForm.authorizationDoc && (
                <button type="button" className="auth-doc-remove" onClick={() => setField('authorizationDoc', null)}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            )}
        </div>
        {corporateErrors.authorizationDoc && <span className="field-error-text">{corporateErrors.authorizationDoc}</span>}
    </div>
);

export default CorporateAuthDocUpload;

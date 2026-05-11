// Enes Doğanay | 6 Mayıs 2026: Firma yönetim paneli — koordinatör
import React from 'react';
import './CompanyManagementPanel.css';
import { useCompanyManagement } from '../hooks/useCompanyManagement';
import CompanyGeneralInfoCard from './CompanyGeneralInfoCard';
import CompanyContactCard from './CompanyContactCard';
import CompanyCatalogSection from './CompanyCatalogSection';
import CompanyTagSection from './CompanyTagSection';
import CompanyCertificateSection from './CompanyCertificateSection';
import CompanyModals from './CompanyModals';

const CompanyManagementPanel = ({ company, onCompanyUpdated, onSave, isNew, onDelete, isAdmin }) => {
    const {
        fields, catalog, productDraft, setProductDraft, catalogHandlers,
        saving, feedback,
        showSaveSuccess, setShowSaveSuccess,
        logoUploading, logoPreview, pendingLogoUrl, logoRedNotu,
        approvedTags, tagInput, setTagInput, tagSending, tagFeedback, pendingTagRequest,
        showDeleteConfirm, setShowDeleteConfirm, deleting,
        isDirty, districtOptions, ALL_CITIES,
        set, setCity, handleLogoUpload, handleSubmit, handleTagSubmit, handleDelete,
    } = useCompanyManagement({ company, onCompanyUpdated, onSave, onDelete, isNew, isAdmin });

    const subCount = catalog.reduce((acc, cat) => acc + (cat.subs?.length || 0), 0);
    const productCount = catalog.reduce((acc, cat) => acc + (cat.subs?.reduce((a, s) => a + (s.products?.length || 0), 0) || 0), 0);

    return (
        <section className="cmp-workspace">
            {/* Enes Doğanay | 7 Mayıs 2026: Hero banner — diğer tab sayfalarıyla aynı sistem, emerald gradient */}
            <div className="cmp-hero">
                <div className="cmp-hero__inner">
                    <div className="cmp-hero__title">
                        <span className="cmp-hero__icon">
                            <span className="material-symbols-outlined">storefront</span>
                        </span>
                        <div>
                            <h2>{fields.firma_adi || 'Firma Paneli'}</h2>
                            <p>{fields.ana_sektor ? `${fields.ana_sektor} · Firma bilgilerini düzenle` : 'Firma bilgilerini düzenle ve yönet'}</p>
                        </div>
                    </div>
                    <div className="cmp-hero__kpis">
                        {catalog.length > 0 && (
                            <div className="cmp-hero__kpi cmp-hero__kpi--catalog">
                                <span className="cmp-hero__kpi-value">{catalog.length}</span>
                                <span className="cmp-hero__kpi-label">Ürün Grubu</span>
                            </div>
                        )}
                        {subCount > 0 && (
                            <div className="cmp-hero__kpi cmp-hero__kpi--sub">
                                <span className="cmp-hero__kpi-value">{subCount}</span>
                                <span className="cmp-hero__kpi-label">Alt Grup</span>
                            </div>
                        )}
                        {productCount > 0 && (
                            <div className="cmp-hero__kpi cmp-hero__kpi--product">
                                <span className="cmp-hero__kpi-value">{productCount}</span>
                                <span className="cmp-hero__kpi-label">Ürün</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="cmp-form">
                <CompanyGeneralInfoCard fields={fields} set={set} logoPreview={logoPreview} logoUploading={logoUploading} pendingLogoUrl={pendingLogoUrl} logoRedNotu={logoRedNotu} handleLogoUpload={handleLogoUpload} />
                <CompanyContactCard fields={fields} set={set} setCity={setCity} districtOptions={districtOptions} ALL_CITIES={ALL_CITIES} />
                <div className="cmp-card">
                    <div className="cmp-card__head">
                        <span className="material-symbols-outlined">description</span>
                        <div>
                            <h3>Şirket Hakkında</h3>
                            <p>Detay sayfasının &ldquo;Şirket Hakkında&rdquo; bölümünde görünür. Tarihçe, kapasite ve güçlü yönleri yazın.</p>
                        </div>
                    </div>
                    <label className="cmp-field">
                        <span>Açıklama</span>
                        <textarea rows={6} value={fields.description} onChange={e => set('description', e.target.value)} placeholder="Örn: 1992 yılında kurulan firmamız, X sektöründe yurt içi ve yurt dışı pazarlara hizmet vermektedir…" />
                    </label>
                </div>
                <CompanyCatalogSection catalog={catalog} productDraft={productDraft} setProductDraft={setProductDraft} handlers={catalogHandlers} />
                {feedback.msg && feedback.type === 'err' && (
                    <div className="cmp-feedback cmp-feedback--err">
                        <span className="material-symbols-outlined">error</span>
                        {feedback.msg}
                    </div>
                )}
                {!isNew && (
                    <CompanyTagSection approvedTags={approvedTags} pendingTagRequest={pendingTagRequest} tagInput={tagInput} setTagInput={setTagInput} tagSending={tagSending} tagFeedback={tagFeedback} handleTagSubmit={handleTagSubmit} isAdmin={isAdmin} />
                )}
                {/* Enes Doğanay | 12 Mayıs 2026: Sertifika yükleme kartı — sadece mevcut firmalar için */}
                {!isNew && (
                    <CompanyCertificateSection company={company} />
                )}
                <div className="cmp-actions">
                    <p className="cmp-actions__hint">{isNew ? 'Tüm bilgileri doldurduktan sonra firmayı ekleyebilirsiniz.' : 'Değişiklikler kaydedildikten hemen sonra firma bilgileriniz güncellenecektir.'}</p>
                    <div className="cmp-actions__buttons">
                        <button type="button" className="cmp-btn cmp-btn--save" disabled={saving || !isDirty} onClick={handleSubmit}>
                            <span className="material-symbols-outlined">{saving ? 'progress_activity' : isNew ? 'add_business' : 'save'}</span>
                            {saving ? 'Kaydediliyor…' : isNew ? 'Firmayı Ekle' : 'Değişiklikleri Kaydet'}
                        </button>
                        {onDelete && !isNew && (
                            <button type="button" className="cmp-btn cmp-btn--delete" disabled={saving || deleting} onClick={() => setShowDeleteConfirm(true)}>
                                <span className="material-symbols-outlined">delete_forever</span>
                                {deleting ? 'Siliniyor…' : 'Firmayı Sil'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <CompanyModals showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} deleting={deleting} handleDelete={handleDelete} showSaveSuccess={showSaveSuccess} setShowSaveSuccess={setShowSaveSuccess} firmaAdi={fields.firma_adi} saving={saving} />
        </section>
    );
};

export default CompanyManagementPanel;

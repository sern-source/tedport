// Enes Doğanay | 12 Mayıs 2026: Sertifika yükleme/görüntüleme kartı — firma paneli
import React from 'react';
import { SERTIFIKA_TURLERI, SERTIFIKA_META } from '../constants/sertifikaConstants';
import { useCertificateSection } from '../hooks/useCertificateSection';
import './CompanyCertificateSection.css';

/* Enes Doğanay | 12 Mayıs 2026: Talep satırı yardımcı bileşeni */
const TalepItem = ({ talep }) => {
    const statusLabel = { bekliyor: 'Beklemede', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi' };
    const statusIcon  = { bekliyor: 'schedule', onaylandi: 'check_circle', reddedildi: 'cancel' };
    const tur = talep.sertifika_turu === 'Diger' && talep.sertifika_turu_diger
        ? talep.sertifika_turu_diger
        : talep.sertifika_turu;
    return (
        <div className="cmp-cert-talep-item">
            <span className="material-symbols-outlined">{statusIcon[talep.durum] || 'schedule'}</span>
            <span className="cmp-cert-talep-tur">{tur}</span>
            <span className={`cmp-cert-talep-status cmp-cert-talep-status--${talep.durum}`}>
                {statusLabel[talep.durum] || talep.durum}
            </span>
            {talep.durum === 'reddedildi' && talep.admin_notu && (
                <span className="cmp-cert-talep-red-note">{talep.admin_notu}</span>
            )}
        </div>
    );
};

/* Enes Doğanay | 12 Mayıs 2026: Ana bileşen */
const CompanyCertificateSection = ({ company }) => {
    const {
        approved, talepleri, loading,
        form, setForm, turDropOpen, setTurDropOpen, turDropRef,
        sending, feedback,
        handleTurSelect, handleFileChange, handleCertSubmit,
    } = useCertificateSection({ companyId: company?.firmaID, firmaAdi: company?.firma_adi });

    const selectedMeta = form.selectedTur ? SERTIFIKA_META[form.selectedTur] : null;
    const pendingSent  = talepleri.some(t => t.durum === 'bekliyor');

    return (
        <div className="cmp-card">
            <div className="cmp-card__head">
                <span className="material-symbols-outlined">workspace_premium</span>
                <div>
                    <h3>Sertifikalar</h3>
                    <p>ISO, TSE, CE ve benzeri kalite belgelerini yükleyin. Admin onayından sonra firma profilinizde rozet olarak görünür.</p>
                </div>
            </div>

            {loading && (
                <div className="cmp-cert-loading">
                    <span className="material-symbols-outlined">progress_activity</span>
                    Yükleniyor…
                </div>
            )}

            {/* Enes Doğanay | 12 Mayıs 2026: Onaylı sertifika rozetleri */}
            {!loading && approved.length > 0 && (
                <div>
                    <div className="cmp-cert-approved-head">Aktif Sertifikalar</div>
                    <div className="cmp-cert-badges">
                        {approved.map(s => {
                            const meta = SERTIFIKA_META[s.sertifika_turu] || SERTIFIKA_META['Diger'];
                            return (
                                <span
                                    key={s.id}
                                    className="cmp-cert-badge"
                                    style={{ '--cb-color': meta.color, '--cb-bg': meta.bg, '--cb-border': meta.border }}
                                >
                                    <span className="material-symbols-outlined">verified</span>
                                    {s.sertifika_turu}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 12 Mayıs 2026: Bekleyen/reddedilen talepler listesi */}
            {!loading && talepleri.length > 0 && (
                <div>
                    <div className="cmp-cert-approved-head">Talepler</div>
                    <div className="cmp-cert-talep-list">
                        {talepleri.map(t => <TalepItem key={t.id} talep={t} />)}
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 12 Mayıs 2026: Yeni talep formu — bekleyen varsa bilgi göster */}
            {!loading && (
                <div>
                    <div className="cmp-cert-form-head">Yeni Sertifika Talebi</div>
                    {pendingSent ? (
                        <div className="cmp-cert-feedback cmp-cert-feedback--ok">
                            <span className="material-symbols-outlined">schedule</span>
                            Bekleyen bir talebiniz var. Admin inceledikten sonra yeni talep gönderebilirsiniz.
                        </div>
                    ) : (
                        <div className="cmp-cert-form">
                            {/* Enes Doğanay | 12 Mayıs 2026: Sertifika türü custom dropdown */}
                            <div className="cert-tur-wrap" ref={turDropRef}>
                                <div
                                    className={`cert-tur-trigger${turDropOpen ? ' cert-tur-trigger--open' : ''}`}
                                    onClick={() => setTurDropOpen(p => !p)}
                                    role="combobox"
                                    aria-expanded={turDropOpen}
                                >
                                    <span className={`cert-tur-label${!form.selectedTur ? ' cert-tur-label--placeholder' : ''}`}>
                                        {selectedMeta ? selectedMeta.label : 'Sertifika türü seçin…'}
                                    </span>
                                    <span className={`material-symbols-outlined cert-tur-chevron${turDropOpen ? ' cert-tur-chevron--open' : ''}`}>
                                        expand_more
                                    </span>
                                </div>
                                {turDropOpen && (
                                    <div className="cert-tur-menu" role="listbox">
                                        {SERTIFIKA_TURLERI.map(t => (
                                            <div
                                                key={t.value}
                                                className={`cert-tur-option${form.selectedTur === t.value ? ' cert-tur-option--active' : ''}`}
                                                onClick={() => handleTurSelect(t.value)}
                                                role="option"
                                                aria-selected={form.selectedTur === t.value}
                                            >
                                                <span>{t.label}<span className="cert-tur-option__desc"> — {t.desc}</span></span>
                                                {form.selectedTur === t.value && (
                                                    <span className="material-symbols-outlined">check</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Enes Doğanay | 12 Mayıs 2026: Diğer sertifika adı */}
                            {form.selectedTur === 'Diger' && (
                                <input
                                    type="text"
                                    className="cmp-cert-diger-input"
                                    placeholder="Sertifika adını girin (ör: API 6A)"
                                    value={form.digerTur}
                                    onChange={e => setForm(p => ({ ...p, digerTur: e.target.value }))}
                                />
                            )}

                            {/* Enes Doğanay | 12 Mayıs 2026: Belge dosyası yükleme */}
                            <div className="cmp-cert-file-row">
                                <label className="cmp-cert-file-label">
                                    <span className="material-symbols-outlined">upload_file</span>
                                    {form.file ? 'Dosyayı Değiştir' : 'Belge Ekle (zorunlu)'}
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                                </label>
                                {form.file && (
                                    <span className="cmp-cert-file-name">{form.file.name}</span>
                                )}
                            </div>

                            {feedback.msg && (
                                <div className={`cmp-cert-feedback cmp-cert-feedback--${feedback.type}`}>
                                    <span className="material-symbols-outlined">
                                        {feedback.type === 'ok' ? 'check_circle' : 'error'}
                                    </span>
                                    {feedback.msg}
                                </div>
                            )}

                            <button
                                type="button"
                                className="cmp-btn cmp-btn--ghost cmp-btn--sm"
                                onClick={handleCertSubmit}
                                disabled={sending || !form.selectedTur || (form.selectedTur === 'Diger' && !form.digerTur.trim()) || !form.file}
                            >
                                <span className="material-symbols-outlined">
                                    {sending ? 'progress_activity' : 'send'}
                                </span>
                                {sending ? 'Gönderiliyor…' : 'Talep Gönder'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanyCertificateSection;

// Enes Doğanay | 6 Mayıs 2026: Hızlı ihale düzenleme modalı (legacy — sadece detay güncelleme)
import React from 'react';
import CitySelect from '../../../components/CitySelect';
import DatePicker from '../../../components/DatePicker';

const IhaleEditModal = ({ editModal, editForm, editError, editSaving, editReqState, setEditReqState, setEditForm, onClose, onSave, onAddReq, onRemoveReq }) => {
    if (!editModal) return null;

    return (
        <div className="tom-edit-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="tom-edit-modal">
                <div className="tom-edit-modal__header">
                    <h2><span className="material-symbols-outlined">edit</span>İhaleyi Düzenle</h2>
                    <button className="tom-edit-modal__close" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="tom-edit-modal__body">
                    {editError && <div className="tom-form-error"><span className="material-symbols-outlined">error</span>{editError}</div>}
                    <div className="tom-edit-section">
                        <div className="tom-edit-field">
                            <label>İhale Başlığı</label>
                            <input value={editForm.baslik || ''} onChange={e => setEditForm(p => ({ ...p, baslik: e.target.value }))} placeholder="İhale başlığı" maxLength={120} />
                        </div>
                        <div className="tom-edit-field">
                            <label>Açıklama</label>
                            <textarea value={editForm.aciklama || ''} onChange={e => setEditForm(p => ({ ...p, aciklama: e.target.value }))} rows={3} placeholder="İhale açıklaması" />
                        </div>
                        <div className="tom-edit-grid">
                            <div className="tom-edit-field">
                                <label>Son Başvuru Tarihi</label>
                                <DatePicker value={editForm.son_basvuru_tarihi || ''} onChange={v => setEditForm(p => ({ ...p, son_basvuru_tarihi: v }))} />
                            </div>
                            <div className="tom-edit-field">
                                <label>Teslim Süresi</label>
                                <input value={editForm.teslim_suresi || ''} onChange={e => setEditForm(p => ({ ...p, teslim_suresi: e.target.value }))} placeholder="Örn: 30 gün" />
                            </div>
                        </div>
                        <div className="tom-edit-field">
                            <label>Teslim Lokasyonu</label>
                            <CitySelect value={{ il: editForm.teslim_il || '', ilce: editForm.teslim_ilce || '' }} onChange={({ il, ilce }) => setEditForm(p => ({ ...p, teslim_il: il, teslim_ilce: ilce }))} />
                        </div>
                        <div className="tom-edit-field">
                            <label>KDV Durumu</label>
                            <input value={editForm.kdv_durumu || ''} onChange={e => setEditForm(p => ({ ...p, kdv_durumu: e.target.value }))} placeholder="KDV dahil / hariç" />
                        </div>
                    </div>
                    <div className="tom-edit-section">
                        <h4>Gereksinimler</h4>
                        <div className="tom-edit-req-list">
                            {(editForm.gereksinimler || []).map((r, i) => (
                                <div key={r.id || i} className="tom-edit-req-item">
                                    <span className="material-symbols-outlined">drag_indicator</span>
                                    <span className="tom-edit-req-item__text">{r.madde} {r.aciklama && <small>({r.aciklama})</small>}</span>
                                    <button type="button" className="tom-edit-req-item__remove" onClick={() => onRemoveReq(r.id || i)}><span className="material-symbols-outlined">close</span></button>
                                </div>
                            ))}
                        </div>
                        <div className="tom-edit-req-input">
                            <input value={editReqState.madde} onChange={e => setEditReqState(p => ({ ...p, madde: e.target.value }))} placeholder="Yeni gereksinim..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddReq(); } }} />
                            <input value={editReqState.aciklama} onChange={e => setEditReqState(p => ({ ...p, aciklama: e.target.value }))} placeholder="Açıklama (isteğe bağlı)" />
                            <button type="button" onClick={onAddReq} className="tom-btn tom-btn--add-req"><span className="material-symbols-outlined">add</span>Ekle</button>
                        </div>
                    </div>
                </div>
                <div className="tom-edit-modal__footer">
                    <button className="tom-btn tom-btn--cancel" onClick={onClose} disabled={editSaving}>İptal</button>
                    <button className="tom-btn tom-btn--save" onClick={onSave} disabled={editSaving}>{editSaving ? <><span className="material-symbols-outlined tom-spin">progress_activity</span>Kaydediliyor…</> : <><span className="material-symbols-outlined">save</span>Kaydet</>}</button>
                </div>
            </div>
        </div>
    );
};

export default IhaleEditModal;

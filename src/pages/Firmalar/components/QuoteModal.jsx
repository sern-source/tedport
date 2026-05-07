// Enes Doğanay | 6 Mayıs 2026: Teklif talebi modalı — kart ve liste görünümü paylaşımlı
import React from 'react';
import CitySelect from '../../../components/CitySelect';
import DatePicker from '../../../components/DatePicker';
import './QuoteModal.css';

const QuoteModal = ({ supplier, form, quoteFile, sending, sent, userProfile, onClose, onSetField, onSetFile, onSubmit }) => (
  <div className="quote-modal-overlay">
    <div className="quote-modal" onClick={e => e.stopPropagation()}>
      {sent ? (
        <div className="quote-modal-success">
          <span className="material-symbols-outlined quote-success-icon">check_circle</span>
          <h3>Teklif Talebiniz Gönderildi!</h3>
          <p>Firma en kısa sürede talebinizi inceleyecektir.</p>
        </div>
      ) : (
        <>
          <div className="quote-modal-header">
            <div>
              <h3>Teklif Talebi</h3>
              <p className="quote-modal-subtitle">{supplier.name}</p>
            </div>
            <button className="quote-modal-close" onClick={onClose} type="button">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="quote-modal-body">
            <div className="quote-form-group">
              <label>Talep Başlığı *</label>
              <input
                type="text" placeholder="Ör: Paslanmaz Çelik Boru Fiyat Talebi"
                value={form.konu} onChange={e => onSetField('konu', e.target.value)} maxLength={200}
              />
            </div>

            <div className="quote-form-row">
              <div className="quote-form-group">
                <label>Miktar</label>
                <input
                  type="number" placeholder="Ör: 500" value={form.miktar} min={1} max={99999}
                  onChange={e => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 99999)) onSetField('miktar', v); }}
                />
              </div>
              <div className="quote-form-group">
                <label>Talep Edilen Teslim Tarihi</label>
                <DatePicker
                  value={form.teslim_tarihi}
                  onChange={val => onSetField('teslim_tarihi', val)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="quote-form-group">
              <label>Teslim Yeri</label>
              <CitySelect value={form.teslim_yeri} onChange={city => onSetField('teslim_yeri', city)} />
            </div>

            <div className="quote-form-group">
              <label>Talep Detayları *</label>
              <textarea
                placeholder="Talep detaylarınızı yazın... (Ölçüler, malzeme tercihi vb.)"
                value={form.mesaj} onChange={e => onSetField('mesaj', e.target.value)}
                rows={4} maxLength={2000}
              />
            </div>

            <div className="quote-form-group">
              <label>Ek Dosya <span className="quote-file-optional">(Opsiyonel — teknik şartname, çizim vb.)</span></label>
              <div className="quote-file-upload">
                <label className="quote-file-btn" htmlFor="quote-modal-file">
                  <span className="material-symbols-outlined">attach_file</span>
                  {quoteFile ? quoteFile.name : 'Dosya Seç'}
                </label>
                <input
                  id="quote-modal-file" type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f && f.size <= 10 * 1024 * 1024) onSetFile(f);
                  }}
                />
                {quoteFile && (
                  <button type="button" className="quote-file-remove" onClick={() => onSetFile(null)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
            </div>

            <div className="quote-form-info">
              <span className="material-symbols-outlined">info</span>
              <span>İletişim bilgileriniz ({userProfile?.email}) taleple birlikte paylaşılacaktır.</span>
            </div>
          </div>

          <div className="quote-modal-footer">
            <button className="btn btn-outline quote-btn-cancel" onClick={onClose} type="button">İptal</button>
            <button
              className="btn btn-primary quote-btn-send" onClick={onSubmit} type="button"
              disabled={sending || !form.konu.trim() || !form.mesaj.trim()}
            >
              {sending ? 'Gönderiliyor...' : 'Teklif İste'}
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

export default QuoteModal;

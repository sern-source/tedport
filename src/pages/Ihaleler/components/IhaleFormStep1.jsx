// Enes Doğanay | 6 Mayıs 2026: İhale form adım 1 — Temel Bilgiler
import React from 'react';
import CitySelect from '../../../components/CitySelect';
import { TURKEY_DISTRICTS } from '../../../constants/turkeyDistricts';

const IhaleFormStep1 = ({ form, setForm }) => (
    <div className="ihale-step-content">
        <label className="ihale-field">
            <span>Başlık *</span>
            <input type="text" value={form.baslik} onChange={e => setForm(p => ({ ...p, baslik: e.target.value }))} placeholder="Örn. 500 adet laptop alımı" />
        </label>
        <label className="ihale-field ihale-field--full">
            <span>Açıklama</span>
            <textarea rows={4} value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="İhale kapsamı, genel bilgiler, teknik gereksinimler…" />
        </label>
        <div className="ihale-modal__grid">
            <div className="ihale-field">
                <span>Teslim Yeri İl *</span>
                <CitySelect value={form.teslim_il} onChange={val => setForm(p => ({ ...p, teslim_il: val, teslim_ilce: '' }))} />
            </div>
            {/* Enes Doğanay | 10 Nisan 2026: İlçe de CitySelect ile aranabilir dropdown */}
            <div className="ihale-field">
                <span>Teslim Yeri İlçe *</span>
                <CitySelect
                    value={form.teslim_ilce}
                    onChange={val => setForm(p => ({ ...p, teslim_ilce: val }))}
                    options={TURKEY_DISTRICTS[form.teslim_il] || []}
                    placeholder="İlçe seçiniz"
                    icon="map"
                />
            </div>
        </div>
        {/* Enes Doğanay | 2 Mayıs 2026: Anonim ihale toggle */}
        <div className="ihale-anonim-row">
            <div className="ihale-anonim-row__info">
                <span className="material-symbols-outlined">visibility_off</span>
                <div>
                    <strong>Anonim İhale</strong>
                    <p>Aktif edilirse firma adınız ihale kartlarında ve detay sayfasında gizlenir. Teklif verenler firmanızı göremez.</p>
                </div>
            </div>
            <button type="button" className={`ihale-anonim-toggle${form.anonim ? ' ihale-anonim-toggle--on' : ''}`}
                onClick={() => setForm(p => ({ ...p, anonim: !p.anonim }))} aria-pressed={form.anonim}>
                <span className="ihale-anonim-toggle__knob" />
            </button>
        </div>
    </div>
);

export default IhaleFormStep1;

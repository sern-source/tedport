// Enes Doğanay | 6 Mayıs 2026: İletişim ve konum kartı — telefon, email, il, ilçe, adres
import React from 'react';
import CitySelect from './CitySelect';

const CompanyContactCard = ({ fields, set, setCity, districtOptions, ALL_CITIES, fieldError = { key: '', msg: '' } }) => (
    <div className="cmp-card">
        <div className="cmp-card__head">
            <span className="material-symbols-outlined">location_on</span>
            <div><h3>İletişim ve Konum</h3></div>
        </div>
        <div className="cmp-grid cmp-grid--3">
            <label className="cmp-field">
                <span>Telefon</span>
                <input data-field-key="telefon" type="text" name="cmp_t_x" value={fields.telefon} onChange={e => set('telefon', e.target.value)} placeholder="0 (XXX) XXX XX XX" autoComplete="one-time-code" />
                {fieldError.key === 'telefon' && <span className="cmp-field-err"><span className="material-symbols-outlined">error</span>{fieldError.msg}</span>}
            </label>
            <label className="cmp-field">
                <span>E-posta</span>
                <input data-field-key="eposta" type="text" name="cmp_e_x" value={fields.eposta} onChange={e => set('eposta', e.target.value)} placeholder="iletisim@firma.com" autoComplete="one-time-code" />
                {fieldError.key === 'eposta' && <span className="cmp-field-err"><span className="material-symbols-outlined">error</span>{fieldError.msg}</span>}
            </label>
            <div className="cmp-field">
                <span>İl</span>
                <CitySelect value={fields.city} onChange={val => setCity(val)} options={ALL_CITIES} placeholder="İl seçin" />
            </div>
            <div className="cmp-field">
                <span>İlçe</span>
                <CitySelect value={fields.district} onChange={val => set('district', val)} options={districtOptions} placeholder={fields.city ? 'İlçe seçin' : 'Önce il seçin'} />
            </div>
            <label className="cmp-field cmp-field--span2">
                <span>Açık Adres</span>
                <input data-field-key="adres" type="text" name="cmp_a_x" value={fields.adres} onChange={e => set('adres', e.target.value)} placeholder="Cadde, sokak, bina no, kat / daire" autoComplete="one-time-code" />
                {fieldError.key === 'adres' && <span className="cmp-field-err"><span className="material-symbols-outlined">error</span>{fieldError.msg}</span>}
            </label>
        </div>
    </div>
);

export default CompanyContactCard;

// Enes Doğanay | 6 Mayıs 2026: Davetli firma arama bölümü — adım 2 alt bileşeni
import React from 'react';

const IhaleInviteFirmaSection = ({
    form,
    firmaSearchTerm, firmaSearchResults, firmaSearching,
    firmaResultsRef,
    handleFirmaSearch, addDavetliFirma, removeDavetliFirma,
}) => (
    <div className="ihale-section">
        <span className="ihale-section__title">
            <span className="material-symbols-outlined">group_add</span>
            Davet Edilecek Firmalar
        </span>
        <div className="ihale-firma-search">
            <input type="text" placeholder="Firma adı ile arayın…" value={firmaSearchTerm}
                onChange={e => handleFirmaSearch(e.target.value)} />
            {firmaSearching && <span className="ihale-firma-search__spinner">Aranıyor…</span>}
            {firmaSearchResults.length > 0 && (
                <div className="ihale-firma-search__results" ref={firmaResultsRef}>
                    {firmaSearchResults.map(f => {
                        const alreadyAdded = form.davetli_firmalar.some(df => df.firma_id === f.firmaID);
                        const isOnayli = f.onayli_hesap === true;
                        return (
                            <div key={f.firmaID} className={`ihale-firma-search__item${!isOnayli ? ' ihale-firma-search__item--disabled' : ''}`}>
                                <div className="ihale-firma-search__info">
                                    <strong>{f.firma_adi}</strong>
                                    {isOnayli
                                        ? <span className="ihale-firma-badge ihale-firma-badge--ok"><span className="material-symbols-outlined">verified</span> Onaylı</span>
                                        : <span className="ihale-firma-badge ihale-firma-badge--warn"><span className="material-symbols-outlined">info</span> Onaylı firma değil</span>
                                    }
                                </div>
                                {isOnayli
                                    ? <button type="button" disabled={alreadyAdded} className="ihale-firma-add-btn" onClick={() => addDavetliFirma(f)}>{alreadyAdded ? 'Eklendi' : '+ Ekle'}</button>
                                    : <span className="ihale-firma-warn-text">Firmayla iletişime geçip profilini onaylamasını talep edebilirsiniz.</span>
                                }
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        {form.davetli_firmalar.length > 0 && (
            <div className="ihale-firma-tags">
                {form.davetli_firmalar.map(f => (
                    <div key={f.firma_id} className="ihale-firma-tag">
                        <span className="material-symbols-outlined">business</span>
                        <span>{f.firma_adi}</span>
                        <button type="button" onClick={() => removeDavetliFirma(f.firma_id)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default IhaleInviteFirmaSection;

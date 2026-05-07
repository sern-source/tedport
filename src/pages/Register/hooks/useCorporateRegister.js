// Enes Doğanay | 7 Mayıs 2026: Kurumsal kayıt formu koordinatör — state, URL params, validate, submit
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { checkEmailAvailability, uploadAuthorizationDoc } from '../services/registerService';
import { submitCorporateApplication } from '../../../services/corporateApplicationsApi';
import { useCorporateFirmaSearch, parseIlIlce } from './useCorporateFirmaSearch';

const INITIAL_CORPORATE_FORM = {
    applicantFirstName: '', applicantLastName: '', applicantTitle: '',
    listedCompanyName: '', selectedFirmaId: null, companyPhone: '',
    companyIl: '', companyIlce: '', companyOpenAddress: '',
    websiteUrl: '', corporateEmail: '', phone: '',
    verificationNote: '', authorizationDoc: null,
};

const validateCorporateForm = (form) => {
    const errors = {};
    const required = [
        { key: 'applicantFirstName', label: 'Başvuran Adı' }, { key: 'applicantLastName', label: 'Başvuran Soyadı' },
        { key: 'applicantTitle', label: 'Pozisyon' }, { key: 'phone', label: 'Başvuranın Telefon Numarası' },
        { key: 'listedCompanyName', label: 'Şirket Adı' }, { key: 'websiteUrl', label: 'Web Sitesi' },
        { key: 'corporateEmail', label: 'Kurumsal E-posta' }, { key: 'companyPhone', label: 'Şirket Telefon Numarası' },
        { key: 'companyIl', label: 'İl' }, { key: 'companyIlce', label: 'İlçe' }, { key: 'companyOpenAddress', label: 'Açık Adres' },
    ];
    required.forEach(({ key, label }) => { if (!String(form[key] || '').trim()) errors[key] = `${label} alanını doldurunuz.`; });
    if (!form.authorizationDoc) errors.authorizationDoc = 'Lütfen imzalanmış yetkilendirme belgesini yükleyin.';
    return errors;
};

const useCorporateRegister = ({ kvkkAccepted, onMessage }) => {
    const [searchParams] = useSearchParams();
    const [corporateForm, setCorporateForm] = useState(INITIAL_CORPORATE_FORM);
    const [corporateErrors, setCorporateErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submittedApplication, setSubmittedApplication] = useState(null);

    const setField = (field, value) => {
        setCorporateForm(prev => ({ ...prev, [field]: value }));
        if (corporateErrors[field]) setCorporateErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    const firmaSearch = useCorporateFirmaSearch({ setCorporateForm, setField });

    // Enes Doğanay | 7 Mayıs 2026: Firma detaydan yönlendirmede URL parametrelerinden formu doldur
    useEffect(() => {
        const firmaId = searchParams.get('firmaId');
        const firmaAdi = searchParams.get('firmaAdi');
        if (!firmaId || !firmaAdi) return;
        const { il, ilce } = parseIlIlce(searchParams.get('ilIlce') || '');
        setCorporateForm(prev => ({
            ...prev, listedCompanyName: firmaAdi, selectedFirmaId: parseInt(firmaId, 10) || null,
            ...(il ? { companyIl: il } : {}), ...(ilce ? { companyIlce: ilce } : {}),
            ...(searchParams.get('adres') ? { companyOpenAddress: searchParams.get('adres') } : {}),
            ...(searchParams.get('telefon') ? { companyPhone: searchParams.get('telefon') } : {}),
            ...(searchParams.get('webSitesi') ? { websiteUrl: searchParams.get('webSitesi') } : {}),
            ...(searchParams.get('eposta') ? { corporateEmail: searchParams.get('eposta') } : {}),
        }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async () => {
        const errors = validateCorporateForm(corporateForm);
        setCorporateErrors(errors);
        if (Object.keys(errors).length > 0) { onMessage('error', 'Lütfen kırmızı ile işaretlenen eksik alanları doldurun.'); return; }
        if (!kvkkAccepted) { onMessage('error', "Lütfen Hizmet şartları, Gizlilik Politikası ve KVKK Aydınlatma Metni'ni okuduğunuzu onaylayın."); return; }
        setLoading(true);
        try {
            const emailCheck = await checkEmailAvailability(corporateForm.corporateEmail);
            if (emailCheck && !emailCheck.available) { onMessage('error', emailCheck.reason); return; }
            const authorizationDocUrl = await uploadAuthorizationDoc(corporateForm.authorizationDoc);
            const result = await submitCorporateApplication({ ...corporateForm, authorizationDocUrl });
            setSubmittedApplication(result.application || null);
            setCorporateForm(INITIAL_CORPORATE_FORM);
            onMessage('success', 'Kurumsal başvurunuz başarıyla alındı! Ekibimiz başvurunuzu en kısa sürede inceleyecek ve sonucu e-posta ile size bildirecektir.');
        } catch (err) { onMessage('error', err.message || 'Kurumsal başvuru oluşturulamadı.');
        } finally { setLoading(false); }
    };

    const resetSubmission = () => setSubmittedApplication(null);

    return {
        corporateForm, setField, corporateErrors, loading,
        submittedApplication, handleSubmit, resetSubmission,
        ...firmaSearch,
    };
};

export default useCorporateRegister;

// Enes Doğanay | 7 Mayıs 2026: useTeklifForm koordinatör — state + action hook'larını birleştirir
import useTeklifFormState from './useTeklifFormState';
import useTeklifActions from './useTeklifActions';

// Enes Doğanay | 7 Mayıs 2026: Teklif popup, gönder/geri çek/taslak sil — koordinatör
const useTeklifForm = ({ userProfile, authManagedCompanyId, managedCompanyName }) => {
    const formState = useTeklifFormState();
    const actions = useTeklifActions({ userProfile, authManagedCompanyId, managedCompanyName, formState });

    return {
        ...formState,
        ...actions,
    };
};

export default useTeklifForm;

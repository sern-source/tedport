// Enes Doğanay | 6 Nisan 2026: Ihale durumlari tum ekranlarda ayni kuralla hesaplanir
// Enes Doğanay | 6 Nisan 2026: draft ve kapali DB değerleri eklendi
export const getTenderStatusMeta = (tender) => {
    const normalizedStatus = (tender?.durum || '').toLowerCase();
    const isActive = tender?.is_active !== false;
    const publishDate = tender?.yayin_tarihi ? new Date(tender.yayin_tarihi) : null;
    const deadlineDate = tender?.son_basvuru_tarihi ? new Date(tender.son_basvuru_tarihi) : null;
    const now = new Date();

    if (normalizedStatus === 'draft') {
        return { key: 'draft', label: 'Taslak', className: 'draft' };
    }

    if (!isActive || normalizedStatus === 'kapali' || normalizedStatus === 'cancelled' || normalizedStatus === 'completed' || normalizedStatus === 'closed') {
        return { key: 'kapali', label: 'Kapalı', className: 'kapali' };
    }

    if (publishDate && publishDate.getTime() > now.getTime()) {
        return { key: 'yaklasan', label: 'Yaklaşan', className: 'yaklasan' };
    }

    if (deadlineDate && deadlineDate.getTime() < now.getTime()) {
        return { key: 'kapali', label: 'Kapalı', className: 'kapali' };
    }

    return { key: 'canli', label: 'Canlı', className: 'canli' };
};

// Enes Doğanay | 6 Nisan 2026: Tarihler ihale kartlarinda tek bicimde gosterilir
export const formatTenderDate = (dateValue) => {
    if (!dateValue) {
        return 'Tarih belirtilmedi';
    }

    const date = new Date(dateValue);
    return `${date.toLocaleDateString('tr-TR')} • ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
};

// Enes Doğanay | 6 Nisan 2026: Ihaleler sayfasinda kart alt basliklari temiz kalmasi icin butce notu normalize edilir
export const formatTenderBudget = (budgetNote) => {
    return budgetNote?.trim() || 'Bütçe bilgisi paylaşılmadı';
};
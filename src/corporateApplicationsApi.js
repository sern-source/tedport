import { supabase, supabaseAnonKey, supabaseUrl } from './supabaseClient';

// Enes Doğanay | 6 Nisan 2026: Frontend ve server payload'lari ayni alan adlariyla eslenir
const mapFormToDatabasePayload = (formData) => ({
  applicant_first_name: String(formData.applicantFirstName || '').trim(),
  applicant_last_name: String(formData.applicantLastName || '').trim(),
  applicant_title: String(formData.applicantTitle || '').trim() || null,
  company_name: String(formData.companyName || '').trim(),
  listed_company_name: String(formData.listedCompanyName || '').trim() || null,
  website_url: String(formData.websiteUrl || '').trim() || null,
  corporate_email: String(formData.corporateEmail || '').trim().toLowerCase(),
  phone: String(formData.phone || '').trim(),
  tax_office: String(formData.taxOffice || '').trim() || null,
  tax_number: String(formData.taxNumber || '').trim() || null,
  company_address: String(formData.companyAddress || '').trim() || null,
  verification_note: String(formData.verificationNote || '').trim() || null
});

const getFunctionsErrorMessage = (error, fallbackMessage) => {
  const contextMessage = error?.context?.msg || error?.message;
  return contextMessage || fallbackMessage;
};

const invokeCorporateApplicationsFunction = async ({ body, accessToken }) => {
  const response = await fetch(`${supabaseUrl}/functions/v1/corporate-applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify(body)
  });

  let responseBody = null;

  try {
    responseBody = await response.json();
  } catch (error) {
    responseBody = null;
  }

  if (!response.ok) {
    throw new Error(responseBody?.error || `Edge Function returned ${response.status}`);
  }

  return responseBody;
};

// Enes Doğanay | 6 Nisan 2026: Admin e-posta kontrolu env olmasa bile Supabase tablosundan okunabilir
export const resolveIsAdminUser = async (email, fallbackCheck) => {
  if (fallbackCheck?.(email)) {
    return true;
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const { data, error } = await supabase
    .from('admin_epostalari')
    .select('email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data?.email);
};

// Enes Doğanay | 6 Nisan 2026: Basvuru formu once endpointi dener, env yoksa dogrudan Supabase insert fallback kullanir
export const submitCorporateApplication = async (formData) => {
  try {
    const data = await invokeCorporateApplicationsFunction({
      body: {
        ...formData,
        action: 'submit'
      }
    });

    return { application: data?.application, mode: 'edge' };
  } catch (error) {
    const fallbackReason = error?.message || 'Kurumsal başvuru Edge Function çağrısı başarısız oldu.';
    const databasePayload = mapFormToDatabasePayload(formData);
    const { data: existingPending, error: pendingError } = await supabase
      .from('kurumsal_basvurular')
      .select('id')
      .eq('status', 'pending')
      .eq('corporate_email', databasePayload.corporate_email)
      .maybeSingle();

    if (pendingError) {
      throw new Error('Kurumsal başvuru tablosuna erişilemedi. Güncel SQL dosyasını tekrar çalıştırın.');
    }

    if (existingPending) {
      throw new Error('Bu e-posta adresi için zaten bekleyen bir kurumsal başvuru var.');
    }

    const { data, error: insertError } = await supabase
      .from('kurumsal_basvurular')
      .insert([databasePayload])
      .select('*')
      .single();

    if (insertError) {
      throw new Error(insertError.message || 'Kurumsal başvuru oluşturulamadı.');
    }

    return { application: data, mode: 'database', fallbackReason };
  }
};

// Enes Doğanay | 6 Nisan 2026: Admin paneli verileri once endpointten, gerekirse RLS ile dogrudan Supabase'ten okunur
export const listCorporateApplications = async (accessToken) => {
  try {
    const data = await invokeCorporateApplicationsFunction({
      body: {
        action: 'list'
      },
      accessToken
    });

    return { applications: data?.applications || [], mode: 'edge' };
  } catch (error) {
    const fallbackReason = error?.message || 'Başvuru listesi Edge Function üzerinden alınamadı.';
    const { data, error: selectError } = await supabase
      .from('kurumsal_basvurular')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (selectError) {
      throw new Error(selectError.message || 'Başvurular alınamadı.');
    }

    return { applications: data || [], mode: 'database', fallbackReason };
  }
};

// Enes Doğanay | 6 Nisan 2026: Env yoksa admin karari kayda islenir; aktivasyon ve mail daha sonra tamamlanabilir
export const reviewCorporateApplication = async ({
  accessToken,
  applicationId,
  decision,
  reviewNote,
  reviewerEmail
}) => {
  try {
    const data = await invokeCorporateApplicationsFunction({
      body: {
        action: 'review',
        applicationId,
        decision,
        reviewNote
      },
      accessToken
    });

    return { application: data?.application, mode: 'edge' };
  } catch (error) {
    const fallbackReason = error?.message || 'Başvuru inceleme Edge Function çağrısı başarısız oldu.';

    if (decision === 'approve') {
      throw new Error(fallbackReason);
    }

    const now = new Date().toISOString();
    const nextStatus = decision === 'approve' ? 'approved' : decision === 'needs_info' ? 'needs_info' : 'rejected';
    const updatePayload = {
      status: nextStatus,
      review_note: String(reviewNote || '').trim() || null,
      reviewed_by_email: reviewerEmail || null,
      reviewed_at: now,
      approved_at: decision === 'approve' ? now : null,
      rejected_at: decision === 'reject' ? now : null,
      updated_at: now
    };

    const { data, error: updateError } = await supabase
      .from('kurumsal_basvurular')
      .update(updatePayload)
      .eq('id', applicationId)
      .select('*')
      .single();

    if (updateError) {
      throw new Error(updateError.message || 'Başvuru güncellenemedi.');
    }

    return { application: data, mode: 'database', fallbackReason };
  }
};
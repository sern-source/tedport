// Enes Doğanay | 6 Mayıs 2026: İletişim formu hook
// Enes Doğanay | 12 Mayıs 2026: company alanı, selectedPurpose + handlePurposeSelect eklendi
import { useState } from 'react';
import { submitContactForm } from '../services/iletisimService';

// Enes Doğanay | 6 Mayıs 2026: Boş form sabiti
const EMPTY_FORM = { name: '', company: '', email: '', subject: '', message: '' };

// Enes Doğanay | 6 Mayıs 2026: Form state, handler'lar ve submit mantığı
export const useIletisim = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  // Enes Doğanay | 12 Mayıs 2026: Seçili amaç kartı
  const [selectedPurpose, setSelectedPurpose] = useState(null);

  // Enes Doğanay | 6 Mayıs 2026: Input değişim handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enes Doğanay | 12 Mayıs 2026: Amaç kartı seçimi — konuyu preselect eder
  const handlePurposeSelect = (purposeKey) => {
    setSelectedPurpose(purposeKey);
    setFormData(prev => ({ ...prev, subject: purposeKey }));
  };

  // Enes Doğanay | 6 Mayıs 2026: Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitContactForm(formData);
      setStatus('success');
      setFormData(EMPTY_FORM);
      setSelectedPurpose(null);
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return { formData, status, selectedPurpose, handleChange, handlePurposeSelect, handleSubmit };
};

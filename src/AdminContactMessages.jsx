/* Enes Doğanay | 14 Nisan 2026: Admin iletişim mesajları yönetim paneli */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './AdminContactMessages.css';
import { supabase } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';

/* Enes Doğanay | 14 Nisan 2026: Mesaj durumu meta bilgisi */
const STATUS_META = {
  new: { label: 'Yeni', className: 'acm-status--new' },
  read: { label: 'Okundu', className: 'acm-status--read' },
  replied: { label: 'Yanıtlandı', className: 'acm-status--replied' },
  archived: { label: 'Arşivlendi', className: 'acm-status--archived' },
};

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  return `${d.toLocaleDateString('tr-TR')} • ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
};

const AdminContactMessages = () => {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /* Enes Doğanay | 14 Nisan 2026: Admin yetki kontrolü — env + DB çift katmanlı (resolveIsAdminUser) */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      if (!(await resolveIsAdminUser(session.user.email, isAdminEmail))) {
        setAccessDenied(true);
        setLoading(false);
        setSessionChecked(true);
        return;
      }
      setSessionChecked(true);
      fetchMessages();
    };
    checkAdmin();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('iletisim')
      .select('*')
      .order('created_at', { ascending: false });

    /* Enes Doğanay | 14 Nisan 2026: Hata varsa konsola yaz */
    if (error) console.error('iletisim fetch error:', error);
    if (data) setMessages(data);
    setLoading(false);
  };

  /* Enes Doğanay | 14 Nisan 2026: Mesaj durumunu güncelle */
  const updateStatus = async (id, newStatus) => {
    setActionLoadingId(id);
    const { error } = await supabase
      .from('iletisim')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    }
    setActionLoadingId(null);
  };

  /* Enes Doğanay | 14 Nisan 2026: Mesaj sil */
  const deleteMessage = async (id) => {
    if (!window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    setActionLoadingId(id);
    const { error } = await supabase.from('iletisim').delete().eq('id', id);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
    setActionLoadingId(null);
  };

  /* Enes Doğanay | 14 Nisan 2026: Filtreleme */
  const filtered = messages.filter(m => {
    const matchStatus = statusFilter === 'all' || (m.status || 'new') === statusFilter;
    const term = searchTerm.toLocaleLowerCase('tr-TR');
    const matchSearch = !term ||
      (m.name || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (m.email || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (m.subject || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (m.message || '').toLocaleLowerCase('tr-TR').includes(term);
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    all: messages.length,
    new: messages.filter(m => !m.status || m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length,
  };

  if (!sessionChecked) return null;

  if (accessDenied) {
    return (
      <>
        <SharedHeader />
        <div className="acm-page">
          <div className="acm-main">
            <div className="acm-access-denied">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ef4444' }}>block</span>
              <h2>Erişim Reddedildi</h2>
              <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
              <button onClick={() => navigate('/')} className="acm-btn-primary">Ana Sayfaya Dön</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SharedHeader />
      <div className="acm-page">
        <div className="acm-main">
          {/* Hero */}
          <div className="acm-hero">
            <div>
              <h1>İletişim Mesajları</h1>
              <p>İletişim sayfasından gelen tüm mesajları görüntüleyin ve yönetin.</p>
            </div>
            <div className="acm-hero-badge">
              <span className="material-symbols-outlined">mail</span>
              {statusCounts.new} yeni mesaj
            </div>
          </div>

          {/* Stats */}
          <div className="acm-stats">
            {[
              { key: 'all', icon: 'inbox', label: 'Toplam', color: '#64748b' },
              { key: 'new', icon: 'mark_email_unread', label: 'Yeni', color: '#3b82f6' },
              { key: 'read', icon: 'drafts', label: 'Okundu', color: '#f59e0b' },
              { key: 'replied', icon: 'reply', label: 'Yanıtlandı', color: '#10b981' },
              { key: 'archived', icon: 'archive', label: 'Arşiv', color: '#8b5cf6' },
            ].map(s => (
              <button
                key={s.key}
                className={`acm-stat-card ${statusFilter === s.key ? 'acm-stat-card--active' : ''}`}
                onClick={() => setStatusFilter(s.key)}
                type="button"
              >
                <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
                <span className="acm-stat-num">{statusCounts[s.key]}</span>
                <span className="acm-stat-label">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="acm-search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Ad, e-posta, konu veya mesaj ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="acm-search-input"
            />
            {searchTerm && (
              <button type="button" className="acm-search-clear" onClick={() => setSearchTerm('')}>
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="acm-loading">
              <div className="acm-spinner"></div>
              <p>Mesajlar yükleniyor...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="acm-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#cbd5e1' }}>inbox</span>
              <p>Henüz mesaj bulunmuyor.</p>
            </div>
          ) : (
            <div className="acm-list">
              {filtered.map(msg => {
                const st = msg.status || 'new';
                const meta = STATUS_META[st] || STATUS_META.new;
                const isExpanded = expandedId === msg.id;
                const isActionLoading = actionLoadingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`acm-card ${isExpanded ? 'acm-card--expanded' : ''} ${st === 'new' ? 'acm-card--unread' : ''}`}
                  >
                    {/* Header row */}
                    <button
                      type="button"
                      className="acm-card-header"
                      onClick={() => {
                        setExpandedId(isExpanded ? null : msg.id);
                        if (!isExpanded && st === 'new') updateStatus(msg.id, 'read');
                      }}
                    >
                      <div className="acm-card-left">
                        <div className="acm-card-avatar">{(msg.name || '?').charAt(0).toUpperCase()}</div>
                        <div className="acm-card-info">
                          <span className="acm-card-name">{msg.name || 'İsimsiz'}</span>
                          <span className="acm-card-email">{msg.email}</span>
                        </div>
                      </div>
                      <div className="acm-card-right">
                        <span className={`acm-status-badge ${meta.className}`}>{meta.label}</span>
                        <span className="acm-card-date">{formatDate(msg.created_at)}</span>
                        <span className={`material-symbols-outlined acm-card-chevron ${isExpanded ? 'acm-card-chevron--open' : ''}`}>expand_more</span>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="acm-card-body">
                        {msg.subject && (
                          <div className="acm-card-subject">
                            <span className="material-symbols-outlined">subject</span>
                            <strong>{msg.subject}</strong>
                          </div>
                        )}
                        <div className="acm-card-message">{msg.message}</div>

                        <div className="acm-card-actions">
                          <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || '')}`} className="acm-btn acm-btn-primary" target="_blank" rel="noopener noreferrer">
                            <span className="material-symbols-outlined">reply</span> Yanıtla
                          </a>

                          {st !== 'replied' && (
                            <button type="button" className="acm-btn acm-btn-success" onClick={() => updateStatus(msg.id, 'replied')} disabled={isActionLoading}>
                              <span className="material-symbols-outlined">check</span> Yanıtlandı
                            </button>
                          )}

                          {st !== 'archived' && (
                            <button type="button" className="acm-btn acm-btn-outline" onClick={() => updateStatus(msg.id, 'archived')} disabled={isActionLoading}>
                              <span className="material-symbols-outlined">archive</span> Arşivle
                            </button>
                          )}

                          {st === 'archived' && (
                            <button type="button" className="acm-btn acm-btn-outline" onClick={() => updateStatus(msg.id, 'new')} disabled={isActionLoading}>
                              <span className="material-symbols-outlined">unarchive</span> Geri Al
                            </button>
                          )}

                          <button type="button" className="acm-btn acm-btn-danger" onClick={() => deleteMessage(msg.id)} disabled={isActionLoading}>
                            <span className="material-symbols-outlined">delete</span> Sil
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminContactMessages;

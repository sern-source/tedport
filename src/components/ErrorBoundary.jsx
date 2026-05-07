// Enes Doğanay | 16 Nisan 2026: Global Error Boundary — beklenmeyen hatalarda kullanıcı dostu ekran
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary yakaladı:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: '2rem',
          fontFamily: 'Inter, sans-serif', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            Bir şeyler ters gitti
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '400px' }}>
            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.625rem 1.25rem', background: '#1a56db', color: '#fff',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 500,
              }}
            >
              Sayfayı Yenile
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.625rem 1.25rem', background: '#f1f5f9', color: '#475569',
                border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 500,
              }}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

// Enes Doğanay | 7 Nisan 2026: Sayfa geçişlerinde logolu yükleniyor ekranı
// Enes Doğanay | 8 Nisan 2026: CSS yüklenmeden stilsiz kalmaması için tüm stiller inline yapıldı
// Enes Doğanay | 2 Mayıs 2026: Dark mode desteği — data-theme kontrolü
const isDark = () => document.documentElement.dataset.theme === 'dark';

const loaderStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDark()
        ? 'linear-gradient(180deg, #0a1628 0%, #0f172a 50%, #1a0a2e 100%)'
        : 'linear-gradient(180deg, #f8fbff 0%, #ffffff 50%, #f0f4ff 100%)',
};

const innerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
};

const logoStyle = {
    width: '72px',
    height: '72px',
    objectFit: 'contain',
};

const dotsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: isDark() ? '#3b9eff' : '#1d4ed8',
    animation: 'pageLoaderBounce 1.4s ease-in-out infinite',
};

const textStyle = {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 600,
    color: isDark() ? '#475569' : '#94a3b8',
    letterSpacing: '0.04em',
};

const PageLoader = () => (
    <div style={loaderStyle}>
        <div style={innerStyle}>
            <img
                src="/tedport-logo_no-background.png"
                alt="Tedport"
                style={logoStyle}
            />
            <div style={dotsStyle}>
                <span style={dotStyle} />
                <span style={{ ...dotStyle, animationDelay: '0.16s' }} />
                <span style={{ ...dotStyle, animationDelay: '0.32s' }} />
            </div>
            <p style={textStyle}>Yükleniyor</p>
        </div>
    </div>
);

export default PageLoader;

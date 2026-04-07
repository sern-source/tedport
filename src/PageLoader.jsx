// Enes Doğanay | 7 Nisan 2026: Sayfa geçişlerinde logolu yükleniyor ekranı
// Enes Doğanay | 8 Nisan 2026: CSS yüklenmeden stilsiz kalmaması için tüm stiller inline yapıldı
const loaderStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 50%, #f0f4ff 100%)',
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
    borderRadius: '18px',
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
    background: '#1d4ed8',
    animation: 'pageLoaderBounce 1.4s ease-in-out infinite',
};

const textStyle = {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#94a3b8',
    letterSpacing: '0.04em',
};

const PageLoader = () => (
    <div style={loaderStyle}>
        <div style={innerStyle}>
            <img
                src="/tedport-logo-sade.jpg"
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

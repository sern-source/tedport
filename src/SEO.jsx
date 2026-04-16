{/* Enes Doğanay | 16 Nisan 2026: Dinamik SEO meta tag bileşeni — react-helmet-async */}
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Tedport';
const DEFAULT_DESC = "Türkiye'nin B2B tedarik portalı. Doğrulanmış üreticiler, toptancılar ve distribütörlerle bağlantı kurun.";
const DEFAULT_IMAGE = '/tedport-logo-sade.jpg';
const BASE_URL = 'https://tedport.com';

export default function SEO({ title, description, path, image, noIndex }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — B2B Tedarik Portalı`;
  const desc = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMAGE;
  const url = path ? `${BASE_URL}${path}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}

// Enes Doğanay | 23 Mayıs 2026: Boş Pages Router — src/pages/'in Pages Router olarak algılanmasını önler
// Next.js, root pages/ varsa src/pages/'i Pages Router olarak kullanmaz
export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

import React from 'react';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import SharedFooter from './SharedFooter';
import SEO from './SEO';
import './Kvkk.css';

const GizlilikPolitikasi = () => {
    return (
        <>
            <SEO
                title="Gizlilik Politikası"
                description="Tedport gizlilik politikası — kişisel verileriniz nasıl korunur"
                path="/gizlilik-politikasi"
            />
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />

            <main className="kvkk-page">
                <div className="kvkk-container">
                    <div className="kvkk-header">
                        <span className="material-symbols-outlined kvkk-header-icon">shield</span>
                        <div>
                            <h1>Gizlilik Politikası</h1>
                            <p className="kvkk-last-updated">Son güncelleme: Mayıs 2026</p>
                        </div>
                    </div>

                    <div className="kvkk-body">

                        <section className="kvkk-section">
                            <h2>1. Genel Bakış</h2>
                            <p>
                                <strong>Tedport Teknoloji A.Ş.</strong> olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi
                                koruma taahhüdünü ciddiye alıyoruz. Bu politika, platformumuzu kullandığınızda hangi verileri
                                topladığımızı, nasıl kullandığımızı ve haklarınızın neler olduğunu açıklamaktadır.
                            </p>
                            <p>
                                Bu politika, 6698 sayılı KVKK ve AB Genel Veri Koruma Yönetmeliği (GDPR) ile uyumlu şekilde
                                hazırlanmıştır. Detaylı KVKK bilgisi için <a href="/kvkk">KVKK Aydınlatma Metni</a>'ni inceleyebilirsiniz.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>2. Topladığımız Veriler</h2>
                            <p>Platforma kayıt olduğunuzda ve hizmetlerimizi kullandığınızda aşağıdaki verileri topluyoruz:</p>
                            <ul className="kvkk-list">
                                <li><strong>Hesap bilgileri:</strong> Ad, soyad, e-posta adresi, şifre (şifrelenmiş)</li>
                                <li><strong>Profil bilgileri:</strong> Şirket adı, sektör, konum, iletişim bilgileri</li>
                                <li><strong>İşlem verileri:</strong> İhale teklifleri, mesajlar, platform aktiviteleri</li>
                                <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, oturum logları</li>
                                <li><strong>İletişim tercihleri:</strong> Bildirim ayarları, pazarlama onayı</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>3. Verileri Nasıl Kullanıyoruz</h2>
                            <p>Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılmaktadır:</p>
                            <ul className="kvkk-list">
                                <li>Hesabınızı oluşturmak ve yönetmek</li>
                                <li>Platform hizmetlerini sunmak ve geliştirmek</li>
                                <li>İhale ve teklif süreçlerini yönetmek</li>
                                <li>Güvenlik ve doğrulama işlemleri</li>
                                <li>Yasal yükümlülükleri yerine getirmek</li>
                                <li>Onay vermeniz durumunda: pazarlama ve yeni fırsatlar hakkında bilgilendirme</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>4. Veri Paylaşımı</h2>
                            <p>
                                Kişisel verilerinizi üçüncü taraflara satmıyoruz. Verileriniz yalnızca aşağıdaki durumlarda paylaşılabilir:
                            </p>
                            <ul className="kvkk-list">
                                <li>Hizmet sağlayıcılarımızla (Supabase altyapısı, e-posta servisi) — yalnızca hizmet sunumu için</li>
                                <li>Yasal zorunluluk halinde yetkili kamu kurumlarıyla</li>
                                <li>Platform üzerinde açıkça paylaştığınız bilgiler diğer kullanıcılarla görülebilir</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>5. Çerezler (Cookies)</h2>
                            <p>
                                Platformumuz oturum yönetimi ve güvenlik amacıyla zorunlu çerezler kullanmaktadır. Bu çerezler
                                oturumunuzu aktif tutmak için gereklidir ve devre dışı bırakılamazlar.
                            </p>
                            <p>
                                Analitik çerezler yalnızca anonimleştirilmiş kullanım verileri toplamak amacıyla kullanılmakta olup
                                tarayıcı ayarlarınızdan devre dışı bırakılabilir.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>6. Verileriniz Üzerindeki Haklarınız</h2>
                            <p>KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
                            <ul className="kvkk-list">
                                <li>Verilerinize erişim ve kopyasını talep etme</li>
                                <li>Hatalı verilerin düzeltilmesini isteme</li>
                                <li>Belirli koşullarda verilerinizin silinmesini talep etme</li>
                                <li>Pazarlama iletişimlerinden istediğiniz zaman çıkma (Profil → Bildirim Tercihleri)</li>
                                <li>Veri işlemeye itiraz etme</li>
                            </ul>
                            <div className="kvkk-info-box">
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <span>Haklarınızı kullanmak için: <a href="mailto:info@tedport.com">info@tedport.com</a></span>
                                </div>
                            </div>
                        </section>

                        <section className="kvkk-section">
                            <h2>7. Veri Güvenliği</h2>
                            <p>
                                Verileriniz endüstri standardı güvenlik önlemleriyle korunmaktadır. Tüm bağlantılar TLS/SSL ile
                                şifrelenmekte, şifreler hash'lenerek saklanmakta ve veritabanı erişimleri kısıtlı tutulmaktadır.
                            </p>
                            <p>
                                Bir güvenlik ihlali tespit etmeniz durumunda lütfen derhal <a href="mailto:info@tedport.com">info@tedport.com</a> adresine bildirin.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>8. İletişim</h2>
                            <p>
                                Bu politika veya veri işleme pratiklerimiz hakkında sorularınız için bizimle iletişime geçebilirsiniz.
                            </p>
                            <div className="kvkk-info-box">
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <span><strong>E-posta:</strong> <a href="mailto:info@tedport.com">info@tedport.com</a></span>
                                </div>
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">link</span>
                                    <span><a href="/kvkk">KVKK Aydınlatma Metni'ni görüntüle</a></span>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <SharedFooter />
        </>
    );
};

export default GizlilikPolitikasi;

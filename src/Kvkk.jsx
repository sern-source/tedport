import React from 'react';
import { Link } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import SharedFooter from './SharedFooter';
import SEO from './SEO';
import './Kvkk.css';

const Kvkk = () => {
    const fromRegister = document.referrer.includes('/register');

    return (
        <>
            <SEO
                title="KVKK Aydınlatma Metni"
                description="Tedport Kişisel Verilerin Korunması Kanunu Aydınlatma Metni"
                path="/kvkk"
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
                        <span className="material-symbols-outlined kvkk-header-icon">gavel</span>
                        <div>
                            <h1>Kişisel Verilerin Korunması Aydınlatma Metni</h1>
                            <p className="kvkk-last-updated">Son güncelleme: Mayıs 2026</p>
                        </div>
                    </div>

                    <div className="kvkk-body">

                        <section className="kvkk-section">
                            <h2>1. Veri Sorumlusunun Kimliği</h2>
                            <p>
                                İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu
                                sıfatıyla hareket eden <strong>Tedport Teknoloji A.Ş.</strong> ("Tedport" veya "Şirket") tarafından hazırlanmıştır.
                            </p>
                            <div className="kvkk-info-box">
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">location_on</span>
                                    <span><strong>Adres:</strong> [Şirket adresi]</span>
                                </div>
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <span><strong>E-posta:</strong> <a href="mailto:info@tedport.com">info@tedport.com</a></span>
                                </div>
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">badge</span>
                                    <span><strong>MERSİS No:</strong> [●]</span>
                                </div>
                            </div>
                        </section>

                        <section className="kvkk-section">
                            <h2>2. İşlenen Kişisel Veriler</h2>
                            <p>Tedport tarafından işlenen kişisel veriler, kullanıcının platform ile olan ilişkisine göre değişmekle birlikte aşağıdaki gibidir:</p>
                            <div className="kvkk-data-grid">
                                <div className="kvkk-data-card">
                                    <span className="material-symbols-outlined">person</span>
                                    <h3>Kimlik Bilgileri</h3>
                                    <p>Ad, soyad</p>
                                </div>
                                <div className="kvkk-data-card">
                                    <span className="material-symbols-outlined">contact_phone</span>
                                    <h3>İletişim Bilgileri</h3>
                                    <p>E-posta adresi, telefon numarası</p>
                                </div>
                                <div className="kvkk-data-card">
                                    <span className="material-symbols-outlined">security</span>
                                    <h3>İşlem Güvenliği</h3>
                                    <p>IP adresi, log kayıtları, oturum bilgileri</p>
                                </div>
                                <div className="kvkk-data-card">
                                    <span className="material-symbols-outlined">history</span>
                                    <h3>Kullanıcı İşlem Bilgileri</h3>
                                    <p>Platform üzerindeki arama, teklif, mesajlaşma ve etkileşim bilgileri</p>
                                </div>
                                <div className="kvkk-data-card">
                                    <span className="material-symbols-outlined">apartment</span>
                                    <h3>Şirket Bilgileri</h3>
                                    <p>Firma adı, sektör bilgisi, ürün/hizmet bilgileri</p>
                                </div>
                                <div className="kvkk-data-card">
                                    <span className="material-symbols-outlined">campaign</span>
                                    <h3>Pazarlama Verileri</h3>
                                    <p>Tercihler, ilgi alanları, kampanya geri dönüşleri (açık rıza olması halinde)</p>
                                </div>
                            </div>
                        </section>

                        <section className="kvkk-section">
                            <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
                            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                            <ul className="kvkk-list">
                                <li>Kullanıcı hesabının oluşturulması ve yönetilmesi</li>
                                <li>Platform hizmetlerinin sunulması ve geliştirilmesi</li>
                                <li>Tedarikçi ve alıcıların eşleştirilmesi</li>
                                <li>Kullanıcılar arası iletişimin sağlanması</li>
                                <li>Müşteri destek süreçlerinin yürütülmesi</li>
                                <li>Hizmet kalitesinin artırılması ve analiz yapılması</li>
                                <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
                                <li>Yetkili kurum ve kuruluşlara bilgi verilmesi</li>
                                <li>Açık rıza verilmesi halinde pazarlama ve bilgilendirme faaliyetlerinin yürütülmesi</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>4. Kişisel Verilerin Toplanma Yöntemi</h2>
                            <p>Kişisel verileriniz aşağıdaki kanallar aracılığıyla elektronik ortamda toplanmaktadır:</p>
                            <ul className="kvkk-list">
                                <li>Web sitesi üyelik formları</li>
                                <li>Mobil uygulamalar</li>
                                <li>Çerezler (cookies) ve benzeri teknolojiler</li>
                                <li>Üçüncü taraf entegrasyonlar (Google, LinkedIn ile giriş)</li>
                                <li>E-posta ve iletişim formları</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>5. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
                            <p>Kişisel verileriniz, KVKK'nın 5. ve 6. maddeleri kapsamında aşağıdaki hukuki sebeplere dayanarak işlenmektedir:</p>
                            <ul className="kvkk-list">
                                <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
                                <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
                                <li>Veri sorumlusunun meşru menfaatleri</li>
                                <li>Açık rıza (özellikle pazarlama faaliyetleri için)</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>6. Kişisel Verilerin Aktarılması</h2>
                            <p>Kişisel verileriniz aşağıdaki taraflara aktarılabilir:</p>
                            <div className="kvkk-transfer-grid">
                                <div className="kvkk-transfer-item">
                                    <h3>Hizmet Sağlayıcılar</h3>
                                    <p>Barındırma (hosting), altyapı, yazılım, analiz ve iletişim hizmeti sunan iş ortakları</p>
                                </div>
                                <div className="kvkk-transfer-item">
                                    <h3>Yetkili Kurum ve Kuruluşlar</h3>
                                    <p>Mahkemeler, kamu kurumları ve düzenleyici otoriteler</p>
                                </div>
                                <div className="kvkk-transfer-item">
                                    <h3>İş Ortakları</h3>
                                    <p>Platform işleyişi kapsamında tedarikçi ve alıcı kullanıcılar</p>
                                </div>
                            </div>
                            <p className="kvkk-note">Aktarımlar, KVKK'nın 8. ve 9. maddelerine uygun şekilde gerçekleştirilmektedir.</p>
                        </section>

                        <section className="kvkk-section">
                            <h2>7. Kişisel Verilerin Yurt Dışına Aktarılması</h2>
                            <p>
                                Kullanılan altyapı hizmetlerinin yurt dışında bulunması halinde, kişisel verileriniz KVKK'ya uygun olarak
                                ve gerekli teknik ve idari tedbirler alınarak yurt dışına aktarılabilir.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>8. Kişisel Verilerin Saklanma Süresi</h2>
                            <p>Kişisel verileriniz;</p>
                            <ul className="kvkk-list">
                                <li>Hizmet ilişkisinin devamı süresince</li>
                                <li>Yasal saklama süreleri boyunca</li>
                                <li>İşleme amacının gerektirdiği süre kadar</li>
                            </ul>
                            <p>saklanmakta olup, sürenin sonunda silinmekte, yok edilmekte veya anonim hale getirilmektedir.</p>
                        </section>

                        <section className="kvkk-section">
                            <h2>9. KVKK Kapsamındaki Haklarınız</h2>
                            <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                            <ul className="kvkk-list">
                                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                                <li>KVKK'ya uygun olarak silinmesini veya yok edilmesini isteme</li>
                                <li>Yapılan işlemlerin üçüncü kişilere bildirilmesini isteme</li>
                                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                                <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararınızın giderilmesini talep etme</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>10. Başvuru Yöntemi</h2>
                            <p>KVKK kapsamındaki taleplerinizi aşağıdaki yöntemlerle iletebilirsiniz:</p>
                            <div className="kvkk-info-box">
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <span><strong>E-posta:</strong> <a href="mailto:info@tedport.com">info@tedport.com</a></span>
                                </div>
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">location_on</span>
                                    <span><strong>Yazılı başvuru:</strong> [Şirket adresi]</span>
                                </div>
                            </div>
                            <p className="kvkk-note">Başvurularınız, mevzuata uygun olarak en geç <strong>30 gün</strong> içerisinde sonuçlandırılacaktır.</p>
                        </section>

                        <section className="kvkk-section">
                            <h2>11. Güncellemeler</h2>
                            <p>
                                Tedport, işbu Aydınlatma Metni üzerinde gerekli gördüğü durumlarda değişiklik yapma hakkını saklı tutar.
                                Güncellenmiş metin, platform üzerinde yayımlandığı tarihten itibaren geçerli olur.
                            </p>
                        </section>

                    </div>

                    {fromRegister && (
                        <div className="kvkk-footer-nav">
                            <Link to="/register" className="kvkk-back-btn">
                                <span className="material-symbols-outlined">arrow_back</span>
                                Kayıt Sayfasına Dön
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <SharedFooter />
        </>
    );
};

export default Kvkk;

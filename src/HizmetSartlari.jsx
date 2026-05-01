import React from 'react';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import SharedFooter from './SharedFooter';
import SEO from './SEO';
import './Kvkk.css';

const HizmetSartlari = () => {
    return (
        <>
            <SEO
                title="Hizmet Şartları"
                description="Tedport platformu kullanım koşulları ve hizmet şartları"
                path="/hizmet-sartlari"
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
                        <span className="material-symbols-outlined kvkk-header-icon">description</span>
                        <div>
                            <h1>Hizmet Şartları</h1>
                            <p className="kvkk-last-updated">Son güncelleme: Mayıs 2026</p>
                        </div>
                    </div>

                    <div className="kvkk-body">

                        <section className="kvkk-section">
                            <h2>1. Taraflar ve Kapsam</h2>
                            <p>
                                Bu Hizmet Şartları, <strong>Tedport Teknoloji A.Ş.</strong> ("Tedport" veya "Biz") ile Tedport platformunu kullanan
                                gerçek veya tüzel kişiler ("Kullanıcı") arasındaki hukuki ilişkiyi düzenlemektedir.
                            </p>
                            <p>
                                Platforma kayıt olarak veya hizmetlerimizi kullanarak bu şartları kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız
                                platformu kullanmayınız.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>2. Platform Hizmetleri</h2>
                            <p>
                                Tedport, Türkiye'nin güvenilir B2B tedarik platformudur. Platform üzerinden aşağıdaki hizmetler sunulmaktadır:
                            </p>
                            <ul className="kvkk-list">
                                <li>Firma rehberi ve firma profil sayfaları</li>
                                <li>İhale ilanları oluşturma ve yönetme</li>
                                <li>İhalelere teklif verme ve teklif yönetimi</li>
                                <li>Firmalar arası iletişim ve mesajlaşma</li>
                                <li>Kurumsal hesap ve yetkilendirme yönetimi</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>3. Kullanıcı Hesabı ve Sorumluluklar</h2>
                            <p>
                                Platforma kayıt olurken doğru ve güncel bilgi sağlamak kullanıcının sorumluluğundadır. Hesap bilgilerinizin
                                gizliliğini korumak ve hesabınız üzerinden gerçekleştirilen tüm işlemlerden sorumlu olmak size aittir.
                            </p>
                            <p>
                                Aşağıdaki kullanım biçimleri kesinlikle yasaktır:
                            </p>
                            <ul className="kvkk-list">
                                <li>Yanıltıcı veya sahte bilgi paylaşımı</li>
                                <li>Başka kullanıcıların hesaplarına yetkisiz erişim girişimi</li>
                                <li>Platform altyapısına zarar verecek her türlü eylem</li>
                                <li>Ticari amaçlı spam veya istenmeyen mesaj gönderimi</li>
                                <li>Yürürlükteki mevzuata aykırı içerik yayınlanması</li>
                            </ul>
                        </section>

                        <section className="kvkk-section">
                            <h2>4. Kurumsal Hesaplar</h2>
                            <p>
                                Kurumsal hesap başvurusu yapan kullanıcılar, şirketi temsil etme yetkisine sahip olduklarını beyan ederler.
                                Tedport, başvuru sürecinde yetkilendirme belgesi talep etme hakkını saklı tutar.
                            </p>
                            <p>
                                Onaylanan kurumsal hesaplar, Tedport tarafından atanan firma yöneticileri tarafından denetlenir.
                                Hatalı veya yanıltıcı bilgi tespiti durumunda hesap askıya alınabilir veya kapatılabilir.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>5. Fikri Mülkiyet</h2>
                            <p>
                                Tedport platformundaki tüm içerik, tasarım, marka, logo ve yazılım Tedport'a aittir ve fikri mülkiyet
                                mevzuatı kapsamında korunmaktadır. Önceden yazılı izin alınmaksızın hiçbir içerik kopyalanamaz,
                                çoğaltılamaz veya ticari amaçla kullanılamaz.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>6. Sorumluluk Sınırlaması</h2>
                            <p>
                                Tedport, kullanıcılar arasındaki ticari ilişkilerde aracı konumundadır. Platform üzerinden yapılan
                                anlaşmalar ve ödemelerin sonuçlarından Tedport sorumlu tutulamaz.
                            </p>
                            <p>
                                Hizmetlerin kesintisiz veya hatasız çalışacağını garanti etmemekle birlikte, hizmet kalitesini
                                sürekli iyileştirme taahhüdündeyiz.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>7. Şartların Değiştirilmesi</h2>
                            <p>
                                Tedport, hizmet şartlarını önceden bildirimde bulunmaksızın güncelleme hakkını saklı tutar.
                                Güncellemeler platform üzerinde yayımlandığı tarihten itibaren geçerli olur. Platformu kullanmaya
                                devam etmeniz, güncel şartları kabul ettiğiniz anlamına gelir.
                            </p>
                        </section>

                        <section className="kvkk-section">
                            <h2>8. Uygulanacak Hukuk</h2>
                            <p>
                                Bu Hizmet Şartları Türk hukukuna tabidir. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve
                                İcra Daireleri yetkilidir.
                            </p>
                            <div className="kvkk-info-box">
                                <div className="kvkk-info-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <span>Sorularınız için: <a href="mailto:info@tedport.com">info@tedport.com</a></span>
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

export default HizmetSartlari;

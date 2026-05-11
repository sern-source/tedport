// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — misyon & vizyon kartları
import React from 'react';

const AboutValues = () => (
    <section className="about-section">
        <div className="about-container">
            <div className="about-section-header">
                <h2>Değerlerimiz &amp; Hedeflerimiz</h2>
                <p>Bizi biz yapan temel prensiplerimiz ve geleceğe bakış açımız.</p>
            </div>
            <div className="about-values-grid">
                {/* Mission */}
                <div className="about-value-card">
                    <div className="about-value-icon">
                        <span className="material-symbols-outlined">target</span>
                    </div>
                    <h3>Misyonumuz</h3>
                    <p>Tedport'un misyonu; firmaların doğru tedarikçi, doğru müşteri ve doğru iş fırsatlarına daha kısa sürede ulaşmasını sağlayarak satınalma ve satış süreçlerini dijitalleştirmek ve ticari verimliliği artırmaktır.</p>
                    <p>Birçok şirket için tedarikçi araştırması yapmak, teklif toplamak, müşteri bulmak ve güvenilir firmalara ulaşmak ciddi zaman ve operasyon maliyeti oluşturur. Tedport, bu süreçleri merkezi bir yapıda toplayarak işletmelerin daha hızlı, daha doğru ve daha verimli ticari kararlar almasına yardımcı olur.</p>
                    <p>Platformumuz sayesinde firmalar; satınalma taleplerini kolayca yayınlayabilir, birden fazla tedarikçiden teklif alabilir, tedarikçi karşılaştırmaları yapabilir, hedef müşterilere ve tedarikçilere ulaşabilir, satış ve pazarlama süreçlerini geliştirebilir, firma görünürlüğünü artırabilir ve yeni iş bağlantıları kurabilir.</p>
                    <div className="about-value-glow glow-blue"></div>
                </div>
                {/* Vision */}
                <div className="about-value-card">
                    <div className="about-value-icon">
                        <span className="material-symbols-outlined">visibility</span>
                    </div>
                    <h3>Vizyonumuz</h3>
                    <p>Tedport olarak vizyonumuz; firmaların satınalma, tedarikçi bulma, müşteri kazanma ve satış geliştirme süreçlerini tek bir dijital platform üzerinden yönetebildiği güçlü bir B2B ekosistemi oluşturmaktır.</p>
                    <p>Tedport'un uzun vadeli hedefi; satınalma profesyonelleri, satış ekipleri ve tedarikçi firmalar için Türkiye'nin en çok tercih edilen dijital iş ağı haline gelmektir. Firmaların klasik arama motorları ve farklı platformlarda saatler süren firma araştırması süreçlerini azaltarak, ihtiyaç duydukları şirketlere ve ürünlere doğrudan erişebilecekleri merkezi bir yapı sunmayı amaçlıyoruz.</p>
                    <p>Vizyonumuz yalnızca firmaları listeleyen bir platform olmak değil; satınalma ve satış süreçlerinde aktif değer üreten, ticari iş birliklerini hızlandıran ve şirketlerin büyümesine katkı sağlayan dijital bir iş geliştirme merkezi olmaktır.</p>
                    <div className="about-value-glow glow-purple"></div>
                </div>
            </div>
        </div>
    </section>
);

export default AboutValues;

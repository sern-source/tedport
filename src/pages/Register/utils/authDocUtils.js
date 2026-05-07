// Enes Doğanay | 6 Mayıs 2026: Yetkilendirme belgesi PDF içeriği — inline print penceresi
export const downloadYetkilendirmePdf = () => {
    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Tedport \u2013 Yetkilendirme Belgesi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111; padding: 40px 50px; line-height: 1.65; }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1e3a5f; }
    .logo { font-size: 22pt; font-weight: 900; letter-spacing: 3px; color: #1e3a5f; }
    .doc-title { font-size: 12pt; font-weight: bold; margin-top: 8px; text-transform: uppercase; color: #1e3a5f; letter-spacing: 0.5px; }
    .doc-date { font-size: 9pt; color: #888; margin-top: 6px; }
    h2 { font-size: 10.5pt; font-weight: bold; color: #1e3a5f; margin: 20px 0 7px; text-transform: uppercase; border-bottom: 1px solid #c8d8ec; padding-bottom: 4px; }
    p { margin-bottom: 7px; font-size: 10.5pt; }
    ul { margin: 4px 0 8px 22px; }
    ul li { margin-bottom: 4px; font-size: 10.5pt; }
    .box { background: #f5f8fc; border: 1px solid #dce8f5; border-radius: 4px; padding: 12px 16px; margin: 8px 0; }
    .party-name { font-weight: bold; font-size: 11pt; }
    .between { text-align: center; font-size: 9pt; color: #888; margin: 6px 0; }
    .field-row { display: flex; gap: 16px; margin-bottom: 10px; }
    .field { flex: 1; }
    .field-label { font-size: 9pt; color: #444; font-weight: bold; margin-bottom: 3px; }
    .field-line { border-bottom: 1.5px solid #333; height: 24px; }
    .notice { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px 14px; font-size: 9.5pt; margin: 18px 0; color: #555; }
    .sig-grid { display: flex; gap: 24px; margin-top: 28px; }
    .sig-box { flex: 1; border: 1px solid #cdd; border-radius: 5px; padding: 14px 16px; }
    .sig-box h3 { font-size: 10pt; font-weight: bold; color: #1e3a5f; margin-bottom: 12px; text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; text-transform: uppercase; }
    .sig-row { margin-bottom: 12px; }
    .sig-label { font-size: 9pt; color: #555; }
    .sig-line { border-bottom: 1px solid #333; height: 22px; margin-top: 2px; }
    .stamp { height: 70px; border: 1px dashed #bbb; border-radius: 3px; margin-top: 8px; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 8.5pt; }
    .footer { margin-top: 24px; text-align: center; font-size: 8pt; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
    .print-btn { display: block; margin: 0 auto 20px; padding: 9px 28px; background: #1e3a5f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10pt; }
    @media print { .print-btn { display: none !important; } body { padding: 20px 30px; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Yazdır / PDF Olarak Kaydet</button>
  <div class="header">
    <div class="logo">TEDPORT</div>
    <div class="doc-title">Firma Sayfası Yönetim Yetkilendirme ve Taahhüt Belgesi</div>
    <div class="doc-date">Belge Tarihi: _____ / _____ / _______</div>
  </div>
  <h2>1. Taraflar</h2>
  <p>İşbu Yetkilendirme Belgesi ("Belge");</p>
  <div class="box">
    <p><span class="party-name">[FİRMA ÜNVANI]</span></p>
    <p>(MERSİS No: […………………])</p>
    <p>("Firma")</p>
  </div>
  <div class="between">— ile —</div>
  <div class="box">
    <p><span class="party-name">Tedport Teknoloji A.Ş.</span></p>
    <p>("Tedport")</p>
  </div>
  <p style="margin-top:8px">arasında düzenlenmiştir.</p>
  <h2>2. Amaç</h2>
  <p>Bu Belge, Firma adına Tedport platformunda oluşturulan/oluşturulacak firma sayfasının yönetimi için yetkilendirilen kişinin belirlenmesi ve yetki kapsamının düzenlenmesi amacıyla hazırlanmıştır.</p>
  <h2>3. Yetkilendirilen Kişi Bilgileri</h2>
  <div class="field-row">
    <div class="field"><div class="field-label">Ad Soyad</div><div class="field-line"></div></div>
    <div class="field"><div class="field-label">T.C. Kimlik No</div><div class="field-line"></div></div>
  </div>
  <div class="field-row">
    <div class="field"><div class="field-label">Unvan / Görev</div><div class="field-line"></div></div>
    <div class="field"><div class="field-label">Telefon</div><div class="field-line"></div></div>
  </div>
  <div class="field-row">
    <div class="field"><div class="field-label">E-posta</div><div class="field-line"></div></div>
    <div class="field" style="visibility:hidden"><div class="field-label">.</div><div class="field-line"></div></div>
  </div>
  <h2>4. Yetki Kapsamı</h2>
  <p>Firma, yukarıda bilgileri yer alan kişiyi aşağıdaki işlemleri gerçekleştirmek üzere yetkilendirdiğini kabul eder:</p>
  <ul>
    <li>Firma sayfasını oluşturmak ve düzenlemek</li>
    <li>Ürün/hizmet bilgilerini eklemek ve güncellemek</li>
    <li>Platform üzerinden teklif vermek ve iletişim kurmak</li>
    <li>Kullanıcı mesajlarını yanıtlamak</li>
    <li>Firma adına içerik paylaşmak</li>
  </ul>
  <p>Bu yetki, Tedport platformu ile sınırlıdır.</p>
  <h2>5. Beyan ve Taahhütler</h2>
  <ul>
    <li>Verilen tüm bilgilerin doğru ve güncel olduğunu,</li>
    <li>Yetkilendirmenin firma içi yetkiye dayandığını,</li>
    <li>Tedport'un bu yetkilendirmeyi ayrıca doğrulamakla yükümlü olmadığını,</li>
    <li>Yetkisiz kullanım veya yanlış beyan durumunda tüm sorumluluğun kendilerine ait olduğunu,</li>
    <li>Platformda yapılan tüm işlemlerin firma adına yapılmış sayılacağını.</li>
  </ul>
  <h2>6. Sorumluluk ve Tazminat</h2>
  <ul>
    <li>Yetkili kişinin yaptığı tüm işlemlerden doğrudan sorumlu olduğunu,</li>
    <li>Bu işlemler nedeniyle Tedport'un uğrayabileceği her türlü zarar, talep ve masrafı tazmin edeceğini,</li>
    <li>Üçüncü kişilerden gelebilecek taleplerde Tedport'u sorumlu tutmayacağını.</li>
  </ul>
  <h2>7. Yetkinin Süresi ve Sona Ermesi</h2>
  <ul>
    <li>Bu yetkilendirme, Firma tarafından yazılı olarak geri alınana kadar geçerlidir.</li>
    <li>Yetkinin iptali, Tedport'a yazılı bildirim yapılması ile hüküm doğurur.</li>
    <li>Bildirim yapılana kadar gerçekleştirilen işlemler geçerli sayılır.</li>
  </ul>
  <h2>8. Doğrulama ve Ek Belge Talebi</h2>
  <p>Tedport, gerekli gördüğü durumlarda imza sirküleri, ticaret sicil gazetesi gibi ek belgeleri talep etme ve yetkilendirmeyi askıya alma hakkını saklı tutar.</p>
  <h2>9. Elektronik Kayıtların Delil Niteliği</h2>
  <p>Taraflar, Tedport sistemlerinde tutulan log kayıtları, işlem geçmişi ve mesajlaşmalar gibi kayıtların Hukuk Muhakemeleri Kanunu çerçevesinde kesin delil niteliği taşıdığını kabul eder.</p>
  <h2>10. Kişisel Veriler</h2>
  <p>Bu belge kapsamında paylaşılan kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenecektir.</p>
  <h2>11. Uyuşmazlık Çözümü</h2>
  <p>İşbu Belge'den doğabilecek uyuşmazlıklarda <strong>İstanbul (Merkez) Mahkemeleri ve İcra Daireleri</strong> yetkilidir.</p>
  <h2>12. Yürürlük</h2>
  <p>İşbu Belge, taraflarca imzalandığı tarihte yürürlüğe girer.</p>
  <div class="notice">Bu belgeyi eksiksiz doldurunuz, firma yetkilisi tarafından imzalatınız ve kaşe vurulduğundan emin olunuz. Ardından taranmış veya fotoğraflanmış PDF olarak sisteme yükleyiniz.</div>
  <div class="sig-grid">
    <div class="sig-box">
      <h3>Firma Yetkilisi</h3>
      <div class="sig-row"><div class="sig-label">Ad Soyad</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">Unvan</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">Tarih</div><div class="sig-line"></div></div>
      <div class="stamp">İmza / Kaşe Alanı</div>
    </div>
    <div class="sig-box">
      <h3>Yetkilendirilen Kişi</h3>
      <div class="sig-row"><div class="sig-label">Ad Soyad</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">Tarih</div><div class="sig-line"></div></div>
      <div class="sig-row"><div class="sig-label">İmza</div><div class="sig-line"></div></div>
      <div style="height:70px"></div>
    </div>
  </div>
  <div class="footer">Tedport Teknoloji A.Ş. | info@tedport.com | www.tedport.com</div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=820');
    if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 600);
    }
};

---
applyTo: "src/**/*.{css,jsx}"
---

# 🎨 Tedport Web — UI & CSS System (v1)

Bu kurallar JS architecture kurallarıyla birlikte çalışır.
Tüm yeni ve refactor edilen bileşenler bu kurallara UYMAK ZORUNDADIR.

---

## 🔴 TEMEL İLKELER

- Tutarlılık > Yaratıcılık
- Yeniden kullanılabilirlik > Tek seferlik stil
- Temiz UI > Hızlı UI

---

## 🧠 REFACTOR DAVRANIŞ KURALI (ÇOK KRİTİK)

AI aşağıdaki prensibe UYMAK ZORUNDADIR:

👉 Eğer UI:
- görsel olarak tutarlıysa  
- spacing sistemi büyük ölçüde doğruysa  
- ciddi bir UX problemi yoksa  

❗ KESİNLİKLE redesign YAPILMAZ

---

### ✅ AI NE YAPMALI

- class isimlerini düzelt
- tekrar eden stilleri temizle
- component’lere böl
- yapıyı iyileştir

---

### ❌ AI NE YAPMAMALI

- Layout’u değiştirme  
- Spacing’i keyfi değiştirme  
- Renkleri değiştirme  
- “Daha güzel olur” diye UI yeniden yazma  

---

## ⚠️ MEVCUT UI KORUMA KURALI

Refactor sırasında:

- Mevcut spacing sistemi TAM uymasa bile:
  - görsel olarak düzgünse → DOKUNMA

- Hardcoded renkler:
  - sadece tekrar ediyorsa → refactor et
  - tekil kullanım → bırakılabilir

- Border radius / shadow:
  - sadece ciddi tutarsızlık varsa düzelt

---

## 🧠 ALTIN KARAR KURALI

AI şu soruyu sormalı:

👉 “Bu değişiklik UI görünümünü değiştiriyor mu?”

- EVET → yapma (gereksizse)
- HAYIR → yap (refactor)

---

## 🧱 BİLEŞEN BÖLME KURALI (KRİTİK)

Bir bileşen:
- 150 satırı aşıyorsa
- 2'den fazla görsel bölüm içeriyorsa
- layout + logic + UI bloklarını karıştırıyorsa

👉 ZORUNLU olarak şu şekilde bölünmelidir:


Component
├── ComponentHeader
├── ComponentContent
└── ComponentActions


Örnek:

TenderDetailPage
├── TenderHeader
├── TenderInfo
├── TenderOffers
└── TenderActions


---

## 🎨 CSS İSİMLENDİRME (STRICT — BEM benzeri, component-scoped)

### DOĞRU:
```css
.tender-card {}
.tender-card__title {}
.tender-card__meta {}
.tender-card--highlighted {}
YANLIŞ ❌:
.box {}
.title {}
.bigText {}
.red {}
📁 CSS DOSYA YAPISI

Her bileşenin kendi CSS dosyası OLMAK ZORUNDADIR:

ComponentName.jsx
ComponentName.css
🔒 KAPSAM KURALLARI
Global sızıntı yok
Ham tag stillendirmesi YASAK:
div {}  ❌
h1 {}   ❌

Yalnızca class kullanılır.

📏 BOŞLUK SİSTEMİ (TARGET)

Yalnızca şu değerler hedeflenir:

4px | 8px | 12px | 16px | 24px | 32px | 40px | 48px
⚠️ REFACTOR NOTU
Bu değerler hedef sistemdir
Mevcut UI uyumlu değilse AMA düzgün görünüyorsa → değiştirilmez
Sadece ciddi tutarsızlık varsa düzeltilir
YASAK ❌ (yeni yazılan kod için)
margin: 13px;
padding: 27px;
🎨 TASARIM TOKEN'LARI (ZORUNLU)

CSS değişkenleri kullanılır:

:root {
  --color-primary: #2563eb;
  --color-text: var(--text-dark);
  --radius-md: 8px;
  --shadow-soft: 0 2px 8px rgba(0,0,0,0.08);
}
YASAK ❌ (yeni kod için)
color: #1a73e8;
border-radius: 7px;
🧩 UI TUTARLILIK KURALLARI
Border Radius

Yalnızca şunlar kullanılır: 6px | 8px | 12px

Gölgeler

Yalnızca önceden tanımlanmış gölgeler.

Tipografi
Rastgele font boyutu yok
Tutarlı ölçek kullanılır
🎯 LAYOUT KURALLARI
Flexbox → layout için
Grid → karmaşık layout için
KAÇINILACAKLAR:
Gereksiz position: absolute
Sihirli genişlik/yükseklik değerleri
🚫 INLINE STYLE KURALI
<div style={{ marginTop: 17 }}>  ❌
YALNIZCA izin verilenler:
Dinamik genişlik/pozisyon
Animasyon değerleri
⚠️ REFACTOR DURUMU:
Tek seferlik küçük inline style → kalabilir
Tekrar ediyorsa → class’a alınır
🧠 YENİDEN KULLANILABİLİRLİK

Aynı UI iki kez görünüyorsa → bileşen çıkarılır.

Örnekler: Button, Card, Modal, Badge, Tag

🔁 UI REFACTORING KURALLARI (KRİTİK)

UI değiştirilirken AI ZORUNLU OLARAK:

Tekrar eden stilleri kaldırır
Benzer class'ları birleştirir
Yeniden kullanılabilir bileşenler çıkarır
Boşluğu normalize eder
İsimlendirme standardını uygular

❗ Ama:

UI görünümünü değiştirmez
görsel hiyerarşiyi bozmaz
kullanıcı deneyimini değiştirmez
🎨 PREMİUM UI KURALLARI (SADECE YENİ UI)
Whitespace cömertçe kullanılır
Kalabalık layout'lardan kaçınılır
Borderlar yerine subtle shadow tercih edilir
Tutarlı boşluk ritmi
Çok fazla renk kullanılmaz
⚠️ ANTI-PATTERN'LER
Rastgele boşluk ❌
Tutarsız border-radius ❌
Inline renkler ❌
Tekrar eden stiller ❌
Derin iç içe CSS ❌
🧠 AI UYGULAMA KURALI

UI yazmadan önce AI KONTROL ETMEK ZORUNDADIR:

Bu yeniden kullanılabilir mi?
İsimlendirme tutarlı mı?
Boşluk değerleri geçerli mi?
Bölünebilir mi?

Değilse → Önce refactor, sonra devam.

---

## 🔄 REFACTOR PROTOKOLÜ (ZORUNLU — Her sayfa refactorı için)

### ADIM 1: PRE-FLIGHT (Yazmadan önce)

AI orijinal dosyayı okuyup şunları çıkarmak ZORUNDADIR:
- **Tüm event handler'lar**: `onClick`, `onChange`, `onSubmit` ve ne yaptığı
- **Tüm state'ler**: isim + başlangıç değeri + ne zaman değişiyor
- **Prop akışları**: parent → child arası geçen prop'lar, callback'ler
- **Kritik CSS davranışları**: hover state'ler, z-index değerleri, dropdown pozisyonları, animasyonlar

> Bu liste refactor boyunca "davranış checklist'i" olarak kullanılır.

---

### ADIM 2: YAZARKEN

- Her event handler orijinalle **birebir** karşılaştırılır — davranış yorumlanmaz, kopyalanır
- CSS orijinal dosyadan okunarak yazılır; **tahmine dayalı CSS üretilmez**
- Prop adı değişirse (ör. `onSearchTag` → `onTagClick`) çağıran tüm yerler aynı anda güncellenir

---

### ADIM 3: POST-CHECK (Silmeden önce)

1. **Handler karşılaştırması**: Orijinal dosyadaki her handler'ın yeni dosyada karşılığı var mı?
2. **CSS duplicate kontrolü**: CSS dosyası bitince aynı sınıf adı birden fazla kez geçiyor mu? (`grep` ile kontrol et)
3. **`transform` + z-index**: Hover'da `transform` varsa `z-index` de eklenmiş mi?
4. **Build**: `npm run build` → exit code 0 ✅
5. **Ancak ondan sonra** eski dosyalar silinir

---

### ⚠️ GEÇMİŞ HATALARDAN ÇIKARILAN KURALLAR

| Tuzak | Önlem |
|---|---|
| Tag/chip click → yanlış handler | Orijinal `onClick` fonksiyonu birebir oku, yeniden yaz |
| CSS duplicate kurallar ezme | CSS dosyası bitince `grep` ile sınıf adı tekrarını ara |
| `transform` + z-index çakışması | Hover'da `transform` varsa **her zaman** `z-index` ekle |
| `position: fixed` + `transform` parent | `fixed` dropdown'u `transform` olan parent altında kullanma; `absolute` kullan |
| Prop yeniden adlandırma kayması | Prop adı değişince çağıran dosyaları aynı anda güncelle |
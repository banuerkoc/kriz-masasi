# İKÇÜ Ders Konukluğu: Kurumsal İletişimde Çeviklik ve AI

İzmir Katip Çelebi Üniversitesi, Halkla İlişkiler ve Reklamcılık bölümü için hazırlanan ders konukluğu materyalleri.

- **Tarih:** Pazartesi 19 Ekim 2026, 10:00
- **Süre:** 1,5 saat
- **Konuşmacı:** Banu Erkoç
- **Organizasyon:** Ali Rıza Tunçer (ART Brand Atelier), Burcu Hoca (İKÇÜ)

## Akış

| Süre | Bölüm |
|---|---|
| 10 dk | Açılış: Çeviklik nedir? Kriz anında ilk açıklama için ne kadar süre var? |
| 15 dk | AI ile çeviklik: dinleme, üretim, test, kriz hazırlığı. Çevik iletişim döngüsü. |
| 15 dk | Kurumsal iletişim panelinin gösterimi |
| 20 dk | Öğrencilere özel aracın canlı demosu ve "bunu nasıl yaptım" |
| 10 dk | Sınırlar ve etik: uydurulan bilgi, KVKK, marka sesi, sorumluluk |
| 20 dk | Soru-cevap ve kapanış (araç linki / QR kod) |

## Öğrencilere özel araç

Aday fikirler:
1. **Kriz İlk 60 Dakika simülatörü** (önerilen): senaryo seçilir, araç ilk açıklama taslağını, olası gazeteci sorularını ve kanal planını çıkarır.
2. **Tek mesaj, beş kanal:** bir duyuru LinkedIn, Instagram, basın bülteni, iç duyuru ve SMS için uyarlanır.
3. **Paydaş gözüyle oku:** bir metin çalışan, gazeteci, müşteri ve yatırımcı gözünden yorumlanır.

Canlı demoda internet kesilirse diye araca önceden hazırlanmış senaryolar da konacak.

## Dosyalar

- `kriz-masasi.html`: yayınlanan tek sayfa. Elle düzenlenmez, `./build.sh` ile üretilir.
- `src/kutuphane.js`: kriz kütüphanesi. Senaryolar, gündem sinyalleri, AI'ın sorunlu ilk taslakları, düzeltilmiş açıklamalar, gazeteci soruları ve prompt kütüphanesi burada. İçerik değişikliği için yalnızca bu dosyayı düzenle.
- `src/head.html`: görünüm ve sayfa iskeleti.
- `src/logic.js`: simülasyon, radar, SCCT puanı, ton kontrolü, PDF.
- `assets/`: logolar (derleme sırasında sayfaya gömülür).

Sayfada canlı AI çağrısı yoktur; bütün metinler kütüphaneden gelir.

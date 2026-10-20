/* ================= KRİZ KÜTÜPHANESİ =================
   Sayfadaki bütün içerik buradan gelir; canlı AI çağrısı yoktur.
   Her senaryoda: sinyaller (gündem), yeni gelişme, hazır plan.
   taslak / taslakG: AI'ın yazabileceği tipik, sorunlu ilk taslak (derste "yanlış" örnek).
   aciklama / aciklamaG: kurumsal iletişimcinin düzelttiği, yayına hazır metin.
   ================================================== */
const CLUSTERS = {
  kurban:{ad:"Kurban kümesi", base:20, sor:"zayıf sorumluluk"},
  kaza:{ad:"Kaza kümesi", base:42, sor:"düşük sorumluluk"},
  onlenebilir:{ad:"Önlenebilir küme", base:66, sor:"yüksek sorumluluk"}
};
const STRATS = {
  kurban:{ad:"Bilgilendir ve ilgi göster", metin:"Kurum da olaydan zarar görmüş durumda. İnsanların kendini korumak için bilmesi gerekenleri açıkça söyle, mağdurlara ilgi göster, olayın kontrol dışı yönünü sakin bir dille anlat."},
  kaza:{ad:"Azalt ve düzelt", metin:"Olayın kasıt ya da ihmal içermediğini kanıtla anlat, ama savunmaya geçme. Mağdurlara ilgi göster ve tekrar yaşanmaması için atılan somut adımı söyle."},
  onlenebilir:{ad:"Yeniden inşa et", metin:"Sorumluluğu üstlen, açıkça özür dile, telafiyi ve kalıcı düzeltmeyi takvimiyle açıkla. Bu kümede savunma ya da mazeret krizi büyütür."}
};

const SCENARIOS = [
{
  id:"is-kazasi", baslik:"Fabrikada iş kazası videosu",
  kurum:"ÇelikPelik Galaktik Döküm A.Ş.", sektor:"Metal döküm, Kemalpaşa OSB, 640 çalışan",
  ozet:"Sabah vardiyasında pres hattında bir çalışan elinden yaralandı. Olay anının videosu WhatsApp gruplarından X'e düştü.",
  kume:"kaza",
  sinyaller:[
    {t:0,kaynak:"Anonim hesap",kanal:"X",metin:"Kemalpaşa'da fabrikada iş kazası, işçi kanlar içinde! Kimse bir şey söylemiyor. [video]",erisim:12000,duygu:-0.8},
    {t:4,kaynak:"Yerel haber sitesi",kanal:"Haber",metin:"Kemalpaşa OSB'de iş kazası: 1 yaralı. Fabrika yönetiminden henüz açıklama yapılmadı.",erisim:35000,duygu:-0.4},
    {t:9,kaynak:"Çalışanın yakını",kanal:"Instagram",metin:"Abim hastanede. Şirketten bizi arayan bile olmadı.",erisim:8000,duygu:-0.9},
    {t:15,kaynak:"Ulusal gazete muhabiri",kanal:"Basın",metin:"Yaralının durumu ve kazanın nedeni hakkında açıklamanız var mı? 30 dakika içinde haberi yayınlıyoruz.",erisim:0,duygu:-0.2},
    {t:22,kaynak:"Bölge sendikası",kanal:"X",metin:"İş kazası kader değildir! ÇelikPelik yönetimi hesap vermeli.",erisim:60000,duygu:-0.9},
    {t:31,kaynak:"İSG uzmanı",kanal:"LinkedIn",metin:"Videoya bakınca preste ışık bariyeri görünmüyor. Bu bir ekipman sorunu olabilir.",erisim:15000,duygu:-0.6},
    {t:40,kaynak:"Çalışan WhatsApp grubu",kanal:"İç kanal",metin:"Yarın o hatta çalışacak mıyız? Güvende miyiz, kimse bir şey demiyor.",erisim:640,duygu:-0.5},
    {t:52,kaynak:"Ulusal TV",kanal:"Haber",metin:"Muhabirimiz fabrikanın önünde. Yönetimden kameraya konuşan olmadı.",erisim:250000,duygu:-0.5},
    {"t": 2, "kaynak": "Yerel kullanıcı", "kanal": "X", "metin": "Kemalpaşa OSB'de ambulans sesleri, fabrikanın önü kalabalık.", "erisim": 4000, "duygu": -0.4},
    {"t": 6, "kaynak": "Vardiya çalışanı", "kanal": "İç kanal", "metin": "Telefonları bırakın dediler, içeride ne oluyor? Kimse açıklama yapmıyor.", "erisim": 640, "duygu": -0.6},
    {"t": 11, "kaynak": "Canlı yayıncı", "kanal": "TikTok", "metin": "Fabrikanın önünden canlıdayım: İçeride ne olduğunu kimse söylemiyor.", "erisim": 45000, "duygu": -0.7},
    {"t": 17, "kaynak": "Bölgesel gazete", "kanal": "Haber", "metin": "İzmir'de iş kazası: Pres hattında çalışan işçi elinden yaralandı.", "erisim": 70000, "duygu": -0.4},
    {"t": 26, "kaynak": "Bölge milletvekili", "kanal": "X", "metin": "Bu kazayı Meclis'e taşıyacağım. Soru önergesi hazırlıyorum.", "erisim": 80000, "duygu": -0.7},
    {"t": 35, "kaynak": "Haber ajansı", "kanal": "Basın", "metin": "Tesiste daha önce iş kazası yaşandı mı? Kayıtları paylaşır mısınız?", "erisim": 0, "duygu": -0.3},
    {"t": 44, "kaynak": "Çalışanın kızı", "kanal": "Instagram", "metin": "Babam iyi, dua eden herkese teşekkür ederiz.", "erisim": 20000, "duygu": 0.4},
    {"t": 47, "kaynak": "OSB yönetimi", "kanal": "LinkedIn", "metin": "Üye firmamızla görüşüyoruz, süreci yakından takip ediyoruz.", "erisim": 9000, "duygu": 0.1},
    {"t": 56, "kaynak": "Kullanıcı", "kanal": "X", "metin": "ÇelikPelik'in geçen yılki İSG ödülü haberi yeniden dolaşıyor: Ödül aldınız, peki ya işçi?", "erisim": 50000, "duygu": -0.7},
    {"t": 58, "kaynak": "Çalışan grubu", "kanal": "İç kanal", "metin": "Arkadaşlar yarın vardiyaya gelmemeyi konuşuyor.", "erisim": 640, "duygu": -0.8}
  ],
  gelisme:{kaynak:"Eski çalışan",kanal:"X",metin:"O presin emniyet sensörü 3 aydır arızalıydı. Defalarca tutanak tuttuk, kimse dinlemedi.",erisim:90000,duygu:-0.95,kume:"onlenebilir"},
  hazir:{
    taslak:"Kemalpaşa tesisimizde yaşanan talihsiz iş kazasından haberdarız. Çalışanımızın sağlık durumu yakından takip ediliyor. Konuyu çok ciddiye alıyoruz ve gerekli incelemeler yapılmaktadır. Kamuoyunun bilgisine sunarız.",
    taslakG:"Sosyal medyada paylaşılan iddiaları görüyoruz. Ekipmanla ilgili bir sorun olduysa gerekli adımlar atılacaktır. Olası mağduriyetlerin giderilmesi için hassasiyetle çalışıyoruz.",
    aciklama:"Bugün saat [08.40] sularında Kemalpaşa tesisimizde, pres hattında çalışan bir arkadaşımız elinden yaralandı. Arkadaşımızı hemen hastaneye ulaştırdık. Tedavisi sürüyor ve [hayati tehlikesi bulunmuyor].\n\nAilesiyle sürekli görüşüyoruz; tedavi sürecindeki bütün ihtiyaçlarını karşılayacağız.\n\nKazanın yaşandığı hattı durdurduk. Kazanın nedenini resmi makamlarla birlikte inceliyoruz ve inceleme bitene kadar bu hatta üretim yapmayacağız.\n\nBugün saat [16.00]'da kurumsal hesaplarımızdan yeniden bilgi vereceğiz.",
    aciklamaG:"Bu sabah Kemalpaşa tesisimizde pres hattında yaralanan arkadaşımızın tedavisi sürüyor. Ailesiyle her gün görüşüyor, bütün tedavi ve destek ihtiyaçlarını karşılıyoruz.\n\nÇalışanlarımız bu presin emniyet sensörüyle ilgili bize daha önce uyarıda bulunmuş. [Bakım kayıtlarımız] bu uyarıları doğruluyor. Uyarılara zamanında karşılık vermedik. Bu kazanın sorumluluğu bizimdir. Arkadaşımızdan, ailesinden ve bütün çalışanlarımızdan özür dileriz.\n\nTesisteki bütün pres hatlarını durdurduk. Hatlar, [bağımsız bir İSG kuruluşu] denetleyip onay verene kadar çalışmayacak. Bu süre boyunca çalışanlarımızın ücretlerini tam olarak ödeyeceğiz.\n\nİnceleme sonucunu ve aldığımız önlemleri [tarih] tarihinde kamuoyuyla paylaşacağız.",
    sorular:[
      {soru:"Yaralı çalışanın durumu nedir?",cevap:"Tedavisi sürüyor ve [doktorların paylaştığı bilgi]. Sağlık durumuyla ilgili ayrıntıları ailesinin izni olmadan paylaşmıyoruz."},
      {soru:"Ekipman arızalı mıydı, uyarılar neden dikkate alınmadı?",cevap:"Bakım kayıtlarını resmi makamlara teslim ettik. İnceleme bitmeden tahmin yürütmeyeceğiz; sonuç ne olursa olsun kamuoyuyla paylaşacağız."},
      {soru:"Bu tesiste daha önce kaza oldu mu?",cevap:"Son [3] yılda tesisimizde [sayı] iş kazası kaydı var. Bu kayıtları resmi inceleme kapsamında paylaşacağız."}
    ],
    plan:[
      {zaman:"0–15 dk",aksiyon:"Kriz ekibini topla. Aileyi ara. Hattı durdur. Çalışanlara iç duyuru gönder."},
      {zaman:"15–60 dk",aksiyon:"İlk açıklamayı X, LinkedIn ve web sitesinde yayınla. Muhabire aynı metinle yazılı cevap ver."},
      {zaman:"1–6 saat",aksiyon:"Sendika ve OSB yönetimiyle görüş. Vardiya amirleriyle yüz yüze bilgilendirme yap. Sözcüyü TV için hazırla."},
      {zaman:"İlk 24 saat",aksiyon:"İnceleme takvimini açıkla. Söz verdiğin saatte ikinci açıklamayı yap. Yorumları izle, soruları yanıtla."}
    ],
    dogrula:["Yaralının sağlık durumu (hastaneden ve aileden)","Kazanın saati ve hattın adı","Pres bakım kayıtları ve arıza bildirimleri","Aile, isim ve fotoğraf paylaşımına izin veriyor mu?"],
    kacin:["Videoyu çekeni ya da paylaşanı suçlamak","İnceleme bitmeden 'kural ihlali' ya da 'dikkatsizlik' demek","Yaralının adını ve sağlık bilgisini izinsiz paylaşmak"]
  }
},
{
  id:"urun", baslik:"Üründe cam parçası iddiası",
  kurum:"ÖzhakikiKörfezKuantum Süt Ürünleri", sektor:"Süt ve yoğurt üreticisi, İzmir merkezli",
  ozet:"Bir kullanıcı TikTok'ta yoğurt kabından cam parçası çıktığını gösteren bir video paylaştı. Video bir saatte yüz binlerce kez izlendi.",
  kume:"kaza",
  sinyaller:[
    {t:0,kaynak:"TikTok kullanıcısı",kanal:"TikTok",metin:"Çocuğuma yedirecektim, kaptan cam çıktı! ÖzhakikiKörfezKuantum bunu açıklasın.",erisim:180000,duygu:-0.9},
    {t:6,kaynak:"Annelik grubu",kanal:"Instagram",metin:"Arkadaşlar evdeki ÖzhakikiKörfezKuantum yoğurtlarını kontrol edin, paylaşın.",erisim:45000,duygu:-0.7},
    {t:12,kaynak:"Tüketici sitesi",kanal:"Şikâyet sitesi",metin:"ÖzhakikiKörfezKuantum yoğurdundan cam çıktı başlıklı şikâyet 2 bin kez görüntülendi.",erisim:2000,duygu:-0.6},
    {t:19,kaynak:"Zincir market",kanal:"Basın",metin:"Satın alma müdürü: Ürünü raftan çekmemiz gerekiyor mu? Bugün karar vermeliyiz.",erisim:0,duygu:-0.3},
    {t:27,kaynak:"Gıda mühendisi",kanal:"X",metin:"Üretim hattında cam kullanılmıyorsa parça sonradan girmiş olabilir. Parti numarası önemli.",erisim:20000,duygu:0.1},
    {t:38,kaynak:"Haber sitesi",kanal:"Haber",metin:"Ünlü yoğurt markasında cam iddiası! Tarım ve Orman Bakanlığı'na başvuru yapıldı.",erisim:120000,duygu:-0.6},
    {t:50,kaynak:"Sadık müşteri",kanal:"X",metin:"20 yıldır ÖzhakikiKörfezKuantum yiyorum, böyle bir şey görmedim. Önce açıklamalarını bekleyelim.",erisim:6000,duygu:0.5},
    {"t": 3, "kaynak": "Kullanıcı", "kanal": "X", "metin": "Videoyu izledim, midem bulandı. ÖzhakikiKörfezKuantum'u hemen bıraktım.", "erisim": 9000, "duygu": -0.8},
    {"t": 9, "kaynak": "Gıda mühendisi", "kanal": "TikTok", "metin": "Bir yoğurt kabına cam nasıl girer? Üç ihtimali anlatıyorum.", "erisim": 90000, "duygu": -0.1},
    {"t": 15, "kaynak": "Bir anne", "kanal": "Instagram", "metin": "Çocuğum her gün bu yoğurdu yiyor. Korkudan uyuyamayacağım.", "erisim": 30000, "duygu": -0.8},
    {"t": 23, "kaynak": "Market zinciri", "kanal": "Haber", "metin": "ÖzhakikiKörfezKuantum yoğurtlarını incelemeye aldık, müşterilerimizi bilgilendireceğiz.", "erisim": 60000, "duygu": -0.4},
    {"t": 31, "kaynak": "Eski şikâyet", "kanal": "Şikâyet sitesi", "metin": "Aynı markadan 2024 tarihli 'yoğurtta sert parça' şikâyeti yeniden gündemde.", "erisim": 3000, "duygu": -0.6},
    {"t": 34, "kaynak": "TV haber müdürü", "kanal": "Basın", "metin": "Akşam bülteninde sizden bir konuk alabilir miyiz?", "erisim": 0, "duygu": -0.2},
    {"t": 43, "kaynak": "Satış ekibi", "kanal": "İç kanal", "metin": "Bayiler siparişleri iptal ediyor. Onlara ne söyleyelim?", "erisim": 120, "duygu": -0.6},
    {"t": 46, "kaynak": "Gıda güvenliği uzmanı", "kanal": "LinkedIn", "metin": "Önlem amaçlı geri çağırma doğru bir karar olur.", "erisim": 14000, "duygu": 0.2},
    {"t": 55, "kaynak": "Kullanıcı", "kanal": "X", "metin": "Rakip bir markanın göndermeli paylaşımı tepki çekti: Krizden fırsat çıkarılmaz.", "erisim": 75000, "duygu": -0.3}
  ],
  gelisme:{kaynak:"Market kamera kaydı",kanal:"Haber",metin:"Bir market zincirinin güvenlik kamerasında, bir kişinin raftaki yoğurt kaplarının kapağını açıp kapattığı görüldü. Polis inceleme başlattı.",erisim:150000,duygu:0.2,kume:"kurban"},
  hazir:{
    taslak:"Bir tüketicimizin paylaştığı videodan haberdarız. Ürünlerimiz en yüksek kalite standartlarında üretilmektedir ve böyle bir durumun yaşanması mümkün değildir. Konuyu çok ciddiye alıyoruz.",
    taslakG:"Kamera kayıtları, ürünlerimizin dışarıdan müdahaleye uğradığını ve şirketimizin herhangi bir sorumluluğu olmadığını göstermiştir. Yaşanan yanlış anlaşılma konusunda kamuoyunu bilgilendiririz.",
    aciklama:"[Parti numarası] olan ÖzhakikiKörfezKuantum yoğurtlarını, inceleme tamamlanana kadar tüketmemenizi rica ediyoruz. Bu partideki ürünleri bugün raflardan çekiyoruz.\n\nVideoyu paylaşan aileyle görüştük. Ürünü birlikte inceleyeceğiz ve yaşadıkları için her türlü desteği vereceğiz.\n\nÜretim kayıtlarımızı [bağımsız bir laboratuvarla] birlikte inceliyoruz.\n\nİncelemenin sonucunu [saat/tarih] itibarıyla web sitemizden ve sosyal medya hesaplarımızdan paylaşacağız. Sorularınız için: [tüketici hattı].",
    aciklamaG:"Emniyet, bir marketin kamera kaydında raftaki ürünlerimizin kapaklarının bir kişi tarafından açılıp kapatıldığını tespit etti ve soruşturma başlattı. Soruşturmada emniyetle tam iş birliği yapıyoruz.\n\nİlgili partiyi raflardan çekmeye devam ediyoruz. Kapağı ya da mührü açılmış görünen hiçbir ürünü tüketmeyin.\n\nVideoyu paylaşan ailenin yaşadığı korkuyu anlıyoruz. Ürünlerimizin raftaki güvenliği de bizim sorumluluğumuzda; aileyle görüşmeye ve destek olmaya devam ediyoruz.\n\nAmbalaj güvenliğimizi artırmak için aldığımız önlemleri [tarih] tarihinde paylaşacağız.",
    sorular:[
      {soru:"Ürünleri raftan çekiyor musunuz?",cevap:"Evet. [Parti numarası] olan ürünleri bugün raftan çekiyoruz. Tüketicilerimizin güvenliğini inceleme sonucunu beklemeden korumak istiyoruz."},
      {soru:"Üretim hattınızda cam var mı?",cevap:"Üretim alanımızda [cam ekipman kullanılmıyor / şu kontroller uygulanıyor]. Laboratuvar incelemesi bitince sonucu açıklayacağız."},
      {soru:"Videodaki aileye ne diyorsunuz?",cevap:"Yaşadıkları korkuyu anlıyoruz. Kendileriyle görüştük; ürünü birlikte inceleyeceğiz ve sonucu önce onlarla paylaşacağız."}
    ],
    plan:[
      {zaman:"0–15 dk",aksiyon:"Kalite ve hukuk ekibiyle parti numarasını bul. Paylaşımı yapan kişiye özel mesajla ulaş."},
      {zaman:"15–60 dk",aksiyon:"İlk açıklamayı TikTok, Instagram ve web sitesinde yayınla. Marketlere yazılı bilgi notu gönder."},
      {zaman:"1–6 saat",aksiyon:"Bakanlığı bilgilendir. Tüketici hattına hazır cevaplar ver. Annelik gruplarındaki soruları yanıtla."},
      {zaman:"İlk 24 saat",aksiyon:"Laboratuvar sonucunu paylaş. Geri çağırma kapsamını netleştir. Üretim hattından kısa bir video hazırla."}
    ],
    dogrula:["Parti numarası ve dağıtım bölgeleri","Üretim hattında cam ekipman bulunup bulunmadığı","Laboratuvar inceleme süresi","Yasal geri çağırma yükümlülükleri"],
    kacin:["Videoyu paylaşan aileyi yalan söylemekle suçlamak","Kamera kaydı ortaya çıkınca 'biz suçsuzuz' diyerek konuyu kapatmak","Cam parçası ya da çocukla ilgili görüntüleri yeniden paylaşmak"]
  }
},
{
  id:"veri", baslik:"Müşteri verisi sızıntısı",
  kurum:"IşınlaGelsin Hiperkargo", sektor:"Kargo ve lojistik, 2,1 milyon bireysel müşteri",
  ozet:"Bir hacker forumunda 1,2 milyon müşteriye ait ad, telefon ve adres bilgisi satışa çıkarıldı. Müşteriler sahte SMS almaya başladı.",
  kume:"kurban",
  sinyaller:[
    {t:0,kaynak:"Siber güvenlik hesabı",kanal:"X",metin:"IşınlaGelsin Hiperkargo'ya ait olduğu iddia edilen 1,2 milyon kayıt forumda satışta. Örnek veriler gerçek görünüyor.",erisim:40000,duygu:-0.7},
    {t:7,kaynak:"Müşteri",kanal:"X",metin:"Az önce 'kargonuz bekliyor, ödeme yapın' diye SMS geldi, içinde adresim yazıyor. IşınlaGelsin, verilerimiz nerede?",erisim:15000,duygu:-0.9},
    {t:14,kaynak:"Teknoloji haber sitesi",kanal:"Haber",metin:"IşınlaGelsin Hiperkargo'da büyük veri sızıntısı iddiası. Şirketten açıklama bekleniyor.",erisim:90000,duygu:-0.6},
    {t:21,kaynak:"Avukat",kanal:"LinkedIn",metin:"Hatırlatma: Veri sorumlusu, ihlali öğrendiği andan itibaren 72 saat içinde KVKK Kurulu'na bildirmek zorunda.",erisim:12000,duygu:-0.2},
    {t:29,kaynak:"Ekonomi muhabiri",kanal:"Basın",metin:"Kaç müşteri etkilendi, kart bilgileri de var mı? Akşam bülteni için yarım saatte cevap lazım.",erisim:0,duygu:-0.3},
    {t:41,kaynak:"Kurumsal müşteri",kanal:"İç kanal",metin:"E-ticaret firmasından müşteri temsilcisine mesaj: Sözleşmemizi gözden geçireceğiz.",erisim:0,duygu:-0.7},
    {t:55,kaynak:"Kullanıcı",kanal:"X",metin:"#IşınlaGelsinVerilerimNerede etiketi Türkiye gündeminde 3. sırada.",erisim:300000,duygu:-0.8},
    {"t": 3, "kaynak": "Forum kullanıcısı", "kanal": "X", "metin": "Örnek dosya paylaşıldı: isim, telefon, adres eksiksiz.", "erisim": 22000, "duygu": -0.8},
    {"t": 10, "kaynak": "Kargo bekleyen müşteri", "kanal": "Instagram", "metin": "Kapıma tanımadığım biri geldi, adımı biliyordu.", "erisim": 35000, "duygu": -0.9},
    {"t": 17, "kaynak": "İçerik üreticisi", "kanal": "TikTok", "metin": "SMS dolandırıcılığı nasıl anlaşılır? IşınlaGelsin örneğiyle anlatıyorum.", "erisim": 150000, "duygu": -0.4},
    {"t": 24, "kaynak": "Tüketici sitesi", "kanal": "Şikâyet sitesi", "metin": "'Verilerim çalındı, kimse dönmüyor' başlığıyla 412 yeni şikâyet.", "erisim": 12000, "duygu": -0.8},
    {"t": 33, "kaynak": "Siber güvenlik uzmanı", "kanal": "Haber", "metin": "Sızıntının boyutu 1,2 milyon kaydı aşabilir.", "erisim": 80000, "duygu": -0.6},
    {"t": 37, "kaynak": "Çağrı merkezi", "kanal": "İç kanal", "metin": "Bekleme süresi 40 dakikaya çıktı, ekip yetişemiyor.", "erisim": 300, "duygu": -0.6},
    {"t": 45, "kaynak": "KVKK uzmanı", "kanal": "LinkedIn", "metin": "Kurumların ilk 72 saatte şeffaf olması güveni korur.", "erisim": 16000, "duygu": -0.1},
    {"t": 49, "kaynak": "Teknoloji podcast'i", "kanal": "Basın", "metin": "Yarın canlı yayına sözcünüzü bekliyoruz.", "erisim": 0, "duygu": -0.1},
    {"t": 58, "kaynak": "Kullanıcı", "kanal": "X", "metin": "Rakip bir kargo firması 'verilerin bizde güvende' reklamına başladı.", "erisim": 65000, "duygu": -0.3}
  ],
  gelisme:{kaynak:"Güvenlik araştırmacısı",kanal:"X",metin:"Veriler bir saldırıyla alınmamış: IşınlaGelsin'in test sunucusundaki veritabanı aylardır şifresiz ve herkese açıktı.",erisim:110000,duygu:-0.9,kume:"onlenebilir"},
  hazir:{
    taslak:"Bazı müşteri verilerinin yetkisiz erişime maruz kalmış olabileceğine dair bilgiler değerlendirilmektedir. Sistemlerimiz güvenlidir. Olası mağduriyetlerin önlenmesi için gerekli çalışmalar yapılmaktadır.",
    taslakG:"Teknik bir hata sonucunda bazı verilerin erişime açık kaldığı anlaşılmaktadır. Konuyla ilgili gerekli önlemler alınmıştır. Müşterilerimizin hassasiyetini anlıyoruz.",
    aciklama:"Müşterilerimize ait [ad, telefon ve adres] bilgilerinin yetkisiz kişilerin eline geçtiğini [tarih ve saat] tespit ettik. [Kart ve şifre bilgileri] bu sistemde tutulmuyor.\n\nIşınlaGelsin Hiperkargo sizden SMS ile hiçbir zaman ödeme ya da şifre istemez. Bu tür mesajlardaki bağlantılara tıklamayın.\n\nOlayı siber güvenlik uzmanlarıyla birlikte inceliyoruz ve KVKK Kurulu'na yasal süre içinde bildirim yapıyoruz.\n\nBilgileri etkilenen her müşterimizi [tarih] tarihine kadar SMS ve e-posta ile tek tek bilgilendireceğiz. Sorularınız için: [destek hattı].",
    aciklamaG:"İncelememiz, müşteri bilgilerinin bir saldırıyla değil, bizim hatamız yüzünden açığa çıktığını gösterdi. Bir test sunucumuzdaki veritabanını gerektiği gibi korumadık. Müşterilerimizden özür dileriz.\n\nSunucuyu kapattık. Bütün sistemlerimizi [bağımsız bir güvenlik firmasına] denetletiyoruz.\n\nBilgileri etkilenen her müşterimizi tek tek bilgilendiriyoruz ve dolandırıcılık riskine karşı [ücretsiz destek / telafi adımı] sunuyoruz. IşınlaGelsin Hiperkargo sizden SMS ile hiçbir zaman ödeme istemez.\n\nKVKK Kurulu'na bildirimimizi yaptık. Aldığımız önlemleri [tarih] tarihinde ayrıntılı olarak paylaşacağız.",
    sorular:[
      {soru:"Kaç müşteri etkilendi?",cevap:"Şu ana kadar doğruladığımız sayı [sayı]. İnceleme sürüyor; sayı kesinleştiğinde açıklayacağız."},
      {soru:"Kart bilgileri de çalındı mı?",cevap:"Hayır. [Kart bilgileri sistemlerimizde tutulmuyor / ödeme altyapımız ayrı bir sistemde]. Bunu teknik ekibimiz doğruladı."},
      {soru:"KVKK'ya bildirim yaptınız mı?",cevap:"Bildirimi [tarih/saat] yasal süre içinde yaptık. Kurul'un bütün taleplerini karşılayacağız."}
    ],
    plan:[
      {zaman:"0–15 dk",aksiyon:"Bilgi işlem, hukuk ve KVKK sorumlusunu topla. Sızıntının gerçek olup olmadığını doğrula."},
      {zaman:"15–60 dk",aksiyon:"Sahte SMS uyarısını hemen yayınla; müşterilerin korunması açıklamanın tamamlanmasını beklemez. Basına aynı metinle cevap ver."},
      {zaman:"1–6 saat",aksiyon:"Kurumsal müşterileri tek tek ara. Çağrı merkezine hazır cevaplar ver. KVKK bildirimini hazırla."},
      {zaman:"İlk 24 saat",aksiyon:"Etkilenen müşterilere SMS ve e-posta ile bilgi ver. Güvenlik önlemlerini açıkla. Gündem etiketindeki sorulara cevap ver."}
    ],
    dogrula:["Sızan verinin gerçekten şirkete ait olup olmadığı","Hangi veri türlerinin etkilendiği","KVKK bildirim süresinin başladığı an","Kart verilerinin ayrı sistemde tutulduğu"],
    kacin:["'Sistemlerimiz güvenlidir' gibi henüz doğrulanmamış bir iddia","Kesinleşmemiş müşteri sayısı vermek","Suçu yalnızca hacker'lara yüklemek"]
  }
},
{
  id:"reklam", baslik:"Reklam kampanyasına tepki",
  kurum:"ŞıkırŞıkır Moda Evreni", sektor:"Hazır giyim markası, 85 mağaza",
  ozet:"Yeni sezon reklam filminde 'Annelik kolay, şık olmak zor' sloganı kullanıldı. Film yayına girdikten sonra sosyal medyada tepki büyüdü.",
  kume:"onlenebilir",
  sinyaller:[
    {t:0,kaynak:"Kullanıcı",kanal:"X",metin:"'Annelik kolay' mı? Bu cümleyi kim onayladı? ŞıkırŞıkır'dan bir daha alışveriş yok.",erisim:25000,duygu:-0.8},
    {t:5,kaynak:"Ünlü bir influencer",kanal:"Instagram",metin:"3 çocuk annesi olarak bu reklamı izleyince çok kırıldım. İş birliğimizi sonlandırıyorum.",erisim:400000,duygu:-0.9},
    {t:13,kaynak:"Reklam eleştirmeni",kanal:"LinkedIn",metin:"Brief'te 'esprili' denmiş belli, ama kimse annelere test ettirmemiş. Klasik bir onay zinciri hatası.",erisim:18000,duygu:-0.5},
    {t:20,kaynak:"Pazarlama dergisi",kanal:"Basın",metin:"Kampanyayı geri çekecek misiniz? Ajansınızın görüşünü de almak istiyoruz.",erisim:0,duygu:-0.3},
    {t:28,kaynak:"Kullanıcı",kanal:"TikTok",metin:"Reklamın parodisi: 'Annelik kolay' diyen anne, 4 dakikada 12 iş yapıyor.",erisim:600000,duygu:-0.4},
    {t:39,kaynak:"Mağaza çalışanı",kanal:"İç kanal",metin:"Müşteriler kasada reklamı soruyor. Ne diyeceğiz?",erisim:85,duygu:-0.4},
    {t:49,kaynak:"Kadın hakları derneği",kanal:"X",metin:"Annelerin emeğini görünmez kılan reklamlar masum değildir. ŞıkırŞıkır özür dilemeli.",erisim:70000,duygu:-0.8},
    {"t": 2, "kaynak": "Kullanıcı", "kanal": "X", "metin": "Reklamın 6 saniyelik kesiti 'Annelik kolay' sesiyle dolaşıyor.", "erisim": 50000, "duygu": -0.7},
    {"t": 8, "kaynak": "Anneler", "kanal": "TikTok", "metin": "'Annelik kolay mı?' akımı başladı: Anneler bir günlerini anlatıyor.", "erisim": 350000, "duygu": -0.5},
    {"t": 16, "kaynak": "Stilist", "kanal": "Instagram", "metin": "Kampanyanın görselleri güzel, ama mesaj felaket.", "erisim": 120000, "duygu": -0.5},
    {"t": 24, "kaynak": "Haber sitesi", "kanal": "Haber", "metin": "'Annelik kolay' sloganına sosyal medyada yoğun tepki.", "erisim": 90000, "duygu": -0.6},
    {"t": 33, "kaynak": "Müşteri", "kanal": "Şikâyet sitesi", "metin": "Reklamınız yüzünden sadakat üyeliğimi iptal ettim.", "erisim": 4000, "duygu": -0.7},
    {"t": 36, "kaynak": "Kadın dergisi editörü", "kanal": "Basın", "metin": "Annelerden özür dileyecek misiniz? Bugün yayına hazırlanıyoruz.", "erisim": 0, "duygu": -0.3},
    {"t": 44, "kaynak": "Kreatif ekipten bir çalışan", "kanal": "İç kanal", "metin": "Bu cümleye toplantıda itiraz etmiştik, kimse dinlemedi.", "erisim": 40, "duygu": -0.4},
    {"t": 46, "kaynak": "Marka uzmanı", "kanal": "LinkedIn", "metin": "Hızlı ve samimi bir özür markayı hâlâ kurtarabilir.", "erisim": 22000, "duygu": 0.3},
    {"t": 53, "kaynak": "Sadık müşteri", "kanal": "Instagram", "metin": "Özür dilerlerse alışverişe devam ederim.", "erisim": 7000, "duygu": 0.4},
    {"t": 57, "kaynak": "Kullanıcı", "kanal": "X", "metin": "#ŞıkırŞıkırÖzürDile etiketi gündemde 5. sırada.", "erisim": 280000, "duygu": -0.8}
  ],
  gelisme:{kaynak:"Sızan ajans yazışması",kanal:"X",metin:"Ajansın iç yazışmasından ekran görüntüsü: 'Tepki çeker ama konuşulur, iyi olur.' Marka müdürü de yazışmada.",erisim:220000,duygu:-0.95,kume:"onlenebilir",agirlastiran:"Tepkinin önceden bilindiği ortaya çıktı (kasıt algısı)"},
  hazir:{
    taslak:"ŞıkırŞıkır Moda Evreni olarak reklam filmimize yönelik tepkileri dikkatle izliyoruz. Filmdeki 'Annelik kolay, şık olmak zor' ifadesi birçok anneyi incitti ve bunun için özür dileriz. Bu mesajın nasıl hazırlandığını ve yayına nasıl girdiğini inceliyoruz; ön değerlendirme sürecimizde annelerin görüşünün yeterince alınmadığını görüyoruz.",
    taslakG:"Sosyal medyada paylaşılan yazışmanın bağlamından koparıldığını düşünüyoruz. Markamız her zaman kadınların yanında olmuştur. Yaşanan yanlış anlaşılmadan dolayı üzgünüz.",
    aciklama:"Yeni reklam filmimizde kullandığımız 'Annelik kolay, şık olmak zor' cümlesiyle annelerin emeğini küçümsedik. Bu cümleyi biz yazdık, biz onayladık. Annelerden ve bize güvenen herkesten özür dileriz.\n\nFilmi bugün bütün kanallardan kaldırdık.\n\nBundan sonra her kampanyamızı yayına almadan önce [farklı deneyimlerden annelerin yer aldığı bir danışma grubuna] göstereceğiz.\n\nKampanya bütçesinin [bir bölümünü], [anneleri destekleyen bir kuruluşla] birlikte belirleyeceğimiz bir projeye aktaracağız. Ayrıntıları [tarih] tarihinde paylaşacağız.",
    aciklamaG:"Ortaya çıkan yazışma doğru. Bu filmin tepki çekebileceğini yayından önce biliyorduk ve yine de yayına aldık. Yanlış bir karar verdik. Annelerden ve bize güvenen herkesten özür dileriz.\n\nFilmi kaldırdık. Kararı veren süreci baştan sona inceliyor, [sorumluluklarla ilgili adımı] atıyoruz.\n\nKampanya kararlarımızda annelerin sesini duyacak bir danışma kurulu kuruyoruz. Kurul ilk toplantısını [tarih] tarihinde yapacak ve sonuçlarını sizinle paylaşacağız.",
    sorular:[
      {soru:"Bu slogan nasıl onaylandı?",cevap:"Onay sürecimizde bu cümleyi annelerin gözünden okumadık. Hata bizim; süreci değiştiriyoruz ve yeni süreci [tarih] tarihinde açıklayacağız."},
      {soru:"Ajansla çalışmaya devam edecek misiniz?",cevap:"Filmi onaylayan bizdik; sorumluluk markamızındır. Ajansla çalışma kararımızı [tarih] tarihinde açıklayacağız."},
      {soru:"Bu bir PR taktiği miydi?",cevap:"Hayır. Tepki çekmeyi bir iletişim aracı olarak görmüyoruz. [Sızan yazışma ortaya çıktıysa: Yazışmadaki yaklaşım değerlerimize aykırı ve bununla ilgili adımı atıyoruz.]"}
    ],
    plan:[
      {zaman:"0–15 dk",aksiyon:"Marka müdürü, ajans ve hukukla görüş. Reklamı tüm ücretli kanallarda durdur."},
      {zaman:"15–60 dk",aksiyon:"Özrü Instagram, X ve TikTok'ta yayınla. Influencer'a özel mesajla ulaş. Mağaza çalışanlarına ne söyleyeceklerini anlatan kısa bir not gönder."},
      {zaman:"1–6 saat",aksiyon:"Pazarlama dergisine yazılı cevap ver. Planlanmış tüm gönderileri durdur. Dernekle görüşme talep et."},
      {zaman:"İlk 24 saat",aksiyon:"Onay sürecindeki değişikliği açıkla. Parodilere savunmayla değil, kabul eden bir tonla karşılık ver ya da hiç cevap verme."}
    ],
    dogrula:["Reklamın yayından kalktığı tüm kanallar","Influencer sözleşmesinin durumu","Telafi projesi için bütçe onayı","Sızan yazışmanın gerçek olup olmadığı"],
    kacin:["'Yanlış anlaşıldık' ya da 'espriydi' demek","Tepki gösterenlere esprili cevaplar yazmak","Özrü ajansın üzerine yıkmak"]
  }
}
];

const PROMPTS = [
  {kat:"Kriz",baslik:"İlk açıklama taslağı",ne:"Kriz anında ilk 30 dakika içinde yayınlanacak kısa açıklamayı hızlıca hazırlamak için.",
   metin:"Bir kurumun kurumsal iletişim uzmanısın. Aşağıdaki kriz için ilk açıklamayı (holding statement) Türkçe yaz.\n\nKurum: [kurum ve sektör]\nOlay: [doğrulanmış bilgiler]\nBilinmeyenler: [henüz bilmediğimiz şeyler]\n\nKurallar:\n- En fazla 120 kelime.\n- Sırası: ne oldu, insanlar güvende mi, mağdurlara ilgi, attığımız adım, bir sonraki bilgi ne zaman verilecek.\n- Bilmediğin hiçbir bilgiyi uydurma; onların yerine [köşeli parantez] bırak.\n- Savunmacı, suçlayan ya da teknik bir dil kullanma."},
  {kat:"Kriz",baslik:"Gazeteci soruları provası",ne:"Sözcüyü basın toplantısına ya da telefon görüşmesine hazırlamak için.",
   metin:"Deneyimli ve zor sorular soran bir muhabir rolüne gir. Konu: [kriz özeti].\n\nBana en zor 8 soruyu sor; her seferinde yalnızca bir soru sor ve benim cevabımı bekle. Her cevabımdan sonra:\n1) Cevabımda manşet olabilecek riskli bir ifade var mı?\n2) Daha kısa ve net bir alternatif cümle öner.\nSon soruda bana genel bir değerlendirme yap."},
  {kat:"Kriz",baslik:"Senaryo planlaması",ne:"Kriz yaşanmadan önce kurumun en olası krizlerini listelemek ve hazırlık yapmak için.",
   metin:"[Sektör] sektöründe faaliyet gösteren, [çalışan sayısı] çalışanlı bir kurum için olası 6 kriz senaryosu yaz. Her senaryo için:\n- Olasılık (düşük/orta/yüksek) ve etki (düşük/orta/yüksek)\n- SCCT'ye göre kriz kümesi (kurban, kaza, önlenebilir)\n- Krizden ilk etkilenecek paydaşlar\n- Şimdiden hazırlanması gereken bir belge ya da şablon\nSonucu tablo olarak ver."},
  {kat:"Basın",baslik:"Basın bülteni taslağı",ne:"Bir duyuru, ödül ya da etkinlik için ilk bülten taslağını hazırlamak için.",
   metin:"Aşağıdaki bilgilerle Türkçe bir basın bülteni yaz.\n\nHaber: [ne oldu]\nKim, nerede, ne zaman: [bilgiler]\nAlıntı yapılacak kişi ve unvanı: [isim, unvan]\nKurum hakkında: [2 cümle]\n\nKurallar: İlk paragraf 5N1K'yi cevaplasın. Başlık 10 kelimeyi geçmesin. Alıntıyı ben yazacağım; onun yerine [ALINTI] bırak. Abartılı sıfatlar kullanma ('lider', 'eşsiz', 'devrim niteliğinde' gibi)."},
  {kat:"Basın",baslik:"Haber değeri testi",ne:"Bir duyurunun gazeteciler için ilginç olup olmadığını önceden görmek için.",
   metin:"Bir ekonomi gazetesinin editörüsün. Aşağıdaki bülteni oku ve dürüstçe değerlendir:\n1) Bu haberi yayınlar mısın? Neden?\n2) Haberi daha değerli yapacak eksik bilgi ne (rakam, yerel bağlantı, insan hikâyesi)?\n3) Gazeteciyi ilk iki satırda kaybettiren cümleyi göster.\n\nBülten:\n[metin]"},
  {kat:"Sosyal medya",baslik:"Tek mesaj, beş kanal",ne:"Aynı duyuruyu her kanalın diline uyarlamak için.",
   metin:"Aşağıdaki duyuruyu şu kanallar için ayrı ayrı yaz: LinkedIn (profesyonel, en fazla 120 kelime), Instagram (görsel önerisiyle birlikte kısa metin), X (en fazla 260 karakter), çalışanlara iç duyuru, müşterilere SMS (en fazla 160 karakter).\n\nHer kanalda ana mesaj aynı kalsın, yalnızca ton ve uzunluk değişsin. Emoji kullanma.\n\nDuyuru: [metin]"},
  {kat:"Sosyal medya",baslik:"Yorum analizi",ne:"Bir paylaşımın altındaki yorumlardan neyin konuşulduğunu hızlıca çıkarmak için.",
   metin:"Aşağıda bir paylaşımın altındaki yorumlar var (kişisel bilgileri çıkardım). Bunları analiz et:\n1) En çok tekrar eden 3–5 konu ve her birinin yaklaşık yüzdesi\n2) Genel duygu: olumlu / nötr / olumsuz oranları\n3) Cevap verilmesi gereken 3 yorum ve önerilen cevaplar\n4) Göz ardı edilebilecek, trol niteliğindeki yorumlar\n\nYorumlar:\n[yorumlar]"},
  {kat:"Paydaş",baslik:"Paydaş gözüyle oku",ne:"Bir metni yayınlamadan önce farklı kitlelerin nasıl okuyacağını görmek için.",
   metin:"Aşağıdaki metni sırayla şu kişilerin gözünden oku: bir fabrika çalışanı, bir gazeteci, bir müşteri, bir yatırımcı ve bir sendika temsilcisi.\n\nHer biri için: metinden çıkardığı mesaj, onu rahatsız eden ya da eksik bulduğu nokta, 1 cümlelik tepkisi. Son olarak metnin risk puanını 1–10 arasında ver ve en riskli cümleyi göster.\n\nMetin: [metin]"},
  {kat:"Reklam",baslik:"Kampanyanın zayıf yönlerini bul",ne:"Bir kampanya fikrini yayına almadan önce tepki çekebilecek yerlerini bulmak için.",
   metin:"Bir reklam fikrini yayından önce eleştirmen bir ekipsin. Aşağıdaki kampanyayı incele:\n- Hangi gruplar kendini dışlanmış, küçümsenmiş ya da hedef alınmış hissedebilir?\n- Slogan ya da görsel, bağlamından koparılınca nasıl okunur?\n- Tepki gelirse ilk 24 saatte ne söyleyebiliriz?\nEleştirilerini sertten yumuşağa doğru sırala. Fikri savunma; zayıf noktalarını göster.\n\nKampanya: [slogan, görsel tarifi, hedef kitle]"},
  {kat:"Ölçüm",baslik:"Kampanya sonrası rapor",ne:"Bir kampanyanın sonuçlarını yöneticiye bir sayfada anlatmak için.",
   metin:"Aşağıdaki kampanya verilerinden yönetici için tek sayfalık bir rapor yaz.\n\nHedef: [hedef]\nVeriler: [erişim, etkileşim, ziyaret, dönüşüm, medya yansıması, bütçe]\n\nBölümler: 3 maddelik özet, hedefe göre ne oldu, neyin işe yaradığı, neyin işe yaramadığı, bir sonraki kampanya için 3 öneri. Verilerde olmayan hiçbir rakamı kullanma. Bir rakamdan emin değilsen 'veri yok' yaz."},
  {kat:"Kariyer",baslik:"Portföy anlatımı",ne:"Ders projeni ya da stajını CV'ye ve LinkedIn'e yazmak için.",
   metin:"Halkla ilişkiler ve reklamcılık öğrencisiyim. Aşağıdaki projeyi CV'm için 3 madde, LinkedIn için de 80 kelimelik kısa bir metin olarak yaz.\n\nProje: [ne yaptım]\nBenim rolüm: [rolüm]\nSonuç: [ölçülebilir sonuç varsa]\n\nKurallar: Her madde güçlü bir fiille başlasın ('hazırladım', 'yönettim', 'ölçtüm'). Yapmadığım bir şeyi ekleme, rakam uydurma."},
  {kat:"Kariyer",baslik:"Mülakat provası",ne:"Ajans ya da kurumsal iletişim mülakatına hazırlanmak için.",
   metin:"[Ajans / şirket türü] için kurumsal iletişim stajyeri arayan bir İK uzmanısın. Benimle 6 soruluk bir mülakat yap. Biri vaka sorusu olsun (örneğin 'markamız sosyal medyada eleştirildi, ilk ne yaparsın?'). Her seferinde bir soru sor, cevabımı bekle. Mülakat bitince güçlü yönlerimi, zayıf yönlerimi ve daha iyi cevaplar için önerilerini yaz."}
];


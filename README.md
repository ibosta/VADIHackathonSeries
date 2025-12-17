# Dosya Vadisi Projesi

Bu proje, kullanıcıların dosyalarını güvenli bir şekilde yüklemesine, indirmesine ve diğer kullanıcılarla paylaşmasına olanak tanıyan bir web uygulamasıdır. Tüm dosyalar, kullanıcı tarafında şifrelenir ve güvenli bir şekilde saklanır.

## Proje Yapısı ve Dosyaların İşlevleri

Proje, HTML, CSS ve JavaScript dosyalarından oluşmaktadır. Supabase, arka uç hizmetleri (veritabanı, kimlik doğrulama, depolama) için kullanılmaktadır.

### Ana HTML Dosyaları

- **`index.html`**: Kullanıcı giriş yaptıktan sonra yönlendirildiği ana gösterge panelidir. Toplam dosya sayısı, paylaşılan dosya sayısı gibi istatistikleri ve son yüklenen dosyaları gösterir.
- **`login.html`**: Kullanıcıların sisteme giriş yapmasını sağlayan sayfadır.
- **`register.html`**: Yeni kullanıcıların sisteme kaydolmasını sağlayan sayfadır.
- **`files.html`**: Kullanıcının kendi yüklediği tüm dosyaları listeleyen ve yönetmesine olanak tanıyan sayfadır.
- **`shared.html`**: Başka kullanıcılar tarafından o anki kullanıcıyla paylaşılan dosyaları listeleyen sayfadır.
- **`upload.html`**: Kullanıcının yeni dosyalar yüklemesini sağlayan sayfadır.

### JavaScript Dosyaları

- **`cryptoUtils.js`**: Kriptografik işlemleri yöneten modüldür. Dosyaların şifrelenmesi, şifrelerin çözülmesi ve anahtar yönetimi gibi kritik işlevleri içerir.
- **`dashboard.js`**: `index.html` sayfasının arkasındaki mantığı yönetir. İstatistikleri ve son dosyaları Supabase'den çeker ve sayfada görüntüler.
- **`files.js`**: `files.html` sayfasının mantığını yönetir. Kullanıcının kendi dosyalarını listeler, indirme ve paylaşma işlevlerini başlatır.
- **`login.js`**: `login.html` sayfasındaki giriş formunun mantığını yönetir. Kullanıcı kimlik bilgilerini Supabase'e gönderir.
- **`register.js`**: `register.html` sayfasındaki kayıt formunun mantığını yönetir. Yeni kullanıcı oluşturur ve şifreleme anahtarlarını üretir.
- **`shared.js`**: `shared.html` sayfasının mantığını yönetir. Paylaşılan dosyaları listeler ve indirme işlemlerini yönetir.
- **`supabase.js`**: Supabase istemcisini başlatan ve yapılandıran ana modüldür. Diğer tüm JavaScript dosyaları bu modülü kullanarak Supabase ile etkileşime girer.
- **`upload.js`**: `upload.html` sayfasının mantığını yönetir. Dosya seçme, şifreleme ve yükleme işlemlerini adım adım gerçekleştirir.

### Stil ve Yapılandırma Dosyaları

- **`styles.css`**: Projenin tüm sayfaları için genel stil kurallarını ve tasarımını içerir.
- **`package.json`**: Projenin bağımlılıklarını ve temel bilgilerini içeren Node.js paket yönetim dosyasıdır.
- **`.env`**: Supabase gibi servislerin hassas bilgilerini (API anahtarları vb.) saklamak için kullanılan ortam değişkenleri dosyasıdır.
- **`.gitignore`**: Git versiyon kontrol sisteminin hangi dosyaları ve klasörleri takip etmemesi gerektiğini belirtir.

### Diğer Dosyalar

- **`img/logo.png`**: Projenin logosudur.

## Kullanım

1.  Uygulamayı kullanmaya başlamak için `register.html` sayfası üzerinden bir hesap oluşturun.
2.  Hesap oluşturduktan sonra `login.html` sayfası üzerinden giriş yapın.
3.  Giriş yaptıktan sonra ana panel (`index.html`) sizi karşılar.
4.  `upload.html` sayfasından dosyalarınızı güvenli bir şekilde yükleyebilirsiniz.
5.  `files.html` sayfasından yüklediğiniz dosyaları yönetebilir ve başkalarıyla paylaşabilirsiniz.
6.  `shared.html` sayfasından sizinle paylaşılan dosyalara erişebilirsiniz.

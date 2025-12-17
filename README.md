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

## Kurulum ve Çalıştırma

### Ön Gereksinimler

Projeyi çalıştırmak için aşağıdakilerin yüklü olması gerekmektedir:
- **Node.js** (v14 veya daha yüksek) ve **npm**
- Modern web tarayıcı (Chrome, Firefox, Safari, Edge)
- Aktif bir Supabase projesi

### Adım 1: Projeyi Klonlayın

```bash
git clone <repo-url>
cd VADIHackathonSeries
```

### Adım 2: Bağımlılıkları Kurun

```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarlayın

Proje kökünde `.env` dosyası oluşturun ve aşağıdaki Supabase bilgilerini ekleyin:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabase projenizdeki API ayarlarından bu değerleri alabilirsiniz.

### Adım 4: Uygulamayı Çalıştırın

Geliştirme sunucusunu başlatmak için:

```bash
npm run dev
```

Uygulama, genellikle `http://localhost:5173` adresinde açılacaktır.

### Adım 5: Tarayıcıda Açın

Tarayıcıyı açın ve aşağıdaki adrese gidin:

```
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

## Kurulum ve Çalıştırma

### Ön Gereksinimler

Projeyi çalıştırmak için aşağıdakilerin yüklü olması gerekmektedir:
- **Node.js** (v14 veya daha yüksek) ve **npm**
- Modern web tarayıcı (Chrome, Firefox, Safari, Edge)
- Aktif bir Supabase projesi

### Adım 1: Projeyi Klonlayın

```bash
git clone <repo-url>
cd VADIHackathonSeries
```

### Adım 2: Bağımlılıkları Kurun

```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarlayın

Proje kökünde `.env` dosyası oluşturun ve aşağıdaki Supabase bilgilerini ekleyin:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabase projenizdeki API ayarlarından bu değerleri alabilirsiniz.

### Adım 4: Uygulamayı Çalıştırın

Geliştirme sunucusunu başlatmak için:

```bash
npm run dev
```

Uygulama, genellikle `http://localhost:5173` adresinde açılacaktır.

### Adım 5: Tarayıcıda Açın

Tarayıcıyı açın ve aşağıdaki adrese gidin:

```
https://bilisimvadisi.lydor.net
```

Uygulamanın giriş sayfası sizi karşılayacaktır.

### Production Build

Production için derlemek üzere:

```bash
npm run build
```

Build çıktısı `dist` klasöründe oluşturulacaktır.

## Kullanım

1.  Uygulamayı kullanmaya başlamak için `register.html` sayfası üzerinden bir hesap oluşturun.
2.  Hesap oluşturduktan sonra `login.html` sayfası üzerinden giriş yapın.
3.  Giriş yaptıktan sonra ana panel (`index.html`) sizi karşılar.
4.  `upload.html` sayfasından dosyalarınızı güvenli bir şekilde yükleyebilirsiniz.
5.  `files.html` sayfasından yüklediğiniz dosyaları yönetebilir ve başkalarıyla paylaşabilirsiniz.
6.  `shared.html` sayfasından sizinle paylaşılan dosyalara erişebilirsiniz.

```

Uygulamanın giriş sayfası sizi karşılayacaktır.

### Production Build

Production için derlemek üzere:

```bash
npm run build
```

Build çıktısı `dist` klasöründe oluşturulacaktır.

## Kullanım

1.  Uygulamayı kullanmaya başlamak için `register.html` sayfası üzerinden bir hesap oluşturun.
2.  Hesap oluşturduktan sonra `login.html` sayfası üzerinden giriş yapın.
3.  Giriş yaptıktan sonra ana panel (`index.html`) sizi karşılar.
4.  `upload.html` sayfasından dosyalarınızı güvenli bir şekilde yükleyebilirsiniz.
5.  `files.html` sayfasından yüklediğiniz dosyaları yönetebilir ve başkalarıyla paylaşabilirsiniz.
6.  `shared.html` sayfasından sizinle paylaşılan dosyalara erişebilirsiniz.

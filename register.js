import supabase from './supabase.js';
import { generateEncryptedKeys } from './cryptoUtils.js';

const registerForm = document.getElementById('signupForm');
const resultDiv = document.getElementById('result');

async function handleUserRegistration(email, password, username) {
    // Buton durumunu değiştir
    const button = registerForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Kayıt yapılıyor...';
    button.disabled = true;

    resultDiv.textContent = "⏳ Kayıt işlemi başladı, lütfen bekleyin...";
    resultDiv.className = 'alert alert-info';
    resultDiv.setAttribute('role', 'alert');

    // Auth işlemi (Kullanıcı oluşturma)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username: username }
        }
    });

    if (authError) {
        console.error("Kayıt hatası:", authError);
        resultDiv.textContent = "❌ Kayıt hatası: " + authError.message;
        resultDiv.className = 'error';
        button.textContent = originalText;
        button.disabled = false;
        return;
    }

    const userId = authData.user.id;

    console.log("Anahtarlar üretiliyor...");
    resultDiv.textContent = "Kullanıcı oluşturuldu. Şifreleme anahtarları üretiliyor...";

    try {
        const keys = await generateEncryptedKeys(password);

        // 2. Profiles tablosu güncellenirken username de eklendi
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: username,
                public_key: keys.publicKey,
                encrypted_private_key: keys.encryptedPrivateKey
            })
            .eq('id', userId);

        if (profileError) {
            console.error("Profil güncelleme hatası:", profileError);
            resultDiv.textContent = "❌ Profil güncelleme hatası: " + profileError.message;
            resultDiv.className = 'error';
            button.textContent = originalText;
            button.disabled = false;
        } else {
            console.log("Başarılı!");
            resultDiv.textContent = "Kayıt başarılı! Anahtarlar güvenle oluşturuldu. Yönlendiriliyorsunuz...";
            resultDiv.className = 'success';

            // Cache password for immediate use if needed (auto-login scenario)
            sessionStorage.setItem('temp_session_pwd', password);

            registerForm.reset();

            // Kullanıcıyı hemen yönlendirmek isteyebilirsiniz
            window.location.href = 'login.html';
        }

    } catch (err) {
        console.error("Anahtar üretim hatası:", err);
        resultDiv.textContent = "Kriptografik hata oluştu: " + err.message;
        resultDiv.className = 'error';
        button.textContent = originalText;
        button.disabled = false;
    }
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 3. Formdan veriyi çekip fonksiyona iletiyoruz
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Şifre kontrolü
    if (password !== confirmPassword) {
        resultDiv.textContent = "Şifreler eşleşmiyor! Lütfen aynı şifreyi girin.";
        resultDiv.className = 'error';
        resultDiv.style.display = 'block';
        return;
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
        resultDiv.textContent = "Şifre en az 6 karakter olmalıdır.";
        resultDiv.className = 'error';
        resultDiv.style.display = 'block';
        return;
    }

    await handleUserRegistration(email, password, username);
});                 
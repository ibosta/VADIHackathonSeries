import supabase from './supabase.js';
import { generateEncryptedKeys } from './cryptoUtils.js';

const registerForm = document.getElementById('signupForm');
const resultDiv = document.getElementById('result');

async function handleUserRegistration(email, password) {
    // Buton durumunu değiştir
    const button = registerForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Kayıt yapılıyor...';
    button.disabled = true;

    resultDiv.textContent = "⏳ Kayıt işlemi başladı, lütfen bekleyin...";
    resultDiv.className = '';
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#d1ecf1';
    resultDiv.style.color = '#0c5460';
    resultDiv.style.border = '1px solid #bee5eb';
    resultDiv.style.padding = '12px 15px';
    resultDiv.style.borderRadius = '8px';
    resultDiv.style.marginTop = '20px';

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
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
    resultDiv.textContent = "🔐 Kullanıcı oluşturuldu. Şifreleme anahtarları üretiliyor...";

    try {
        const keys = await generateEncryptedKeys(password);

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
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
            resultDiv.textContent = "✅ Kayıt başarılı! Anahtarlar güvenle oluşturuldu. Yönlendiriliyorsunuz...";
            resultDiv.className = 'success';

            registerForm.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }

    } catch (err) {
        console.error("Anahtar üretim hatası:", err);
        resultDiv.textContent = "❌ Kriptografik hata oluştu: " + err.message;
        resultDiv.className = 'error';
        button.textContent = originalText;
        button.disabled = false;
    }
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Şifre kontrolü
    if (password !== confirmPassword) {
        resultDiv.textContent = "❌ Şifreler eşleşmiyor! Lütfen aynı şifreyi girin.";
        resultDiv.className = 'error';
        resultDiv.style.display = 'block';
        return;
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
        resultDiv.textContent = "❌ Şifre en az 6 karakter olmalıdır.";
        resultDiv.className = 'error';
        resultDiv.style.display = 'block';
        return;
    }

    await handleUserRegistration(email, password);
});

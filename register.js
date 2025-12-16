import supabase from './supabase.js';
import { generateEncryptedKeys } from './cryptoUtils.js';

// HTML elementlerini seçiyoruz
const registerForm = document.getElementById('signupForm');
const resultDiv = document.getElementById('result');

// Ana Kayıt Fonksiyonu
async function handleUserRegistration(email, password) {
    resultDiv.style.color = "blue";
    resultDiv.textContent = "Kayıt işlemi başladı, lütfen bekleyin...";

    // 1. Önce Supabase Auth ile kullanıcıyı kaydet
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("Kayıt hatası:", authError);
        resultDiv.style.color = "red";
        resultDiv.textContent = "Hata: " + authError.message;
        return;
    }

    const userId = authData.user.id;

    // 2. Kriptografik anahtarları tarayıcıda oluştur
    console.log("Anahtarlar üretiliyor...");
    resultDiv.textContent = "Kullanıcı oluşturuldu. Şifreleme anahtarları üretiliyor...";

    try {
        const keys = await generateEncryptedKeys(password);

        // 3. Anahtarları 'profiles' tablosuna kaydet
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                public_key: keys.publicKey,
                // generateEncryptedKeys fonksiyonundan gelen şifreli string (IV içinde gömülü)
                encrypted_private_key: keys.encryptedPrivateKey
            })
            .eq('id', userId);

        if (profileError) {
            console.error("Profil güncelleme hatası:", profileError);
            resultDiv.style.color = "red";
            resultDiv.textContent = "Profil güncelleme hatası: " + profileError.message;
        } else {
            console.log("Başarılı!");
            resultDiv.style.color = "green";
            resultDiv.textContent = "Kayıt başarılı! Anahtarlar güvenle oluşturuldu. Lütfen emailinizi onaylayın.";

            // İsterseniz formu temizleyin
            registerForm.reset();
        }

    } catch (err) {
        console.error("Anahtar üretim hatası:", err);
        resultDiv.style.color = "red";
        resultDiv.textContent = "Kriptografik hata oluştu.";
    }
}

// ---------------------------------------------------------
// FORM OLAY DİNLEYİCİSİ (BAĞLANTI NOKTASI)
// ---------------------------------------------------------
registerForm.addEventListener('submit', async (e) => {
    // 1. Sayfanın yenilenmesini engelle
    e.preventDefault();

    // 2. Inputlardan verileri al
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 3. Fonksiyonu çalıştır
    await handleUserRegistration(email, password);
});
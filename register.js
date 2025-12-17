import supabase from './supabase.js';
import { generateEncryptedKeys } from './cryptoUtils.js';

const registerForm = document.getElementById('signupForm');
const resultDiv = document.getElementById('result');

// 1. Fonksiyon parametresine username eklendi
async function handleUserRegistration(email, password, username) {
    resultDiv.style.color = "blue";
    resultDiv.textContent = "Kayıt işlemi başladı, lütfen bekleyin...";

    // Auth işlemi (Kullanıcı oluşturma)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        // İsterseniz meta data olarak da ekleyebilirsiniz, ama aşağıda profile ekliyoruz.
        options: {
            data: { username: username }
        }
    });

    if (authError) {
        console.error("Kayıt hatası:", authError);
        resultDiv.style.color = "red";
        resultDiv.textContent = "Hata: " + authError.message;
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
                username: username, // <--- BURASI EKLENDİ
                public_key: keys.publicKey,
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
            resultDiv.textContent = "Kayıt başarılı! Anahtarlar güvenle oluşturuldu.";

            registerForm.reset();

            // Kullanıcıyı hemen yönlendirmek isteyebilirsiniz
            window.location.href = 'login.html';
        }

    } catch (err) {
        console.error("Anahtar üretim hatası:", err);
        resultDiv.style.color = "red";
        resultDiv.textContent = "Kriptografik hata oluştu.";
    }
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 3. Formdan veriyi çekip fonksiyona iletiyoruz
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await handleUserRegistration(email, password, username);
});
import supabase from './supabase.js';
import { generateEncryptedKeys } from './cryptoUtils.js';

const registerForm = document.getElementById('signupForm');
const resultDiv = document.getElementById('result');

async function handleUserRegistration(email, password) {
    resultDiv.style.color = "blue";
    resultDiv.textContent = "Kayıt işlemi başladı, lütfen bekleyin...";

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

    console.log("Anahtarlar üretiliyor...");
    resultDiv.textContent = "Kullanıcı oluşturuldu. Şifreleme anahtarları üretiliyor...";

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
            resultDiv.style.color = "red";
            resultDiv.textContent = "Profil güncelleme hatası: " + profileError.message;
        } else {
            console.log("Başarılı!");
            resultDiv.style.color = "green";
            resultDiv.textContent = "Kayıt başarılı! Anahtarlar güvenle oluşturuldu.";

            registerForm.reset();

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

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await handleUserRegistration(email, password);
});

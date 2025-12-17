import supabase from './supabase.js';

const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const alertContainer = document.getElementById('alertContainer');

let currentUser = null;
let currentProfile = null;

document.addEventListener('DOMContentLoaded', initProfile);

changePasswordBtn.addEventListener('click', handleChangePassword);

async function initProfile() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;

    } catch (error) {
        console.error('Hata:', error);
        showAlert('Bir hata oluştu: ' + error.message, 'error');
    }
}

async function handleChangePassword() {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validasyon
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Tüm şifre alanlarını doldurun', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showAlert('Yeni şifre en az 6 karakter olmalı', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('Yeni şifreler eşleşmiyor', 'error');
        return;
    }

    if (currentPassword === newPassword) {
        showAlert('Yeni şifre mevcut şifreden farklı olmalı', 'error');
        return;
    }

    try {
        changePasswordBtn.disabled = true;
        changePasswordBtn.textContent = 'Değiştiriliyor...';

        // Önce mevcut şifreyi doğrula (kullanıcıyı tekrar giriş yaptırarak)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });

        if (signInError) {
            showAlert('Mevcut şifre yanlış', 'error');
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = 'Şifreyi Değiştir';
            return;
        }

        // Şifreyi güncelle
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) throw updateError;

        // Formu temizle
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';

        showAlert('Şifre başarıyla değiştirildi', 'success');

    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        showAlert('Şifre değiştirilemedi: ' + error.message, 'error');
    } finally {
        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = 'Şifreyi Değiştir';
    }
}

function showAlert(message, type = 'success') {
    alertContainer.innerHTML = `
        <div class="alert alert-${type}">
            ${type === 'success' ? '✅' : '❌'} ${message}
        </div>
    `;

    // 5 saniye sonra alert'i kaldır
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

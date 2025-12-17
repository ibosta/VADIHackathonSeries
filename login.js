import supabase from './supabase.js';

const form = document.getElementById('loginForm')
const result = document.getElementById('result')

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const button = form.querySelector('button[type="submit"]')
    const originalText = button.textContent
    button.textContent = 'Giriş yapılıyor...'
    button.disabled = true

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        result.textContent = 'Giriş hatası: ' + error.message
        result.className = 'error'
        button.textContent = originalText
        button.disabled = false
        return
    }

    result.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...'
    result.className = 'success'

    sessionStorage.setItem('temp_session_pwd', password);

    setTimeout(() => {
        window.location.href = 'index.html'
    }, 1000)
})

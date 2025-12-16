import supabase from './supabase.js';

console.log('Login.js yüklendi');
console.log('Supabase:', supabase);

const form = document.getElementById('loginForm')
const result = document.getElementById('result')

if (!form) {
    console.error('Form bulunamadı!');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submit edildi');

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    // Buton durumunu değiştir
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

    // başarılı login
    result.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...'
    result.className = 'success'

    // index.html'e yönlendir
    setTimeout(() => {
        window.location.href = 'index.html'
    }, 1000)
})

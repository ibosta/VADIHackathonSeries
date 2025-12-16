import supabase from './supabase.js';

const form = document.getElementById('loginForm')
const result = document.getElementById('result')

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        result.textContent = 'Login error: ' + error.message
        return
    }

    // başarılı login
    result.textContent = 'Login successful! Redirecting...'

    // index.html'e yönlendir
    window.location.href = 'index.html'
})

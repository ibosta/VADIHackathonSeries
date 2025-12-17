import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'http://45.154.99.250:8000'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
const supabase = createClient(supabaseUrl, supabaseKey)

export async function signOutUser() {
	const { error } = await supabase.auth.signOut();
	if (error) {
		console.error("Çıkış yaparken hata oluştu:", error);
	} else {
		window.location.href = 'login.html';
	}
}
try {
	const logoutBtn = document.getElementById('logout');
	
	logoutBtn.addEventListener('click', signOutUser);
} catch (error) {
	console.warn("Çıkış butonu bulunamadı, çıkış işlevi eklenemedi.");
}


export default supabase;
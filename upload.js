import supabase from './supabase.js';
import { encryptFileForUpload } from './cryptoUtils.js';

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusDiv = document.getElementById('status');

uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        setStatus('Lütfen bir dosya seçin.', 'error');
        return;
    }

    try {
        setLoading(true);
        setStatus('Oturum kontrol ediliyor...');

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Oturum açmış kullanıcı bulunamadı. Lütfen giriş yapın.");
        }

        setStatus('Public Key alınıyor...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('public_key')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.public_key) {
            throw new Error("Public Key bulunamadı. Lütfen tekrar giriş yapın veya profilinizi kontrol edin.");
        }

        setStatus('Dosya şifreleniyor (Client-side encryption)...');

        const encryptionResult = await encryptFileForUpload(file, profile.public_key);

        console.log("Şifreleme tamamlandı:", encryptionResult);

        setStatus('Şifreli dosya buluta yükleniyor...');

        const safeFileName = sanitizeFileName(file.name);
        const storagePath = `${user.id}/${Date.now()}_${safeFileName}`;

        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('file_manager')
            .upload(storagePath, encryptionResult.encryptedBlob, {
                contentType: 'application/octet-stream',
                upsert: false
            });

        if (storageError) throw storageError;

        setStatus('Veritabanı güncelleniyor...');

        const { error: dbError } = await supabase
            .from('files')
            .insert({
                user_id: user.id,
                filepath: storagePath,
                filename: file.name,
                mime_type: file.type,
                encryption_iv: encryptionResult.iv,
                encryption_key: encryptionResult.encryptedAesKey
            });

        if (dbError) throw dbError;

        setStatus('Yükleme ve şifreleme başarıyla tamamlandı!', 'success');
        fileInput.value = '';

    } catch (error) {
        console.error('Yükleme hatası:', error);
        setStatus('Hata: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
});

function setStatus(msg, type = 'normal') {
    statusDiv.textContent = msg;
    statusDiv.className = type;
    statusDiv.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : 'black');
}

function setLoading(isLoading) {
    uploadBtn.disabled = isLoading;
    uploadBtn.textContent = isLoading ? 'İşlem Yapılıyor...' : 'Şifrele ve Yükle';
}

function sanitizeFileName(fileName) {
    const trMap = {
        'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G',
        'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U',
        'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O'
    };

    let sanitized = fileName.replace(/[çÇğĞşŞüÜıİöÖ]/g, function (s) {
        return trMap[s];
    });

    sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    return sanitized;
}
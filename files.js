import supabase from './supabase.js';
import { decryptFile } from './cryptoUtils.js';

const fileList = document.getElementById('fileList');
const loadingDiv = document.getElementById('loading');
const statusDiv = document.getElementById('status');

// Sayfa yüklendiğinde dosyaları getir
document.addEventListener('DOMContentLoaded', fetchFiles);

async function fetchFiles() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Dosyaları veritabanından çek (Metadata)
        const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderFiles(files);
    } catch (error) {
        console.error('Hata:', error);
        statusDiv.textContent = 'Dosyalar yüklenirken hata oluştu: ' + error.message;
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function renderFiles(files) {
    fileList.innerHTML = '';

    if (files.length === 0) {
        fileList.innerHTML = '<tr><td colspan="4" style="text-align:center">Hiç dosya yok.</td></tr>';
        return;
    }

    files.forEach(file => {
        const tr = document.createElement('tr');

        const date = new Date(file.created_at).toLocaleDateString('tr-TR');

        tr.innerHTML = `
            <td>${file.filename}</td>
            <td>${date}</td>
            <td>-</td> <td>
                <button class="btn-download" data-id="${file.id}">İndir (Şifre Çöz)</button>
            </td>
        `;

        // İndirme butonuna event listener ekle
        const btn = tr.querySelector('.btn-download');
        btn.addEventListener('click', () => handleDownload(file));

        fileList.appendChild(tr);
    });
}

async function handleDownload(fileMetadata) {
    const btn = document.querySelector(`button[data-id="${fileMetadata.id}"]`);
    const originalText = btn.textContent;

    try {
        const password = prompt("Dosya şifresini çözmek için lütfen GİRİŞ ŞİFRENİZİ girin:");
        if (!password) return;

        btn.textContent = "İndiriliyor...";
        btn.disabled = true;

        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('encrypted_private_key')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) throw new Error("Profil anahtarlarına erişilemedi.");

        const { data: fileBlob, error: downloadError } = await supabase
            .storage
            .from('file_manager')
            .download(fileMetadata.filepath);

        if (downloadError) throw downloadError;

        btn.textContent = "Şifre Çözülüyor...";

        const decryptedBlob = await decryptFile(
            fileBlob,
            fileMetadata,
            profile.encrypted_private_key,
            password
        );

        const url = window.URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileMetadata.filename;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        btn.textContent = "İndirme Başarılı";
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);

    } catch (error) {
        console.error("İndirme Hatası:", error);
        alert("Hata: " + error.message);
        btn.textContent = "Hata!";
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
    }
}
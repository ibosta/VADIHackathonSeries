import supabase from './supabase.js';
import { decryptFile, reEncryptKeyForShare } from './cryptoUtils.js';

const fileList = document.getElementById('fileList');
const loadingDiv = document.getElementById('loading');
const statusDiv = document.getElementById('status');
const shareModal = document.getElementById('shareModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const confirmShareBtn = document.getElementById('confirmShareBtn');
const shareUsernamesInput = document.getElementById('shareUsernames');
const shareExpiresInput = document.getElementById('shareExpires');
const shareLimitInput = document.getElementById('shareLimit');
const shareFileNameDisplay = document.getElementById('shareFileName');

let currentFileToShare = null;

document.addEventListener('DOMContentLoaded', fetchFiles);

closeModalBtn.addEventListener('click', () => {
    shareModal.style.display = 'none';
    currentFileToShare = null;
});

confirmShareBtn.addEventListener('click', handleShareProcess);


async function fetchFiles() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderFiles(files);
    } catch (error) {
        console.error('Hata:', error);
        statusDiv.textContent = 'Hata: ' + error.message;
        statusDiv.className = 'error';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function renderFiles(files) {
    fileList.innerHTML = '';
    if (files.length === 0) {
        fileList.innerHTML = '<tr><td colspan="3" style="text-align:center">Hiç dosya yok.</td></tr>';
        return;
    }

    files.forEach(file => {
        const tr = document.createElement('tr');
        const date = new Date(file.created_at).toLocaleDateString('tr-TR');

        tr.innerHTML = `
            <td>${file.filename}</td>
            <td>${date}</td>
            <td>
                <button class="btn-download" data-id="${file.id}">İndir</button>
                <button class="btn-share" data-id="${file.id}">Paylaş</button>
            </td>
        `;

        tr.querySelector('.btn-download').addEventListener('click', () => handleDownload(file));
        tr.querySelector('.btn-share').addEventListener('click', () => {
            currentFileToShare = file;
            shareFileNameDisplay.textContent = `Seçilen Dosya: ${file.filename}`;
            shareUsernamesInput.value = '';
            shareExpiresInput.value = '';
            shareLimitInput.value = '-1';
            shareModal.style.display = 'block';
        });

        fileList.appendChild(tr);
    });
}

async function handleShareProcess() {
    const rawUsernames = shareUsernamesInput.value;
    const expiresAt = shareExpiresInput.value || null;
    const limit = parseInt(shareLimitInput.value);

    if (!rawUsernames.trim()) {
        alert("Lütfen en az bir kullanıcı adı girin.");
        return;
    }

    const usernames = rawUsernames.split(',').map(u => u.trim()).filter(u => u !== '');

    try {
        confirmShareBtn.disabled = true;
        confirmShareBtn.textContent = "İşleniyor...";

        const password = prompt("Dosyayı başkasıyla paylaşmak için anahtarınızı çözmemiz gerekiyor.\nLütfen giriş şifrenizi girin:");
        if (!password) {
            confirmShareBtn.disabled = false;
            confirmShareBtn.textContent = "Paylaş";
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        const { data: senderProfile } = await supabase
            .from('profiles')
            .select('encrypted_private_key')
            .eq('id', user.id)
            .single();

        const { data: recipients, error: userError } = await supabase
            .from('profiles')
            .select('id, username, public_key')
            .in('username', usernames);

        if (userError) throw userError;

        if (!recipients || recipients.length === 0) {
            throw new Error("Girilen kullanıcı adlarına ait kayıt bulunamadı.");
        }

        const missingUsers = usernames.filter(u => !recipients.find(r => r.username === u));
        if (missingUsers.length > 0) {
            alert(`Şu kullanıcılar bulunamadı: ${missingUsers.join(', ')}. Sadece bulunanlarla devam ediliyor.`);
        }

        const shareDataArray = [];

        for (const recipient of recipients) {
            console.log(`${recipient.username} için anahtar hazırlanıyor...`);

            const encryptedKeyForReceiver = await reEncryptKeyForShare(
                senderProfile.encrypted_private_key,
                password,
                currentFileToShare.encryption_key,
                recipient.public_key
            );

            shareDataArray.push({
                file_id: currentFileToShare.id,
                sender_id: user.id,
                receiver_id: recipient.id,
                encrypted_key_for_receiver: encryptedKeyForReceiver,
                expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
                downloads_remained: limit
            });
        }

        if (shareDataArray.length > 0) {
            const { error: shareError } = await supabase
                .from('file_shares')
                .insert(shareDataArray);

            if (shareError) throw shareError;

            alert("Dosya başarıyla paylaşıldı!");
            shareModal.style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        alert("Paylaşım hatası: " + error.message);
    } finally {
        confirmShareBtn.disabled = false;
        confirmShareBtn.textContent = "Paylaş";
    }
}

async function handleDownload(fileMetadata) {
    const btn = document.querySelector(`button[data-id="${fileMetadata.id}"].btn-download`);
    const originalText = btn.textContent;

    try {
        const password = prompt("Şifre çözmek için GİRİŞ ŞİFRENİZİ girin:");
        if (!password) return;

        btn.textContent = "...";
        btn.disabled = true;

        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
            .from('profiles')
            .select('encrypted_private_key')
            .eq('id', user.id)
            .single();

        const { data: fileBlob, error: dlErr } = await supabase
            .storage
            .from('file_manager')
            .download(fileMetadata.filepath);

        if (dlErr) throw dlErr;

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
        btn.textContent = "Ok";
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);

    } catch (error) {
        alert("Hata: " + error.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
}
import supabase from './supabase.js';
import { decryptFile } from './cryptoUtils.js';

const sharedFileList = document.getElementById('sharedFileList');
const loadingDiv = document.getElementById('loading');
const statusDiv = document.getElementById('status');

document.addEventListener('DOMContentLoaded', fetchSharedFiles);

async function fetchSharedFiles() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const { data: shares, error } = await supabase
            .from('file_shares')
            .select(`
                id,
                expires_at,
                downloads_remained,
                encrypted_key_for_receiver,
                created_at,
                files:file_id (
                    id,
                    filename,
                    filepath,
                    encryption_iv,
                    mime_type
                ),
                sender:sender_id (
                    username
                )
            `)
            .eq('receiver_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderSharedFiles(shares);

    } catch (error) {
        console.error('Hata:', error);
        statusDiv.textContent = 'Hata: ' + error.message;
        statusDiv.style.color = 'red';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function renderSharedFiles(shares) {
    sharedFileList.innerHTML = '';

    if (!shares || shares.length === 0) {
        sharedFileList.innerHTML = '<tr><td colspan="5" style="text-align:center">Sizinle paylaşılan dosya yok.</td></tr>';
        return;
    }

    shares.forEach(share => {
        const tr = document.createElement('tr');

        let expireText = "Süresiz";
        let isExpired = false;

        if (share.expires_at) {
            const expireDate = new Date(share.expires_at);
            expireText = expireDate.toLocaleDateString('tr-TR') + ' ' + expireDate.toLocaleTimeString('tr-TR');
            if (new Date() > expireDate) {
                isExpired = true;
                expireText += " (Süresi Doldu)";
            }
        }

        const limitText = share.downloads_remained === -1 ? "Limitsiz" : share.downloads_remained;
        const isLimitReached = share.downloads_remained === 0;
        const fileName = share.files ? share.files.filename : "[Silinmiş Dosya]";
        const senderName = share.sender ? share.sender.username : "Bilinmeyen";
        const isDisabled = isExpired || isLimitReached || !share.files;
        let statusClass = isDisabled ? 'status-expired' : 'status-active';

        tr.innerHTML = `
            <td>${fileName}</td>
            <td>${senderName}</td>
            <td class="${isExpired ? 'status-expired' : ''}">${expireText}</td>
            <td class="${isLimitReached ? 'status-expired' : ''}">${limitText}</td>
            <td>
                <button class="btn-download" data-id="${share.id}" ${isDisabled ? 'disabled' : ''}>
                    ${isDisabled ? 'Erişim Yok' : 'İndir'}
                </button>
            </td>
        `;

        if (!isDisabled) {
            tr.querySelector('.btn-download').addEventListener('click', () => handleSharedDownload(share));
        }

        sharedFileList.appendChild(tr);
    });
}

async function handleSharedDownload(shareData) {
    const btn = document.querySelector(`button[data-id="${shareData.id}"]`);
    const originalText = btn.textContent;

    try {
        const password = prompt("Paylaşılan dosyayı çözmek için KENDİ giriş şifrenizi girin:");
        if (!password) return;

        btn.textContent = "İndiriliyor...";
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
            .download(shareData.files.filepath);

        if (dlErr) throw dlErr;

        btn.textContent = "Çözülüyor...";

        const mixedMetadata = {
            encryption_key: shareData.encrypted_key_for_receiver,
            encryption_iv: shareData.files.encryption_iv,
            mime_type: shareData.files.mime_type
        };

        const decryptedBlob = await decryptFile(
            fileBlob,
            mixedMetadata,
            profile.encrypted_private_key,
            password
        );

        const url = window.URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = shareData.files.filename;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        if (shareData.downloads_remained > 0) {
            const newRemaining = shareData.downloads_remained - 1;

            const { error: updateError } = await supabase
                .from('file_shares')
                .update({ downloads_remained: newRemaining })
                .eq('id', shareData.id);

            if (!updateError) {
                shareData.downloads_remained = newRemaining;
                fetchSharedFiles();
            }
        }

        btn.textContent = "Tamamlandı";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error(error);
        alert("İndirme başarısız: " + error.message);
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
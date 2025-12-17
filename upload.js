import supabase from './supabase.js';
import { encryptFileForUpload, generateEncryptedKeys } from './cryptoUtils.js';

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusDiv = document.getElementById('status');
const fileListQueue = document.getElementById('fileListQueue');
const queueTitle = document.querySelector('.queue-title');
const clearQueueBtn = document.querySelector('.btn-queue-clear');

let fileQueue = [];

// Initialize listeners
document.addEventListener('DOMContentLoaded', () => {
    // File input handling
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
            // Reset input value to allow selecting the same file again (e.g. after removing from queue)
            fileInput.value = '';
        }
    });

    // Clear queue
    clearQueueBtn?.addEventListener('click', () => {
        fileQueue = [];
        renderQueue();
    });

    // Upload Action
    uploadBtn.addEventListener('click', processUploadQueue);

    // Setup Drag & Drop
    const uploadDropZone = document.querySelector('.upload-drop-zone');
    if (uploadDropZone) {
        uploadDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadDropZone.style.borderColor = 'var(--color-primary)';
            uploadDropZone.style.backgroundColor = 'var(--color-info-bg)';
        });

        uploadDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadDropZone.style.borderColor = '';
            uploadDropZone.style.backgroundColor = '';
        });

        uploadDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadDropZone.style.borderColor = '';
            uploadDropZone.style.backgroundColor = '';

            if (e.dataTransfer.files.length > 0) {
                handleFiles(Array.from(e.dataTransfer.files));
            }
        });
    }
});

function handleFiles(files) {
    // Filter duplicates if needed, or just append
    files.forEach(file => {
        // Simple check to avoid exact duplicates in current queue
        if (!fileQueue.some(f => f.name === file.name && f.size === file.size)) {
            fileQueue.push({
                file: file,
                status: 'pending', // pending, uploading, success, error
                message: ''
            });
        }
    });
    renderQueue();
}

function renderQueue() {
    fileListQueue.innerHTML = '';

    // Update Title count
    if (queueTitle) {
        queueTitle.textContent = `Yükleme Kuyruğu (${fileQueue.length})`;
    }

    if (fileQueue.length === 0) {
        fileListQueue.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px;">Kuyruk boş</p>';
        return;
    }

    fileQueue.forEach((item, index) => {
        const file = item.file;
        const fileSize = formatFileSize(file.size);

        let statusIcon = '';
        let statusClass = '';

        if (item.status === 'success') {
            statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            statusClass = 'text-success';
        } else if (item.status === 'error') {
            statusIcon = `<span style="color:red">⚠️</span>`;
        } else if (item.status === 'uploading') {
            statusIcon = `<div class="spinner-sm"></div>`; // Needs css for spinner
        }

        const html = `
        <div class="file-item-card">
            <div class="file-item-flex">
                <div class="file-icon-box">
                    <span style="font-size: 24px;">📄</span>
                </div>
                <div class="file-info">
                    <div class="file-header">
                        <p class="file-name" title="${file.name}">${file.name}</p>
                        <div class="file-actions">
                            ${statusIcon}
                            <button class="btn-remove" data-index="${index}" title="Kaldır">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                    <p class="file-size">${fileSize}</p>
                    ${item.message ? `<p class="status-text ${item.status === 'error' ? 'text-error' : ''}" style="margin-top:4px; font-size:12px;">${item.message}</p>` : ''}
                </div>
            </div>
        </div>
        `;
        fileListQueue.insertAdjacentHTML('beforeend', html);
    });

    // Attach Remove Event Listeners
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            fileQueue.splice(index, 1);
            renderQueue();
        });
    });
}

async function processUploadQueue() {
    const pendingItems = fileQueue.filter(i => i.status === 'pending' || i.status === 'error');

    if (pendingItems.length === 0) {
        if (fileQueue.length === 0) {
            setStatus('Lütfen önce dosya seçin.', 'error');
        } else {
            setStatus('Tüm dosyalar zaten yüklendi.', 'success');
        }
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = 'İşleniyor...';

    for (let i = 0; i < fileQueue.length; i++) {
        const item = fileQueue[i];
        if (item.status === 'pending' || item.status === 'error') {
            // Update UI to uploading
            item.status = 'uploading';
            item.message = 'Hazırlanıyor...';
            renderQueue();

            try {
                await uploadSingleFile(item);
                item.status = 'success';
                item.message = 'Yüklendi';
            } catch (err) {
                console.error(err);
                item.status = 'error';
                item.message = err.message || 'Hata oluştu';
            }
            renderQueue();
        }
    }

    uploadBtn.disabled = false;
    uploadBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
        </svg>
        Şifrele ve Yükle
    `;
    setStatus('İşlem tamamlandı.', 'success');
}

async function uploadSingleFile(queueItem) {
    queueItem.message = 'Oturum kontrol ediliyor...';
    renderQueue();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Giriş yapmalısınız.");

    let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('public_key')
        .eq('id', user.id)
        .single();

    // Recover if missing keys
    if (profileError || !profile?.public_key) {

        // Try getting cached password from session
        const sessionPassword = sessionStorage.getItem('temp_session_pwd');

        if (!sessionPassword) {
            throw new Error("Şifreleme anahtarlarınız eksik. Güvenlik nedeniyle lütfen çıkış yapıp tekrar giriş yapın (veya yeni hesap açın).");
        }

        queueItem.message = 'Anahtarlar oluşturuluyor...';
        renderQueue();

        try {
            const keys = await generateEncryptedKeys(sessionPassword);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    public_key: keys.publicKey,
                    encrypted_private_key: keys.encryptedPrivateKey
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Set profile data for next steps
            profile = { public_key: keys.publicKey };

        } catch (err) {
            throw new Error("Anahtar oluşturma başarısız: " + err.message);
        }
    }

    queueItem.message = 'Şifreleniyor...';
    renderQueue();

    const encryptionResult = await encryptFileForUpload(queueItem.file, profile.public_key);

    queueItem.message = 'Yükleniyor...';
    renderQueue();

    const safeFileName = sanitizeFileName(queueItem.file.name);
    const storagePath = `${user.id}/${Date.now()}_${safeFileName}`;

    const { error: storageError } = await supabase
        .storage
        .from('file_manager')
        .upload(storagePath, encryptionResult.encryptedBlob, {
            contentType: 'application/octet-stream',
            upsert: false
        });

    if (storageError) throw storageError;

    queueItem.message = 'Kaydediliyor...';
    renderQueue();

    const { error: dbError } = await supabase
        .from('files')
        .insert({
            user_id: user.id,
            filepath: storagePath,
            filename: queueItem.file.name,
            mime_type: queueItem.file.type,
            encryption_iv: encryptionResult.iv,
            encryption_key: encryptionResult.encryptedAesKey
        });

    if (dbError) throw dbError;
}

function setStatus(msg, type = 'normal') {
    statusDiv.textContent = msg;
    statusDiv.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : 'inherit');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function sanitizeFileName(fileName) {
    const trMap = {
        'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G',
        'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U',
        'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O'
    };
    let sanitized = fileName.replace(/[çÇğĞşŞüÜıİöÖ]/g, s => trMap[s]);
    sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    return sanitized;
}
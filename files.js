import supabase from './supabase.js';
import { decryptFile, reEncryptKeyForShare } from './cryptoUtils.js';

const fileList = document.getElementById('fileList');
const filesGrid = document.getElementById('filesGrid');
const filesTable = document.getElementById('filesTable');
const loadingDiv = document.getElementById('loading');
const statusDiv = document.getElementById('status');
const shareModal = document.getElementById('shareModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const confirmShareBtn = document.getElementById('confirmShareBtn');
const shareUsernamesInput = document.getElementById('shareUsernames');
const shareExpiresInput = document.getElementById('shareExpires');
const shareLimitInput = document.getElementById('shareLimit');
const shareFileNameDisplay = document.getElementById('shareFileName');
const searchInput = document.getElementById('searchInput');
const sortFilter = document.getElementById('sortFilter');
const typeFilter = document.getElementById('typeFilter');
const groupByTypeCheckbox = document.getElementById('groupByType');
const viewListBtn = document.getElementById('viewList');
const viewGridBtn = document.getElementById('viewGrid');

let currentFileToShare = null;
let allFiles = [];
let currentView = 'list';

document.addEventListener('DOMContentLoaded', fetchFiles);

searchInput.addEventListener('input', filterAndRenderFiles);
sortFilter.addEventListener('change', filterAndRenderFiles);
typeFilter.addEventListener('change', filterAndRenderFiles);
groupByTypeCheckbox.addEventListener('change', filterAndRenderFiles);

viewListBtn.addEventListener('click', () => {
    currentView = 'list';
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
    filterAndRenderFiles();
});

viewGridBtn.addEventListener('click', () => {
    currentView = 'grid';
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
    filterAndRenderFiles();
});

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

        allFiles = files;
        filterAndRenderFiles();
    } catch (error) {
        console.error('Hata:', error);
        statusDiv.textContent = 'Hata: ' + error.message;
        statusDiv.className = 'error';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'heic'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'rtf'].includes(ext)) return 'document';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) return 'audio';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'archive';
    return 'other';
}

function getFileIcon(filename) {
    const type = getFileType(filename);
    const icons = {
        image: '🖼️',
        document: '📄',
        video: '🎥',
        audio: '🎵',
        archive: '🗄️',
        other: '📎'
    };
    return icons[type] || '📎';
}

function getFileTypeName(type) {
    const names = {
        image: 'Görsel',
        document: 'Belge',
        video: 'Video',
        audio: 'Ses',
        archive: 'Arşiv',
        other: 'Diğer'
    };
    return names[type] || 'Diğer';
}

function getFileTypeGroupIcon(type) {
    const icons = {
        image: '🖼️',
        document: '📁',
        video: '🎬',
        audio: '🎶',
        archive: '📦',
        other: '📂'
    };
    return icons[type] || '📂';
}

function filterAndRenderFiles() {
    let filtered = [...allFiles];
    
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(file => 
            file.filename.toLowerCase().includes(searchTerm)
        );
    }
    
    const typeValue = typeFilter.value;
    if (typeValue !== 'all') {
        filtered = filtered.filter(file => getFileType(file.filename) === typeValue);
    }
    
    const sortValue = sortFilter.value;
    filtered.sort((a, b) => {
        switch(sortValue) {
            case 'date-desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'date-asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'name-asc':
                return a.filename.localeCompare(b.filename, 'tr');
            case 'name-desc':
                return b.filename.localeCompare(a.filename, 'tr');
            default:
                return 0;
        }
    });
    
    const shouldGroup = groupByTypeCheckbox.checked;
    
    if (currentView === 'list') {
        filesTable.style.display = 'table';
        filesGrid.style.display = 'none';
        if (shouldGroup) {
            renderGroupedList(filtered);
        } else {
            renderList(filtered);
        }
    } else {
        filesTable.style.display = 'none';
        filesGrid.style.display = 'grid';
        if (shouldGroup) {
            renderGroupedGrid(filtered);
        } else {
            renderGrid(filtered);
        }
    }
}

function renderList(files) {
    fileList.innerHTML = '';
    if (files.length === 0) {
        fileList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6b7280;">Hiç dosya bulunamadı.</td></tr>';
        return;
    }

    files.forEach(file => {
        const tr = document.createElement('tr');
        const date = new Date(file.created_at).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const fileType = getFileType(file.filename);

        tr.innerHTML = `
            <td>
                <div class="file-name-cell">
                    <span class="file-icon">${getFileIcon(file.filename)}</span>
                    <span class="file-name-text">${file.filename}</span>
                </div>
            </td>
            <td>
                <span class="file-type-badge ${fileType}">
                    ${getFileIcon(file.filename)} ${getFileTypeName(fileType)}
                </span>
            </td>
            <td>${date}</td>
            <td>
                <button class="btn-download" data-id="${file.id}">
                    İndir
                </button>
                <button class="btn-share" data-id="${file.id}">
                    Paylaş
                </button>
            </td>
        `;

        tr.querySelector('.btn-download').addEventListener('click', () => handleDownload(file));
        tr.querySelector('.btn-share').addEventListener('click', () => openShareModal(file));

        fileList.appendChild(tr);
    });
}

function renderGroupedList(files) {
    fileList.innerHTML = '';
    if (files.length === 0) {
        fileList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6b7280;">Hiç dosya bulunamadı.</td></tr>';
        return;
    }

    const grouped = {};
    files.forEach(file => {
        const type = getFileType(file.filename);
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(file);
    });

    Object.keys(grouped).forEach(type => {
        const groupFiles = grouped[type];
        
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <td colspan="4" style="background: #f9fafb; padding: 12px 16px;">
                <div style="display: flex; align-items: center; gap: 10px; font-weight: 600; color: #111827;">
                    <span style="font-size: 1.3rem;">${getFileTypeGroupIcon(type)}</span>
                    <span>${getFileTypeName(type)}</span>
                    <span style="font-size: 0.85rem; color: #6b7280; font-weight: 500;">(${groupFiles.length})</span>
                </div>
            </td>
        `;
        fileList.appendChild(headerRow);


        groupFiles.forEach(file => {
            const tr = document.createElement('tr');
            const date = new Date(file.created_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            tr.innerHTML = `
                <td>
                    <div class="file-name-cell">
                        <span class="file-icon">${getFileIcon(file.filename)}</span>
                        <span class="file-name-text">${file.filename}</span>
                    </div>
                </td>
                <td>
                    <span class="file-type-badge ${type}">
                        ${getFileIcon(file.filename)} ${getFileTypeName(type)}
                    </span>
                </td>
                <td>${date}</td>
                <td>
                    <button class="btn-download" data-id="${file.id}">
                        İndir
                    </button>
                    <button class="btn-share" data-id="${file.id}">
                        Paylaş
                    </button>
                </td>
            `;

            tr.querySelector('.btn-download').addEventListener('click', () => handleDownload(file));
            tr.querySelector('.btn-share').addEventListener('click', () => openShareModal(file));

            fileList.appendChild(tr);
        });
    });
}

function renderGrid(files) {
    filesGrid.innerHTML = '';
    if (files.length === 0) {
        filesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: #6b7280;">Hiç dosya bulunamadı.</div>';
        return;
    }

    files.forEach(file => {
        const fileType = getFileType(file.filename);
        const date = new Date(file.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-card-icon">${getFileIcon(file.filename)}</div>
            <div class="file-card-name" title="${file.filename}">${file.filename}</div>
            <div class="file-card-meta">
                <span class="file-type-badge ${fileType}">${getFileTypeName(fileType)}</span>
                <span>${date}</span>
            </div>
            <div class="file-card-actions">
                <button class="btn-download" data-id="${file.id}">İndir</button>
                <button class="btn-share" data-id="${file.id}">Paylaş</button>
            </div>
        `;

        card.querySelector('.btn-download').addEventListener('click', (e) => {
            e.stopPropagation();
            handleDownload(file);
        });
        card.querySelector('.btn-share').addEventListener('click', (e) => {
            e.stopPropagation();
            openShareModal(file);
        });

        filesGrid.appendChild(card);
    });
}

function renderGroupedGrid(files) {
    filesGrid.innerHTML = '';
    filesGrid.style.display = 'block';
    
    if (files.length === 0) {
        filesGrid.innerHTML = '<div style="text-align:center; padding: 40px; color: #6b7280;">Hiç dosya bulunamadı.</div>';
        return;
    }

    const grouped = {};
    files.forEach(file => {
        const type = getFileType(file.filename);
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(file);
    });

    Object.keys(grouped).forEach(type => {
        const groupFiles = grouped[type];
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'type-group';
        
        const header = document.createElement('div');
        header.className = 'type-group-header';
        header.innerHTML = `
            <span class="type-group-icon">${getFileTypeGroupIcon(type)}</span>
            <span>${getFileTypeName(type)}</span>
            <span class="type-group-count">(${groupFiles.length})</span>
        `;
        groupDiv.appendChild(header);
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'files-grid';
        
        groupFiles.forEach(file => {
            const date = new Date(file.created_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                <div class="file-card-icon">${getFileIcon(file.filename)}</div>
                <div class="file-card-name" title="${file.filename}">${file.filename}</div>
                <div class="file-card-meta">
                    <span class="file-type-badge ${type}">${getFileTypeName(type)}</span>
                    <span>${date}</span>
                </div>
                <div class="file-card-actions">
                    <button class="btn-download" data-id="${file.id}">İndir</button>
                    <button class="btn-share" data-id="${file.id}">Paylaş</button>
                </div>
            `;

            card.querySelector('.btn-download').addEventListener('click', (e) => {
                e.stopPropagation();
                handleDownload(file);
            });
            card.querySelector('.btn-share').addEventListener('click', (e) => {
                e.stopPropagation();
                openShareModal(file);
            });

            gridContainer.appendChild(card);
        });
        
        groupDiv.appendChild(gridContainer);
        filesGrid.appendChild(groupDiv);
    });
}

function openShareModal(file) {
    currentFileToShare = file;
    shareFileNameDisplay.textContent = `Seçilen Dosya: ${file.filename}`;
    shareUsernamesInput.value = '';
    shareExpiresInput.value = '';
    shareLimitInput.value = '-1';
    shareModal.style.display = 'block';
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

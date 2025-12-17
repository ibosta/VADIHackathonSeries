import supabase from './supabase.js';

// DOM Elements
const welcomeMsg = document.getElementById('welcomeMsg');
const currentDateEl = document.getElementById('currentDate');
const totalFilesEl = document.getElementById('totalFiles');
const sharedByMeEl = document.getElementById('sharedByMe');
const sharedWithMeEl = document.getElementById('sharedWithMe');
const lastActivityEl = document.getElementById('lastActivity');
const recentFilesTable = document.getElementById('recentFilesTable');

document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
	// 1. Tarihi Ayarla
	const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	currentDateEl.textContent = new Date().toLocaleDateString('tr-TR', dateOptions);

	// 2. Oturum Kontrolü
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) {
		window.location.href = 'login.html';
		return;
	}

	// 3. Kullanıcı Profilini Çek (İsim göstermek için)
	fetchUserProfile(user.id);

	// 4. İstatistikleri Çek ve Göster
	fetchStats(user.id);

	// 5. Son Dosyaları Çek
	fetchRecentFiles(user.id);
}

async function fetchUserProfile(userId) {
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('username')
		.eq('id', userId)
		.single();

	if (profile && profile.username) {
		welcomeMsg.textContent = `Hoş Geldin, ${profile.username} 👋`;
	}
}

async function fetchStats(userId) {
	try {
		// A. Toplam Dosya Sayısı
		const { count: fileCount, error: fileError } = await supabase
			.from('files')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId);

		if (!fileError) {
			totalFilesEl.textContent = fileCount;
			animateValue(totalFilesEl, 0, fileCount, 1000);
		}

		// B. Paylaştıklarım (Giden)
		const { count: sentCount, error: sentError } = await supabase
			.from('file_shares')
			.select('*', { count: 'exact', head: true })
			.eq('sender_id', userId);

		if (!sentError) {
			sharedByMeEl.textContent = sentCount;
		}

		// C. Bana Paylaşılanlar (Gelen)
		const { count: receivedCount, error: receivedError } = await supabase
			.from('file_shares')
			.select('*', { count: 'exact', head: true })
			.eq('receiver_id', userId);

		if (!receivedError) {
			sharedWithMeEl.textContent = receivedCount;
		}

	} catch (err) {
		console.error("İstatistik hatası:", err);
	}
}

async function fetchRecentFiles(userId) {
	try {
		// Son 5 dosyayı çek
		const { data: files, error } = await supabase
			.from('files')
			.select('filename, created_at, mime_type')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.limit(5);

		if (error) throw error;

		// Son aktivite zamanını güncelle
		if (files.length > 0) {
			const lastDate = new Date(files[0].created_at);
			lastActivityEl.textContent = timeAgo(lastDate);
		} else {
			recentFilesTable.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#9ca3af;">Henüz dosya yüklenmedi.</td></tr>';
			lastActivityEl.textContent = '-';
			renderChart([]); // Boş grafik
			return;
		}

		// Tabloyu Doldur
		recentFilesTable.innerHTML = '';
		files.forEach(file => {
			const tr = document.createElement('tr');
			const dateStr = new Date(file.created_at).toLocaleDateString('tr-TR');
			const icon = getFileIcon(file.mime_type);

			tr.innerHTML = `
                <td><span class="file-icon">${icon}</span> ${file.filename}</td>
                <td>${dateStr}</td>
                <td><span class="badge badge-gray">${formatMimeType(file.mime_type)}</span></td>
            `;
			recentFilesTable.appendChild(tr);
		});

		// Tüm dosyaları çekip türlerine göre grafik oluştur (Daha kapsamlı analiz için limit: 100)
		const { data: allFiles } = await supabase
			.from('files')
			.select('mime_type')
			.eq('user_id', userId)
			.limit(100);

		if (allFiles) renderChart(allFiles);

	} catch (err) {
		console.error("Dosya listesi hatası:", err);
		recentFilesTable.innerHTML = '<tr><td colspan="3" style="color:red">Veri yüklenemedi.</td></tr>';
	}
}

// Chart.js Grafiğini Oluştur
function renderChart(files) {
	const ctx = document.getElementById('fileTypeChart').getContext('2d');

	// Mime Type sayımı
	const typeCounts = {};
	files.forEach(f => {
		const type = formatMimeType(f.mime_type);
		typeCounts[type] = (typeCounts[type] || 0) + 1;
	});

	const labels = Object.keys(typeCounts);
	const data = Object.values(typeCounts);

	if (labels.length === 0) {
		labels.push('Veri Yok');
		data.push(1); // Boş grafik için
	}

	new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: labels,
			datasets: [{
				data: data,
				backgroundColor: [
					'#4f46e5', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
				],
				borderWidth: 0
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					position: 'right',
					labels: {
						boxWidth: 12,
						font: { size: 11 }
					}
				}
			}
		}
	});
}

// Yardımcı Fonksiyonlar

function getFileIcon(mimeType) {
	if (mimeType.includes('image')) return '🖼️';
	if (mimeType.includes('pdf')) return '📄';
	if (mimeType.includes('video')) return '🎥';
	if (mimeType.includes('text')) return '📝';
	return '📁';
}

function formatMimeType(mimeType) {
	if (!mimeType) return 'Diğer';
	const parts = mimeType.split('/');
	return parts.length > 1 ? parts[1].toUpperCase() : mimeType;
}

function timeAgo(date) {
	const seconds = Math.floor((new Date() - date) / 1000);
	let interval = seconds / 31536000;
	if (interval > 1) return Math.floor(interval) + " yıl önce";
	interval = seconds / 2592000;
	if (interval > 1) return Math.floor(interval) + " ay önce";
	interval = seconds / 86400;
	if (interval > 1) return Math.floor(interval) + " gün önce";
	interval = seconds / 3600;
	if (interval > 1) return Math.floor(interval) + " sa önce";
	interval = seconds / 60;
	if (interval > 1) return Math.floor(interval) + " dk önce";
	return "Az önce";
}

function animateValue(obj, start, end, duration) {
	let startTimestamp = null;
	const step = (timestamp) => {
		if (!startTimestamp) startTimestamp = timestamp;
		const progress = Math.min((timestamp - startTimestamp) / duration, 1);
		obj.innerHTML = Math.floor(progress * (end - start) + start);
		if (progress < 1) {
			window.requestAnimationFrame(step);
		}
	};
	window.requestAnimationFrame(step);
}
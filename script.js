// Ambil elemen DOM
const hargaDasarInput = document.getElementById('hargaDasar');
const jumlahKoinInput = document.getElementById('jumlahKoin');
const persenSlider = document.getElementById('persenSlider');
const displayPoin = document.getElementById('displayPoin');
const displayPersen = document.getElementById('displayPersen');

const resHargaDasar = document.getElementById('resHargaDasar');
const resHargaHasil = document.getElementById('resHargaHasil');
const resSelisih = document.getElementById('resSelisih');
const resProfit = document.getElementById('resProfit');

const btnReset = document.getElementById('btnReset');
const btnSalin = document.getElementById('btnSalin');

const namaCatatanInput = document.getElementById('namaCatatan');
const btnSimpan = document.getElementById('btnSimpan');
const listCatatan = document.getElementById('listCatatan');

// Penyimpanan data kalkulasi aktif
let dataAktif = {};

// Ambil riwayat dari LocalStorage HP
let riwayatData = JSON.parse(localStorage.getItem('scalpCalcHistory')) || [];

// Fungsi Utama Perhitungan
function hitungKalkulasi() {
    const hargaDasar = parseFloat(hargaDasarInput.value) || 0;
    const jumlahKoin = parseFloat(jumlahKoinInput.value) || 1; 
    const persentase = parseFloat(persenSlider.value);
    
    // Hitung selisih poin berdasarkan slider
    const selisihPoin = Math.round((persentase / 100) * hargaDasar);
    const hargaHasil = hargaDasar + selisihPoin;
    const totalProfit = selisihPoin * jumlahKoin;

    // Perbaikan Bug % Selisih: Hitung persentase real berdasarkan selisih poin aktual
    const realPersen = hargaDasar > 0 ? ((selisihPoin / hargaDasar) * 100).toFixed(2) : "0.00";

    // Update Tampilan UI Utama
    displayPoin.textContent = (selisihPoin >= 0 ? '+' : '') + formatAngka(selisihPoin);
    displayPersen.textContent = (selisihPoin >= 0 ? '+' : '') + realPersen + "%";
    
    resHargaDasar.textContent = formatAngka(hargaDasar);
    resHargaHasil.textContent = formatAngka(hargaHasil);
    resSelisih.textContent = (selisihPoin >= 0 ? '+' : '') + formatAngka(selisihPoin);
    resProfit.textContent = formatAngka(totalProfit);

    // Pewarnaan Profit (Hijau/Merah)
    if (totalProfit > 0) {
        resProfit.className = 'profit-green';
    } else if (totalProfit < 0) {
        resProfit.className = 'loss-red';
    } else {
        resProfit.className = '';
    }

    // Simpan ke data aktif untuk keperluan fitur simpan catatan
    dataAktif = {
        hargaDasar,
        jumlahKoin,
        selisihPoin,
        realPersen,
        hargaHasil,
        totalProfit
    };
}

// Format Ribuan (Contoh: 2910 menjadi 2.910)
function formatAngka(num) {
    return num.toLocaleString('id-ID');
}

// Fungsi Tombol Cepat (+1, -10, +100, dll)
window.adjustPoin = function(nilaiTambah) {
    const hargaDasar = parseFloat(hargaDasarInput.value) || 0;
    if (hargaDasar === 0) return;

    // Cari poin saat ini secara real dari posisi slider
    const persentaseSekarang = parseFloat(persenSlider.value);
    const poinSekarang = Math.round((persentaseSekarang / 100) * hargaDasar);
    
    // Jumlahkan poin baru
    const poinBaru = poinSekarang + nilaiTambah;
    
    // Konversi balik ke nilai persentase slider
    let persenBaru = (poinBaru / hargaDasar) * 100;
    
    // Batasi rentang gerak slider antara -300% hingga +300%
    persenBaru = Math.max(-300, Math.min(300, persenBaru));
    
    persenSlider.value = persenBaru;
    hitungKalkulasi();
}

// Fungsi Menyimpan Catatan
function simpanCatatan() {
    let nama = namaCatatanInput.value.trim();
    if (!nama) {
        nama = "Catatan Tanpa Nama";
    }

    // Ambil tanggal dan jam saat ini secara real-time
    const sekarang = new Date();
    const tanggal = sekarang.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const jam = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const waktuString = `${tanggal} - ${jam}`;

    // Buat objek data baru
    const catatanBaru = {
        id: Date.now(),
        nama: nama,
        waktu: waktuString,
        data: { ...dataAktif }
    };

    // Tambahkan data ke baris paling atas riwayat
    riwayatData.unshift(catatanBaru);

    // Kunci masuk ke memori HP (LocalStorage)
    localStorage.setItem('scalpCalcHistory', JSON.stringify(riwayatData));

    // Bersihkan kembali kolom input teks
    namaCatatanInput.value = "";
    
    // Perbarui Tampilan Riwayat Catatan
    tampilkanRiwayat();
}

// Fungsi Menampilkan Daftar Riwayat Catatan ke Layar
function tampilkanRiwayat() {
    listCatatan.innerHTML = "";

    if (riwayatData.length === 0) {
        listCatatan.innerHTML = "<p style='color:#999; font-size:0.85rem; text-align:center; padding: 15px 0;'>Belum ada catatan tersimpan.</p>";
        return;
    }

    riwayatData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-catatan';
        
        const warnaProfit = item.data.totalProfit > 0 ? 'color: #34c759; font-weight: bold;' : (item.data.totalProfit < 0 ? 'color: #ff3b30; font-weight: bold;' : '');

        div.innerHTML = `
            <div class="header-catatan">
                <span>${item.nama}</span>
                <button type="button" class="btn-hapus" onclick="hapusCatatan(${item.id})">×</button>
            </div>
            <div class="waktu-catatan">${item.waktu}</div>
            <div class="detail-catatan">
                <div>Dasar: <b>${formatAngka(item.data.hargaDasar)}</b> (${item.data.jumlahKoin} Koin) | Hasil: <b>${formatAngka(item.data.hargaHasil)}</b></div>
                <div>Selisih: <b>${item.data.selisihPoin >= 0 ? '+' : ''}${formatAngka(item.data.selisihPoin)} Poin</b> (${item.data.selisihPoin >= 0 ? '+' : ''}${item.data.realPersen}%)</div>
                <div style="${warnaProfit}">Profit: ${formatAngka(item.data.totalProfit)}</div>
            </div>
        `;
        listCatatan.appendChild(div);
    });
}

// Fungsi Menghapus Catatan Satu Per Satu
window.hapusCatatan = function(id) {
    if (confirm("Hapus catatan ini dari riwayat?")) {
        riwayatData = riwayatData.filter(item => item.id !== id);
        localStorage.setItem('scalpCalcHistory', JSON.stringify(riwayatData));
        tampilkanRiwayat();
    }
}

// Pasang Event Listeners pemicu real-time
hargaDasarInput.addEventListener('input', hitungKalkulasi);
jumlahKoinInput.addEventListener('input', hitungKalkulasi);
persenSlider.addEventListener('input', hitungKalkulasi);
btnSimpan.addEventListener('click', simpanCatatan);

// Tombol Reset Awal
btnReset.addEventListener('click', () => {
    hargaDasarInput.value = "2910";
    jumlahKoinInput.value = "120";
    persenSlider.value = "0";
    namaCatatanInput.value = "";
    hitungKalkulasi();
});

// Tombol Salin
btnSalin.addEventListener('click', () => {
    const teksSalin = `ScalpCalc Hasil:
Harga Dasar: ${resHargaDasar.textContent}
Harga Hasil: ${resHargaHasil.textContent}
Selisih: ${resSelisih.textContent} (${displayPersen.textContent})
Profit: ${resProfit.textContent}`;

    navigator.clipboard.writeText(teksSalin).then(() => {
        alert("Hasil kalkulasi berhasil disalin!");
    }).catch(err => {
        alert("Gagal menyalin teks.");
    });
});

// Pemicu awal saat aplikasi pertama kali dimuat
hitungKalkulasi();
tampilkanRiwayat();

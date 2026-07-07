// Ambil elemen DOM lama
const hargaDasarInput = document.getElementById('hargaDasar');
const jumlahKoinInput = document.getElementById('jumlahKoin');
const persenSlider = document.getElementById('persenSlider');
const displayPoin = document.getElementById('displayPoin');
const displayPersen = document.getElementById('displayPersen'); // Baru

const resHargaDasar = document.getElementById('resHargaDasar');
const resHargaHasil = document.getElementById('resHargaHasil');
const resSelisih = document.getElementById('resSelisih');
const resProfit = document.getElementById('resProfit');

const btnReset = document.getElementById('btnReset');
const btnSalin = document.getElementById('btnSalin');

// Elemen Baru Fitur Simpan
const namaCatatanInput = document.getElementById('namaCatatan');
const btnSimpan = document.getElementById('btnSimpan');
const listCatatan = document.getElementById('listCatatan');

// Variabel global untuk menyimpan data hasil kalkulasi aktif
let dataAktif = {};

// Fungsi Utama Perhitungan
function hitungKalkulasi() {
    const hargaDasar = parseFloat(hargaDasarInput.value) || 0;
    const jumlahKoin = parseFloat(jumlahKoinInput.value) || 1; 
    const persentase = parseFloat(persenSlider.value);
    
    const selisihPoin = Math.round((persentase / 100) * hargaDasar);
    const hargaHasil = hargaDasar + selisihPoin;
    const totalProfit = selisihPoin * jumlahKoin;

    // Hitung persentase real (bukan pembulatan slider) terhadap harga dasar
    const realPersen = hargaDasar > 0 ? ((selisihPoin / hargaDasar) * 100).toFixed(2) : "0.00";

    // Update UI Utama
    displayPoin.textContent = (selisihPoin >= 0 ? '+' : '') + selisihPoin;
    displayPersen.textContent = (selisihPoin >= 0 ? '+' : '') + realPersen + "%";
    
    resHargaDasar.textContent = formatAngka(hargaDasar);
    resHargaHasil.textContent = formatAngka(hargaHasil);
    resSelisih.textContent = (selisihPoin >= 0 ? '+' : '') + formatAngka(selisihPoin);
    resProfit.textContent = formatAngka(totalProfit);

    if (totalProfit > 0) {
        resProfit.className = 'profit-green';
    } else if (totalProfit < 0) {
        resProfit.className = 'loss-red';
    } else {
        resProfit.className = '';
    }

    // Simpan ke object global agar bisa ditarik saat tombol Simpan ditekan
    dataAktif = {
        hargaDasar,
        jumlahKoin,
        selisihPoin,
        realPersen,
        hargaHasil,
        totalProfit
    };
}

function formatAngka(num) {
    return num.toLocaleString('id-ID');
}

window.adjustPoin = function(nilaiTambah) {
    const hargaDasar = parseFloat(hargaDasarInput.value) || 0;
    if (hargaDasar === 0) return;

    const persentaseSekarang = parseFloat(persenSlider.value);
    const poinSekarang = Math.round((persentaseSekarang / 100) * hargaDasar);
    
    const poinBaru = poinSekarang + nilaiTambah;
    let persenBaru = (poinBaru / hargaDasar) * 100;
    persenBaru = Math.max(-300, Math.min(300, persenBaru));
    
    persenSlider.value = persenBaru;
    hitungKalkulasi();
}

// ================= FUNGSI SIMPAN & RIWAYAT DATA =================

// Ambil data lama dari LocalStorage jika ada
let riwayatData = JSON.parse(localStorage.getItem('scalpCalcHistory')) || [];

function simpanCatatan() {
    let nama = namaCatatanInput.value.trim();
    if (!nama) {
        nama = "Tanpa Nama";
    }

    // Generate tanggal dan jam saat ini
    const sekarang = new Date();
    const tanggal = sekarang.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const jam = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const waktuString = `${tanggal}, ${jam}`;

    // Buat object catatan baru
    const catatanBaru = {
        id: Date.now(),
        nama: nama,
        waktu: waktuString,
        data: { ...dataAktif }
    };

    // Tambahkan ke array riwayat (di urutan paling atas)
    riwayatData.unshift(catatanBaru);

    // Simpan ke local storage HP
    localStorage.setItem('scalpCalcHistory', JSON.stringify(riwayatData));

    // Reset input nama dan render ulang list
    namaCatatanInput.value = "";
    tampilkanRiwayat();
}

function tampilkanRiwayat() {
    listCatatan.innerHTML = "";

    if (riwayatData.length === 0) {
        listCatatan.innerHTML = "<p style='color:#999; font-size:0.85rem; text-align:center; padding: 10px;'>Belum ada catatan tersimpan.</p>";
        return;
    }

    riwayatData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-catatan';
        
        const isProfit = item.data.totalProfit >= 0;
        const warnaProfit = item.data.totalProfit > 0 ? 'color: #34c759; font-weight: bold;' : (item.data.totalProfit < 0 ? 'color: #ff3b30; font-weight: bold;' : '');

        div.innerHTML = `
            <div class="header-catatan">
                <span>${item.nama}</span>
                <button class="btn-hapus" onclick="hapusCatatan(${item.id})">×</button>
            </div>
            <div class="waktu-catatan">${item.waktu}</div>
            <div class="detail-catatan">
                <div>Dasar: ${formatAngka(item.data.hargaDasar)} (${item.data.jumlahKoin} Koin)</div>
                <div>Hasil: ${formatAngka(item.data.hargaHasil)}</div>
                <div>Poin: ${item.data.selisihPoin >= 0 ? '+' : ''}${formatAngka(item.data.selisihPoin)} (${item.data.selisihPoin >= 0 ? '+' : ''}${item.data.realPersen}%)</div>
                <div style="${warnaProfit}">Profit: ${formatAngka(item.data.totalProfit)}</div>
            </div>
        `;
        listCatatan.appendChild(div);
    });
}

// Fungsi Hapus Catatan Tunggal
window.hapusCatatan = function(id) {
    if (confirm("Hapus catatan ini?")) {
        riwayatData = riwayatData.filter(item => item.id !== id);
        localStorage.setItem('scalpCalcHistory', JSON.stringify(riwayatData));
        tampilkanRiwayat();
    }
}

// Event Listeners
hargaDasarInput.addEventListener('input', hitungKalkulasi);
jumlahKoinInput.addEventListener('input', hitungKalkulasi);
persenSlider.addEventListener('input', hitungKalkulasi);
btnSimpan.addEventListener('click', simpanCatatan);

btnReset.addEventListener('click', () => {
    hargaDasarInput.value = "2910";
    jumlahKoinInput.value = "120";
    persenSlider.value = "0";
    namaCatatanInput.value = "";
    hitungKalkulasi();
});

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

// Load awal aplikasi
hitungKalkulasi();
tampilkanRiwayat();

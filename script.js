// Ambil elemen DOM
const hargaDasarInput = document.getElementById('hargaDasar');
const jumlahKoinInput = document.getElementById('jumlahKoin');
const persenSlider = document.getElementById('persenSlider');
const displayPoin = document.getElementById('displayPoin');

const resHargaDasar = document.getElementById('resHargaDasar');
const resHargaHasil = document.getElementById('resHargaHasil');
const resSelisih = document.getElementById('resSelisih');
const resProfit = document.getElementById('resProfit');

const btnReset = document.getElementById('btnReset');
const btnSalin = document.getElementById('btnSalin');

// Fungsi Utama Perhitungan
function hitungKalkulasi() {
    const hargaDasar = parseFloat(hargaDasarInput.value) || 0;
    // Default koin jika kosong atau 0 menjadi 1
    const jumlahKoin = parseFloat(jumlahKoinInput.value) || 1; 
    
    // Ambil persentase dari slider (-300% sampai +300%)
    const persentase = parseFloat(persenSlider.value);
    
    // Hitung selisih poin berdasarkan persentase dari harga dasar
    // Math.round digunakan agar poin berupa angka bulat (integer) sesuai gambar
    const selisihPoin = Math.round((persentase / 100) * hargaDasar);
    
    // Hitung output logika
    const hargaHasil = hargaDasar + selisihPoin;
    const totalProfit = selisihPoin * jumlahKoin;

    // Update Tampilan UI
    displayPoin.textContent = (selisihPoin >= 0 ? '+' : '') + selisihPoin;
    resHargaDasar.textContent = formatAngka(hargaDasar);
    resHargaHasil.textContent = formatAngka(hargaHasil);
    resSelisih.textContent = (selisihPoin >= 0 ? '+' : '') + formatAngka(selisihPoin);
    
    // Format profit & ubah warna (Hijau jika untung, Merah jika rugi)
    resProfit.textContent = formatAngka(totalProfit);
    if (totalProfit > 0) {
        resProfit.className = 'profit-green';
    } else if (totalProfit < 0) {
        resProfit.className = 'loss-red';
    } else {
        resProfit.className = '';
    }
}

// Fungsi pembantu format ribuan (Contoh: -4200 menjadi -4.200)
function formatAngka(num) {
    return num.toLocaleString('id-ID');
}

// Fungsi untuk tombol cepat (+1, -10, dll)
window.adjustPoin = function(nilaiTambah) {
    const hargaDasar = parseFloat(hargaDasarInput.value) || 0;
    if (hargaDasar === 0) return;

    // Cari poin saat ini dari slider
    const persentaseSekarang = parseFloat(persenSlider.value);
    const poinSekarang = Math.round((persentaseSekarang / 100) * hargaDasar);
    
    // Tambahkan poin baru
    const poinBaru = poinSekarang + nilaiTambah;
    
    // Ubah kembali poin baru ke bentuk persen untuk slider
    let persenBaru = (poinBaru / hargaDasar) * 100;
    
    // Batasi agar tidak melampaui batas maks/min slider (-300% s.d 300%)
    persenBaru = Math.max(-300, Math.min(300, persenBaru));
    
    persenSlider.value = persenBaru;
    hitungKalkulasi();
}

// Event Listeners agar berjalan real-time dan halus
hargaDasarInput.addEventListener('input', hitungKalkulasi);
jumlahKoinInput.addEventListener('input', hitungKalkulasi);
persenSlider.addEventListener('input', hitungKalkulasi); // 'input' bekerja instan saat digeser

// Tombol Reset
btnReset.addEventListener('click', () => {
    hargaDasarInput.value = "2910";
    jumlahKoinInput.value = "120";
    persenSlider.value = "0";
    hitungKalkulasi();
});

// Tombol Salin Hasil
btnSalin.addEventListener('click', () => {
    const teksSalin = `ScalpCalc Hasil:
Harga Dasar: ${resHargaDasar.textContent}
Harga Hasil: ${resHargaHasil.textContent}
Selisih: ${resSelisih.textContent}
Profit: ${resProfit.textContent}`;

    navigator.clipboard.writeText(teksSalin).then(() => {
        alert("Hasil kalkulasi berhasil disalin!");
    }).catch(err => {
        alert("Gagal menyalin teks.");
    });
});

// Jalankan kalkulasi pertama kali saat aplikasi dibuka
hitungKalkulasi();

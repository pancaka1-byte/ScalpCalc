// Ambil elemen DOM
const hargaDasarInput = document.getElementById('hargaDasar');
const jumlahKoinInput = document.getElementById('jumlahKoin');
const persenSlider = document.getElementById('persenSlider');
const displayPoin = document.getElementById('displayPoin');
const displayPersen = document.getElementById('displayPersen');

const resHargaDasar = document.getElementById('resHargaDasar');
const resHargaHasil = document.getElementById('resHargaHasil');
const resSelisih = document.getElementById('resSelisih');
const resAsetAwal = document.getElementById('resAsetAwal');   
const resAsetAkhir = document.getElementById('resAsetAkhir'); 
const resProfit = document.getElementById('resProfit');

const btnReset = document.getElementById('btnReset');
const btnSalin = document.getElementById('btnSalin');

const namaCatatanInput = document.getElementById('namaCatatan');
const btnSimpan = document.getElementById('btnSimpan');
const listCatatan = document.getElementById('listCatatan');

let dataAktif = {};
let riwayatData = JSON.parse(localStorage.getItem('scalpCalcHistory')) || [];

// Fungsi Utama Perhitungan
function hitungKalkulasi() {
    const hargaDasar = parseFloat(hargaDasarInput.value) || 0;
    const jumlahKoin = parseFloat(jumlahKoinInput.value) || 1; 
    const persentase = parseFloat(persenSlider.value);
    
    // Hitung logika inti
    const selisihPoin = Math.round((persentase / 100) * hargaDasar);
    const hargaHasil = hargaDasar + selisihPoin;
    const totalProfit = selisihPoin * jumlahKoin;

    // Hitung nilai aset awal & akhir secara real-time
    const asetAwal = hargaDasar * jumlahKoin;
    const asetAkhir = hargaHasil * jumlahKoin;

    const realPersen = hargaDasar > 0 ? ((selisihPoin / hargaDasar) * 100).toFixed(2) : "0.00";

    // Update UI Utama
    displayPoin.textContent = (selisihPoin >= 0 ? '+' : '') + formatAngka(selisihPoin);
    displayPersen.textContent = (selisihPoin >= 0 ? '+' : '') + realPersen + "%";
    
    resHargaDasar.textContent = formatAngka(hargaDasar);
    resHargaHasil.textContent = formatAngka(hargaHasil);
    resSelisih.textContent = (selisihPoin >= 0 ? '+' : '') + formatAngka(selisihPoin);
    
    // Masukkan data aset ke UI secara real-time
    resAsetAwal.textContent = formatAngka(asetAwal);
    resAsetAkhir.textContent = formatAngka(asetAkhir);
    
    resProfit.textContent = formatAngka(totalProfit);

    if (totalProfit > 0) {
        resProfit.className = 'profit-green';
    } else if (totalProfit < 0) {
        resProfit.className = 'loss-red';
    } else {
        resProfit.className = '';
    }

    // Simpan data lengkap ke objek aktif
    dataAktif = {
        hargaDasar,
        jumlahKoin,
        selisihPoin,
        realPersen,
        hargaHasil,
        asetAwal,
        asetAkhir,
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

function simpanCatatan() {
    let nama = namaCatatanInput.value.trim();
    if (!nama) {
        nama = "Catatan Tanpa Nama";
    }

    const sekarang = new Date();
    const tanggal = sekarang.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const jam = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const waktuString = `${tanggal} - ${jam}`;

    const catatanBaru = {
        id: Date.now(),
        nama: nama,
        waktu: waktuString,
        data: { ...dataAktif }
    };

    riwayatData.unshift(catatanBaru);
    localStorage.setItem('scalpCalcHistory', JSON.stringify(riwayatData));
    namaCatatanInput.value = "";
    tampilkanRiwayat();
}

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
                <div>Dasar: <b>${formatAngka(item.data.hargaDasar)}</b> (${item.data.jumlahKoin} Koin) → Hasil: <b>${formatAngka(item.data.hargaHasil)}</b></div>
                <div>Aset: <b>${formatAngka(item.data.asetAwal)}</b> → <b>${formatAngka(item.data.asetAkhir)}</b></div>
                <div>Selisih: <b>${item.data.selisihPoin >= 0 ? '+' : ''}${formatAngka(item.data.selisihPoin)} Poin</b> (${item.data.selisihPoin >= 0 ? '+' : ''}${item.data.realPersen}%)</div>
                <div style="${warnaProfit}">Profit: ${formatAngka(item.data.totalProfit)}</div>
            </div>
        `;
        listCatatan.appendChild(div);
    });
}

window.hapusCatatan = function(id) {
    if (confirm("Hapus catatan ini dari riwayat?")) {
        riwayatData = riwayatData.filter(item => item.id !== id);
        localStorage.setItem('scalpCalcHistory', JSON.stringify(riwayatData));
        tampilkanRiwayat();
    }
}

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
Nilai Aset: ${resAsetAwal.textContent} -> ${resAsetAkhir.textContent}
Profit: ${resProfit.textContent}`;

    navigator.clipboard.writeText(teksSalin).then(() => {
        alert("Hasil kalkulasi berhasil disalin!");
    }).catch(err => {
        alert("Gagal menyalin teks.");
    });
});

hitungKalkulasi();
tampilkanRiwayat();
        

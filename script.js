
const harga = document.getElementById("harga");
const persen = document.getElementById("persen");

const persenValue = document.getElementById("persenValue");

const beli = document.getElementById("beli");
const jual = document.getElementById("jual");
const dasar = document.getElementById("dasar");

function hitung() {

    let h = Number(harga.value);
    let p = Number(persen.value);

    let selisih = h * p / 100;

    let hargaBeli = Math.round(h - selisih);
    let hargaJual = Math.round(h + selisih);

    dasar.innerText = h.toLocaleString("id-ID");
    beli.innerText = hargaBeli.toLocaleString("id-ID");
    jual.innerText = hargaJual.toLocaleString("id-ID");

    persenValue.innerText = p.toFixed(1) + " %";
}

function ubahHarga(nilai){
    harga.value = Number(harga.value) + nilai;
    hitung();
}

harga.addEventListener("input", hitung);
persen.addEventListener("input", hitung);

hitung();

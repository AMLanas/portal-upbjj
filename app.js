/* ============================================================
   KONSTANTA & STATE
   ============================================================ */

const STORAGE_KEY = 'ut_upbjj_data';

let upbjjList  = [];   // array utama data UPBJJ
let filterType = 'all'; // filter tipe aktif saat ini
let editIndex  = null;  // index item yang sedang diedit

/* ============================================================
   DATA DEFAULT
   (Digunakan saat localStorage kosong / pertama kali dibuka)
   ============================================================ */

const defaultData = [
  { id: uid(), nama: 'UPBJJ-UT Jakarta',     jalan: 'Jl. Cabe Raya, Pondok Cabe, Pamulang, Tangerang Selatan', tipe: 'pusat'    },
  { id: uid(), nama: 'UPBJJ-UT Banjarmasin', jalan: 'Jl. Brigjen H. Hasan Basri No.9, Banjarmasin Utara',       tipe: 'regional' },
  { id: uid(), nama: 'UPBJJ-UT Surabaya',    jalan: 'Jl. Raya Panjang Jiwo No.113, Surabaya',                   tipe: 'regional' },
  { id: uid(), nama: 'UPBJJ-UT Medan',       jalan: 'Jl. Bhayangkara No.9, Medan',                              tipe: 'regional' },
  { id: uid(), nama: 'UPBJJ-UT Makassar',    jalan: 'Jl. Abdesir No.1, Makassar',                               tipe: 'regional' },
  { id: uid(), nama: 'UPBJJ-UT Padang',      jalan: 'Jl. Jhoni Anwar No.1, Lapai, Padang',                      tipe: 'cabang'   },
  { id: uid(), nama: 'UPBJJ-UT Palembang',   jalan: 'Jl. Srijaya Negara, Bukit Besar, Palembang',               tipe: 'cabang'   },
  { id: uid(), nama: 'UPBJJ-UT Semarang',    jalan: 'Jl. Pawiyatan Luhur IV No.15, Bendan Duwur, Semarang',     tipe: 'regional' },
  { id: uid(), nama: 'UPBJJ-UT Yogyakarta',  jalan: 'Jl. HOS Cokroaminoto No.1, Pakuncen, Wirobrajan, Yogyakarta', tipe: 'cabang' },
  { id: uid(), nama: 'UPBJJ-UT Denpasar',    jalan: 'Jl. Gunung Sanghyang No.116-120, Pemecutan Kaja, Denpasar', tipe: 'regional' },
  { id: uid(), nama: 'UPBJJ-UT Kupang',      jalan: 'Jl. Perintis Kemerdekaan No.9, Kupang',                    tipe: 'cabang'   },
  { id: uid(), nama: 'UPBJJ-UT Manado',      jalan: 'Jl. Ester Lapian No.1, Manado',                            tipe: 'cabang'   },
];

/* ============================================================
   UTILITAS
   ============================================================ */

/** Buat ID unik berbasis waktu + random */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Escape karakter HTML untuk mencegah XSS */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   PENYIMPANAN (localStorage)
   ============================================================ */

/** Muat data dari localStorage; pakai defaultData jika kosong */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    upbjjList = raw ? JSON.parse(raw) : [...defaultData];
  } catch (e) {
    console.error('Gagal memuat data:', e);
    upbjjList = [...defaultData];
  }
}

/** Simpan upbjjList ke localStorage dan perbarui counter hero */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(upbjjList));
  updateTotalCount();
}

/* ============================================================
   UI HELPERS
   ============================================================ */

/** Perbarui angka total UPBJJ di bagian hero */
function updateTotalCount() {
  document.getElementById('totalCount').textContent = upbjjList.length;
}

/** Tampilkan notifikasi toast singkat */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ============================================================
   FILTER & PENCARIAN
   ============================================================ */

/**
 * Set filter tipe aktif dan re-render kartu.
 * @param {string} type  - 'all' | 'pusat' | 'cabang' | 'regional'
 * @param {HTMLElement} btn - tombol chip yang diklik
 */
function setFilter(type, btn) {
  filterType = type;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderCards();
}

/**
 * Kembalikan daftar UPBJJ yang sudah difilter
 * berdasarkan tipe aktif dan teks pencarian.
 * @returns {Array}
 */
function getFiltered() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();

  return upbjjList.filter(item => {
    const matchTipe   = filterType === 'all' || item.tipe === filterType;
    const matchSearch = !query
      || item.nama.toLowerCase().includes(query)
      || item.jalan.toLowerCase().includes(query);

    return matchTipe && matchSearch;
  });
}

/* ============================================================
   RENDER KARTU
   ============================================================ */

/** Render ulang semua kartu UPBJJ ke dalam grid */
function renderCards() {
  const grid     = document.getElementById('upbjj-grid');
  const countBar = document.getElementById('count-bar');
  const filtered = getFiltered();

  // Perbarui keterangan jumlah hasil
  countBar.innerHTML =
    `Menampilkan <strong>${filtered.length}</strong> dari <strong>${upbjjList.length}</strong> UPBJJ`;

  // Tampilkan empty state jika tidak ada hasil
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🔍</div>
        <p>Tidak ada UPBJJ yang cocok dengan pencarian Anda.</p>
      </div>`;
    return;
  }

  // Render kartu
  grid.innerHTML = filtered.map((item, i) => {
    const tipeLabel = { pusat: 'Pusat', cabang: 'Cabang', regional: 'Regional' }[item.tipe] || item.tipe;
    const realIndex = upbjjList.findIndex(x => x.id === item.id);

    return `
      <div class="upbjj-card ${item.tipe}" style="animation-delay:${i * 0.04}s">
        <span class="card-type-badge">${tipeLabel}</span>
        <div class="card-name">${escHtml(item.nama)}</div>
        <div class="card-address">${escHtml(item.jalan)}</div>
        <div class="card-actions">
          <button class="btn-sm btn-edit"   onclick="openEdit(${realIndex})">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteUPBJJ(${realIndex})">🗑 Hapus</button>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   CRUD — TAMBAH
   ============================================================ */

/** Tambahkan UPBJJ baru dari form input */
function addUPBJJ() {
  const nama  = document.getElementById('inp-nama').value.trim();
  const jalan = document.getElementById('inp-jalan').value.trim();
  const tipe  = document.getElementById('inp-tipe').value;

  if (!nama || !jalan) {
    showToast('⚠️ Nama dan alamat wajib diisi!');
    return;
  }

  upbjjList.unshift({ id: uid(), nama, jalan, tipe });
  save();
  renderCards();

  // Kosongkan field input
  document.getElementById('inp-nama').value  = '';
  document.getElementById('inp-jalan').value = '';

  showToast('✅ UPBJJ berhasil ditambahkan!');
}

/* ============================================================
   CRUD — HAPUS
   ============================================================ */

/**
 * Hapus UPBJJ berdasarkan index di upbjjList.
 * @param {number} idx
 */
function deleteUPBJJ(idx) {
  if (!confirm(`Hapus "${upbjjList[idx].nama}"?`)) return;

  upbjjList.splice(idx, 1);
  save();
  renderCards();
  showToast('🗑 UPBJJ dihapus.');
}

/* ============================================================
   CRUD — EDIT (Modal)
   ============================================================ */

/**
 * Buka modal edit dan isi field dengan data item yang dipilih.
 * @param {number} idx
 */
function openEdit(idx) {
  editIndex = idx;
  const item = upbjjList[idx];

  document.getElementById('edit-nama').value  = item.nama;
  document.getElementById('edit-jalan').value = item.jalan;
  document.getElementById('edit-tipe').value  = item.tipe;

  document.getElementById('edit-modal').classList.add('open');
}

/** Tutup modal edit */
function closeModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editIndex = null;
}

/** Simpan perubahan dari modal edit */
function saveEdit() {
  if (editIndex === null) return;

  const nama  = document.getElementById('edit-nama').value.trim();
  const jalan = document.getElementById('edit-jalan').value.trim();
  const tipe  = document.getElementById('edit-tipe').value;

  if (!nama || !jalan) {
    showToast('⚠️ Nama dan alamat wajib diisi!');
    return;
  }

  // Perbarui data di array (pertahankan id lama)
  upbjjList[editIndex] = { ...upbjjList[editIndex], nama, jalan, tipe };

  save();
  renderCards();
  closeModal();
  showToast('✅ Data UPBJJ diperbarui!');
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

// Tutup modal saat klik di luar area modal
document.getElementById('edit-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// Tekan Enter di field form untuk langsung menambah
['inp-nama', 'inp-jalan'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') addUPBJJ();
  });
});

/* ============================================================
   INISIALISASI
   ============================================================ */

load();
renderCards();
updateTotalCount();

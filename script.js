// Simple client-side logic. Semua data disimpan di localStorage.

// --- Account management ---
const btnLink = document.getElementById('btn-link');
const btnChange = document.getElementById('btn-change');

btnLink.addEventListener('click', linkAccount);
btnChange.addEventListener('click', changePassword);

function linkAccount(){
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if(!u || !p){
    alert('Isi username dan password.'); return;
  }
  // Simpan sederhana — jangan gunakan ini di produksi
  localStorage.setItem('sha_user', u);
  localStorage.setItem('sha_pass', btoa(p));
  alert('Akun tersimpan (di browser).');
}

function changePassword(){
  const u = document.getElementById('username').value.trim();
  const oldp = prompt('Masukkan password lama:');
  const storeUser = localStorage.getItem('sha_user');
  const storePass = localStorage.getItem('sha_pass');
  if(!storeUser){ alert('Belum ada akun yang ditautkan.'); return; }
  if(u !== storeUser){ alert('Username tidak cocok dengan akun yang tersimpan.'); return; }
  if(!oldp || btoa(oldp) !== storePass){ alert('Password lama salah.'); return; }
  const newp = prompt('Masukkan password baru:');
  if(!newp){ alert('Password baru tidak boleh kosong.'); return; }
  localStorage.setItem('sha_pass', btoa(newp));
  alert('Password telah diubah.');
}

// --- Health check ---
const btnCheck = document.getElementById('btn-check-health');
const btnSave = document.getElementById('btn-save-entry');
const healthResult = document.getElementById('health-result');

btnCheck.addEventListener('click', doHealthCheck);
btnSave.addEventListener('click', saveEntryToHistory);

function doHealthCheck(){
  const age = Number(document.getElementById('age').value);
  const height = Number(document.getElementById('height').value);
  const weight = Number(document.getElementById('weight').value);
  const sympt = {
    fatigue: document.getElementById('fatigue').checked,
    anger: document.getElementById('anger').checked,
    sick: document.getElementById('sick').checked
  };
  if(!age || !height || !weight){ alert('Isi umur, tinggi, dan berat.'); return; }
  const bmi = computeBMI(height, weight);
  const bmiCategory = bmiCategoryText(bmi);
  const idealRange = 'BMI ideal: 18.5 - 24.9';
  const idealWeight = idealWeightRange(height);

  const suggestions = generateAISuggestions({age, height, weight, bmi, sympt});

  healthResult.innerHTML = `
    <strong>Hasil:</strong>
    <div>Umur: ${age} tahun</div>
    <div>Tinggi: ${height} cm</div>
    <div>Berat: ${weight} kg</div>
    <div>BMI: ${bmi.toFixed(2)} — <em>${bmiCategory}</em></div>
    <div>${idealRange} (Perkiraan berat ideal: ${idealWeight.min} - ${idealWeight.max} kg)</div>
    <div class="suggestion"><strong>Saran (AI sederhana):</strong><br/>${suggestions}</div>
  `;
}

function computeBMI(heightCm, weightKg){
  const h = heightCm/100;
  return weightKg / (h*h);
}

function bmiCategoryText(bmi){
  if(bmi < 18.5) return 'Kurus (Underweight)';
  if(bmi < 25) return 'Normal';
  if(bmi < 30) return 'Kelebihan berat (Overweight)';
  return 'Obesitas';
}

function idealWeightRange(heightCm){
  const h = heightCm/100;
  const min = Math.round(18.5 * h * h);
  const max = Math.round(24.9 * h * h);
  return {min, max};
}

function generateAISuggestions({age, height, weight, bmi, sympt}){
  // Catatan: ini *bukan* model AI eksternal; ini rule-based sederhana
  const pieces = [];
  // BMI advice
  if(bmi < 18.5) pieces.push('Berat badan di bawah normal — pertimbangkan makan sumber kalori & protein berkualitas, dan periksa dengan tenaga medis bila ada penurunan berat mendadak.');
  else if(bmi < 25) pieces.push('Berat badan ideal. Pertahankan pola makan seimbang dan olahraga teratur (3-5x/minggu).');
  else if(bmi < 30) pieces.push('Sedikit kelebihan berat. Kurangi konsumsi gula dan makanan tinggi lemak, tingkatkan aktivitas fisik.');
  else pieces.push('Obesitas — sebaiknya konsultasi ke profesional kesehatan untuk rencana diet & aktivitas.');

  // symptoms
  if(sympt.fatigue) pieces.push('Cepat lelah: periksa kualitas tidur (target 7-9 jam), asupan zat besi/vitamin, dan hidrasi.');
  if(sympt.anger) pieces.push('Gampang marah: coba teknik napas, meditasi singkat, dan cek beban stres harian. Olahraga ringan membantu regulasi emosi.');
  if(sympt.sick) pieces.push('Gampang sakit: periksa imunitas (vitamin D/C), konsumsi makanan bergizi, dan hindari kontak dengan sumber infeksi saat memungkinkan.');

  // age-based tip
  if(age >= 50) pieces.push('Di usia 50+, perhatikan cek kesehatan rutin (tekanan darah, gula darah, kolesterol).');

  // actionable small steps
  pieces.push('Langkah cepat: catat 1 perubahan kecil yang bisa dilakukan minggu ini (contoh: tambah 1 porsi sayur/hari, tidur 30 menit lebih awal, atau kurangi 30 menit gadget).');

  return pieces.map(p=>`• ${p}`).join('<br/>');
}

// --- Save to history ---
function saveEntryToHistory(){
  const age = Number(document.getElementById('age').value);
  const height = Number(document.getElementById('height').value);
  const weight = Number(document.getElementById('weight').value);
  const gadgetMinutes = Number(document.getElementById('gadget-minutes').value) || 0;
  if(!age || !height || !weight){ alert('Isi umur, tinggi, dan berat sebelum menyimpan.'); return; }
  const bmi = computeBMI(height, weight);
  const entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    age, height, weight, bmi, gadgetMinutes
  };
  const arr = JSON.parse(localStorage.getItem('sha_history') || '[]');
  arr.push(entry);
  localStorage.setItem('sha_history', JSON.stringify(arr));
  alert('Tersimpan di history. Lihat halaman History.');
}

// --- Gadget usage ---
const btnGadget = document.getElementById('btn-check-gadget');
const gadgetResult = document.getElementById('gadget-result');
btnGadget.addEventListener('click', checkGadgetUsage);

function checkGadgetUsage(){
  const minutes = Number(document.getElementById('gadget-minutes').value);
  const threshold = Number(document.getElementById('gadget-threshold').value);
  if(isNaN(minutes)){ alert('Masukkan lama pemakaian gadget.'); return; }
  if(minutes > threshold){
    gadgetResult.innerHTML = `<div class="warning">Peringatan: Pemakaian gadget melebihi batas (${threshold} menit) — saat ini ${minutes} menit.</div>` +
      `<div class="suggestion"><strong>Saran:</strong><br/>• Istirahatkan mata tiap 20 menit (aturan 20-20-20).<br/>• Ganti sebagian waktu dengan jalan singkat atau stretching.<br/>• Atur mode fokus / notifikasi untuk kurangi gangguan.</div>`;
  } else {
    gadgetResult.innerHTML = `Pemakaian gadget dalam batas aman (${minutes} / ${threshold} menit).<br/><small class="note">Ingat untuk tetap bergerak dan menjaga postur.</small>`;
  }
}

// --- Initialize fields from storage if ada ---
(function init(){
  const u = localStorage.getItem('sha_user');
  if(u) document.getElementById('username').value = u;
})();

// Optional: expose some functions for history page
window._sha = {
  getHistory: ()=> JSON.parse(localStorage.getItem('sha_history') || '[]'),
  clearHistory: ()=> localStorage.removeItem('sha_history')
};

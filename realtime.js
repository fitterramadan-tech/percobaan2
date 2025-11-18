let startTime = null;
let interval = null;

function startTracking() {
    if (interval) return;

    startTime = Date.now();
    interval = setInterval(updateTime, 1000);
}

function stopTracking() {
    if (!interval) return;

    clearInterval(interval);
    interval = null;
    saveHistory("Pemakaian gadget dihentikan");
}

function updateTime() {
    let now = Date.now();
    let diff = Math.floor((now - startTime) / 1000);

    let h = Math.floor(diff / 3600);
    let m = Math.floor((diff % 3600) / 60);
    let s = diff % 60;

    document.getElementById("timeDisplay").innerText = `${h} jam ${m} menit ${s} detik`;

    // Warning otomatis
    if (h >= 3) {
        document.getElementById("warning").innerText = "⚠ Pemakaian sudah terlalu lama! Istirahat sekarang.";
    }
}

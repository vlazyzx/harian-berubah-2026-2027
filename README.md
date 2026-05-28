# 🧠 Grind Mode — Daily Habit Tracker

> *Stay locked in. Every. Single. Day.*

Sebuah daily habit tracker berbasis web dengan vibes **dark + neon cyber**, dibangun pakai HTML, CSS (Tailwind), dan JavaScript murni — tanpa framework, tanpa backend. Data tersimpan langsung di browser lo.

---

## ✨ Fitur

- ✅ **Checklist Harian** — 7 habit yang bisa diceklis setiap hari
- 🔒 **Submit & Lock** — Sekali disimpan, tidak bisa diubah sampai jam 06:00 WIB keesokan harinya
- ⏳ **Countdown Unlock** — Notif real-time hitung mundur sampai jam 06:00 WIB
- 📊 **Progress Bar** — Visual progress harian 0–100%
- 🍩 **Donut Chart** — Completion chart neon
- 📈 **Bar Chart 7 Hari** — Histogram history mingguan
- 📅 **Tabel Spreadsheet** — Log history 7 hari lengkap per-habit
- 🔥 **Streak Counter** — Hitung berapa hari berturut-turut full complete
- 💾 **Auto Save** — Data tersimpan di `localStorage`, aman meski browser ditutup

---

## 🗂️ Struktur File

```
grind-mode/
├── index.html   # Struktur halaman
├── style.css    # Styling dark neon + animasi
└── app.js       # Semua logika & data
```

> Tiga file terpisah, tidak ada dependency eksternal selain Tailwind CDN dan Google Fonts.

---

## 🚀 Cara Pakai

1. **Clone** repo ini
   ```bash
   git clone https://github.com/username/grind-mode.git
   cd grind-mode
   ```

2. **Buka** `index.html` langsung di browser — tidak perlu install apapun, tidak perlu server

3. **Centang** habit yang udah lo lakuin hari ini

4. Klik **✅ SAVE TODAY** buat ngunci data hari ini

5. Data otomatis unlock lagi jam **06:00 WIB** keesokan harinya

---

## 📋 Daftar Habit

| Emoji | Habit |
|-------|-------|
| 🧠 | No PMO |
| 🌞 | Sunscreen |
| 💪 | Push Up 5x |
| 💧 | Minum Air 8 Gelas |
| 🌙 | Tidur Tepat Waktu |
| ✨ | Skincare Malam |
| 🫧 | Cuci Muka Malam |

> Mau tambah atau hapus habit? Edit array `HABITS` di bagian atas `app.js`.

---

## 🔒 Sistem Lock & Unlock

- Setelah klik **SAVE TODAY**, semua habit terkunci — tidak bisa dicentang/uncentang
- Muncul notif **🔓 Unlock dalam: HH:MM:SS** yang countdown real-time
- Tepat jam **06:00 WIB**, halaman otomatis reload dan hari baru dimulai
- Logika "hari baru" berbasis WIB (UTC+7) — bukan UTC default browser

---

## 💾 Penyimpanan Data

Semua data disimpan di `localStorage` browser dengan key `grindmode_data`. Format datanya:

```json
{
  "2025-05-28": {
    "habits": {
      "noPMO": true,
      "sunscreen": true
    },
    "completedAt": {
      "noPMO": "08:30",
      "sunscreen": "09:15"
    },
    "submittedAt": "22:45:10"
  }
}
```

> ⚠️ Data tersimpan **lokal di browser** lo. Kalau ganti browser atau clear cache, data akan hilang.

---

## 🛠️ Kustomisasi

**Ganti daftar habit** — edit array `HABITS` di `app.js`:
```js
const HABITS = [
  { id: 'noPMO', emoji: '🧠', label: 'No PMO' },
  // tambah habit baru di sini
];
```

**Ganti jam unlock** — edit angka `6` di fungsi `todayKey` dan `getSecondsUntilUnlock` di `app.js`:
```js
if (wib.getUTCHours() < 6) { ... } // ganti 6 ke jam yang lo mau
```

---

## 🎨 Tech Stack

- **HTML5** — Struktur halaman
- **Tailwind CSS** (via CDN) — Utility classes
- **Vanilla JavaScript** — Logika aplikasi
- **localStorage** — Penyimpanan data
- **Google Fonts** — Syne (display) + Space Mono (mono)

---

## 📸 Preview

```
╔════════════════════════════════════════╗
║  // system active                      ║
║  GRIND MODE        Rabu, 28 Mei 2025  ║
║  Daily Habit Tracker                   ║
║  ████████████████░░░░  75%  🔥 3 DAYS ║
╠════════════════════════════════════════╣
║  TODAY'S HABITS        TODAY'S SCORE  ║
║  ✓ 🧠 No PMO                          ║
║  ✓ 🌞 Sunscreen            75%        ║
║  ✓ 💪 Push Up 5x                      ║
║  ✓ 💧 Minum Air        [donut chart]  ║
║  □ 🌙 Tidur Tepat                     ║
║  □ ✨ Skincare         [bar chart]    ║
║  □ 🫧 Cuci Muka                       ║
║  [✅ SAVE TODAY] [⚠ RESET TODAY]      ║
╚════════════════════════════════════════╝
```

---

<div align="center">
  <sub>Built with 🔥 — stay locked in, king 👑</sub>
</div>

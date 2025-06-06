# Tic Tac Toe Online - Panduan Penggunaan

## 🎮 Fitur Baru: Online Multiplayer

Game Tic Tac Toe Anda sekarang sudah dilengkapi dengan fitur **Player vs Player Online** menggunakan sistem room/kode ruangan!

## 📋 Mode Game yang Tersedia:

1. **Player vs Player (Local)** - Game lokal di satu perangkat
2. **Player vs Player (Online)** - Game online dengan teman menggunakan kode room
3. **Player vs Computer** - Melawan AI dengan 3 tingkat kesulitan

## 🌐 Cara Menggunakan Mode Online:

### Untuk Membuat Room (Host):
1. Pilih "Player vs Player (Online)" di menu utama
2. Pilih "Create Room"
3. Masukkan nama Anda
4. Klik "Create Room"
5. Bagikan kode room (6 karakter) kepada teman Anda
6. Tunggu teman bergabung
7. Klik "Ready to Play" ketika siap
8. Game dimulai ketika kedua pemain sudah ready!

### Untuk Bergabung Room (Guest):
1. Pilih "Player vs Player (Online)" di menu utama
2. Pilih "Join Room"
3. Masukkan nama Anda
4. Masukkan kode room yang diberikan teman
5. Klik "Join Room"
6. Klik "Ready to Play" ketika siap
7. Game dimulai ketika kedua pemain sudah ready!

## 🔧 Versi yang Sedang Berjalan:

**Demo Version** - Menggunakan localStorage untuk simulasi
- ✅ Berfungsi langsung tanpa server
- ✅ Cocok untuk testing di perangkat yang sama
- ⚠️ Hanya bekerja di tab browser yang sama

## 🚀 Upgrade ke Server Version (Opsional):

Untuk pengalaman online yang sesungguhnya, Anda bisa menggunakan versi server:

### Prerequisites:
- Node.js sudah terinstall
- npm tersedia di PATH sistem

### Langkah-langkah:
1. Buka terminal/command prompt
2. Navigasi ke folder TicTacToe:
   ```bash
   cd "d:\My Porto\TicTacToe"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Jalankan server:
   ```bash
   npm start
   ```

5. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

6. Edit file `index.html`, uncomment baris socket.io dan comment baris online-demo.js:
   ```html
   <script src="/socket.io/socket.io.js"></script>
   <!-- <script src="online-demo.js"></script> -->
   ```

### Keuntungan Server Version:
- ✅ Real-time communication
- ✅ Bisa dimainkan dari perangkat berbeda
- ✅ Bisa diakses dari internet (jika di-deploy)
- ✅ Lebih stabil dan responsive

## 🎯 Tips Bermain:

1. **Kode Room** terdiri dari 6 karakter (huruf dan angka)
2. Gunakan tombol **"Copy"** untuk menyalin kode room
3. Kedua pemain harus klik **"Ready"** sebelum game dimulai
4. Player X selalu jalan duluan
5. Gunakan tombol **"Play Again"** untuk main lagi di room yang sama

## 🛠️ Troubleshooting:

### Demo Version:
- Pastikan kedua tab/window browser berada di domain yang sama
- Clear localStorage jika ada masalah: `localStorage.clear()`

### Server Version:
- Pastikan port 3000 tidak digunakan aplikasi lain
- Restart server jika ada masalah koneksi
- Check console browser untuk error messages

## 📱 Kompatibilitas:

- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ Tablet
- ⚠️ Demo version butuh localStorage support

Selamat bermain! 🎉

# 🚀 Deploy ke Railway.app - Panduan Lengkap

## 🎯 Mengapa Railway?

✅ **Gratis** sampai 500 jam/bulan  
✅ **Paling mudah** untuk Socket.IO apps  
✅ **Auto-deploy** dari GitHub  
✅ **HTTPS** otomatis  
✅ **Custom domain** gratis  

## 📋 Step-by-step Deployment

### 1. Persiapan Code

Pastikan file `package.json` sudah benar:

```json
{
  "name": "tictactoe-online",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
```

### 2. Create GitHub Repository

```bash
# Di folder TicTacToe
git init
git add .
git commit -m "Initial commit - TicTacToe Online"

# Push ke GitHub (buat repo baru di github.com dulu)
git remote add origin https://github.com/USERNAME/tictactoe-online.git
git branch -M main
git push -u origin main
```

### 3. Deploy di Railway

1. **Buka:** https://railway.app
2. **Login** dengan GitHub
3. **Click:** "New Project" 
4. **Pilih:** "Deploy from GitHub repo"
5. **Select:** repo TicTacToe Anda
6. **Click:** Deploy

**SELESAI!** Railway auto-detect Node.js dan deploy otomatis.

### 4. Akses Game Online

Setelah deploy selesai (2-3 menit):
- Dapat URL seperti: `https://tictactoe-online-production.up.railway.app`
- Share URL ini ke teman untuk main online!

## 🎮 Alternative Options

### 2nd Choice: **Render.com**
- Free tier: 750 jam/bulan
- Setup serupa dengan Railway
- Sedikit lebih lambat cold start

### 3rd Choice: **Vercel** (Perlu config khusus)
- Excellent untuk frontend
- Butuh serverless function setup untuk Socket.IO

### 4th Choice: **Heroku** (Paid only)
- Industry standard
- Tapi sekarang tidak ada free tier

## 💡 Pro Tips

### Custom Domain (Optional):
1. Beli domain di Namecheap/GoDaddy
2. Add CNAME record di Railway dashboard
3. Game bisa diakses di domain sendiri!

### Environment Variables:
Railway auto-set PORT variable, jadi server.js sudah compatible.

### Auto-Deploy:
Setiap git push ke main branch = auto deploy baru!

## 🔧 Troubleshooting

### Jika Deploy Gagal:
1. Check build logs di Railway dashboard
2. Pastikan `npm start` works di local
3. Verify package.json scripts

### Jika Socket.IO Error:
Railway support WebSocket by default, jadi harusnya tidak ada masalah.

## 💰 Costs

**Railway Free Tier:**
- 500 jam/bulan (cukup untuk hobby project)
- $5/bulan untuk unlimited usage
- Sangat reasonable untuk project serius

**Estimated Usage:**
- Game online biasanya < 100 jam/bulan
- Perfect untuk testing dan sharing dengan teman

## 🎊 Result

Setelah deploy, Anda akan punya:

✅ **URL public** yang bisa diakses siapa saja  
✅ **HTTPS** secure connection  
✅ **Auto-deploy** setiap update code  
✅ **Professional hosting** dengan uptime bagus  

**Perfect untuk portfolio dan sharing dengan teman!**

---

*Deploy time: ~5 menit | Cost: FREE | Professional grade: ✅*

# 🔐 GitHub Authentication Guide

## Method 1: Git Credential Manager (Already Configured)

Git Credential Manager sudah diset. Saat `git push`, akan muncul dialog untuk login GitHub.

## Method 2: Personal Access Token (Manual)

### Step 1: Generate Token
1. **Buka**: https://github.com/settings/tokens
2. **Click**: "Generate new token" → "Generate new token (classic)"
3. **Note**: "TicTacToe Project"
4. **Expiration**: 90 days (atau No expiration)
5. **Select scopes**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. **Click**: "Generate token"
7. **COPY TOKEN** (tidak akan ditampilkan lagi!)

### Step 2: Use Token as Password
```bash
git push origin main
# Username: Imronrsya
# Password: [PASTE_YOUR_TOKEN_HERE]
```

## Method 3: GitHub CLI (Advanced)

```bash
# Install GitHub CLI first
winget install GitHub.cli

# Then authenticate
gh auth login
```

## Method 4: SSH Keys (Most Secure)

### Generate SSH Key:
```bash
ssh-keygen -t ed25519 -C "imronrsya@gmail.com"
```

### Add to GitHub:
1. Copy public key: `cat ~/.ssh/id_ed25519.pub`
2. Add to GitHub: https://github.com/settings/keys
3. Change remote URL:
```bash
git remote set-url origin git@github.com:Imronrsya/TicTacToe.git
```

## Troubleshooting

### Error: "remote: Support for password authentication was removed"
- GitHub tidak lagi accept password biasa
- Harus gunakan Personal Access Token atau SSH

### Error: "Authentication failed"
- Token salah atau expired
- Generate token baru

### Error: "Permission denied"
- Username salah
- Token tidak punya permission yang cukup

## Quick Fix Commands

```bash
# Clear saved credentials
git config --global --unset credential.helper

# Set credential manager
git config --global credential.helper manager-core

# Force re-authentication
git push origin main
```

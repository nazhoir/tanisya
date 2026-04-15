/auth/login → Credentials (email/username + password)
/auth/login/otp → Kirim OTP ke email
/auth/login/otp/verify → Verifikasi kode OTP
/auth/login/magic-link → Magic link
/auth/login/2fa → TOTP (app autentikator)
/auth/login/2fa/email → OTP via email (2FA)
/auth/login/2fa/backup → Kode cadangan

app/auth/login/
├── layout.tsx          ← Hero panel kiri + wrapper card (shared)
├── page.tsx            ← Login credentials (email/username + password)
├── otp/
│   ├── page.tsx        ← Kirim kode OTP ke email
│   └── verify/
│       └── page.tsx    ← Masukkan kode OTP
├── magic-link/
│   └── page.tsx        ← Kirim magic link
└── 2fa/
    ├── page.tsx        ← Verifikasi TOTP (app autentikator)
    ├── email/
    │   └── page.tsx    ← Verifikasi OTP via email (2FA)
    └── backup/
        └── page.tsx    ← Kode cadangan

stores/
└── otp-store.ts        ← Zustand store untuk pendingEmail
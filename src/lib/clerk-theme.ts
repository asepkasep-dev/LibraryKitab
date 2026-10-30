/**
 * Tema Clerk agar formulir masuk/daftar menyatu dengan desain dark premium
 * Bab 4 (navy, emas, teal) tanpa memakai CSS global Clerk yang aslinya terang.
 */
export const temaClerk = {
  variables: {
    colorPrimary: "#c8a04a",
    colorText: "#eaf0f6",
    colorTextSecondary: "#a9b6c8",
    colorBackground: "#0d1728",
    colorInputBackground: "#122036",
    colorInputText: "#eaf0f6",
    colorTextOnPrimaryBackground: "#0b1220",
    colorDanger: "#f87171",
    colorSuccess: "#34d399",
    colorWarning: "#c8a04a",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-jakarta), sans-serif",
    fontSizeSmall: "0.75rem",
    spacingUnit: "0.25rem",
  },
  elements: {
    card: "bg-transparent shadow-none border border-white/10 backdrop-blur-xl",
    footer: "hidden",
    formPage: "bg-transparent",
    headerTitle: "font-semibold text-[1.05rem] text-[#eaf0f6]",
    headerSubtitle: "text-sm text-[#a9b6c8]",
    socialButtonsBlockButton:
      "border border-white/15 bg-white/5 text-[#eaf0f6] hover:bg-white/10",
    socialButtonsBlockButtonText: "text-[#eaf0f6]",
    socialButtonsIcon: "fill-none stroke-[#eaf0f6]",
    formButtonPrimary:
      "bg-[#c8a04a] text-[#0b1220] hover:bg-[#d8b462] shadow-none font-semibold",
    formFieldInput:
      "bg-[#122036] border border-white/15 text-[#eaf0f6] placeholder:text-[#7f8ea3] focus:border-[#c8a04a]",
    formFieldLabel: "text-[#cbd6e4]",
    formResendCodeLink: "text-[#c8a04a]",
    inputGroupText: "text-[#7f8ea3]",
    alert: "bg-[#122036] border border-white/10 text-[#cbd6e4]",
    alertText: "text-[#cbd6e4] text-sm",
    footerActionLink: "text-[#c8a04a]",
    identityPreviewEditButton: "text-[#c8a04a]",
    lineAfter: "bg-white/10",
    lineBefore: "bg-white/10",
    dividerLine: "bg-white/10",
    backRow: "bg-transparent",
    userAvatarImage: "ring-2 ring-[#c8a04a]/40",
    userPopoverFormattedName: "text-[#eaf0f6]",
    userPopoverUsername: "text-[#a9b6c8]",
    menuList: "bg-[#0d1728]",
    menuItem: "text-[#eaf0f6] hover:bg-white/10",
    menuBadge: "bg-[#c8a04a]/15 text-[#c8a04a]",
    profilePage: "bg-transparent",
    navbar: "bg-[#0d1728] border-r border-white/10",
    navbarMobileMenuButton: "bg-transparent",
    navbarText: "text-[#a9b6c8]",
    accountSecurityPage: "bg-transparent",
    root: "bg-transparent",
  },
  localization: {
    signIn: {
      start: {
        title: "Masuk ke akun Anda",
        subtitle: "Selamat datang kembali di perpustakaan kitab",
        actionText: "Belum punya akun?",
        actionLink: "Daftar gratis",
      },
      password: {
        title: "Masukkan kata sandi",
        subtitle: "Lanjutkan bacaan Anda dari halaman terakhir.",
        actionText: "Tidak menggunakan kata sandi?",
        actionLink: "Gunakan tautan verifikasi email",
      },
      emailCode: {
        title: "Periksa email Anda",
        subtitle: "Masukkan kode 6 digit yang kami kirim.",
      },
      emailLink: {
        title: "Periksa email Anda",
        subtitle: "Klik tautan yang kami kirim untuk masuk.",
      },
      forgotPasswordTitle: "Pemulihan kata sandi",
      signUpLink: "Daftar gratis",
    },
    signUp: {
      start: {
        title: "Buat akun santri atau ustadz",
        subtitle: "Satu email untuk seluruh koleksi kitab.",
        actionText: "Sudah punya akun?",
        actionLink: "Masuk",
      },
      emailAddress: {
        title: "Alamat email Anda",
        subtitle: "Kami memakai email ini untuk mengirim tautan verifikasi.",
      },
      password: {
        title: "Buat kata sandi",
        subtitle: "Minimal 8 karakter, memuat huruf dan angka.",
      },
      emailCode: {
        title: "Verifikasi email",
        subtitle: "Masukkan kode yang dikirim ke email Anda.",
      },
      finishing: {
        title: "Hampir selesai",
        actionButton: "Mulai membaca",
      },
    },
    verification: {
      startDeletion: {
        title: "Hapus data",
      },
    },
    userProfile: {
      title: "Profil",
      subtitle: "Nama, email, dan keamanan akun Anda.",
    },
    formFieldLabel: {
      emailAddress: "Email",
      password: "Kata sandi",
      firstName: "Nama depan",
      lastName: "Nama belakang",
    },
    socialButtonsBlockButton: "Lanjutkan dengan {{ provider_domain }}",
    mobileNumber: {
      title: "Nomor ponsel",
      subtitle: "Masukkan nomor ponsel Anda.",
    },
  },
} as const

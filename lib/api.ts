import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 🔧 MODE DUMMY — dipake sementara selama API Laravel belum kelar.
// Sekarang udah dimatiin karena API Laravel-nya udah jadi & di-deploy.
// Set balik ke true kalau lagi mau develop UI tanpa nyambung ke server.
// ============================================================
const USE_MOCK = false;

// ⚠️ Web-nya di-deploy ke phitagoras.site, jadi app produksi nembak ke situ.
// Kalau lagi develop lokal (php artisan serve) dan mau nyoba dari HP/emulator,
// ganti sementara ke salah satu contoh di bawah lalu balikin lagi pas build final:
// - Expo Go / HP fisik : 'http://192.168.1.5:8000/api'  (IP LAN komputer kamu)
// - Emulator Android    : 'http://10.0.2.2:8000/api'
export const API_BASE_URL = 'https://phitagoras.site/api';

const TOKEN_KEY = 'auth_token';

// Kasih delay dikit biar kerasa kayak nembak jaringan beneran (loading spinner kelihatan)
const fakeDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// Wrapper fetch yang otomatis nempelin token + parse JSON + lempar error yang enak dibaca
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  // Jangan set Content-Type manual kalau body-nya FormData (biarin fetch yang atur boundary-nya)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error(
      'Gagal konek ke server. Pastikan HP & komputer 1 WiFi yang sama, dan API_BASE_URL di lib/api.ts sudah bener.'
    );
  }

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // response bukan JSON (misal server error 500 HTML)
  }

  if (!response.ok) {
    const message = json?.message || `Terjadi kesalahan (${response.status})`;
    const error: any = new Error(message);
    error.status = response.status;
    error.errors = json?.errors;
    throw error;
  }

  return json;
}

// ---------------- TIPE DATA ----------------

export type RiwayatPembayaran = {
  id: number;
  jumlah_bayar: number;
  tanggal_bayar: string;
  metode: string;
  bukti_bayar: string | null;
};

export type Tagihan = {
  id: number;
  pendaftaran_id: number;
  nama_program: string;
  tipe_kelas: string | null;
  jumlah: number;
  total_dibayar: number;
  sisa_tagihan: number;
  jatuh_tempo: string;
  status: 'lunas' | 'belum_lunas' | 'cicilan';
  riwayat_pembayaran: RiwayatPembayaran[];
};

// ---------------- DATA DUMMY ----------------

const MOCK_USER = {
  id: 1,
  name: 'Yosua Ranantama',
  email: 'yosua@example.com',
  nomor_hp: '081234567890',
  alamat: 'Tangerang Selatan, Banten',
};

const MOCK_TAGIHAN: Tagihan[] = [
  {
    id: 1,
    pendaftaran_id: 1,
    nama_program: 'Kursus Web Programming',
    tipe_kelas: 'Reguler',
    jumlah: 2500000,
    total_dibayar: 1000000,
    sisa_tagihan: 1500000,
    jatuh_tempo: '2026-08-15',
    status: 'cicilan',
    riwayat_pembayaran: [
      { id: 1, jumlah_bayar: 1000000, tanggal_bayar: '2026-07-01', metode: 'Transfer Bank', bukti_bayar: null },
    ],
  },
  {
    id: 2,
    pendaftaran_id: 1,
    nama_program: 'Kursus Desain Grafis',
    tipe_kelas: 'Privat',
    jumlah: 1800000,
    total_dibayar: 1800000,
    sisa_tagihan: 0,
    jatuh_tempo: '2026-06-01',
    status: 'lunas',
    riwayat_pembayaran: [
      { id: 2, jumlah_bayar: 1800000, tanggal_bayar: '2026-05-20', metode: 'QRIS', bukti_bayar: null },
    ],
  },
];

// ---------------- AUTH ----------------

export async function login(email: string, password: string) {
  if (USE_MOCK) {
    await fakeDelay();
    if (!email || !password) {
      throw new Error('Email atau password salah.');
    }
    const token = 'mock-token-' + Date.now();
    await setToken(token);
    return { token, user: MOCK_USER };
  }

  const json = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // ⚠️ FIX: backend Laravel-nya balikin token di LEVEL ATAS (json.token),
  // BUKAN di json.data.token. Dan json.data isinya cuma object user
  // {id, nama_lengkap, email, nomor_telepon} — bukan {token, user}.
  // Sebelumnya token gak pernah kesimpen gara-gara ngecek path yang salah.
  const token = json?.token;
  if (token) {
    await setToken(token);
  }

  const user = {
    id: json?.data?.id,
    name: json?.data?.nama_lengkap,
    email: json?.data?.email,
    nomor_hp: json?.data?.nomor_telepon,
    alamat: json?.data?.alamat,
  };

  return { token, user };
}

export async function logout() {
  if (USE_MOCK) {
    await fakeDelay(200);
    await clearToken();
    return;
  }

  try {
    await apiFetch('/logout', { method: 'POST' });
  } catch {
    // biarpun gagal (misal token udah expired), tetep hapus token lokal
  }
  await clearToken();
}

export async function getMe() {
  if (USE_MOCK) {
    await fakeDelay(200);
    return MOCK_USER;
  }

  const json = await apiFetch('/me');
  // Samain nama field-nya kayak login() (name, nomor_hp) biar konsisten
  // dipake di seluruh app, walau backend-nya pakai nama_lengkap/nomor_telepon.
  return {
    id: json.data.id,
    name: json.data.nama_lengkap,
    email: json.data.email,
    nomor_hp: json.data.nomor_telepon,
  };
}

// ---------------- JADWAL ----------------

export type JadwalHari = {
  hari: string;
  pelajaran: { jam: string; mapel: string; ruang: string }[];
};

export async function getJadwal(): Promise<JadwalHari[]> {
  if (USE_MOCK) {
    await fakeDelay();
    return [];
  }

  // ⚠️ FIX: endpoint-nya /siswa/jadwal, bukan /jadwal (404 kalau tetep /jadwal).
  // Balikannya juga array FLAT per baris jadwal:
  // [{hari, jam_mulai, jam_selesai, ruangan, program}, ...]
  // — bukan udah dikelompokin per hari. Jadi di-grouping manual di sini
  // biar JadwalScreen (yang expect {hari, pelajaran:[{jam,mapel,ruang}]}) gak perlu diubah.
  const json = await apiFetch('/siswa/jadwal');
  const rows: {
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    program: string;
  }[] = json.data;

  const grouped: Record<string, JadwalHari['pelajaran']> = {};
  for (const row of rows) {
    if (!grouped[row.hari]) grouped[row.hari] = [];
    grouped[row.hari].push({
      jam: `${row.jam_mulai} - ${row.jam_selesai}`,
      mapel: row.program,
      ruang: row.ruangan,
    });
  }

  return Object.entries(grouped).map(([hari, pelajaran]) => ({ hari, pelajaran }));
}

// ---------------- TAGIHAN & ANGSURAN ----------------

export async function getTagihan(): Promise<Tagihan[]> {
  if (USE_MOCK) {
    await fakeDelay();
    return MOCK_TAGIHAN;
  }

  const json = await apiFetch('/tagihan');
  return json.data;
}

// imageUri = uri hasil dari expo-image-picker (bukti transfer/cicilan)
export async function bayarTagihan(
  tagihanId: number,
  jumlahBayar: number,
  metode: string,
  imageUri: string
) {
  if (USE_MOCK) {
    await fakeDelay();
    const tagihan = MOCK_TAGIHAN.find((t) => t.id === tagihanId);
    if (tagihan) {
      tagihan.total_dibayar += jumlahBayar;
      tagihan.sisa_tagihan = Math.max(0, tagihan.sisa_tagihan - jumlahBayar);
      tagihan.status = tagihan.sisa_tagihan === 0 ? 'lunas' : 'cicilan';
      tagihan.riwayat_pembayaran.push({
        id: Date.now(),
        jumlah_bayar: jumlahBayar,
        tanggal_bayar: new Date().toISOString(),
        metode,
        bukti_bayar: imageUri,
      });
    }
    return tagihan;
  }

  const filename = imageUri.split('/').pop() || `bukti_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  const mime = ext === 'png' ? 'image/png' : ext === 'pdf' ? 'application/pdf' : 'image/jpeg';

  const formData = new FormData();
  formData.append('jumlah_bayar', String(jumlahBayar));
  formData.append('metode', metode);
  // @ts-ignore - React Native FormData file object
  formData.append('bukti_bayar', { uri: imageUri, name: filename, type: mime });

  const json = await apiFetch(`/tagihan/${tagihanId}/bayar`, {
    method: 'POST',
    body: formData,
  });
  return json.data;
}

// ---------------- REGISTER (belum ada layarnya di mobile, tinggal dipasang) ----------------

export async function register(
  namaLengkap: string,
  email: string,
  nomorTelepon: string,
  password: string,
  passwordConfirmation: string
) {
  const json = await apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify({
      nama_lengkap: namaLengkap,
      email,
      nomor_telepon: nomorTelepon,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  // Backend langsung ngirim token pas register (auto-login), tapi tetep
  // wajib verifikasi email dulu sebelum bisa /login lagi nantinya.
  if (json?.token) {
    await setToken(json.token);
  }

  return {
    token: json?.token,
    message: json?.message,
    user: {
      id: json?.data?.id,
      name: json?.data?.nama_lengkap,
      email: json?.data?.email,
      nomor_hp: json?.data?.nomor_telepon,
    },
  };
}

// ---------------- PROFIL (buat ganti tombol "Edit Foto" placeholder jadi form beneran) ----------------

export async function getProfile() {
  const json = await apiFetch('/profile');
  return {
    id: json.data.id,
    name: json.data.nama_lengkap,
    email: json.data.email,
    nomor_hp: json.data.nomor_telepon,
  };
}

export async function updateProfile(namaLengkap: string, nomorTelepon: string) {
  const json = await apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify({ nama_lengkap: namaLengkap, nomor_telepon: nomorTelepon }),
  });
  return {
    name: json.data.nama_lengkap,
    nomor_hp: json.data.nomor_telepon,
  };
}

export async function gantiPassword(
  passwordLama: string,
  passwordBaru: string,
  passwordBaruConfirmation: string
) {
  const json = await apiFetch('/ganti-password', {
    method: 'PUT',
    body: JSON.stringify({
      password_lama: passwordLama,
      password_baru: passwordBaru,
      password_baru_confirmation: passwordBaruConfirmation,
    }),
  });
  // Backend nge-revoke semua token pas ganti password berhasil, jadi
  // token lokal juga wajib dihapus biar user diminta login ulang.
  await clearToken();
  return json.message as string;
}

// ---------------- ABSENSI (rekap kehadiran, bisa dipasang di layar baru/tab profil) ----------------

export type RekapAbsensi = {
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  detail: { tanggal: string; status: string }[];
};

export async function getAbsensi(): Promise<RekapAbsensi> {
  const json = await apiFetch('/siswa/absensi');
  return json.data;
}

// ---------------- INFO KURSUS & FOTO KEGIATAN (publik, gak wajib login) ----------------

export type InfoKursus = {
  nama_tempat: string;
  alamat: string;
  nomor_telepon: string;
  jam_operasional: string;
  hero_judul: string;
  hero_deskripsi: string;
};

export async function getInfoKursus(): Promise<InfoKursus> {
  const json = await apiFetch('/info-kursus');
  return json.data;
}

export type FotoKegiatan = {
  id: number;
  judul: string;
  keterangan: string | null;
  url: string;
  urutan: number;
  aktif: boolean;
};

export async function getFotoKegiatan(): Promise<FotoKegiatan[]> {
  const json = await apiFetch('/foto-kegiatan');
  return json.data;
}

// ---------------- PROGRAM KURSUS (publik — buat layar "Daftar Program" kalau mau ditambahin) ----------------

export async function getProgramKursus() {
  const json = await apiFetch('/program-kursus');
  return json.data;
}

// ---------------- LUPA PASSWORD ----------------

export async function forgotPassword(email: string) {
  const json = await apiFetch('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return json;
}

export async function verifyOtp(email: string, otp: string) {
  const json = await apiFetch('/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  return json;
}

export async function resetPassword(email: string, otp: string, password: string) {
  const json = await apiFetch('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token: otp, password, password_confirmation: password }),
  });
  return json;
}
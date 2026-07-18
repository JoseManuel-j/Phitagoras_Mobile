import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 🔧 MODE DUMMY — dipake sementara selama API Laravel belum kelar.
// Set false lagi kalau API temen lu udah jadi & udah dites lewat Postman.
// ============================================================
const USE_MOCK = true;

// ⚠️ GANTI INI sesuai alamat IP komputer kamu yang menjalankan `php artisan serve`.
// - Kalau test di Expo Go / HP fisik: pakai IP LAN komputer, contoh 'http://192.168.1.5:8000/api'
//   (cek pakai `ipconfig` di Windows atau `ifconfig`/`ip addr` di Mac/Linux)
// - Kalau test di emulator Android Studio: pakai 'http://10.0.2.2:8000/api'
// - JANGAN pakai 'localhost' atau '127.0.0.1', itu nunjuk ke HP-nya sendiri, bukan komputer kamu.
export const API_BASE_URL = 'http://192.168.1.3:8000/api';

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
  if (json?.data?.token) {
    await setToken(json.data.token);
  }
  return json.data; // { token, user }
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
  return json.data;
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
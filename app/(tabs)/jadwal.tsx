import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// INI IMPORT BARUNYA CUK
import { SafeAreaView } from 'react-native-safe-area-context';

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

// Data dummy — ganti dengan API Laravel nanti
const DUMMY_JADWAL = [
  {
    hari: 'Senin',
    pelajaran: [
      { jam: '07.00 - 08.30', mapel: 'Matematika', guru: 'Bp. Andi', ruang: 'R.101', warna: '#3b82f6' },
      { jam: '08.30 - 10.00', mapel: 'Bahasa Indonesia', guru: 'Bu Sari', ruang: 'R.101', warna: '#8b5cf6' },
      { jam: '10.15 - 11.45', mapel: 'IPA', guru: 'Bu Dewi', ruang: 'Lab IPA', warna: '#10b981' },
    ],
  },
  {
    hari: 'Selasa',
    pelajaran: [
      { jam: '07.00 - 08.30', mapel: 'Bahasa Inggris', guru: 'Bu Rina', ruang: 'R.102', warna: '#f59e0b' },
      { jam: '08.30 - 10.00', mapel: 'Sejarah', guru: 'Bp. Budi', ruang: 'R.102', warna: '#ef4444' },
      { jam: '10.15 - 11.45', mapel: 'Seni Budaya', guru: 'Bu Laras', ruang: 'R.Seni', warna: '#ec4899' },
    ],
  },
  {
    hari: 'Rabu',
    pelajaran: [
      { jam: '07.00 - 08.30', mapel: 'Matematika', guru: 'Bp. Andi', ruang: 'R.101', warna: '#3b82f6' },
      { jam: '08.30 - 10.00', mapel: 'IPS', guru: 'Bp. Hendra', ruang: 'R.103', warna: '#14b8a6' },
    ],
  },
  {
    hari: 'Kamis',
    pelajaran: [
      { jam: '07.00 - 08.30', mapel: 'Fisika', guru: 'Bp. Yusuf', ruang: 'Lab Fisika', warna: '#6366f1' },
      { jam: '08.30 - 10.00', mapel: 'Kimia', guru: 'Bu Nana', ruang: 'Lab Kimia', warna: '#84cc16' },
      { jam: '10.15 - 11.45', mapel: 'Bahasa Inggris', guru: 'Bu Rina', ruang: 'R.102', warna: '#f59e0b' },
    ],
  },
  {
    hari: 'Jumat',
    pelajaran: [
      { jam: '07.00 - 08.00', mapel: 'Penjaskes', guru: 'Bp. Toni', ruang: 'Lapangan', warna: '#f97316' },
      { jam: '08.00 - 09.30', mapel: 'Agama', guru: 'Bp. Rizal', ruang: 'R.104', warna: '#a78bfa' },
    ],
  },
];

export default function JadwalScreen() {
  const [jadwal, setJadwal] = useState(DUMMY_JADWAL);
  const [hariAktif, setHariAktif] = useState('Senin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set hari aktif sesuai hari ini
    const hariIni = new Date().getDay(); // 0=Minggu, 1=Senin, dst
    if (hariIni >= 1 && hariIni <= 5) {
      setHariAktif(HARI[hariIni - 1]);
    }
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      // Ganti dengan API Laravel kamu nanti
      // const response = await fetch('https://phitagoras.site/api/jadwal', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setJadwal(data);
    } catch (e) {
      // pakai data dummy
    } finally {
      setLoading(false);
    }
  };

  const jadwalHariIni = jadwal.find(j => j.hari === hariAktif);

  return (
    // INI YANG DIGANTI JADI SafeAreaView
    <SafeAreaView style={styles.container}>

      {/* Tab Hari */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {HARI.map(hari => (
          <TouchableOpacity
            key={hari}
            style={[styles.tabBtn, hariAktif === hari && styles.tabBtnActive]}
            onPress={() => setHariAktif(hari)}
          >
            <Text style={[styles.tabText, hariAktif === hari && styles.tabTextActive]}>
              {hari}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Konten Jadwal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView style={styles.jadwalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.hariTitle}>{hariAktif}</Text>

          {jadwalHariIni && jadwalHariIni.pelajaran.length > 0 ? (
            jadwalHariIni.pelajaran.map((item, index) => (
              <View key={index} style={styles.jadwalCard}>
                {/* Garis warna kiri */}
                <View style={[styles.colorBar, { backgroundColor: item.warna }]} />

                <View style={styles.jadwalContent}>
                  <View style={styles.jadwalHeader}>
                    <Text style={styles.mapelText}>{item.mapel}</Text>
                    <View style={[styles.ruangBadge, { backgroundColor: item.warna + '22' }]}>
                      <Text style={[styles.ruangText, { color: item.warna }]}>📍 {item.ruang}</Text>
                    </View>
                  </View>
                  <Text style={styles.guruText}>👤 {item.guru}</Text>
                  <View style={styles.jamRow}>
                    <Text style={styles.jamText}>🕐 {item.jam}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>Tidak ada jadwal hari ini!</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  tabScroll: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  jadwalScroll: {
    flex: 1,
    padding: 20,
  },
  hariTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  jadwalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  colorBar: {
    width: 5,
  },
  jadwalContent: {
    flex: 1,
    padding: 16,
  },
  jadwalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    flex: 1,
  },
  ruangBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ruangText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guruText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },
  jamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jamText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#64748b' },
});
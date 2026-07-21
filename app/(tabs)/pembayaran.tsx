import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemeContext } from '../../components/ThemeContext';
import { bayarTagihan, getTagihan, Tagihan } from '../../lib/api';

function formatRupiah(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function formatTanggal(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

const METODE_OPTIONS = ['Transfer Bank', 'QRIS', 'Tunai'];

export default function PembayaranScreen() {
  const { isDarkMode } = useContext(ThemeContext);

  const bgColor = isDarkMode ? '#12121A' : '#F5F7FA';
  const textColor = isDarkMode ? '#FFFFFF' : '#2D3748';
  const subTextColor = isDarkMode ? '#A0AEC0' : '#718096';
  const cardColor = isDarkMode ? '#1E1E2D' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2D3748' : '#E2E8F0';

  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // state buat modal bayar cicilan
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [metode, setMetode] = useState(METODE_OPTIONS[0]);
  const [buktiUri, setBuktiUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setErrorMsg('');
      const data = await getTagihan();
      setTagihanList(data);
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal mengambil data tagihan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const openBayarModal = (tagihan: Tagihan) => {
    setSelectedTagihan(tagihan);
    setJumlahBayar(String(Math.round(tagihan.sisa_tagihan)));
    setMetode(METODE_OPTIONS[0]);
    setBuktiUri(null);
    setModalVisible(true);
  };

  const pilihBukti = async () => {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      Alert.alert('Izin Ditolak', 'Aplikasi butuh izin akses galeri buat upload bukti bayar.');
      return;
    }
    const hasil = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!hasil.canceled && hasil.assets?.[0]) {
      setBuktiUri(hasil.assets[0].uri);
    }
  };

  const submitBayar = async () => {
    if (!selectedTagihan) return;
    const jumlah = Number(jumlahBayar.replace(/[^0-9]/g, ''));
    if (!jumlah || jumlah <= 0) {
      Alert.alert('Gagal', 'Jumlah bayar harus diisi dengan angka lebih dari 0.');
      return;
    }
    if (jumlah > selectedTagihan.sisa_tagihan) {
      Alert.alert('Gagal', `Jumlah bayar nggak boleh lebih dari sisa tagihan (${formatRupiah(selectedTagihan.sisa_tagihan)}).`);
      return;
    }
    if (!buktiUri && metode !== 'Tunai') {
      Alert.alert('Gagal', 'Upload dulu bukti transfer/pembayarannya ya.');
      return;
    }

    setSubmitting(true);
    try {
      await bayarTagihan(selectedTagihan.id, jumlah, metode, buktiUri);
      setSubmitting(false);
      setModalVisible(false);
      Alert.alert('Berhasil', 'Pembayaran berhasil dikirim, menunggu konfirmasi admin.');
      load();
    } catch (e: any) {
      setSubmitting(false);
      Alert.alert('Gagal', e.message || 'Pembayaran gagal dikirim.');
    }
  };

  const badgeStyle = (status: Tagihan['status']) => {
    if (status === 'verifikasi' || status === 'pending') return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', label: 'Verifikasi Admin' };
    if (status === 'lunas') return { bg: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', label: 'Lunas' };
    if (status === 'cicilan') return { bg: 'rgba(245, 166, 35, 0.2)', color: '#F5A623', label: 'Cicilan Aktif' };
    return { bg: 'rgba(229, 62, 62, 0.2)', color: '#E53E3E', label: 'Belum Bayar' };
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={{ color: subTextColor, marginTop: 12 }}>Memuat tagihan...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F8EF7" />}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Riwayat Tagihan</Text>
      </View>

      {!!errorMsg && (
        <View style={[styles.card, { backgroundColor: cardColor, borderColor: '#E53E3E' }]}>
          <Text style={{ color: '#E53E3E' }}>{errorMsg}</Text>
        </View>
      )}

      {!errorMsg && tagihanList.length === 0 && (
        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <Text style={{ color: subTextColor, textAlign: 'center' }}>Belum ada tagihan.</Text>
        </View>
      )}

      {tagihanList.map((tagihan) => {
        const badge = badgeStyle(tagihan.status);
        return (
          <View key={tagihan.id} style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.programName, { color: textColor }]}>{tagihan.nama_program}</Text>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
            </View>
            <Text style={[styles.tipeProgram, { color: subTextColor }]}>
              Total Tagihan: {formatRupiah(tagihan.jumlah)}
            </Text>
            <Text style={styles.price}>{formatRupiah(tagihan.sisa_tagihan)}</Text>
            <Text style={[styles.subLabel, { color: subTextColor }]}>Sisa yang harus dibayar</Text>

            {tagihan.status === 'lunas' ? (
              <View style={styles.lunasBox}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.lunasText}>Pembayaran berhasil dikonfirmasi</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.jatuhTempo, { marginTop: 8 }]}>
                  Jatuh Tempo: {formatTanggal(tagihan.jatuh_tempo)}
                </Text>
                <TouchableOpacity style={styles.payButton} onPress={() => openBayarModal(tagihan)}>
                  <Text style={styles.payButtonText}>Bayar / Cicil Sekarang</Text>
                </TouchableOpacity>
              </>
            )}

            {tagihan.riwayat_pembayaran.length > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={[styles.riwayatTitle, { color: subTextColor }]}>Riwayat Cicilan</Text>
                {tagihan.riwayat_pembayaran.map((p) => (
                  <View key={p.id} style={styles.cicilanRow}>
                    <Text style={[styles.cicilanInfo, { color: subTextColor }]}>
                      {formatTanggal(p.tanggal_bayar)} · {p.metode}
                    </Text>
                    <Text style={styles.textSukses}>{formatRupiah(p.jumlah_bayar)} ✅</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        );
      })}

      <View style={{ height: 40 }} />

      {/* MODAL BAYAR CICILAN / ANGSURAN */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Upload Bukti - {selectedTagihan?.nama_program}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {selectedTagihan && (
              <Text style={[styles.modalSubtitle, { color: subTextColor }]}>
                Sisa Tagihan: {formatRupiah(selectedTagihan.sisa_tagihan)}
              </Text>
            )}

            {/* 1. PILIH METODE PEMBAYARAN */}
            <Text style={[styles.label, { color: textColor }]}>Pilih Metode Pembayaran</Text>
            <View style={styles.metodeRow}>
              {METODE_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.metodeChip,
                    { borderColor },
                    metode === m && { backgroundColor: '#4F8EF7', borderColor: '#4F8EF7' },
                  ]}
                  onPress={() => setMetode(m)}
                >
                  <Text style={{ color: metode === m ? '#FFF' : textColor, fontSize: 12, fontWeight: '600' }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 2. INFO DINAMIS BERDASARKAN METODE YANG DIPILIH */}
            {metode === 'Transfer Bank' && (
              <View style={[styles.infoBankCard, { backgroundColor: isDarkMode ? '#2D3748' : '#FAFAFA', borderColor }]}>
                <View style={styles.bankDetail}>
                  <Text style={[styles.bankTitle, { color: textColor }]}>Transfer Bank</Text>
                  <Text style={{ color: subTextColor, fontSize: 13, marginTop: 4 }}>Bank BCA</Text>
                  <Text style={[styles.bankRekening, { color: textColor }]}>6090012451</Text>
                  <Text style={{ color: subTextColor, fontSize: 13 }}>A/N LPK Phitagoras</Text>
                </View>
              </View>
            )}

            {metode === 'QRIS' && (
              <View style={[styles.qrisContainer, { borderColor }]}>
                <Text style={{ color: textColor, fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>
                  Scan QRIS di bawah ini:
                </Text>
                <Image 
                  source={require('../../assets/qris-phitagoras.jpeg')} 
                  style={styles.imageQrisLarge} 
                  resizeMode="contain" 
                />
              </View>
            )}

            {metode === 'Tunai' && (
              <View style={[styles.infoBankCard, { backgroundColor: isDarkMode ? '#2D3748' : '#FAFAFA', borderColor, justifyContent: 'center' }]}>
                <Text style={{ color: textColor, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
                  Silakan lakukan pembayaran langsung ke admin/kasir di LPK Phitagoras.
                </Text>
              </View>
            )}

            {/* 3. LOGIKA CONDITIONAL RENDERING (Menunggu Verifikasi / Sisa Rp0) */}
            {selectedTagihan?.status === 'verifikasi' || selectedTagihan?.status === 'pending' || selectedTagihan?.sisa_tagihan === 0 ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>Tidak ada angsuran yang perlu dibayar saat ini.</Text>
              </View>
            ) : (
              /* FORM UPLOAD DAN INPUT JIKA STATUS BELUM LUNAS */
              <>
                <Text style={[styles.label, { color: textColor }]}>Jumlah Bayar (Rp)</Text>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  keyboardType="numeric"
                  value={jumlahBayar}
                  onChangeText={setJumlahBayar}
                  placeholder="500000"
                  placeholderTextColor="#888"
                />

                <Text style={[styles.label, { color: textColor }]}>Foto Bukti Transfer</Text>
                <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={pilihBukti}>
                  {buktiUri ? (
                    <Image source={{ uri: buktiUri }} style={styles.previewImage} />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="cloud-upload-outline" size={28} color={subTextColor} />
                      <Text style={{ color: subTextColor, fontSize: 12, marginTop: 4 }}>Browse... No file selected.</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                  onPress={submitBayar}
                  disabled={submitting}
                >
                  {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Kirim Pembayaran</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  card: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  programName: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, paddingRight: 8 },
  tipeProgram: { fontSize: 13, marginBottom: 4 },
  price: { color: '#4F8EF7', fontSize: 24, fontWeight: 'bold' },
  subLabel: { fontSize: 11, marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  lunasBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: 10, borderRadius: 8, marginTop: 10 },
  lunasText: { color: '#4CAF50', fontSize: 12, marginLeft: 6, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.2)', marginVertical: 12 },
  riwayatTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  cicilanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cicilanInfo: { fontSize: 13 },
  textSukses: { color: '#4CAF50', fontSize: 13, fontWeight: 'bold' },
  jatuhTempo: { color: '#E53E3E', fontSize: 12, fontWeight: 'bold' },
  payButton: { backgroundColor: '#4F8EF7', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  payButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },

  // STYLING TAMBAHAN UNTUK INFO BANK & WARNING
  infoBankCard: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16, marginTop: 10 },
  bankDetail: { flex: 1, justifyContent: 'center' },
  bankTitle: { fontSize: 14, fontWeight: 'bold' },
  bankRekening: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  
  // STYLING BARU UNTUK QRIS RAKSASA
  qrisContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fix background putih buat dark mode
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 10
  },
  imageQrisLarge: { width: 250, height: 250, borderRadius: 8 },

  warningBox: { backgroundColor: '#FEF3C7', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A', marginTop: 10, marginBottom: 10 },
  warningText: { color: '#92400E', textAlign: 'center', fontSize: 13, fontWeight: '600' },
  
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  metodeRow: { flexDirection: 'row', gap: 8 },
  metodeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  uploadBox: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, height: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  submitButton: { backgroundColor: '#4F8EF7', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../components/ThemeContext';

export default function PembayaranScreen() {
  const { isDarkMode } = useContext(ThemeContext);

  const bgColor = isDarkMode ? '#12121A' : '#F5F7FA';
  const textColor = isDarkMode ? '#FFFFFF' : '#2D3748';
  const subTextColor = isDarkMode ? '#A0AEC0' : '#718096';
  const cardColor = isDarkMode ? '#1E1E2D' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2D3748' : '#E2E8F0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Riwayat Tagihan</Text>
      </View>

      {/* CARD 1: PROGRAM SATUAN (LUNAS) */}
      <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.programName, { color: textColor }]}>Ms. Word Master</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
            <Text style={[styles.badgeText, { color: '#4CAF50' }]}>Lunas</Text>
          </View>
        </View>
        <Text style={[styles.tipeProgram, { color: subTextColor }]}>Program Satuan (Tanpa Cicilan)</Text>
        <Text style={styles.price}>Rp 350.000</Text>
        <View style={styles.lunasBox}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.lunasText}>Pembayaran berhasil dikonfirmasi</Text>
        </View>
      </View>

      {/* CARD 2: PROGRAM PAKET (CICILAN) */}
      <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.programName, { color: textColor }]}>Paket Full-Stack Web</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(245, 166, 35, 0.2)' }]}>
            <Text style={[styles.badgeText, { color: '#F5A623' }]}>Cicilan Aktif</Text>
          </View>
        </View>
        <Text style={[styles.tipeProgram, { color: subTextColor }]}>Total Tagihan: Rp 1.500.000</Text>

        <View style={styles.divider} />

        {/* List Riwayat Cicilan */}
        <View style={styles.cicilanRow}>
          <Text style={[styles.cicilanInfo, { color: subTextColor }]}>Cicilan 1 (DP Awal)</Text>
          <Text style={styles.textSukses}>Rp 500.000 ✅</Text>
        </View>

        <View style={[styles.cicilanRowActive, { backgroundColor: isDarkMode ? '#262638' : '#EDF2F7' }]}>
          <View>
            <Text style={[styles.cicilanInfoActive, { color: textColor }]}>Cicilan 2 (Bulan ini)</Text>
            <Text style={styles.jatuhTempo}>Jatuh Tempo: 25 Jun 2026</Text>
          </View>
          <TouchableOpacity style={styles.paySmallButton}>
            <Text style={styles.paySmallButtonText}>Bayar 500rb</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cicilanRow}>
          <Text style={[styles.cicilanInfo, { color: subTextColor }]}>Cicilan 3 (Bulan depan)</Text>
          <Text style={[styles.belumText, { color: subTextColor }]}>Rp 500.000 ❌</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  card: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  programName: { fontSize: 18, fontWeight: 'bold' },
  tipeProgram: { fontSize: 13, marginBottom: 12 },
  price: { color: '#4F8EF7', fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  lunasBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: 10, borderRadius: 8 },
  lunasText: { color: '#4CAF50', fontSize: 12, marginLeft: 6, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.2)', marginVertical: 12 },
  cicilanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cicilanRowActive: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderColor: '#4F8EF7' },
  cicilanInfo: { fontSize: 14 },
  cicilanInfoActive: { fontSize: 14, fontWeight: 'bold' },
  jatuhTempo: { color: '#E53E3E', fontSize: 11, marginTop: 4, fontWeight: 'bold' },
  textSukses: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold' },
  belumText: { fontSize: 14 },
  paySmallButton: { backgroundColor: '#4F8EF7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  paySmallButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
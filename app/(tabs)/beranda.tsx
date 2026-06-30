import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ThemeContext } from '../../components/ThemeContext';

export default function BerandaScreen() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [dataMurid, setDataMurid] = useState({ nama: 'Memuat...', program: '-', email: '-' });

  useEffect(() => {
    const ambilData = async () => {
      const isiFlashdisk = await AsyncStorage.getItem('data_murid');
      if (isiFlashdisk) setDataMurid(JSON.parse(isiFlashdisk));
    };
    ambilData();
  }, []);

  const bgColor = isDarkMode ? '#12121A' : '#F5F7FA';
  const textColor = isDarkMode ? '#FFFFFF' : '#2D3748';
  const subTextColor = isDarkMode ? '#A0AEC0' : '#718096';
  const cardColor = isDarkMode ? '#1E1E2D' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2D3748' : '#E2E8F0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: subTextColor }]}>Selamat Datang,</Text>
          <Text style={[styles.studentName, { color: textColor }]}>{dataMurid.nama}</Text>
        </View>
        <View style={styles.switchRow}>
          <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={isDarkMode ? '#F6E05E' : '#ED8936'} style={{ marginRight: 8 }} />
          <Switch value={isDarkMode} onValueChange={toggleTheme} thumbColor={isDarkMode ? '#4F8EF7' : '#f4f3f4'} />
        </View>
      </View>

      {/* KARTU PESERTA KURSUS BARU */}
      <View style={[styles.idCard, { backgroundColor: cardColor, borderColor: borderColor, borderWidth: 1 }]}>
        <View style={styles.idHeader}>
          <Ionicons name="ribbon" size={24} color="#4F8EF7" />
          <Text style={styles.lpkName}>LPK Phitagoras</Text>
        </View>
        <Text style={[styles.idLabel, { color: subTextColor }]}>Program Kursus</Text>
        <Text style={[styles.idValue, { color: textColor, fontSize: 18, marginBottom: 12 }]}>{dataMurid.program}</Text>
        
        <Text style={[styles.idLabel, { color: subTextColor }]}>Email Terdaftar</Text>
        <Text style={[styles.idValue, { color: textColor }]}>{dataMurid.email}</Text>
      </View>

      {/* PENGUMUMAN */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Pengumuman Terbaru</Text>
      <View style={[styles.announcementCard, { backgroundColor: cardColor, borderColor: borderColor, borderWidth: 1 }]}>
        <View style={styles.announcementHeader}>
          <Ionicons name="megaphone" size={20} color="#E53E3E" />
          <Text style={[styles.announcementDate, { color: subTextColor }]}>Hari ini, 09:00 WIB</Text>
        </View>
        <Text style={[styles.announcementTitle, { color: textColor }]}>Sesi Konsultasi Project KKP</Text>
        <Text style={[styles.announcementText, { color: subTextColor }]}>
          Jangan lupa siapin progress codingan mobile dan web kalian buat bimbingan rutin minggu ini ya cuk.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 24 },
  greeting: { fontSize: 14, marginBottom: 4 },
  studentName: { fontSize: 22, fontWeight: 'bold', textTransform: 'capitalize' },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  idCard: { borderRadius: 16, padding: 20, marginBottom: 28, elevation: 2 },
  idHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  lpkName: { fontSize: 18, fontWeight: 'bold', color: '#4F8EF7', marginLeft: 10 },
  idLabel: { fontSize: 11, marginBottom: 2 },
  idValue: { fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  announcementCard: { padding: 16, borderRadius: 16, marginBottom: 20, elevation: 1 },
  announcementHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  announcementDate: { fontSize: 12, marginLeft: 8 },
  announcementTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  announcementText: { fontSize: 13, lineHeight: 20 },
});
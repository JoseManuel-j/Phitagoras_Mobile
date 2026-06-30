import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../components/ThemeContext';

export default function ProfilScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [dataMurid, setDataMurid] = useState({ nama: '-', email: '-', wa: '-', alamat: '-', program: '-', foto: null });

  useEffect(() => {
    const ambilData = async () => {
      const isiFlashdisk = await AsyncStorage.getItem('data_murid');
      if (isiFlashdisk) setDataMurid(JSON.parse(isiFlashdisk));
    };
    ambilData();
  }, []);

  // FUNGSI PAS MURID KLIK TOMBOL EDIT FOTO
  const pilihFoto = () => {
    Alert.alert(
      "Ubah Foto Profil", 
      "Nanti di sini kita pasang library 'expo-image-picker' biar bisa buka Galeri HP atau Kamera asli pas API temen lu udah kelar cuk!",
      [{ text: "Oke Siap", style: "default" }]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Keluar', 'Yakin mau keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Keluar', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('data_murid');
          router.replace('/login');
        }
      }
    ]);
  };

  const bgColor = isDarkMode ? '#12121A' : '#F5F7FA';
  const textColor = isDarkMode ? '#FFFFFF' : '#2D3748';
  const subTextColor = isDarkMode ? '#A0AEC0' : '#718096';
  const cardColor = isDarkMode ? '#1E1E2D' : '#FFFFFF';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Profil Siswa</Text>
      </View>

      {/* AVATAR DENGAN TOMBOL EDIT FOTO */}
      <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBox}>
            {dataMurid.foto ? (
              <Image source={{ uri: dataMurid.foto }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color="#FFF" />
            )}
          </View>
          {/* Tombol Kamera Kecil */}
          <TouchableOpacity style={styles.editFotoBtn} onPress={pilihFoto}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: textColor }]}>{dataMurid.nama}</Text>
        <Text style={[styles.badge, { color: '#4F8EF7' }]}>Siswa Aktif</Text>
      </View>

      {/* RINCIAN FORM PENDAFTARAN SESUAI PERMINTAAN LU */}
      <Text style={[styles.sectionTitle, { color: subTextColor }]}>DATA FORM PENDAFTARAN</Text>
      <View style={[styles.dataCard, { backgroundColor: cardColor }]}>
        <DataRow label="Program Kursus Yang Diikuti" value={dataMurid.program} textColor={textColor} subTextColor={subTextColor} />
        <DataRow label="Email Siswa" value={dataMurid.email} textColor={textColor} subTextColor={subTextColor} />
        <DataRow label="No. WhatsApp / Kontak" value={dataMurid.wa} textColor={textColor} subTextColor={subTextColor} />
        <DataRow label="Alamat Rumah" value={dataMurid.alamat} textColor={textColor} subTextColor={subTextColor} noBorder />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
        <Text style={styles.logoutText}>Keluar Akun</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const DataRow = ({ label, value, textColor, subTextColor, noBorder = false }: any) => (
  <View style={[styles.dataRow, !noBorder && styles.borderBottom]}>
    <Text style={[styles.dataLabel, { color: subTextColor }]}>{label}</Text>
    <Text style={[styles.dataValue, { color: textColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 16, marginBottom: 24, elevation: 2 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4F8EF7', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  editFotoBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2B6CB0', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E1E2D' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, textTransform: 'capitalize' },
  badge: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  dataCard: { borderRadius: 16, paddingHorizontal: 16, marginBottom: 24, elevation: 1 },
  dataRow: { paddingVertical: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  dataLabel: { fontSize: 12, marginBottom: 4 },
  dataValue: { fontSize: 15, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(229, 62, 62, 0.05)', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E53E3E' },
  logoutText: { color: '#E53E3E', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
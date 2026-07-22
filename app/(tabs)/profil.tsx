import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../components/ThemeContext';
import { logout as apiLogout } from '../../lib/api';

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

  const getImageUrl = (namaFile: string | null) => {
    if (!namaFile || namaFile === '-') return null;
    if (namaFile.startsWith('http')) return namaFile;
    
    // Sesuaikan folder tempat simpan fotonya
    return `https://phitagoras.site/uploads/${namaFile}`; 
  };

  const handleLogout = async () => {
    Alert.alert('Keluar', 'Yakin mau keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Keluar', style: 'destructive',
        onPress: async () => {
          try {
            await apiLogout(); 
          } catch (error) {
            console.log('Backend error pas logout, tapi gas terus!');
          } finally {
            await AsyncStorage.removeItem('data_murid');
            await AsyncStorage.removeItem('auth_token'); 
            router.replace('/login');
          }
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

      {/* AVATAR HANYA MENAMPILKAN FOTO DARI WEB */}
      <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBox}>
            {dataMurid.foto && dataMurid.foto !== '-' ? (
              <Image 
                source={{ uri: getImageUrl(dataMurid.foto) as string }} 
                style={styles.avatarImage} 
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={40} color="#FFF" />
            )}
          </View>
        </View>
        <Text style={[styles.name, { color: textColor }]}>{dataMurid.nama}</Text>
        <Text style={[styles.badge, { color: '#4F8EF7' }]}>Siswa Aktif</Text>
      </View>

      {/* BAGIAN INFORMASI AKUN (Sesuai Web) */}
      <Text style={[styles.sectionTitle, { color: subTextColor }]}>INFORMASI AKUN</Text>
      <View style={[styles.dataCard, { backgroundColor: cardColor }]}>
        <DataRow label="Nama Lengkap" value={dataMurid.nama} textColor={textColor} subTextColor={subTextColor} />
        <DataRow label="Email Address" value={dataMurid.email} textColor={textColor} subTextColor={subTextColor} />
        <DataRow label="Program Kursus" value={dataMurid.program} textColor={textColor} subTextColor={subTextColor} noBorder />
      </View>

      {/* BAGIAN BIODATA PRIBADI (Sesuai Web) */}
      <Text style={[styles.sectionTitle, { color: subTextColor }]}>BIODATA PRIBADI</Text>
      <View style={[styles.dataCard, { backgroundColor: cardColor }]}>
        <DataRow label="Nomor HP" value={dataMurid.wa} textColor={textColor} subTextColor={subTextColor} />
        <DataRow label="Alamat Lengkap" value={dataMurid.alamat} textColor={textColor} subTextColor={subTextColor} noBorder />
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
  avatarContainer: { marginBottom: 12 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4F8EF7', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, textTransform: 'capitalize' },
  badge: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  dataCard: { borderRadius: 16, paddingHorizontal: 16, marginBottom: 24, elevation: 1 },
  dataRow: { paddingVertical: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  dataLabel: { fontSize: 12, marginBottom: 4 },
  dataValue: { fontSize: 15, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(229, 62, 62, 0.05)', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E53E3E' },
  logoutText: { color: '#E53E3E', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
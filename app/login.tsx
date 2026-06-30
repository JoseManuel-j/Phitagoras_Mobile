import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  // 1. CEK MEMORI PAS APLIKASI BARU DIBUKA
  useEffect(() => {
    const cekStatusLogin = async () => {
      try {
        const data = await AsyncStorage.getItem('data_murid');
        if (data !== null) {
          // Kalau ada data di memori, langsung tendang ke Beranda!
          router.replace('/(tabs)/beranda');
        } else {
          setIsCheckingLogin(false);
        }
      } catch (error) {
        setIsCheckingLogin(false);
      }
    };
    cekStatusLogin();
  }, []);

  // 2. FUNGSI KLIK TOMBOL MASUK
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Gagal', 'Email dan Password nggak boleh kosong cuk!');
      return;
    }

    setIsLoading(true);

    // Simulasi nunggu loading dari API Laravel
    setTimeout(async () => {
      try {
        // Kita bikin data JSON pura-pura dapet dari database dengan struktur BARU
        const namaDariEmail = email.split('@')[0]; 
        const dataSiswa = {
          nama: namaDariEmail,
          email: email, // Ambil dari inputan
          wa: "0812-XXXX-XXXX",
          alamat: "Tangerang Selatan, Banten",
          program: "Full-Stack Web Dev",
          foto: null // Nanti buat nyimpen gambar profil
        };

        // Simpen ke dalam flashdisk HP
        await AsyncStorage.setItem('data_murid', JSON.stringify(dataSiswa));
        
        // Pindah ke Beranda
        setIsLoading(false);
        router.replace('/(tabs)/beranda'); 
      } catch (e) {
        setIsLoading(false);
        Alert.alert('Error', 'Gagal nyimpen data ke HP.');
      }
    }, 1500);
  };

  // Layar loading pas lagi ngecek status login awal
  if (isCheckingLogin) {
    return (
      <View style={[styles.container, { alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Mengecek sesi login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>Φ</Text>
        </View>
        <Text style={styles.title}>Phitagoras</Text>
        <Text style={styles.subtitle}>Portal Siswa</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>Selamat Datang</Text>
        <Text style={styles.instructionText}>Masuk dengan email yang terdaftar saat pendaftaran kursus.</Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Masukkan email kamu"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Masukkan password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121A', padding: 20, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoBox: { backgroundColor: '#4F8EF7', width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 4 },
  formContainer: { backgroundColor: '#1E1E2D', padding: 24, borderRadius: 20, elevation: 5 },
  welcomeText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  instructionText: { color: '#A0A0A0', fontSize: 13, marginBottom: 24, lineHeight: 20 },
  label: { color: '#FFF', fontSize: 13, marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121A', borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#2D2D3D' },
  input: { flex: 1, color: '#FFF', paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  eyeIcon: { padding: 12 },
  loginButton: { backgroundColor: '#4F8EF7', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
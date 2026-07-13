import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getTagihan, getToken, login } from '../lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  // 1. CEK APAKAH SUDAH ADA TOKEN TERSIMPAN PAS APLIKASI BARU DIBUKA
  useEffect(() => {
    const cekStatusLogin = async () => {
      try {
        const token = await getToken();
        if (token) {
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

  // 2. FUNGSI KLIK TOMBOL MASUK -> panggil API Laravel beneran
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Gagal', 'Email dan Password nggak boleh kosong cuk!');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await login(email, password);

      // Simpen data siswa buat ditampilin di halaman Profil,
      // dipetain ke nama field yang dipakai profil.tsx
      let namaProgram = '-';
      try {
        const tagihanList = await getTagihan();
        if (tagihanList.length > 0) namaProgram = tagihanList[0].nama_program;
      } catch {
        // gapapa kalau gagal ambil, bukan blocker buat login
      }

      await AsyncStorage.setItem(
        'data_murid',
        JSON.stringify({
          nama: user.name,
          email: user.email,
          wa: user.nomor_hp || '-',
          alamat: user.alamat || '-',
          program: namaProgram,
          foto: null,
        })
      );

      setIsLoading(false);
      router.replace('/(tabs)/beranda');
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Gagal Login', e.message || 'Email atau password salah.');
    }
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

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { forgotPassword, getTagihan, getToken, login, resetPassword, verifyOtp } from '../lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  // STATE LUPA PASSWORD (MULTI-STEP)
  const [isForgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Password Baru
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const closeForgotModal = () => {
    setForgotModalVisible(false);
    setForgotStep(1);
    setResetEmail('');
    setOtpCode('');
    setNewPassword('');
  };

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Gagal', 'Email dan Password nggak boleh kosong cuk!');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await login(email, password);
      let namaProgram = '-';
      try {
        const tagihanList = await getTagihan();
        if (tagihanList.length > 0) namaProgram = tagihanList[0].nama_program;
      } catch {}

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

  const handleResendOtp = async () => {
    setIsForgotLoading(true);
    try {
      const res = await forgotPassword(resetEmail);
      setIsForgotLoading(false);
      Alert.alert('Sukses', res.message || 'Kode OTP baru telah dikirim ke email kamu.');
    } catch (e: any) {
      setIsForgotLoading(false);
      Alert.alert('Gagal', e.message || 'Terjadi kesalahan saat mengirim ulang OTP.');
    }
  };

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
        <Image 
          source={require('../assets/logo/logo-phitagoras.png')}
          style={{ width: 80, height: 80, marginBottom: 12 }} 
          resizeMode="contain"
        />
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

        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => setForgotModalVisible(true)}>
          <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
        </TouchableOpacity>

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

      {/* MODAL LUPA PASSWORD MULTI-STEP */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isForgotModalVisible}
        onRequestClose={closeForgotModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* STEP 1: INPUT EMAIL */}
            {forgotStep === 1 && (
              <>
                <Text style={styles.modalTitle}>Lupa Password</Text>
                <Text style={styles.modalDesc}>
                  Masukkan email terdaftar kamu. Kami akan mengirimkan kode OTP untuk mengatur ulang password.
                </Text>

                <Text style={[styles.labelModal, { color: '#333' }]}>Email Address</Text>
                <View style={[styles.inputContainerModal, { backgroundColor: '#F5F5F5', borderColor: '#DDD' }]}>
                  <TextInput
                    style={[styles.inputModal, { color: '#000' }]}
                    placeholder="Masukkan email Anda"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.verifyButton, isForgotLoading && { opacity: 0.7 }]}
                  disabled={isForgotLoading}
                  onPress={async () => {
                    if (!resetEmail) {
                      Alert.alert('Gagal', 'Email nggak boleh kosong cuk!');
                      return;
                    }
                    setIsForgotLoading(true);
                    try {
                      const res = await forgotPassword(resetEmail);
                      setIsForgotLoading(false);
                      setForgotStep(2);
                    } catch (e: any) {
                      setIsForgotLoading(false);
                      Alert.alert('Gagal', e.message || 'Email tidak terdaftar atau terjadi kesalahan.');
                    }
                  }}
                >
                  {isForgotLoading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.verifyButtonText}>Kirim Kode OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2: INPUT OTP */}
            {forgotStep === 2 && (
              <>
                <Text style={styles.modalTitle}>Verifikasi Kode OTP</Text>
                <Text style={styles.modalDesc}>
                  Kami sudah kirim kode OTP 6 digit ke <Text style={{fontWeight: 'bold'}}>{resetEmail}</Text>. Kode berlaku selama 10 menit.
                </Text>

                <View style={[styles.inputContainerModal, { backgroundColor: '#F5F5F5', borderColor: '#DDD', justifyContent: 'center' }]}>
                  <TextInput
                    style={[styles.inputModal, { color: '#000', textAlign: 'center', fontSize: 20, letterSpacing: 5 }]}
                    placeholder="- - - - - -"
                    placeholderTextColor="#888"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.verifyButton, isForgotLoading && { opacity: 0.7 }]}
                  disabled={isForgotLoading}
                  onPress={async () => {
                    if (otpCode.length < 6) {
                      Alert.alert('Gagal', 'Masukkan 6 digit kode OTP.');
                      return;
                    }
                    setIsForgotLoading(true);
                    try {
                      await verifyOtp(resetEmail, otpCode);
                      setIsForgotLoading(false);
                      setForgotStep(3);
                    } catch (e: any) {
                      setIsForgotLoading(false);
                      Alert.alert('Gagal', e.message || 'Kode OTP salah atau sudah kadaluarsa.');
                    }
                  }}
                >
                  {isForgotLoading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.verifyButtonText}>Verifikasi Kode</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResendOtp} style={{marginTop: 15, alignItems: 'center'}} disabled={isForgotLoading}>
                  <Text style={{color: '#4F8EF7', fontSize: 13, fontWeight: 'bold'}}>Nggak dapat kode? Kirim ulang</Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3: BIKIN PASSWORD BARU */}
            {forgotStep === 3 && (
              <>
                <Text style={styles.modalTitle}>Buat Password Baru</Text>
                <Text style={styles.modalDesc}>
                  Silakan masukkan password baru untuk akun Anda.
                </Text>

                <Text style={[styles.labelModal, { color: '#333' }]}>Password Baru</Text>
                <View style={[styles.inputContainerModal, { backgroundColor: '#F5F5F5', borderColor: '#DDD' }]}>
                  <TextInput
                    style={[styles.inputModal, { color: '#000' }]}
                    placeholder="Masukkan password baru"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.verifyButton, isForgotLoading && { opacity: 0.7 }]}
                  disabled={isForgotLoading}
                  onPress={async () => {
                    if (newPassword.length < 6) {
                      Alert.alert('Gagal', 'Password minimal 6 karakter.');
                      return;
                    }
                    setIsForgotLoading(true);
                    try {
                      await resetPassword(resetEmail, otpCode, newPassword);
                      setIsForgotLoading(false);
                      Alert.alert('Sukses', 'Password berhasil diubah! Silakan login dengan password baru.');
                      closeForgotModal();
                    } catch (e: any) {
                      setIsForgotLoading(false);
                      Alert.alert('Gagal', e.message || 'Gagal mereset password.');
                    }
                  }}
                >
                  {isForgotLoading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.verifyButtonText}>Simpan Password Baru</Text>}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={closeForgotModal} style={styles.cancelButton} disabled={isForgotLoading}>
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121A', padding: 20, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
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
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 20, marginTop: -10 },
  forgotPasswordText: { color: '#4F8EF7', fontSize: 13, fontWeight: 'bold' },
  
  // Style khusus Modal agar tidak bentrok dengan form utama
  labelModal: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  inputContainerModal: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, marginBottom: 20, borderWidth: 1 },
  inputModal: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, elevation: 10 },
  modalTitle: { color: '#12121A', fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalDesc: { color: '#666', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  verifyButton: { backgroundColor: '#21215C', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  verifyButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  cancelButton: { marginTop: 16, alignItems: 'center', paddingVertical: 8 },
  cancelButtonText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
});
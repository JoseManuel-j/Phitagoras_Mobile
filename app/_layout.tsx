import { Stack } from 'expo-router';
import { ThemeProvider } from '../components/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* Kasih tau mesin buat buka halaman login duluan */}
      <Stack initialRouteName="login">
        {/* Daftarin semua halaman yang ada di luar tabs */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Daftarin folder tabs buat masuk pas udah login */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
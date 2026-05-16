import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { useAuth } from '../lib/auth';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@omega.mu');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setLoading(true); setError(null);
    try {
      await login(email, password);
      navigation.replace('Tabs');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Ionicons name="navigate" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.brand}>OMEGA</Text>
            <Text style={styles.brandSub}>Expats · Mauritius</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Bienvenue de retour</Text>
          <Text style={styles.subtitle}>Connectez-vous pour retrouver votre tableau de bord.</Text>

          {error && (
            <View style={styles.error}>
              <Ionicons name="alert-circle" size={16} color="#b91c1c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity onPress={submit} disabled={loading} style={[styles.cta, loading && { opacity: 0.6 }]}>
            <Text style={styles.ctaText}>{loading ? 'Connexion…' : 'Se connecter'}</Text>
          </TouchableOpacity>

          <Text style={styles.demo}>
            Compte de démonstration : demo@omega.mu / demo1234
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg, padding: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: theme.colors.brandDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { color: theme.colors.ink, fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  brandSub: { color: theme.colors.muted, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '600' },
  body: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.ink },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: 6, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: theme.colors.ink, marginTop: 14 },
  input: {
    height: 48, marginTop: 6, paddingHorizontal: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 12, fontSize: 14, color: theme.colors.ink,
  },
  cta: {
    backgroundColor: theme.colors.brandDeep,
    height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 22,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  demo: { fontSize: 11, color: theme.colors.muted, textAlign: 'center', marginTop: 14 },
  error: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  errorText: { color: '#b91c1c', fontSize: 13 },
});

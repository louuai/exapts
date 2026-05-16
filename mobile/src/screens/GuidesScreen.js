import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { api } from '../lib/api';
import { mockGuides } from '../data/mockProperties';
import ScreenHeader from '../components/ScreenHeader';

export default function GuidesScreen() {
  const [guides, setGuides] = useState(mockGuides);

  useEffect(() => {
    api.guides().then((d) => setGuides(d.guides)).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="OMEGA Guides"
          icon="book-outline"
          title="Guides pour s'installer"
          subtitle="Visa, logement, banque, santé… Toutes les démarches expliquées étape par étape."
        />

        {guides.map((g) => (
          <TouchableOpacity key={g.id} style={styles.card} activeOpacity={0.85}>
            <View style={styles.iconBox}>
              <Ionicons name={g.icon || 'book-outline'} size={20} color={theme.colors.brandDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cat}>{g.category}</Text>
              <Text style={styles.title} numberOfLines={1}>{g.title}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={12} color={theme.colors.muted} />
                <Text style={styles.meta}>{g.readTime} min de lecture</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: theme.colors.border,
    marginBottom: 10,
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: theme.colors.brandLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cat: { fontSize: 10, color: theme.colors.brandDeep, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '700', color: theme.colors.ink, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { fontSize: 11, color: theme.colors.muted },
});

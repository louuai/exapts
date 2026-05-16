import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { api } from '../lib/api';
import { mockProperties } from '../data/mockProperties';
import PropertyCard from '../components/PropertyCard';
import ScreenHeader from '../components/ScreenHeader';

const REGIONS = ['', 'Nord', 'Ouest', 'Centre', 'Sud'];

export default function PropertiesScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [properties, setProperties] = useState(mockProperties);

  useEffect(() => {
    api.properties().then((d) => setProperties(d.properties)).catch(() => {});
  }, []);

  const filtered = properties.filter((p) => {
    if (region && p.region !== region) return false;
    if (query) {
      const q = query.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="OMEGA Real Estate"
          icon="business-outline"
          title="Immobilier à Maurice"
          subtitle="Penthouses, villas, appartements — sélection premium éligible aux permis de résidence."
        />

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={theme.colors.muted} />
          <TextInput
            placeholder="Rechercher un bien…"
            placeholderTextColor={theme.colors.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r || 'all'}
              onPress={() => setRegion(r)}
              style={[styles.chip, region === r && styles.chipActive]}
            >
              <Text style={[styles.chipText, region === r && styles.chipTextActive]}>
                {r || 'Toutes régions'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.count}>{filtered.length} {filtered.length > 1 ? 'biens' : 'bien'}</Text>

        {filtered.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            onPress={() => navigation.navigate('PropertyDetail', { id: p.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 14, paddingHorizontal: 14, height: 46,
  },
  input: { flex: 1, fontSize: 14, color: theme.colors.ink },
  chipsRow: { gap: 8, marginTop: 12, paddingRight: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  chipText: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  chipTextActive: { color: '#fff' },
  count: { fontSize: 13, color: theme.colors.muted, marginVertical: 12, fontWeight: '600' },
});

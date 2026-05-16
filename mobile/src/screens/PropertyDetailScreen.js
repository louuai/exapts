import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { api } from '../lib/api';
import { mockProperties } from '../data/mockProperties';

const { width: SCREEN_W } = Dimensions.get('window');

export default function PropertyDetailScreen({ route }) {
  const { id } = route.params;
  const [property, setProperty] = useState(mockProperties.find((p) => p.id === id) || null);

  useEffect(() => {
    api.property(id).then((d) => setProperty(d.property)).catch(() => {});
  }, [id]);

  if (!property) {
    return (
      <View style={styles.empty}><Text>Chargement…</Text></View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Gallery */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {property.images.map((src, i) => (
          <Image key={i} source={{ uri: src }} style={{ width: SCREEN_W, height: 320 }} />
        ))}
      </ScrollView>

      {/* Title block */}
      <View style={styles.section}>
        <View style={styles.badgesRow}>
          {property.new && <View style={styles.badge}><Text style={styles.badgeText}>NOUVEAU</Text></View>}
          {property.featured && (
            <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.badgeText}>COUP DE CŒUR</Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: theme.colors.ink }]}>
            <Text style={styles.badgeText}>{property.type}</Text>
          </View>
        </View>
        <Text style={styles.title}>{property.title}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location" size={14} color={theme.colors.muted} />
          <Text style={styles.loc}>{property.location}, {property.region}</Text>
        </View>
        <Text style={styles.price}>
          {property.price.toLocaleString('fr-FR')} {property.currency}
        </Text>
      </View>

      {/* Key facts */}
      <View style={styles.factsCard}>
        <Fact icon="resize-outline" label="Surface" value={`${property.surface} m²`} />
        <Fact icon="bed-outline" label="Chambres" value={property.bedrooms} />
        <Fact icon="water-outline" label="SDB" value={property.bathrooms} />
        <Fact icon="car-outline" label="Parkings" value={property.parking} />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.h2}>Description</Text>
        <Text style={styles.desc}>{property.description}</Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.h2}>Prestations</Text>
        {property.features.map((f) => (
          <View key={f} style={styles.feat}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.brand} />
            <Text style={styles.featTxt}>{f}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <TouchableOpacity style={styles.cta}>
          <Ionicons name="call-outline" size={16} color="#fff" />
          <Text style={styles.ctaText}>Contacter l'agent</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Fact({ icon, label, value }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factIcon}>
        <Ionicons name={icon} size={16} color={theme.colors.brandDeep} />
      </View>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 16, paddingVertical: 14 },
  badgesRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  badge: { backgroundColor: theme.colors.brand, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.ink, lineHeight: 28 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  loc: { fontSize: 14, color: theme.colors.muted, fontWeight: '600' },
  price: { fontSize: 28, fontWeight: '800', color: theme.colors.ink, marginTop: 12 },
  factsCard: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: 16, padding: 16,
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  fact: { alignItems: 'center' },
  factIcon: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: theme.colors.brandLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  factLabel: { fontSize: 10, color: theme.colors.muted, fontWeight: '600', textTransform: 'uppercase' },
  factVal: { fontSize: 14, color: theme.colors.ink, fontWeight: '800', marginTop: 2 },
  h2: { fontSize: 18, fontWeight: '800', color: theme.colors.ink, marginBottom: 8 },
  desc: { fontSize: 14, color: theme.colors.text, lineHeight: 22 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  featTxt: { fontSize: 14, color: theme.colors.text },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: theme.colors.brandDeep,
    height: 52, borderRadius: 14,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

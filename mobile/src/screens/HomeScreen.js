import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { api } from '../lib/api';
import { mockProperties, mockGuides } from '../data/mockProperties';
import PropertyCard from '../components/PropertyCard';

export default function HomeScreen({ navigation }) {
  const [properties, setProperties] = useState(mockProperties);
  const [guides, setGuides] = useState(mockGuides);

  useEffect(() => {
    api.properties('?featured=true').then((d) => setProperties(d.properties)).catch(() => {});
    api.guides().then((d) => setGuides(d.guides)).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80' }}
          style={styles.hero}
          imageStyle={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Ionicons name="navigate" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.brand}>OMEGA</Text>
                <Text style={styles.brandSub}>Expats · Mauritius</Text>
              </View>
            </View>
            <Text style={styles.heroEyebrow}>Plateforme #1 pour les expatriés</Text>
            <Text style={styles.heroTitle}>Installez-vous à Maurice, sereinement.</Text>
            <Text style={styles.heroSubtitle}>
              Guides, communauté et immobilier premium réunis sur une seule app.
            </Text>
            <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Biens')}>
              <Text style={styles.ctaText}>Explorer les biens</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.ink} />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { v: '32+', l: 'Guides' },
            { v: '12 K', l: 'Membres' },
            { v: '480+', l: 'Biens' },
            { v: '14', l: 'Villes' },
          ].map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statV}>{s.v}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Featured properties */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Biens à la une</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Biens')}>
              <Text style={styles.sectionLink}>Tout voir →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {properties.slice(0, 4).map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                compact
                onPress={() => navigation.navigate('PropertyDetail', { id: p.id })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Guides grid */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Guides essentiels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Guides')}>
              <Text style={styles.sectionLink}>Tout voir →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.guideGrid}>
            {guides.slice(0, 4).map((g) => (
              <View key={g.id} style={styles.guideCard}>
                <View style={styles.guideIcon}>
                  <Ionicons name={g.icon || 'book-outline'} size={18} color={theme.colors.brandDeep} />
                </View>
                <Text style={styles.guideCat}>{g.category}</Text>
                <Text style={styles.guideTitle} numberOfLines={2}>{g.title}</Text>
                <Text style={styles.guideTime}>{g.readTime} min de lecture</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 360 },
  heroOverlay: {
    flex: 1, padding: 22, backgroundColor: 'rgba(15,22,38,0.55)',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: theme.colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  brandSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '600' },
  heroEyebrow: { color: '#cffafe', fontWeight: '800', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 100 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 32, marginTop: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 8, lineHeight: 20 },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 16, marginBottom: 6,
  },
  ctaText: { color: theme.colors.ink, fontWeight: '800', fontSize: 14 },

  statsRow: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 16, marginTop: -22, marginBottom: 8,
  },
  stat: {
    flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8,
    shadowColor: theme.colors.ink, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  statV: { fontSize: 18, fontWeight: '800', color: theme.colors.ink },
  statL: { fontSize: 10, color: theme.colors.muted, marginTop: 2, fontWeight: '600' },

  section: { marginTop: 22 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.ink },
  sectionLink: { fontSize: 13, fontWeight: '700', color: theme.colors.brandDeep },

  guideGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  guideCard: {
    width: '48%',
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  guideIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: theme.colors.brandLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  guideCat: { fontSize: 10, color: theme.colors.brandDeep, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  guideTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.ink, marginTop: 4, minHeight: 38 },
  guideTime: { fontSize: 11, color: theme.colors.muted, marginTop: 6 },
});

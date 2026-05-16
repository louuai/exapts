import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

export default function PropertyCard({ property, onPress, compact = false }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: property.images[0] }} style={styles.img} />
        <View style={styles.badges}>
          {property.new && <View style={styles.badge}><Text style={styles.badgeText}>NOUVEAU</Text></View>}
          {property.featured && <View style={[styles.badge, styles.badgeWhite]}><Text style={[styles.badgeText, { color: theme.colors.ink }]}>COUP DE CŒUR</Text></View>}
        </View>
        <View style={styles.fav}>
          <Ionicons name="heart-outline" size={18} color={theme.colors.ink} />
        </View>
      </View>
      <View style={styles.body}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
          <Text style={styles.type}>{property.type}</Text>
        </View>
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={12} color={theme.colors.muted} />
          <Text style={styles.loc}>{property.location} · {property.region}</Text>
        </View>
        <View style={styles.specsRow}>
          <Spec icon="resize-outline" value={`${property.surface} m²`} />
          <Spec icon="bed-outline" value={property.bedrooms} />
          <Spec icon="water-outline" value={property.bathrooms} />
        </View>
        <Text style={styles.price}>
          {property.price.toLocaleString('fr-FR')} €
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Spec({ icon, value }) {
  return (
    <View style={styles.spec}>
      <Ionicons name={icon} size={12} color={theme.colors.muted} />
      <Text style={styles.specTxt}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: theme.colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardCompact: { width: 280, marginRight: 14, marginBottom: 0 },
  imgWrap: { height: 200, position: 'relative', backgroundColor: '#eef2f7' },
  img: { height: '100%', width: '100%' },
  badges: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6 },
  badge: {
    backgroundColor: theme.colors.brand,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeWhite: { backgroundColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  fav: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 14 },
  title: { fontSize: 15, fontWeight: '700', color: theme.colors.ink, flex: 1, marginRight: 8 },
  type: { fontSize: 11, color: theme.colors.muted, fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  loc: { fontSize: 12, color: theme.colors.muted },
  specsRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specTxt: { fontSize: 12, color: theme.colors.text },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.ink,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

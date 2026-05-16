import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

export default function ScreenHeader({ eyebrow, title, subtitle, icon }) {
  return (
    <View style={styles.wrap}>
      {eyebrow && (
        <View style={styles.eyebrow}>
          {icon && <Ionicons name={icon} size={14} color={theme.colors.brandDeep} />}
          <Text style={styles.eyebrowText}>{eyebrow}</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  eyebrowText: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.8, color: theme.colors.brandDeep, textTransform: 'uppercase',
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.ink, lineHeight: 32 },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: 6, lineHeight: 20 },
});

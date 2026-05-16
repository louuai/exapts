import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { api } from '../lib/api';
import { mockPosts } from '../data/mockProperties';
import ScreenHeader from '../components/ScreenHeader';

export default function CommunityScreen() {
  const [posts, setPosts] = useState(mockPosts);

  useEffect(() => {
    api.posts().then((d) => setPosts(d.posts)).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="OMEGA Community"
          icon="people-outline"
          title="Communauté OMEGA"
          subtitle="Posez vos questions, partagez vos bons plans, rencontrez d'autres expatriés."
        />

        {posts.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.userRow}>
                <Image source={{ uri: p.user.avatar }} style={styles.avatar} />
                <View>
                  <Text style={styles.name}>{p.user.name}</Text>
                  <Text style={styles.loc}>{p.user.location}</Text>
                </View>
              </View>
              {p.tag && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{p.tag}</Text>
                </View>
              )}
            </View>
            <Text style={styles.content}>{p.content}</Text>
            {p.image && <Image source={{ uri: p.image }} style={styles.postImg} />}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.action}>
                <Ionicons name="heart-outline" size={16} color={theme.colors.text} />
                <Text style={styles.actionText}>{p.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action}>
                <Ionicons name="chatbubble-outline" size={16} color={theme.colors.text} />
                <Text style={styles.actionText}>{p.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action}>
                <Ionicons name="share-outline" size={16} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: theme.colors.border,
    marginBottom: 14,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  userRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: { fontSize: 14, fontWeight: '700', color: theme.colors.ink },
  loc: { fontSize: 11, color: theme.colors.muted, marginTop: 2 },
  tag: {
    backgroundColor: theme.colors.brandLight,
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999,
  },
  tagText: { fontSize: 10, color: theme.colors.brandDeep, fontWeight: '800', letterSpacing: 0.5 },
  content: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  postImg: { width: '100%', height: 220, borderRadius: 12, marginTop: 12 },
  footer: { flexDirection: 'row', gap: 18, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, color: theme.colors.text, fontWeight: '700' },
});

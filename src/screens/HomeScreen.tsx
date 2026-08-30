import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ContentCard from '../components/ContentCard';
import { listRecent } from '../data/historyRepository';
import { getProgress } from '../data/progressRepository';
import { countByType } from '../data/contentRepository';
import type { Content } from '../data/models';
import type { RootStackParamList } from '../navigation/types';
import { lightTheme } from '../theme/colors';
import { openContent } from './players/openContent';

/**
 * Écran d'accueil (Partie 2 §3-4) : en-tête, message, catégories, contenus récents.
 * Ne doit pas devenir un tableau de statistiques complexe — accès rapide au contenu.
 */
export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [recents, setRecents] = useState<Content[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      listRecent(8).then(setRecents).catch(() => setRecents([]));
      countByType().then(setCounts).catch(() => setCounts({}));
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titre}>DSI Vault</Text>
        <Text style={styles.sousTitre}>
          Une bibliothèque locale, simple, professionnelle et privée.
        </Text>
      </View>

      <View style={styles.categories}>
        <StatBadge label="🎵 Audio" count={counts.audio} />
        <StatBadge label="🎬 Vidéo" count={counts.video} />
        <StatBadge label="📄 PDF" count={counts.pdf} />
        <StatBadge label="🖼️ Images" count={counts.image} />
      </View>

      <Text style={styles.section}>🕘 Reprendre / récemment consultés</Text>
      <FlatList
        data={recents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContentCard content={item} onPress={() => openContent(navigation, item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.vide}>Rien à reprendre pour le moment.</Text>
        }
      />
    </SafeAreaView>
  );
}

function StatBadge({ label, count }: { label: string; count?: number }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeCount}>{count ?? 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  titre: { fontSize: 24, fontWeight: '700', color: lightTheme.textPrimary },
  sousTitre: { fontSize: 14, color: lightTheme.textSecondary, marginTop: 4 },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: lightTheme.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
    minWidth: 90,
  },
  badgeLabel: { fontSize: 13, color: lightTheme.textSecondary },
  badgeCount: { fontSize: 18, fontWeight: '700', color: lightTheme.textPrimary, marginTop: 2 },
  section: {
    fontSize: 15,
    fontWeight: '600',
    color: lightTheme.textPrimary,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  vide: { color: lightTheme.textSecondary, paddingHorizontal: 16, paddingVertical: 12 },
});

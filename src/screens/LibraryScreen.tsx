import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CategoryTabs from '../components/CategoryTabs';
import ContentCard from '../components/ContentCard';
import { listByType } from '../data/contentRepository';
import { searchLibrary } from '../services/searchService';
import type { Content, ContentType } from '../data/models';
import type { RootStackParamList } from '../navigation/types';
import { lightTheme } from '../theme/colors';
import { openContent } from './players/openContent';

/**
 * Bibliothèque (Partie 2 §6-11, Partie 3) : vue "Tous" + 4 catégories, recherche locale,
 * mode liste (le mode grille suit la même logique de données — Partie 2 §8).
 */
export default function LibraryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [categorie, setCategorie] = useState<ContentType | 'tous'>('tous');
  const [items, setItems] = useState<Content[]>([]);
  const [recherche, setRecherche] = useState('');

  const charger = useCallback(async () => {
    if (recherche.trim().length > 0) {
      const results = await searchLibrary(recherche.trim());
      setItems(results);
    } else {
      const results = await listByType(categorie);
      setItems(results);
    }
  }, [categorie, recherche]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titre}>📚 Bibliothèque</Text>
        <TextInput
          style={styles.recherche}
          placeholder="🔍 Rechercher un contenu"
          placeholderTextColor={lightTheme.textSecondary}
          value={recherche}
          onChangeText={setRecherche}
        />
      </View>

      {recherche.trim().length === 0 && (
        <CategoryTabs selected={categorie} onSelect={setCategorie} />
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContentCard
            content={item}
            onPress={() => openContent(navigation, item)}
            onLongPress={() => navigation.navigate('ContentInfo', { contentId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.vide}>
            Aucun contenu détecté pour le moment. Lancez une analyse depuis Paramètres
            {'\u00A0'}› Bibliothèque.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  titre: { fontSize: 20, fontWeight: '700', color: lightTheme.textPrimary, marginBottom: 8 },
  recherche: {
    backgroundColor: lightTheme.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: lightTheme.border,
    color: lightTheme.textPrimary,
  },
  vide: { color: lightTheme.textSecondary, padding: 16, textAlign: 'center' },
});

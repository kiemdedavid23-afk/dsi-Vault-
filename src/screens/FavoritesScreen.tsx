import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ContentCard from '../components/ContentCard';
import { listFavorites } from '../data/favoritesRepository';
import { listAllNotes } from '../data/notesRepository';
import { listAllBookmarks } from '../data/bookmarksRepository';
import { getById } from '../data/contentRepository';
import type { Content, Note, Bookmark } from '../data/models';
import type { RootStackParamList } from '../navigation/types';
import { lightTheme } from '../theme/colors';
import { openContent } from './players/openContent';

type Onglet = 'favoris' | 'notes' | 'marquepages';

/**
 * ⭐ ESPACE PERSONNEL — [ Favoris ] [ Notes ] [ Marque-pages ] (Partie 2 §14, Partie 5 §13-16).
 * N'ajoute pas de nouvelle section principale à la navigation.
 */
export default function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [onglet, setOnglet] = useState<Onglet>('favoris');
  const [favoris, setFavoris] = useState<Content[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [marquepages, setMarquepages] = useState<Bookmark[]>([]);

  useFocusEffect(
    useCallback(() => {
      listFavorites().then(setFavoris).catch(() => setFavoris([]));
      listAllNotes().then(setNotes).catch(() => setNotes([]));
      listAllBookmarks().then(setMarquepages).catch(() => setMarquepages([]));
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titre}>⭐ Espace personnel</Text>

      <View style={styles.onglets}>
        <OngletBouton label="Favoris" active={onglet === 'favoris'} onPress={() => setOnglet('favoris')} />
        <OngletBouton label="Notes" active={onglet === 'notes'} onPress={() => setOnglet('notes')} />
        <OngletBouton
          label="Marque-pages"
          active={onglet === 'marquepages'}
          onPress={() => setOnglet('marquepages')}
        />
      </View>

      {onglet === 'favoris' && (
        <FlatList
          data={favoris}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContentCard content={item} onPress={() => openContent(navigation, item)} />
          )}
          ListEmptyComponent={<Text style={styles.vide}>Aucun favori pour le moment.</Text>}
        />
      )}

      {onglet === 'notes' && (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteRow note={item} onPress={() => ouvrirContenuAssocie(navigation, item.contentId)} />
          )}
          ListEmptyComponent={<Text style={styles.vide}>Aucune note pour le moment.</Text>}
        />
      )}

      {onglet === 'marquepages' && (
        <FlatList
          data={marquepages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookmarkRow bookmark={item} onPress={() => ouvrirContenuAssocie(navigation, item.contentId)} />
          )}
          ListEmptyComponent={<Text style={styles.vide}>Aucun marque-page pour le moment.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

async function ouvrirContenuAssocie(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  contentId: string,
) {
  const content = await getById(contentId);
  if (content) openContent(navigation, content);
}

function OngletBouton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.onglet, active && styles.ongletActif]}>
      <Text style={[styles.ongletLabel, active && styles.ongletLabelActif]}>{label}</Text>
    </Pressable>
  );
}

function NoteRow({ note, onPress }: { note: Note; onPress: () => void }) {
  return (
    <Pressable style={styles.ligne} onPress={onPress}>
      <Text style={styles.ligneTexte}>📝 {note.texte}</Text>
      {note.positionSecondes != null && (
        <Text style={styles.ligneMeta}>{Math.floor(note.positionSecondes)}s</Text>
      )}
      {note.page != null && <Text style={styles.ligneMeta}>Page {note.page}</Text>}
    </Pressable>
  );
}

function BookmarkRow({ bookmark, onPress }: { bookmark: Bookmark; onPress: () => void }) {
  return (
    <Pressable style={styles.ligne} onPress={onPress}>
      <Text style={styles.ligneTexte}>
        🔖 {bookmark.page != null ? `Page ${bookmark.page}` : `${Math.floor(bookmark.positionSecondes ?? 0)}s`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background },
  titre: { fontSize: 20, fontWeight: '700', color: lightTheme.textPrimary, padding: 16, paddingBottom: 8 },
  onglets: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
  onglet: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8 },
  ongletActif: { backgroundColor: lightTheme.primary },
  ongletLabel: { color: lightTheme.textPrimary, fontSize: 13 },
  ongletLabelActif: { color: '#FFFFFF', fontWeight: '600' },
  ligne: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTheme.border,
  },
  ligneTexte: { color: lightTheme.textPrimary, fontSize: 14 },
  ligneMeta: { color: lightTheme.textSecondary, fontSize: 12, marginTop: 2 },
  vide: { color: lightTheme.textSecondary, padding: 16, textAlign: 'center' },
});

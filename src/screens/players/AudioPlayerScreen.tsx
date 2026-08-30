import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { getById } from '../../data/contentRepository';
import { getProgress, saveProgress } from '../../data/progressRepository';
import { createBookmark } from '../../data/bookmarksRepository';
import { createNote } from '../../data/notesRepository';
import { isFavorite, addFavorite, removeFavorite } from '../../data/favoritesRepository';
import type { Content } from '../../data/models';
import type { RootStackParamList } from '../../navigation/types';
import { lightTheme } from '../../theme/colors';

type Route = RouteProp<RootStackParamList, 'AudioPlayer'>;

/**
 * Lecteur audio principal (Partie 4 §4-13). L'intégration réelle (lecture, contrôles
 * Android, notification media, arrière-plan) doit passer par react-native-track-player
 * — voir // TODO natif ci-dessous. La logique de reprise/favoris/notes/marque-pages,
 * elle, est déjà fonctionnelle car indépendante du moteur audio.
 */
export default function AudioPlayerScreen() {
  const { params } = useRoute<Route>();
  const [content, setContent] = useState<Content | null>(null);
  const [positionSecondes, setPositionSecondes] = useState(0);
  const [enLecture, setEnLecture] = useState(false);
  const [favori, setFavori] = useState(false);

  useEffect(() => {
    getById(params.contentId).then(setContent);
    isFavorite(params.contentId).then(setFavori);
    getProgress(params.contentId).then((p) => {
      if (p?.positionSecondes) setPositionSecondes(p.positionSecondes);
    });

    // TODO natif : brancher react-native-track-player ici.
    // await TrackPlayer.add({ id: content.id, url: content.uri, title: ..., artist: ... });
    // await TrackPlayer.play();
  }, [params.contentId]);

  useEffect(() => {
    // Sauvegarde périodique de la position pour la reprise (Partie 5 §19).
    const interval = setInterval(() => {
      if (enLecture) saveProgress(params.contentId, { positionSecondes });
    }, 5000);
    return () => clearInterval(interval);
  }, [enLecture, positionSecondes, params.contentId]);

  if (!content) return null;

  async function togglePlay() {
    setEnLecture((v) => !v);
    // TODO natif : TrackPlayer.play() / TrackPlayer.pause()
  }

  async function toggleFavori() {
    if (favori) await removeFavorite(content!.id);
    else await addFavorite(content!.id);
    setFavori(!favori);
  }

  async function ajouterMarquePage() {
    await createBookmark(content!.id, { positionSecondes });
  }

  async function ajouterNote() {
    // L'écran de saisie de texte est hors périmètre de ce squelette ;
    // exemple d'appel avec un texte fixe pour illustrer le flux de données.
    await createNote(content!.id, 'Note rapide', { positionSecondes });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.retour}>{'\u2190'} Audio</Text>

      <View style={styles.pochette} />

      <Text style={styles.titre} numberOfLines={2}>
        {content.metadonnees?.titre ?? content.nom}
      </Text>
      {content.metadonnees?.artiste && (
        <Text style={styles.artiste}>{content.metadonnees.artiste}</Text>
      )}

      <View style={styles.progression}>
        <Text style={styles.temps}>{formatTime(positionSecondes)}</Text>
        <Text style={styles.temps}>{formatTime(content.metadonnees?.duree ?? 0)}</Text>
      </View>

      <View style={styles.controles}>
        <ControlButton label="↶" onPress={() => {}} />
        <ControlButton label="◀" onPress={() => {}} />
        <ControlButton label={enLecture ? '⏸️' : '▶️'} onPress={togglePlay} primary />
        <ControlButton label="▶▶" onPress={() => {}} />
        <ControlButton label="↷" onPress={() => {}} />
      </View>

      <View style={styles.actionsSecondaires}>
        <ControlButton label={favori ? '★' : '⭐'} onPress={toggleFavori} />
        <ControlButton label="🔖" onPress={ajouterMarquePage} />
        <ControlButton label="📝" onPress={ajouterNote} />
      </View>
    </SafeAreaView>
  );
}

function ControlButton({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.controlButton, primary && styles.controlButtonPrimary]}
    >
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background, padding: 20, alignItems: 'center' },
  retour: { alignSelf: 'flex-start', color: lightTheme.textPrimary, fontSize: 16, marginBottom: 20 },
  pochette: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: lightTheme.surface,
    marginBottom: 24,
  },
  titre: { fontSize: 18, fontWeight: '700', color: lightTheme.textPrimary, textAlign: 'center' },
  artiste: { fontSize: 14, color: lightTheme.textSecondary, marginTop: 4 },
  progression: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  temps: { color: lightTheme.textSecondary, fontSize: 12 },
  controles: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  actionsSecondaires: { flexDirection: 'row', marginTop: 24 },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  controlButtonPrimary: { backgroundColor: lightTheme.primary, width: 60, height: 60, borderRadius: 30 },
  controlLabel: { fontSize: 20 },
});

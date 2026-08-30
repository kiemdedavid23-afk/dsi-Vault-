import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Content } from '../data/models';
import { lightTheme } from '../theme/colors';

const ICONS: Record<Content['type'], string> = {
  audio: '🎵',
  video: '🎬',
  pdf: '📄',
  image: '🖼️',
  autre: '📦',
};

interface Props {
  content: Content;
  onPress: () => void;
  onLongPress?: () => void;
}

/** Carte compacte utilisée dans la vue liste de la Bibliothèque (Partie 2 §8). */
export default function ContentCard({ content, onPress, onLongPress }: Props) {
  return (
    <Pressable style={styles.container} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.icon}>{ICONS[content.type]}</Text>
      <View style={styles.info}>
        <Text style={styles.nom} numberOfLines={1}>
          {content.nom}
        </Text>
        {!content.disponible && (
          <Text style={styles.indisponible}>⚠️ Fichier indisponible</Text>
        )}
        {content.metadonnees?.duree != null && (
          <Text style={styles.sousTitre}>{formatDuration(content.metadonnees.duree)}</Text>
        )}
      </View>
    </Pressable>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTheme.border,
  },
  icon: { fontSize: 24, marginRight: 12 },
  info: { flex: 1 },
  nom: { fontSize: 15, color: lightTheme.textPrimary, fontWeight: '500' },
  sousTitre: { fontSize: 13, color: lightTheme.textSecondary, marginTop: 2 },
  indisponible: { fontSize: 13, color: lightTheme.danger, marginTop: 2 },
});

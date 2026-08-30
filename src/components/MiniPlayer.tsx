import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { lightTheme } from '../theme/colors';

interface Props {
  titre: string;
  enLecture: boolean;
  onTogglePlay: () => void;
  onOpen: () => void;
}

/**
 * Mini-lecteur discret affiché quand l'utilisateur quitte l'écran audio complet
 * sans arrêter la lecture (Partie 4 §6). Reste au-dessus de la navigation par onglets.
 */
export default function MiniPlayer({ titre, enLecture, onTogglePlay, onOpen }: Props) {
  return (
    <Pressable style={styles.container} onPress={onOpen}>
      <Text style={styles.titre} numberOfLines={1}>
        🎵 {titre}
      </Text>
      <Pressable onPress={onTogglePlay} hitSlop={12}>
        <Text style={styles.bouton}>{enLecture ? '⏸️' : '▶️'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: lightTheme.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightTheme.border,
  },
  titre: { flex: 1, color: lightTheme.textPrimary, marginRight: 12 },
  bouton: { fontSize: 20 },
});

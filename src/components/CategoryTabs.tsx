import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { lightTheme } from '../theme/colors';
import type { ContentType } from '../data/models';

const CATEGORIES: { key: ContentType | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'audio', label: '🎵 Audio' },
  { key: 'video', label: '🎬 Vidéo' },
  { key: 'pdf', label: '📄 PDF' },
  { key: 'image', label: '🖼️ Images' },
];

interface Props {
  selected: ContentType | 'tous';
  onSelect: (key: ContentType | 'tous') => void;
}

/** [ Tous ] [ Audio ] [ Vidéo ] [ PDF ] [ Images ] — Partie 2 §6. */
export default function CategoryTabs({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {CATEGORIES.map((cat) => {
        const active = cat.key === selected;
        return (
          <Pressable
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{cat.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: lightTheme.surface,
    borderWidth: 1,
    borderColor: lightTheme.border,
    marginRight: 8,
  },
  tabActive: { backgroundColor: lightTheme.primary, borderColor: lightTheme.primary },
  label: { color: lightTheme.textPrimary, fontSize: 13 },
  labelActive: { color: '#FFFFFF', fontWeight: '600' },
});

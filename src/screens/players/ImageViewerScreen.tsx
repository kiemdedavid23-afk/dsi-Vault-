import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
// TODO natif : import ImageViewing from 'react-native-image-viewing';

import { getById, listByType } from '../../data/contentRepository';
import type { Content } from '../../data/models';
import type { RootStackParamList } from '../../navigation/types';
import { lightTheme } from '../../theme/colors';

type Route = RouteProp<RootStackParamList, 'ImageViewer'>;

/**
 * Visionneuse d'images (Partie 4 §28-31) : zoom/navigation délégués à
 * react-native-image-viewing ; les images n'ont pas de progression temporelle,
 * seulement une note générale possible (pas de note positionnelle — Partie 4 §31).
 */
export default function ImageViewerScreen() {
  const { params } = useRoute<Route>();
  const [content, setContent] = useState<Content | null>(null);
  const [galerie, setGalerie] = useState<Content[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getById(params.contentId).then(setContent);
    listByType('image').then((images) => {
      setGalerie(images);
      const i = images.findIndex((img) => img.id === params.contentId);
      if (i >= 0) setIndex(i);
    });
  }, [params.contentId]);

  if (!content) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/*
        TODO natif :
        <ImageViewing
          images={galerie.map((g) => ({ uri: g.uri }))}
          imageIndex={index}
          visible
          onRequestClose={() => {}}
        />
      */}
      <Text style={styles.placeholder}>
        🖼️ Image {index + 1} / {galerie.length || 1}
      </Text>
      <Text style={styles.nom}>{content.nom}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: '#FFFFFF', fontSize: 16 },
  nom: { color: lightTheme.textSecondary, marginTop: 8 },
});

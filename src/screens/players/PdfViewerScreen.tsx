import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
// TODO natif : import Pdf from 'react-native-pdf';

import { getById } from '../../data/contentRepository';
import { getProgress, saveProgress } from '../../data/progressRepository';
import { searchTextInContent } from '../../services/searchService';
import type { Content } from '../../data/models';
import type { RootStackParamList } from '../../navigation/types';
import { lightTheme } from '../../theme/colors';

type Route = RouteProp<RootStackParamList, 'PdfViewer'>;

/**
 * Lecteur PDF (Partie 4 §22-27) : navigation, zoom (délégué à react-native-pdf),
 * recherche texte (native au PDF ou via l'index OCR local), reprise de page.
 */
export default function PdfViewerScreen() {
  const { params } = useRoute<Route>();
  const [content, setContent] = useState<Content | null>(null);
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [resultats, setResultats] = useState<number[]>([]);

  useEffect(() => {
    getById(params.contentId).then(setContent);
    getProgress(params.contentId).then((p) => {
      if (p?.page) setPage(p.page);
    });
  }, [params.contentId]);

  useEffect(() => {
    saveProgress(params.contentId, { page });
  }, [page, params.contentId]);

  async function lancerRecherche(texte: string) {
    setRecherche(texte);
    if (texte.trim().length > 1) {
      const pages = await searchTextInContent(params.contentId, texte.trim());
      setResultats(pages);
    } else {
      setResultats([]);
    }
  }

  if (!content) return null;

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.recherche}
        placeholder='🔍 Rechercher : "roulement"'
        placeholderTextColor={lightTheme.textSecondary}
        value={recherche}
        onChangeText={lancerRecherche}
      />

      {resultats.length > 0 && (
        <Text style={styles.resultats}>
          Trouvé aux pages : {resultats.join(', ')}
        </Text>
      )}

      <View style={styles.zonePdf}>
        {/*
          TODO natif :
          <Pdf
            source={{ uri: content.uri }}
            page={page}
            onPageChanged={(p) => setPage(p)}
            style={StyleSheet.absoluteFill}
          />
        */}
        <Text style={styles.placeholder}>📄 {content.nom}</Text>
      </View>

      <View style={styles.pied}>
        <Text style={styles.pageInfo}>
          Page {page} / {content.metadonnees?.pages ?? '?'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background },
  recherche: {
    margin: 12,
    backgroundColor: lightTheme.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: lightTheme.border,
    color: lightTheme.textPrimary,
  },
  resultats: { paddingHorizontal: 16, color: lightTheme.textSecondary, marginBottom: 8 },
  zonePdf: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: lightTheme.textSecondary },
  pied: { padding: 12, alignItems: 'center' },
  pageInfo: { color: lightTheme.textPrimary },
});

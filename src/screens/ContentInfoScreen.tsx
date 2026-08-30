import React, { useEffect, useState } from 'react';
import { Alert, Linking, SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { getById, markUnavailable } from '../data/contentRepository';
import { isFavorite, addFavorite, removeFavorite } from '../data/favoritesRepository';
import type { Content } from '../data/models';
import type { RootStackParamList } from '../navigation/types';
import { lightTheme } from '../theme/colors';

type Route = RouteProp<RootStackParamList, 'ContentInfo'>;

/**
 * Fiche d'informations (Partie 2 §28, Partie 3 §22) : nom, type, taille, emplacement,
 * date de modification, dernière consultation, progression, métadonnées disponibles.
 */
export default function ContentInfoScreen() {
  const { params } = useRoute<Route>();
  const [content, setContent] = useState<Content | null>(null);
  const [favori, setFavori] = useState(false);

  useEffect(() => {
    getById(params.contentId).then(setContent);
    isFavorite(params.contentId).then(setFavori);
  }, [params.contentId]);

  if (!content) return null;

  async function toggleFavori() {
    if (favori) {
      await removeFavorite(content!.id);
    } else {
      await addFavorite(content!.id);
    }
    setFavori(!favori);
  }

  function ouvrirAvecAutreApplication() {
    // Le format n'est pas pris en charge par les lecteurs intégrés (Partie 3 §4).
    Linking.openURL(content!.uri).catch(() =>
      Alert.alert('Aucune application compatible trouvée sur cet appareil.'),
    );
  }

  function confirmerSuppression() {
    Alert.alert(
      'Supprimer définitivement ce fichier du téléphone ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // TODO natif : suppression réelle via RNFS.unlink + gestion des permissions
            // d'écriture selon la stratégie d'accès (Partie 3 §24 — action irréversible).
            Alert.alert('Suppression non branchée dans ce squelette (voir // TODO natif).');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titre}>{content.nom}</Text>

      {!content.disponible && (
        <Text style={styles.avertissement}>
          ⚠️ Ce fichier a peut-être été déplacé, renommé ou supprimé.
        </Text>
      )}

      <Info label="Type" value={content.type} />
      <Info label="Taille" value={formatSize(content.taille)} />
      <Info label="Emplacement" value={content.emplacement} />
      <Info label="Date de modification" value={new Date(content.dateModification).toLocaleString('fr-FR')} />
      {content.metadonnees?.duree != null && (
        <Info label="Durée" value={`${Math.round(content.metadonnees.duree)} s`} />
      )}
      {content.metadonnees?.pages != null && (
        <Info label="Pages" value={String(content.metadonnees.pages)} />
      )}

      <View style={styles.actions}>
        <ActionButton label={favori ? '★ Retirer des favoris' : '⭐ Ajouter aux favoris'} onPress={toggleFavori} />
        {content.type === 'autre' && (
          <ActionButton label="Ouvrir avec une autre application" onPress={ouvrirAvecAutreApplication} />
        )}
        <ActionButton label="✖ Retirer de DSI Vault" onPress={() => markUnavailable(content.id)} />
        <ActionButton label="🗑️ Supprimer du téléphone" danger onPress={confirmerSuppression} />
      </View>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable style={styles.action} onPress={onPress}>
      <Text style={[styles.actionLabel, danger && { color: lightTheme.danger }]}>{label}</Text>
    </Pressable>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background, padding: 16 },
  titre: { fontSize: 18, fontWeight: '700', color: lightTheme.textPrimary, marginBottom: 8 },
  avertissement: { color: lightTheme.danger, marginBottom: 12 },
  info: { marginBottom: 10 },
  infoLabel: { fontSize: 12, color: lightTheme.textSecondary },
  infoValue: { fontSize: 14, color: lightTheme.textPrimary, marginTop: 2 },
  actions: { marginTop: 20 },
  action: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTheme.border,
  },
  actionLabel: { fontSize: 14, color: lightTheme.textPrimary },
});

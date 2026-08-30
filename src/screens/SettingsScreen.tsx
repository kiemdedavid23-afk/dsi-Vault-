import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { scanLocations } from '../services/libraryScanner';
import { checkForUpdate, getInstalledVersion } from '../services/updateService';
import { resetAllData } from '../services/backupService';
import { clearHistory } from '../data/historyRepository';
import { clearThumbnailCache } from '../services/thumbnailService';
import { lightTheme } from '../theme/colors';

/**
 * ⚙️ Paramètres — 5 blocs validés (Partie 2 §15) :
 * Bibliothèque, Lecture, Confidentialité et sécurité, Apparence, À propos.
 */
export default function SettingsScreen() {
  const [analyseEnCours, setAnalyseEnCours] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');

  async function lancerAnalyse() {
    setAnalyseEnCours(true);
    try {
      // DÉCISION REQUISE : emplacements réellement autorisés par l'utilisateur
      // (sélecteur de dossier ou permission MediaStore) — non câblé ici.
      await scanLocations([], ({ traites, total }) => {
        setProgressLabel(`${traites} / ${total} fichiers analysés`);
      });
      Alert.alert('Bibliothèque actualisée');
    } catch (err) {
      Alert.alert('Analyse impossible', String(err));
    } finally {
      setAnalyseEnCours(false);
      setProgressLabel('');
    }
  }

  async function verifierMiseAJour() {
    // DÉCISION REQUISE : owner/repo GitHub réels du dépôt de distribution.
    const info = await checkForUpdate({ owner: 'votre-organisation', repo: 'dsi-vault' });
    if (!info) {
      Alert.alert('DSI Vault est à jour', `Version installée : ${getInstalledVersion()}`);
    } else {
      Alert.alert('Nouvelle version disponible', `Version ${info.version}\n\n${info.notes}`);
    }
  }

  function confirmerReinitialisation() {
    Alert.alert(
      'Réinitialiser les données locales ?',
      'Favoris, notes, marque-pages, historique, playlists et préférences seront supprimés. Les fichiers originaux de votre téléphone ne sont pas concernés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', style: 'destructive', onPress: () => resetAllData() },
      ],
    );
  }

  function confirmerEffacementHistorique() {
    Alert.alert('Effacer l\u2019historique ?', 'Cette action ne supprime aucun fichier original.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: () => clearHistory() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.titre}>⚙️ Paramètres</Text>

        <Section titre="📚 Bibliothèque">
          <Ligne
            label={analyseEnCours ? progressLabel || 'Analyse en cours…' : 'Actualiser la bibliothèque'}
            onPress={lancerAnalyse}
            disabled={analyseEnCours}
          />
          <Ligne label="Emplacements" onPress={() => {}} />
          <Ligne label="Maintenance" onPress={() => {}} />
        </Section>

        <Section titre="🎵 Lecture">
          <Ligne label="Audio" onPress={() => {}} />
          <Ligne label="Vidéo" onPress={() => {}} />
          <Ligne label="Lecture en arrière-plan" onPress={() => {}} />
          <Ligne label="Picture-in-Picture" onPress={() => {}} />
        </Section>

        <Section titre="🔐 Confidentialité et sécurité">
          <Ligne label="Permissions" onPress={() => {}} />
          <Ligne label="Verrouillage DSI Vault" onPress={() => {}} />
          <Ligne label="Effacer l'historique" onPress={confirmerEffacementHistorique} />
          <Ligne label="Réinitialiser les données locales" onPress={confirmerReinitialisation} danger />
        </Section>

        <Section titre="🎨 Apparence">
          <Ligne label="🌞 Clair / 🌙 Sombre / 🌓 Automatique" onPress={() => {}} />
        </Section>

        <Section titre="ℹ️ À propos">
          <Ligne label={`Version installée : ${getInstalledVersion()}`} onPress={() => {}} />
          <Ligne label="Vérifier les mises à jour" onPress={verifierMiseAJour} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitre}>{titre}</Text>
      {children}
    </View>
  );
}

function Ligne({
  label,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.ligne} onPress={onPress} disabled={disabled}>
      <Text style={[styles.ligneLabel, danger && { color: lightTheme.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.background },
  titre: { fontSize: 20, fontWeight: '700', color: lightTheme.textPrimary, padding: 16 },
  section: { marginBottom: 16 },
  sectionTitre: {
    fontSize: 13,
    fontWeight: '600',
    color: lightTheme.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  ligne: {
    backgroundColor: lightTheme.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTheme.border,
  },
  ligneLabel: { fontSize: 14, color: lightTheme.textPrimary },
});

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Content } from '../../data/models';
import type { RootStackParamList } from '../../navigation/types';
import { recordVisit } from '../../data/historyRepository';

/**
 * Point d'entrée unique pour ouvrir un contenu depuis n'importe quel écran
 * (Accueil, Bibliothèque, Favoris, Historique…) : garantit un comportement
 * cohérent (Partie 2 §29) et enregistre l'historique local (Partie 5 §17).
 */
export function openContent(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  content: Content,
): void {
  recordVisit(content.id).catch(() => {});

  switch (content.type) {
    case 'audio':
      navigation.navigate('AudioPlayer', { contentId: content.id });
      return;
    case 'video':
      navigation.navigate('VideoPlayer', { contentId: content.id });
      return;
    case 'pdf':
      navigation.navigate('PdfViewer', { contentId: content.id });
      return;
    case 'image':
      navigation.navigate('ImageViewer', { contentId: content.id });
      return;
    default:
      // Format non pris en charge par les lecteurs intégrés (Partie 2 §7) :
      // l'écran appelant doit proposer "Ouvrir avec une autre application".
      navigation.navigate('ContentInfo', { contentId: content.id });
  }
}

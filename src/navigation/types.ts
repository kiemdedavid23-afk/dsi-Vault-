export type ContentType = 'audio' | 'video' | 'pdf' | 'image' | 'autre';

export type RootStackParamList = {
  MainTabs: undefined;
  ContentInfo: { contentId: string };
  AudioPlayer: { contentId: string };
  VideoPlayer: { contentId: string };
  PdfViewer: { contentId: string };
  ImageViewer: { contentId: string };
};

export type MainTabParamList = {
  Accueil: undefined;
  Bibliotheque: { filtre?: ContentType | 'tous' } | undefined;
  Favoris: undefined;
  Parametres: undefined;
};

/**
 * Palette provisoire.
 * DÉCISION REQUISE : la palette définitive doit rester cohérente avec l'identité
 * visuelle et l'icône officielle de DSI Vault (Partie 2 §19) — non fournies à ce jour.
 * Cette palette neutre respecte "Professionnalisme dans la simplicité" en attendant.
 */
export const lightTheme = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  primary: '#1F2933',
  accent: '#3E7CB1',
  textPrimary: '#1F2933',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#B3261E',
};

export const darkTheme = {
  background: '#121417',
  surface: '#1C1F24',
  primary: '#F5F5F5',
  accent: '#6FA8DC',
  textPrimary: '#F5F5F5',
  textSecondary: '#A0A6AD',
  border: '#2A2E34',
  danger: '#FF6B60',
};

export type AppTheme = typeof lightTheme;

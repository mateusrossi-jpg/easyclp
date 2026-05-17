const lightPalette = {
  background: '#F4F7F6', // Off-white premium
  rungInactive: '#95A5A6', // Linhas inativas bem visíveis
  rungActive: '#27AE60', // Verde técnico para lógica ativa
  powerRailLeft: '#27AE60', // Barramento esquerdo verde
  powerRailRight: '#111111', // Barramento direito preto
  diagnosticText: '#D35400', // Laranja/Âmbar para diagnósticos
  componentBackground: '#FFFFFF', // Blocos claros
  textPrimary: '#2C3E50', // Navy para alto contraste
  techBlue: '#3498DB', 
  danger: '#E74C3C' 
};

const darkPalette = {
  background: '#1A1A1A', 
  rungInactive: '#2D2D2D', 
  rungActive: '#39FF14',
  powerRailLeft: '#39FF14',
  powerRailRight: '#39FF14',
  diagnosticText: '#FFBF00', 
  componentBackground: '#252525', 
  textPrimary: '#E0E0E0',
  techBlue: '#3498DB', 
  danger: '#E74C3C' 
};

export const EasyCLPTheme = {
  colors: lightPalette, // MVP congelado estritamente em Light Technical UI
  palettes: {
    light: lightPalette,
    dark: darkPalette // Congelado para a Fase 2
  },
  typography: {
    ui: 'Inter', 
    ladder: 'JetBrains Mono' 
  },
  geometry: {
    strokeWidthInactive: 2, 
    strokeWidthActive: 3, 
    rungGap: 32, 
    touchTargetSize: 44 // Touch-friendly (blocos grandes) para mobile
  },
  animation: {
    stateTransitionMs: 150 
  }
};

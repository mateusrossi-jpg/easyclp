export const THEME_TOKENS = {
  color: {
    appBackground: '#EEF3EE',
    canvas: '#FAFCF8',
    surface: '#FFFFFF',
    surfaceWarm: '#F7F5EF',
    surfaceMuted: '#EEF3ED',
    surfacePressed: '#E5EDE5',
    borderSubtle: '#DDE7DD',
    borderStrong: '#C8D7C9',
    text: '#111827',
    textMuted: '#66736B',
    charcoal: '#26312D',
    energy: '#2EA461',
    railLeft: '#267247',
    danger: '#C9453D',
  },
  shadow: {
    soft: {
      shadowColor: '#24352C',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
      elevation: 2,
    },
    floating: {
      shadowColor: '#24352C',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 30,
      elevation: 9,
    },
  },
} as const;

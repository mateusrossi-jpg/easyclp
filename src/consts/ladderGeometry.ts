import { THEME_TOKENS } from './themeTokens';

/**
 * LADDER_GEOMETRY
 * Measured constants for high-fidelity PLC simulation.
 * Precise axial alignment and industrial density.
 */
export const LADDER_GEOMETRY = {
  // Global Shell
  leftRailX: 48,
  rightRailX: 1040, // Expanded for breathing room
  railWidth: 3,
  topPadding: 44,
  
  // Grid System
  columnCount: 12,
  columnWidth: 80, // (1040 - 48 - 48) / 12 ~= 78.6, let's use 80 for more space
  
  // Rung Density
  rungHeight: 124, // Taller for better touch target
  branchGap: 112,
  centerY: 62,
  
  // Symbol Proportions
  contactWidth: 34,
  contactHeight: 32,
  coilWidth: 46,
  coilHeight: 34,
  
  // Function Blocks (Industrial Proportions)
  blockWidth: 156, // Ocupa ~2 colunas com folga
  blockHeight: 90,
  blockHeaderHeight: 24,
  
  // Comparators (Technical)
  compareWidth: 64,
  compareHeight: 36,
  
  // Visual Weight
  lineWidth: 1.5,
  activeLineWidth: 3,
  labelFontSize: 12, // Increased for readability
  
  // Palette
  colorCanvas: THEME_TOKENS.color.canvas,
  colorPowerOff: THEME_TOKENS.color.charcoal,
  colorPowerOn: THEME_TOKENS.color.energy,
  colorRailLeft: THEME_TOKENS.color.railLeft,
  colorRailRight: THEME_TOKENS.color.charcoal,
  colorBlockHeader: THEME_TOKENS.color.charcoal,
  colorBlockBody: THEME_TOKENS.color.surfaceMuted,
  colorText: THEME_TOKENS.color.text,
  colorSymbol: THEME_TOKENS.color.text,
  colorGuide: '#E4ECE4',
  colorSelection: 'rgba(46, 164, 97, 0.10)',
  colorSymbolMuted: '#5F6D65',
  colorElementPlate: 'rgba(255, 255, 255, 0.85)',
  colorElementPlateActive: 'rgba(232, 247, 236, 0.92)',
};

type LayoutElement = {
  branchIndex: number;
};

export const getRungRowCount = (rungElements: LayoutElement[]) => {
  return Math.max(1, Math.max(...rungElements.map(el => el.branchIndex || 0)) + 1);
};

export const getRungHeight = (rungElements: LayoutElement[]) => {
  const rowCount = getRungRowCount(rungElements);
  return LADDER_GEOMETRY.rungHeight + Math.max(0, rowCount - 1) * LADDER_GEOMETRY.branchGap;
};

export const getBranchY = (rungY: number, branchIndex: number) => {
  return rungY + branchIndex * LADDER_GEOMETRY.branchGap;
};

export const getElementX = (column: number) => {
  return LADDER_GEOMETRY.leftRailX + column * LADDER_GEOMETRY.columnWidth;
};

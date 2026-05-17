import { THEME_TOKENS } from './themeTokens';

/**
 * LADDER_GEOMETRY
 * Measured constants for high-fidelity PLC simulation.
 * Precise axial alignment and industrial density.
 */
export const LADDER_GEOMETRY = {
  // Global Shell
  leftRailX: 48,
  rightRailX: 1160, // Further expanded for better spacing
  railWidth: 4,     // Slightly thicker for premium feel
  topPadding: 44,
  
  // Grid System
  columnCount: 12,
  columnWidth: 90,  // (1160 - 48 - 48) / 12 ~= 88.6 -> 90 for rounded math
  
  // Rung Density
  rungHeight: 140,  // Taller rungs for better touch targets and vertical breathing room
  branchGap: 124,
  centerY: 70,      // Adjusted for new rungHeight
  
  // Symbol Proportions
  contactWidth: 40,
  contactHeight: 36,
  coilWidth: 52,
  coilHeight: 38,
  
  // Function Blocks (Large and Legible)
  blockWidth: 170,  // Occupies almost 2 full columns (90*2=180)
  blockHeight: 104,
  blockHeaderHeight: 28,
  
  // Comparators (Technical)
  compareWidth: 72,
  compareHeight: 40,
  
  // Visual Weight
  lineWidth: 1.8,
  activeLineWidth: 3.5,
  labelFontSize: 13, // Larger labels
  
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

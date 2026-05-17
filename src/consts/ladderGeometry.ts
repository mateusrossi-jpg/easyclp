import { THEME_TOKENS } from './themeTokens';

/**
 * LADDER_GEOMETRY
 * Measured constants for high-fidelity PLC simulation.
 * Precise axial alignment and industrial density.
 */
export const LADDER_GEOMETRY = {
  // Global Shell
  leftRailX: 52,
  rightRailX: 1200, // Expanded for breathing room and 12 larger columns
  railWidth: 4.5,   // Thicker for premium industrial feel
  topPadding: 48,
  
  // Grid System
  columnCount: 12,
  columnWidth: 94,  // (1200 - 52 - 52) / 12 ~= 91.3 -> 94 for generous spacing
  
  // Rung Density
  rungHeight: 156,  // Much taller rungs for touch and multi-line comments
  branchGap: 132,
  centerY: 78,      // Perfectly centered in 156 height
  
  // Symbol Proportions (Upscaled)
  contactWidth: 44,
  contactHeight: 40,
  coilWidth: 56,
  coilHeight: 42,
  
  // Function Blocks (Industrial Premium)
  blockWidth: 184,  // Almost 2 columns (94*2=188)
  blockHeight: 112,
  blockHeaderHeight: 32,
  
  // Comparators (Technical)
  compareWidth: 78,
  compareHeight: 44,
  
  // Visual Weight
  lineWidth: 2.2,
  activeLineWidth: 4.5, // Filamental glow feel
  labelFontSize: 14,    // Highly legible tags
  
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

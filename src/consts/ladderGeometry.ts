import { THEME_TOKENS } from './themeTokens';

/**
 * LADDER_GEOMETRY
 * Measured constants for high-fidelity PLC simulation.
 * Precise axial alignment and industrial density.
 */
export const LADDER_GEOMETRY = {
  // Global Shell
  leftRailX: 44,
  rightRailX: 920, // Aumentado para acomodar 12 colunas confortavelmente
  railWidth: 3,
  topPadding: 44,
  
  // Grid System
  columnCount: 12,
  columnWidth: 70, // (920 - 44 - 44) / 12 ~= 69.3
  
  // Rung Density
  rungHeight: 110,
  branchGap: 100,
  centerY: 55,
  
  // Symbol Proportions
  contactWidth: 32,
  contactHeight: 30,
  coilWidth: 42,
  coilHeight: 32,
  
  // Function Blocks (Industrial Proportions)
  blockWidth: 140, // Ocupa ~2 colunas
  blockHeight: 80,
  blockHeaderHeight: 22,
  
  // Comparators (Technical)
  compareWidth: 60,
  compareHeight: 32,
  
  // Visual Weight
  lineWidth: 1.5,
  activeLineWidth: 3,
  labelFontSize: 11,
  
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

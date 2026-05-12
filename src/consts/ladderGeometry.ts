import { THEME_TOKENS } from './themeTokens';

/**
 * LADDER_GEOMETRY
 * Measured constants for high-fidelity PLC simulation.
 * Precise axial alignment and industrial density.
 */
export const LADDER_GEOMETRY = {
  // Global Shell
  leftRailX: 44,
  rightRailX: 870,
  railWidth: 3,
  topPadding: 44,
  
  // Rung Density
  rungHeight: 108,
  branchGap: 96,
  centerY: 54,
  
  // Fixed Horizontal Positions (Aproximação por medição visual)
  firstContactX: 66,
  compareX: 66,
  ctuX: 262,
  tonX: 430,
  cycleTonX: 306,
  coilX: 786,
  
  // Symbol Proportions
  contactWidth: 32,
  contactHeight: 30,
  coilWidth: 42,
  coilHeight: 32,
  
  // Function Blocks (Industrial Proportions)
  blockWidth: 152,
  blockHeight: 76,
  blockHeaderHeight: 21,
  
  // Comparators (Technical)
  compareWidth: 40,
  compareHeight: 30,
  
  // Visual Weight
  lineWidth: 1.65,
  activeLineWidth: 2.35,
  columnWidth: 84,
  labelFontSize: 12,
  
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
  colorGuide: '#EDF2ED',
  colorSelection: 'rgba(67, 185, 112, 0.08)',
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

import React from 'react';
import { G, Rect, Text as SvgText, Line } from 'react-native-svg';
import { LADDER_GEOMETRY as GEO } from '../consts/ladderGeometry';

interface BlockProps {
  type: 'TON' | 'CTU';
  powerIn: boolean;
  powerOut: boolean;
  address: string;
  accValue: string;
  preValue: string;
}

export const LadderBlockSvg: React.FC<BlockProps> = ({ type, powerIn, powerOut, address, accValue, preValue }) => {
  const midX = GEO.blockWidth / 2;
  const startY = GEO.centerY - GEO.blockHeight / 2;
  const bodyX = 8;
  const bodyWidth = GEO.blockWidth - 16;
  
  const inColor = powerIn ? GEO.colorPowerOn : GEO.colorPowerOff;
  const outColor = powerOut ? GEO.colorPowerOn : GEO.colorPowerOff;
  const headerColor = powerIn ? GEO.colorPowerOn : GEO.colorBlockHeader;

  return (
    <G shapeRendering="geometricPrecision">
      {/* Input/Output Wires */}
      <Line x1={0} y1={GEO.centerY} x2={bodyX} y2={GEO.centerY} stroke={inColor} strokeWidth={powerIn ? GEO.activeLineWidth : GEO.lineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <Line x1={GEO.blockWidth - bodyX} y1={GEO.centerY} x2={GEO.blockWidth} y2={GEO.centerY} stroke={outColor} strokeWidth={powerOut ? GEO.activeLineWidth : GEO.lineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />

      {/* Technical Label (Tag) */}
      <SvgText x={midX} y={16} fontSize={14} fontWeight="900" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace" letterSpacing={0.5}>{address}</SvgText>

      {/* Industrial Body with Sharp Depth */}
      <Rect x={bodyX + 4} y={startY + 6} width={bodyWidth} height={GEO.blockHeight} rx={18} fill="rgba(31, 41, 55, 0.12)" />

      {/* Main Chassis */}
      <Rect x={bodyX} y={startY} width={bodyWidth} height={GEO.blockHeight} rx={18} fill={powerIn ? GEO.colorElementPlateActive : GEO.colorBlockBody} stroke={powerIn ? 'rgba(46, 164, 97, 0.55)' : 'rgba(156, 163, 175, 0.4)'} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
      
      {/* Precision Header */}
      <Rect x={bodyX} y={startY} width={bodyWidth} height={GEO.blockHeaderHeight} rx={18} fill={headerColor} />
      <Rect x={bodyX} y={startY + GEO.blockHeaderHeight - 12} width={bodyWidth} height={12} fill={headerColor} />
      
      {/* Header Bevel/Detail */}
      <Line x1={bodyX + 16} y1={startY + GEO.blockHeaderHeight - 1} x2={bodyX + bodyWidth - 16} y2={startY + GEO.blockHeaderHeight - 1} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      
      <SvgText x={midX} y={startY + 21} fontSize={15} fontWeight="900" textAnchor="middle" fill="#FFFFFF" letterSpacing={1}>{type}</SvgText>

      {/* Pin Layout (Crisp Monospace) */}
      <G opacity={1}>
        <SvgText x={bodyX + 14} y={startY + 58} fontSize={13} fontWeight="900" fill={GEO.colorSymbolMuted} fontFamily="monospace">{type === 'TON' ? 'IN' : 'CU'}</SvgText>
        <SvgText x={bodyX + 14} y={startY + 90} fontSize={13} fontWeight="900" fill={GEO.colorSymbolMuted} fontFamily="monospace">{type === 'TON' ? 'PT' : 'RES'}</SvgText>
        
        <SvgText x={bodyX + bodyWidth - 14} y={startY + 58} fontSize={13} fontWeight="900" textAnchor="end" fill={GEO.colorSymbolMuted} fontFamily="monospace">Q</SvgText>
        <SvgText x={bodyX + bodyWidth - 14} y={startY + 90} fontSize={13} fontWeight="900" textAnchor="end" fill={GEO.colorSymbolMuted} fontFamily="monospace">{type === 'TON' ? 'ET' : 'ACC'}</SvgText>
      </G>

      {/* Dynamic Data Readout */}
      <SvgText x={bodyX + bodyWidth - 48} y={startY + 90} fontSize={13} fontWeight="900" textAnchor="end" fill={GEO.colorText} fontFamily="monospace">{accValue}</SvgText>
      <SvgText x={bodyX + 48} y={startY + 90} fontSize={13} fontWeight="900" textAnchor="start" fill={GEO.colorText} fontFamily="monospace">{preValue}</SvgText>
      
      {/* Energized Glow Indicator */}
      {powerIn && (
        <Rect x={bodyX + 6} y={startY + 6} width={8} height={8} rx={4} fill="#6EE7B7" />
      )}
    </G>
  );
};

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
  const bodyX = 11;
  const bodyWidth = GEO.blockWidth - 22;
  
  const inColor = powerIn ? GEO.colorPowerOn : GEO.colorPowerOff;
  const outColor = powerOut ? GEO.colorPowerOn : GEO.colorPowerOff;
  const headerColor = powerIn ? GEO.colorPowerOn : GEO.colorBlockHeader;

  return (
    <G shapeRendering="geometricPrecision">
      {/* Input/Output Wires */}
      <Line x1={0} y1={GEO.centerY} x2={bodyX} y2={GEO.centerY} stroke={inColor} strokeWidth={powerIn ? GEO.activeLineWidth : GEO.lineWidth} vectorEffect="non-scaling-stroke" />
      <Line x1={GEO.blockWidth - bodyX} y1={GEO.centerY} x2={GEO.blockWidth} y2={GEO.centerY} stroke={outColor} strokeWidth={powerOut ? GEO.activeLineWidth : GEO.lineWidth} vectorEffect="non-scaling-stroke" />

      {/* Label above */}
      <SvgText x={midX} y={8} fontSize={12} fontWeight="900" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{address}</SvgText>

      <Rect x={bodyX + 2} y={startY + 3} width={bodyWidth} height={GEO.blockHeight} rx={11} fill="rgba(38, 49, 45, 0.08)" />

      {/* Main Body */}
      <Rect x={bodyX} y={startY} width={bodyWidth} height={GEO.blockHeight} rx={11} fill={powerIn ? GEO.colorElementPlateActive : GEO.colorBlockBody} stroke={powerIn ? 'rgba(46, 164, 97, 0.42)' : '#C8D7C9'} strokeWidth={1.15} vectorEffect="non-scaling-stroke" />
      
      {/* Header */}
      <Rect x={bodyX} y={startY} width={bodyWidth} height={GEO.blockHeaderHeight} rx={11} fill={headerColor} />
      <Rect x={bodyX} y={startY + GEO.blockHeaderHeight - 9} width={bodyWidth} height={9} fill={headerColor} />
      <SvgText x={midX} y={startY + 15} fontSize={12} fontWeight="900" textAnchor="middle" fill="#FFFFFF">{type}</SvgText>

      {/* Pin Labels */}
      <G opacity={0.7}>
        <SvgText x={18} y={startY + 39} fontSize={10.5} fontWeight="800" fill={GEO.colorSymbolMuted}>{type === 'TON' ? 'IN' : 'CU'}</SvgText>
        <SvgText x={18} y={startY + 63} fontSize={10.5} fontWeight="800" fill={GEO.colorSymbolMuted}>{type === 'TON' ? 'PT' : 'R'}</SvgText>
        <SvgText x={GEO.blockWidth - 18} y={startY + 39} fontSize={10.5} fontWeight="800" textAnchor="end" fill={GEO.colorSymbolMuted}>Q</SvgText>
        <SvgText x={GEO.blockWidth - 18} y={startY + 63} fontSize={10.5} fontWeight="800" textAnchor="end" fill={GEO.colorSymbolMuted}>{type === 'TON' ? 'ET' : 'CV'}</SvgText>
      </G>

      {/* Dynamic Values */}
      <SvgText x={GEO.blockWidth - 40} y={startY + 63} fontSize={10.5} fontWeight="900" textAnchor="end" fill="#111827">{accValue}</SvgText>
      <SvgText x={40} y={startY + 63} fontSize={10.5} fontWeight="900" textAnchor="start" fill="#111827">{preValue}</SvgText>
    </G>
  );
};

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
      <Line x1={0} y1={GEO.centerY} x2={bodyX} y2={GEO.centerY} stroke={inColor} strokeWidth={powerIn ? GEO.activeLineWidth : GEO.lineWidth} vectorEffect="non-scaling-stroke" />
      <Line x1={GEO.blockWidth - bodyX} y1={GEO.centerY} x2={GEO.blockWidth} y2={GEO.centerY} stroke={outColor} strokeWidth={powerOut ? GEO.activeLineWidth : GEO.lineWidth} vectorEffect="non-scaling-stroke" />

      {/* Label above */}
      <SvgText x={midX} y={12} fontSize={11} fontWeight="900" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{address}</SvgText>

      {/* Shadow/Depth */}
      <Rect x={bodyX + 3} y={startY + 4} width={bodyWidth} height={GEO.blockHeight} rx={14} fill="rgba(38, 49, 45, 0.08)" />

      {/* Main Body */}
      <Rect x={bodyX} y={startY} width={bodyWidth} height={GEO.blockHeight} rx={14} fill={powerIn ? GEO.colorElementPlateActive : GEO.colorBlockBody} stroke={powerIn ? 'rgba(46, 164, 97, 0.45)' : 'rgba(200, 215, 201, 0.6)'} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      
      {/* Header */}
      <Rect x={bodyX} y={startY} width={bodyWidth} height={GEO.blockHeaderHeight} rx={14} fill={headerColor} />
      <Rect x={bodyX} y={startY + GEO.blockHeaderHeight - 8} width={bodyWidth} height={8} fill={headerColor} />
      <SvgText x={midX} y={startY + 15} fontSize={11} fontWeight="900" textAnchor="middle" fill="#FFFFFF">{type}</SvgText>

      {/* Pin Labels & Content Area */}
      <G opacity={0.8}>
        <SvgText x={bodyX + 10} y={startY + 42} fontSize={10} fontWeight="900" fill={GEO.colorSymbolMuted} fontFamily="monospace">{type === 'TON' ? 'IN' : 'CU'}</SvgText>
        <SvgText x={bodyX + 10} y={startY + 66} fontSize={10} fontWeight="900" fill={GEO.colorSymbolMuted} fontFamily="monospace">{type === 'TON' ? 'PT' : 'RES'}</SvgText>
        
        <SvgText x={bodyX + bodyWidth - 10} y={startY + 42} fontSize={10} fontWeight="900" textAnchor="end" fill={GEO.colorSymbolMuted} fontFamily="monospace">Q</SvgText>
        <SvgText x={bodyX + bodyWidth - 10} y={startY + 66} fontSize={10} fontWeight="900" textAnchor="end" fill={GEO.colorSymbolMuted} fontFamily="monospace">{type === 'TON' ? 'ET' : 'ACC'}</SvgText>
      </G>

      {/* Dynamic Values */}
      <SvgText x={bodyX + bodyWidth - 36} y={startY + 66} fontSize={10} fontWeight="900" textAnchor="end" fill={GEO.colorText} fontFamily="monospace">{accValue}</SvgText>
      <SvgText x={bodyX + 36} y={startY + 66} fontSize={10} fontWeight="900" textAnchor="start" fill={GEO.colorText} fontFamily="monospace">{preValue}</SvgText>
    </G>
  );
};

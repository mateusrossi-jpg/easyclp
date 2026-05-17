import React from 'react';
import { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { LADDER_GEOMETRY as GEO } from '../consts/ladderGeometry';

interface SymbolProps {
  powerIn: boolean;
  powerOut: boolean;
  active?: boolean;
  address?: string;
}

const BaseWire = ({ color }: { color: string }) => (
  <Line x1={0} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={color} strokeWidth={GEO.lineWidth} strokeOpacity={0.58} vectorEffect="non-scaling-stroke" />
);

export const LadderContactNO: React.FC<SymbolProps> = ({ powerIn, powerOut, active }) => {
  const midX = GEO.columnWidth / 2;
  const halfW = GEO.contactWidth / 2;
  const halfH = GEO.contactHeight / 2;
  const symbolColor = active ? GEO.colorPowerOn : GEO.colorSymbolMuted;

  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      {powerIn && <Line x1={0} y1={GEO.centerY} x2={midX - halfW} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      {powerOut && <Line x1={midX + halfW} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      
      <Rect x={midX - halfW - 6} y={GEO.centerY - halfH - 4} width={GEO.contactWidth + 12} height={GEO.contactHeight + 8} rx={7} fill={active ? GEO.colorElementPlateActive : GEO.colorElementPlate} stroke={active ? 'rgba(46, 164, 97, 0.2)' : 'rgba(0,0,0,0.05)'} strokeWidth={1} />
      <Line x1={midX - halfW} y1={GEO.centerY - halfH} x2={midX - halfW} y2={GEO.centerY + halfH} stroke={symbolColor} strokeWidth={3.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <Line x1={midX + halfW} y1={GEO.centerY - halfH} x2={midX + halfW} y2={GEO.centerY + halfH} stroke={symbolColor} strokeWidth={3.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {active && <Line x1={midX - halfW} y1={GEO.centerY} x2={midX + halfW} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
    </G>
  );
};

export const LadderContactNC: React.FC<SymbolProps> = (props) => {
  const midX = GEO.columnWidth / 2;
  const halfW = GEO.contactWidth / 2;
  const halfH = GEO.contactHeight / 2;
  const symbolColor = props.active ? GEO.colorPowerOn : GEO.colorSymbolMuted;
  return (
    <G shapeRendering="geometricPrecision">
      <LadderContactNO {...props} />
      <Line x1={midX - halfW - 2} y1={GEO.centerY + halfH - 2} x2={midX + halfW + 2} y2={GEO.centerY - halfH + 2} stroke={symbolColor} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </G>
  );
};

export const LadderCoil: React.FC<SymbolProps & { type: 'OTE' | 'OTL' | 'OTU' }> = ({ powerIn, active, type }) => {
  const midX = GEO.columnWidth / 2;
  const halfW = GEO.coilWidth / 2;
  const halfH = GEO.coilHeight / 2;
  const symbolColor = active ? GEO.colorPowerOn : GEO.colorSymbolMuted;
  
  // Refined path for a smoother coil look
  const path = `M ${midX - halfW / 2 - 3} ${GEO.centerY - halfH / 2} Q ${midX - halfW - 3} ${GEO.centerY} ${midX - halfW / 2 - 3} ${GEO.centerY + halfH / 2} M ${midX + halfW / 2 + 3} ${GEO.centerY - halfH / 2} Q ${midX + halfW + 3} ${GEO.centerY} ${midX + halfW / 2 + 3} ${GEO.centerY + halfH / 2}`;

  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      {powerIn && <Line x1={0} y1={GEO.centerY} x2={midX - halfW / 2 - 8} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      
      <Rect x={midX - halfW - 4} y={GEO.centerY - halfH - 4} width={GEO.coilWidth + 8} height={GEO.coilHeight + 8} rx={14} fill={active ? GEO.colorElementPlateActive : GEO.colorElementPlate} />
      <Path d={path} fill="none" stroke={symbolColor} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      
      {type === 'OTL' && <SvgText x={midX} y={GEO.centerY + 7} fontSize={14} fontWeight="900" textAnchor="middle" fill={symbolColor} fontFamily="monospace">S</SvgText>}
      {type === 'OTU' && <SvgText x={midX} y={GEO.centerY + 7} fontSize={14} fontWeight="900" textAnchor="middle" fill={symbolColor} fontFamily="monospace">R</SvgText>}
    </G>
  );
};

export const CompareContactSvg: React.FC<SymbolProps & { operator: string, label: string, value: string }> = ({ powerIn, powerOut, operator, label, value }) => {
  const midX = GEO.columnWidth / 2;
  const startX = midX - GEO.compareWidth / 2;
  const startY = GEO.centerY - GEO.compareHeight / 2;
  const inColor = powerIn ? GEO.colorPowerOn : GEO.colorPowerOff;
  const outColor = powerOut ? GEO.colorPowerOn : GEO.colorPowerOff;

  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      {powerIn && <Line x1={0} y1={GEO.centerY} x2={startX - 4} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      {powerOut && <Line x1={startX + GEO.compareWidth + 4} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      
      {/* Label above */}
      <SvgText x={midX} y={15} fontSize={12} fontWeight="900" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{label}</SvgText>
      
      {/* Shadow/Depth */}
      <Rect x={startX - 4} y={startY + 3} width={GEO.compareWidth + 8} height={GEO.compareHeight + 5} rx={10} fill="rgba(38, 49, 45, 0.08)" />
      
      {/* Main Body */}
      <Rect x={startX - 5} y={startY - 5} width={GEO.compareWidth + 10} height={GEO.compareHeight + 10} rx={12} fill={powerIn ? GEO.colorElementPlateActive : GEO.colorElementPlate} stroke={powerIn ? 'rgba(46, 164, 97, 0.4)' : 'rgba(200, 215, 201, 0.5)'} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      
      {/* Operator Area */}
      <Rect x={startX} y={startY} width={GEO.compareWidth} height={GEO.compareHeight} rx={8} fill={GEO.colorBlockBody} stroke={GEO.colorSymbolMuted} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <SvgText x={midX} y={GEO.centerY + 7} fontSize={14} fontWeight="900" textAnchor="middle" fill={GEO.colorText}>{operator}</SvgText>
      
      {/* Value below */}
      <SvgText x={midX} y={GEO.centerY + 38} fontSize={12} fontWeight="900" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{value}</SvgText>
    </G>
  );
};

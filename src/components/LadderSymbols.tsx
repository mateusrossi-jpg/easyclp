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
  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      {powerIn && <Line x1={0} y1={GEO.centerY} x2={midX - halfW} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      {powerOut && <Line x1={midX + halfW} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      
      <Rect x={midX - halfW - 4} y={GEO.centerY - halfH - 3} width={GEO.contactWidth + 8} height={GEO.contactHeight + 6} rx={5} fill={active ? GEO.colorElementPlateActive : GEO.colorElementPlate} />
      <Line x1={midX - halfW} y1={GEO.centerY - halfH} x2={midX - halfW} y2={GEO.centerY + halfH} stroke={active ? GEO.colorPowerOn : GEO.colorSymbolMuted} strokeWidth={2.15} vectorEffect="non-scaling-stroke" />
      <Line x1={midX + halfW} y1={GEO.centerY - halfH} x2={midX + halfW} y2={GEO.centerY + halfH} stroke={active ? GEO.colorPowerOn : GEO.colorSymbolMuted} strokeWidth={2.15} vectorEffect="non-scaling-stroke" />
      {active && <Line x1={midX - halfW} y1={GEO.centerY} x2={midX + halfW} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
    </G>
  );
};

export const LadderContactNC: React.FC<SymbolProps> = (props) => {
  const midX = GEO.columnWidth / 2;
  const halfW = GEO.contactWidth / 2;
  const halfH = GEO.contactHeight / 2;
  return (
    <G shapeRendering="geometricPrecision">
      <LadderContactNO {...props} />
      <Line x1={midX - halfW - 1} y1={GEO.centerY + halfH - 2} x2={midX + halfW + 1} y2={GEO.centerY - halfH + 2} stroke={GEO.colorSymbolMuted} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
    </G>
  );
};

export const LadderCoil: React.FC<SymbolProps & { type: 'OTE' | 'OTL' | 'OTU' }> = ({ powerIn, active, type }) => {
  const midX = GEO.columnWidth / 2;
  const halfW = GEO.coilWidth / 2;
  const halfH = GEO.coilHeight / 2;
  const symbolColor = active ? GEO.colorPowerOn : GEO.colorSymbolMuted;
  const path = `M ${midX - halfW / 2} ${GEO.centerY - halfH / 2} Q ${midX - halfW} ${GEO.centerY} ${midX - halfW / 2} ${GEO.centerY + halfH / 2} M ${midX + halfW / 2} ${GEO.centerY - halfH / 2} Q ${midX + halfW} ${GEO.centerY} ${midX + halfW / 2} ${GEO.centerY + halfH / 2}`;

  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      {powerIn && <Line x1={0} y1={GEO.centerY} x2={midX - halfW / 2 - 2} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      <Rect x={midX - halfW / 2 - 5} y={GEO.centerY - halfH / 2 - 5} width={halfW + 10} height={halfH + 10} rx={7} fill={active ? GEO.colorElementPlateActive : GEO.colorElementPlate} />
      <Path d={path} fill="none" stroke={symbolColor} strokeWidth={2.1} vectorEffect="non-scaling-stroke" />
      {type === 'OTL' && <SvgText x={midX} y={GEO.centerY + 4} fontSize={10} fontWeight="900" textAnchor="middle" fill={symbolColor}>S</SvgText>}
      {type === 'OTU' && <SvgText x={midX} y={GEO.centerY + 4} fontSize={10} fontWeight="900" textAnchor="middle" fill={symbolColor}>R</SvgText>}
    </G>
  );
};

export const CompareContactSvg: React.FC<SymbolProps & { operator: string, label: string, value: string }> = ({ powerIn, powerOut, operator, label, value }) => {
  const midX = GEO.columnWidth / 2;
  const startX = midX - GEO.compareWidth / 2;
  const startY = GEO.centerY - GEO.compareHeight / 2;
  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      {powerIn && <Line x1={0} y1={GEO.centerY} x2={startX} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      {powerOut && <Line x1={startX + GEO.compareWidth} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} vectorEffect="non-scaling-stroke" />}
      
      <SvgText x={midX} y={18} fontSize={10} fontWeight="800" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{label}</SvgText>
      <Rect x={startX - 4} y={startY - 4} width={GEO.compareWidth + 8} height={GEO.compareHeight + 8} rx={8} fill={GEO.colorElementPlate} />
      <Rect x={startX} y={startY} width={GEO.compareWidth} height={GEO.compareHeight} rx={5} fill={GEO.colorBlockBody} stroke={GEO.colorSymbolMuted} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      <SvgText x={midX} y={GEO.centerY + 5} fontSize={11} fontWeight="900" textAnchor="middle" fill={GEO.colorText}>{operator}</SvgText>
      <SvgText x={midX} y={GEO.centerY + 31} fontSize={10} fontWeight="800" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{value}</SvgText>
    </G>
  );
};

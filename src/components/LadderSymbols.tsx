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
  <Line x1={0} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={color} strokeWidth={GEO.lineWidth} strokeOpacity={0.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
);

export const LadderContactNO: React.FC<SymbolProps> = ({ powerIn, powerOut, active }) => {
  const midX = GEO.columnWidth / 2;
  const halfW = GEO.contactWidth / 2;
  const halfH = GEO.contactHeight / 2;
  const symbolColor = active ? GEO.colorPowerOn : GEO.colorSymbolMuted;

  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      
      {/* Filament Glow for Power Lines */}
      {powerIn && (
        <G>
          <Line x1={0} y1={GEO.centerY} x2={midX - halfW} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth + 2} strokeOpacity={0.15} strokeLinecap="round" />
          <Line x1={0} y1={GEO.centerY} x2={midX - halfW} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </G>
      )}
      {powerOut && (
        <G>
          <Line x1={midX + halfW} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth + 2} strokeOpacity={0.15} strokeLinecap="round" />
          <Line x1={midX + halfW} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </G>
      )}
      
      <Rect x={midX - halfW - 6} y={GEO.centerY - halfH - 4} width={GEO.contactWidth + 12} height={GEO.contactHeight + 8} rx={8} fill={active ? GEO.colorElementPlateActive : GEO.colorElementPlate} />
      
      {/* Crisp Contact Lines */}
      <Line x1={midX - halfW} y1={GEO.centerY - halfH} x2={midX - halfW} y2={GEO.centerY + halfH} stroke={symbolColor} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <Line x1={midX + halfW} y1={GEO.centerY - halfH} x2={midX + halfW} y2={GEO.centerY + halfH} stroke={symbolColor} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      
      {active && (
        <Line x1={midX - halfW} y1={GEO.centerY} x2={midX + halfW} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      )}
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
      {/* Sharp Diagonal Slash */}
      <Line x1={midX - halfW - 3} y1={GEO.centerY + halfH - 2} x2={midX + halfW + 3} y2={GEO.centerY - halfH + 2} stroke={symbolColor} strokeWidth={3.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </G>
  );
};

export const LadderCoil: React.FC<SymbolProps & { type: 'OTE' | 'OTL' | 'OTU' }> = ({ powerIn, active, type }) => {
  const midX = GEO.columnWidth / 2;
  const halfW = GEO.coilWidth / 2;
  const halfH = GEO.coilHeight / 2;
  const symbolColor = active ? GEO.colorPowerOn : GEO.colorSymbolMuted;
  
  // Technical curvature for professional look
  const path = `M ${midX - halfW / 2 - 4} ${GEO.centerY - halfH / 2} Q ${midX - halfW - 4} ${GEO.centerY} ${midX - halfW / 2 - 4} ${GEO.centerY + halfH / 2} M ${midX + halfW / 2 + 4} ${GEO.centerY - halfH / 2} Q ${midX + halfW + 4} ${GEO.centerY} ${midX + halfW / 2 + 4} ${GEO.centerY + halfH / 2}`;

  return (
    <G shapeRendering="geometricPrecision">
      <BaseWire color={GEO.colorPowerOff} />
      
      {powerIn && (
        <G>
          <Line x1={0} y1={GEO.centerY} x2={midX - halfW / 2 - 10} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth + 2} strokeOpacity={0.15} strokeLinecap="round" />
          <Line x1={0} y1={GEO.centerY} x2={midX - halfW / 2 - 10} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </G>
      )}
      
      <Rect x={midX - halfW - 4} y={GEO.centerY - halfH - 4} width={GEO.coilWidth + 8} height={GEO.coilHeight + 8} rx={14} fill={active ? GEO.colorElementPlateActive : GEO.colorElementPlate} />
      <Path d={path} fill="none" stroke={symbolColor} strokeWidth={3.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      
      {type === 'OTL' && <SvgText x={midX} y={GEO.centerY + 8} fontSize={16} fontWeight="900" textAnchor="middle" fill={symbolColor} fontFamily="monospace">S</SvgText>}
      {type === 'OTU' && <SvgText x={midX} y={GEO.centerY + 8} fontSize={16} fontWeight="900" textAnchor="middle" fill={symbolColor} fontFamily="monospace">R</SvgText>}
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
      
      {powerIn && (
        <G>
          <Line x1={0} y1={GEO.centerY} x2={startX - 6} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth + 2} strokeOpacity={0.15} strokeLinecap="round" />
          <Line x1={0} y1={GEO.centerY} x2={startX - 6} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </G>
      )}
      {powerOut && (
        <G>
          <Line x1={startX + GEO.compareWidth + 6} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth + 2} strokeOpacity={0.15} strokeLinecap="round" />
          <Line x1={startX + GEO.compareWidth + 6} y1={GEO.centerY} x2={GEO.columnWidth} y2={GEO.centerY} stroke={GEO.colorPowerOn} strokeWidth={GEO.activeLineWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </G>
      )}
      
      {/* Precision Label above */}
      <SvgText x={midX} y={16} fontSize={13} fontWeight="900" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{label}</SvgText>
      
      {/* Sharp Industrial Depth */}
      <Rect x={startX - 4} y={startY + 4} width={GEO.compareWidth + 8} height={GEO.compareHeight + 6} rx={11} fill="rgba(31, 41, 55, 0.1)" />
      
      {/* Component Chassis */}
      <Rect x={startX - 5} y={startY - 5} width={GEO.compareWidth + 10} height={GEO.compareHeight + 10} rx={12} fill={powerIn ? GEO.colorElementPlateActive : GEO.colorElementPlate} stroke={powerIn ? 'rgba(46, 164, 97, 0.45)' : 'rgba(156, 163, 175, 0.45)'} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
      
      {/* Technical Operator Slot */}
      <Rect x={startX} y={startY} width={GEO.compareWidth} height={GEO.compareHeight} rx={8} fill={GEO.colorBlockBody} stroke={GEO.colorSymbolMuted} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      <SvgText x={midX} y={GEO.centerY + 8} fontSize={16} fontWeight="900" textAnchor="middle" fill={GEO.colorText}>{operator}</SvgText>
      
      {/* Parameter Value below */}
      <SvgText x={midX} y={GEO.centerY + 42} fontSize={13} fontWeight="900" textAnchor="middle" fill={GEO.colorSymbolMuted} fontFamily="monospace">{value}</SvgText>
    </G>
  );
};

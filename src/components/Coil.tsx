import React from 'react';
import { G, Line, Path, Text as SvgText } from 'react-native-svg';
import { LADDER_GEOMETRY as GEO } from '../consts/ladderGeometry';

export interface CoilProps {
  x: number;
  y: number;
  tag: string;
}

const WIRE_COLOR = '#404040';
const TEXT_COLOR = '#A3A3A3';
const WIRE_WIDTH = 2;
const BLOCK_WIDTH = 80;
const BLOCK_HEIGHT = 60;

export const Coil: React.FC<CoilProps> = React.memo(({ x, y, tag }) => {
  const midX = BLOCK_WIDTH / 2;
  const midY = BLOCK_HEIGHT / 2;
  
  // Geometria das curvas da bobina
  const arcOffset = 8; 
  const arcControlOffset = 18; 
  const arcHeight = 16;
  const wireMeetX = midX - 13; // Ponto exato onde o fio se choca com o abaulamento da curva

  // Path SVG para os parênteses
  const leftCurve = `M ${midX - arcOffset} ${midY - arcHeight} Q ${midX - arcControlOffset} ${midY} ${midX - arcOffset} ${midY + arcHeight}`;
  const rightCurve = `M ${midX + arcOffset} ${midY - arcHeight} Q ${midX + arcControlOffset} ${midY} ${midX + arcOffset} ${midY + arcHeight}`;

  return (
    <G x={x} y={y}>
      {/* Fio de entrada */}
      <Line x1={0} y1={midY} x2={wireMeetX} y2={midY} stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      
      {/* Fio de saída */}
      <Line x1={BLOCK_WIDTH - wireMeetX} y1={midY} x2={BLOCK_WIDTH} y2={midY} stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      
      {/* Semicírculos (Parênteses) */}
      <Path d={leftCurve} fill="none" stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      <Path d={rightCurve} fill="none" stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      
      {/* Tag de endereçamento */}
      <SvgText 
        x={midX} 
        y={midY - arcHeight - 8} 
        fontSize={12} 
        fill={TEXT_COLOR} 
        textAnchor="middle" 
        fontWeight="700"
      >
        {tag}
      </SvgText>
    </G>
  );
});
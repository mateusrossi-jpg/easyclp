import React from 'react';
import { G, Line, Text as SvgText } from 'react-native-svg';
import { LADDER_GEOMETRY as GEO } from '../consts/ladderGeometry';

export interface ContactNOProps {
  x: number;
  y: number;
  tag: string;
}

const WIRE_COLOR = '#404040';
const TEXT_COLOR = '#A3A3A3';
const WIRE_WIDTH = 2;
const BLOCK_WIDTH = 80;
const BLOCK_HEIGHT = 60;

export const ContactNO: React.FC<ContactNOProps> = React.memo(({ x, y, tag }) => {
  const midX = BLOCK_WIDTH / 2;
  const midY = BLOCK_HEIGHT / 2;
  const gap = 10;
  const lineHalfHeight = 12;

  return (
    <G x={x} y={y}>
      {/* Fio de entrada */}
      <Line x1={0} y1={midY} x2={midX - gap} y2={midY} stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      
      {/* Fio de saída */}
      <Line x1={midX + gap} y1={midY} x2={BLOCK_WIDTH} y2={midY} stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      
      {/* Hastes verticais do Contato */}
      <Line x1={midX - gap} y1={midY - lineHalfHeight} x2={midX - gap} y2={midY + lineHalfHeight} stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      <Line x1={midX + gap} y1={midY - lineHalfHeight} x2={midX + gap} y2={midY + lineHalfHeight} stroke={WIRE_COLOR} strokeWidth={WIRE_WIDTH} />
      
      {/* Tag de endereçamento */}
      <SvgText 
        x={midX} 
        y={midY - lineHalfHeight - 8} 
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
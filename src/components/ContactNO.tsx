import React from 'react';
import { G, Line, Text as SvgText } from 'react-native-svg';
import { GEO } from './geometry';

export interface ContactNOProps {
  x: number;
  y: number;
  tag: string;
}

export const ContactNO: React.FC<ContactNOProps> = React.memo(({ x, y, tag }) => {
  const midX = GEO.BLOCK_WIDTH / 2;
  const midY = GEO.BLOCK_HEIGHT / 2;
  const gap = 10;
  const lineHalfHeight = 12;

  return (
    <G x={x} y={y}>
      {/* Fio de entrada */}
      <Line x1={0} y1={midY} x2={midX - gap} y2={midY} stroke={GEO.WIRE_COLOR} strokeWidth={GEO.WIRE_WIDTH} />
      
      {/* Fio de saída */}
      <Line x1={midX + gap} y1={midY} x2={GEO.BLOCK_WIDTH} y2={midY} stroke={GEO.WIRE_COLOR} strokeWidth={GEO.WIRE_WIDTH} />
      
      {/* Hastes verticais do Contato */}
      <Line x1={midX - gap} y1={midY - lineHalfHeight} x2={midX - gap} y2={midY + lineHalfHeight} stroke={GEO.WIRE_COLOR} strokeWidth={GEO.WIRE_WIDTH} />
      <Line x1={midX + gap} y1={midY - lineHalfHeight} x2={midX + gap} y2={midY + lineHalfHeight} stroke={GEO.WIRE_COLOR} strokeWidth={GEO.WIRE_WIDTH} />
      
      {/* Tag de endereçamento */}
      <SvgText 
        x={midX} 
        y={midY - lineHalfHeight - 8} 
        fontSize={12} 
        fill={GEO.TEXT_COLOR} 
        textAnchor="middle" 
        fontWeight="700"
      >
        {tag}
      </SvgText>
    </G>
  );
});
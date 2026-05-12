import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { useLadderStore } from '../store/useLadderStore';
import { ElementType, LadderElement as LadderElementType } from '../types';

/**
 * LADDER GEOMETRY CONSTANTS
 */
const CELL_WIDTH = 60;
const CELL_HEIGHT = 60;
const CENTER_Y = 30;
const LINE_WIDTH = 1.5;

const CONTACT_SYMBOL_WIDTH = 12; // 24 total (12 left, 12 right of center)
const COIL_SYMBOL_WIDTH = 10;
const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 52;

const POWER_ON = '#4CAF50';
const POWER_OFF = '#000000';
const SYMBOL_COLOR = '#000000';
const TEXT_COLOR = '#000000';
const BLOCK_HEADER_BG = '#000000';
const BLOCK_BODY_BG = '#F0F0F0';

export const ElementSymbol = ({ type, powerIn, powerOut, value, isInsertTarget }: { type: ElementType, powerIn?: boolean, powerOut?: boolean, value?: boolean, isInsertTarget?: boolean }) => {
  const flowInColor = powerIn ? POWER_ON : POWER_OFF;
  const flowOutColor = powerOut ? POWER_ON : POWER_OFF;

  const renderLine = (x1: number, y1: number, x2: number, y2: number, color: string, width = LINE_WIDTH) => (
    <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />
  );

  if (type === 'EMPTY') {
    return (
      <Svg width={CELL_WIDTH} height={CELL_HEIGHT} viewBox={`0 0 ${CELL_WIDTH} ${CELL_HEIGHT}`}>
        {renderLine(0, CENTER_Y, CELL_WIDTH, CENTER_Y, flowInColor)}
      </Svg>
    );
  }

  if (type === 'XIC' || type === 'XIO') {
    return (
      <View style={styles.symbolContainer}>
        <Svg width={CELL_WIDTH} height={CELL_HEIGHT} viewBox={`0 0 ${CELL_WIDTH} ${CELL_HEIGHT}`}>
          {renderLine(0, CENTER_Y, 24, CENTER_Y, flowInColor)}
          {renderLine(36, CELL_WIDTH, CENTER_Y, CELL_WIDTH, flowOutColor)}
          {/* Vertical Bars */}
          {renderLine(24, 18, 24, 42, SYMBOL_COLOR, 2)}
          {renderLine(36, 18, 36, 42, SYMBOL_COLOR, 2)}
          {type === 'XIO' && renderLine(22, 40, 38, 20, SYMBOL_COLOR, 2)}
          {/* Active flow bridging the gap */}
          {((type === 'XIC' && value) || (type === 'XIO' && !value)) && renderLine(24, CENTER_Y, 36, CENTER_Y, POWER_ON, 2)}
        </Svg>
      </View>
    );
  }

  if (type === 'OTE' || type === 'OTL' || type === 'OTU') {
    const activeColor = value ? POWER_ON : SYMBOL_COLOR;
    return (
      <View style={styles.symbolContainer}>
        <Svg width={CELL_WIDTH} height={CELL_HEIGHT} viewBox={`0 0 ${CELL_WIDTH} ${CELL_HEIGHT}`}>
          {renderLine(0, CENTER_Y, 22, CENTER_Y, flowInColor)}
          {renderLine(38, CELL_WIDTH, CENTER_Y, CELL_WIDTH, flowOutColor)}
          {/* Parentheses */}
          <Path d="M 22 18 Q 14 30 22 42" fill="none" stroke={activeColor} strokeWidth={2} />
          <Path d="M 38 18 Q 46 30 38 42" fill="none" stroke={activeColor} strokeWidth={2} />
        </Svg>
        {type === 'OTL' && <Text style={[styles.coilLabel, { color: activeColor }]}>S</Text>}
        {type === 'OTU' && <Text style={[styles.coilLabel, { color: activeColor }]}>R</Text>}
      </View>
    );
  }

  if (type === 'GEQ' || type === 'LEQ') {
    return (
      <View style={styles.symbolContainer}>
        <Svg width={CELL_WIDTH} height={CELL_HEIGHT} viewBox={`0 0 ${CELL_WIDTH} ${CELL_HEIGHT}`}>
          {renderLine(0, CENTER_Y, 20, CENTER_Y, flowInColor)}
          {renderLine(40, CELL_WIDTH, CENTER_Y, CELL_WIDTH, flowOutColor)}
          <Rect x="20" y="18" width="20" height="24" fill={BLOCK_BODY_BG} stroke={SYMBOL_COLOR} strokeWidth={1} />
        </Svg>
        <View style={styles.cmpLabelOverlay}>
          <Text style={styles.cmpText}>{type === 'GEQ' ? '>=' : '<='}</Text>
        </View>
      </View>
    );
  }

  if (type === 'TON' || type === 'CTU') {
    return (
      <View style={[styles.symbolContainer, { width: BLOCK_WIDTH }]}>
        <Svg width={BLOCK_WIDTH} height={CELL_HEIGHT} viewBox={`0 0 ${BLOCK_WIDTH} ${CELL_HEIGHT}`}>
          {renderLine(0, CENTER_Y, 10, CENTER_Y, flowInColor)}
          {renderLine(50, BLOCK_WIDTH, CENTER_Y, BLOCK_WIDTH, flowOutColor)}
          <Rect x="10" y="12" width="40" height="36" fill={BLOCK_BODY_BG} stroke={SYMBOL_COLOR} strokeWidth={1} />
          <Rect x="10" y="12" width="40" height="12" fill={BLOCK_HEADER_BG} />
        </Svg>
        <View style={styles.blockOverlay}>
          <Text style={styles.blockTitle}>{type}</Text>
          <View style={styles.blockInternal}>
            <View style={styles.pinsLeft}>
              <Text style={styles.pinText}>{type === 'TON' ? 'IN' : 'CU'}</Text>
              <Text style={styles.pinText}>{type === 'TON' ? 'PT' : 'R'}</Text>
            </View>
            <View style={styles.pinsRight}>
              <Text style={styles.pinText}>Q</Text>
              <Text style={styles.pinText}>{type === 'TON' ? 'ET' : 'CV'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return null;
};

const LadderElementComponent = ({ element, isInsertTarget = false, onPress }: { element: LadderElementType; isInsertTarget?: boolean; onPress: any }) => {
  const variables = useLadderStore(state => state.variables);
  const variable = variables[element.address];
  const value = variable?.value;
  const isConfigured = element.type !== 'EMPTY';

  const isPowered = typeof value === 'boolean' ? value : (value as any)?.dn;

  // For TON/CTU, show accumulated values next to the block
  const accValue = (typeof value === 'object' && value !== null) ? (value as any).acc : null;
  const preValue = (typeof value === 'object' && value !== null) ? (value as any).pre : null;

  return (
    <TouchableOpacity
      style={[styles.container, (element.type === 'TON' || element.type === 'CTU') ? styles.wideCell : styles.normalCell]}
      onPress={() => onPress(element.id, element.type)}
      activeOpacity={0.8}
    >
      {isConfigured && (
        <View style={styles.labelContainer}>
          <Text style={styles.addressText}>
            {element.address}
          </Text>
        </View>
      )}

      <ElementSymbol
        type={element.type}
        powerIn={element.powerIn}
        powerOut={element.powerOut}
        value={isPowered}
        isInsertTarget={isInsertTarget}
      />

      {accValue !== null && (
        <View style={styles.paramsContainer}>
          <Text style={styles.paramText}>Acc: {accValue}</Text>
          <Text style={styles.paramText}>Pre: {preValue}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  normalCell: {
    width: CELL_WIDTH,
  },
  wideCell: {
    width: 100, // Enough space for block + params
  },
  symbolContainer: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: -50,
    right: -50,
    alignItems: 'center',
    zIndex: 20,
  },
  addressText: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_COLOR,
    fontFamily: 'monospace',
    textAlign: 'center',
    // white background to avoid crossing lines
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  coilLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '900',
    top: 24,
    width: '100%',
    textAlign: 'center',
  },
  cmpLabelOverlay: {
    position: 'absolute',
    width: 20,
    height: 24,
    top: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cmpText: {
    fontSize: 9,
    fontWeight: '900',
    color: TEXT_COLOR,
  },
  blockOverlay: {
    position: 'absolute',
    width: 40,
    height: 36,
    top: 12,
    left: 10,
  },
  blockTitle: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    height: 12,
    lineHeight: 12,
  },
  blockInternal: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 1,
  },
  pinsLeft: {
    justifyContent: 'space-around',
  },
  pinsRight: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  pinText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#333333',
  },
  paramsContainer: {
    position: 'absolute',
    right: 0,
    top: 15,
    width: 45,
    justifyContent: 'center',
  },
  paramText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'monospace',
  }
});

export const LadderElement = React.memo(LadderElementComponent, (prev, next) => {
  return (
    prev.element.type === next.element.type &&
    prev.element.powerIn === next.element.powerIn &&
    prev.element.powerOut === next.element.powerOut &&
    prev.element.address === next.element.address
  );
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LadderElement } from './LadderElement';
import { useLadderStore } from '../store/useLadderStore';
import { Rung, ElementType } from '../types';

const RUNG_HEIGHT = 60;
const CENTER_Y = 30;
const RAIL_WIDTH = 4;
const COIL_TYPES: ElementType[] = ['OTE', 'OTL', 'OTU'];

interface RungCanvasProps {
  rung: Rung;
  index: number;
}

export const RungCanvas: React.FC<RungCanvasProps> = ({ rung, index }) => {
  const elements = useLadderStore(state => state.elements);
  const isSimulating = useLadderStore(state => state.isSimulating);
  const setSelectedElementId = useLadderStore(state => state.setEditingElementId);

  // Group elements by column
  const columnData = React.useMemo(() => {
    const cols: Record<number, string[]> = {};
    rung.elementIds.forEach(id => {
      const el = elements[id];
      if (!cols[el.column]) cols[el.column] = [];
      cols[el.column].push(id);
    });
    
    const sortedCols = Object.entries(cols).sort(([a], [b]) => Number(a) - Number(b));
    
    // Separate logic columns from coil columns
    const logicCols = sortedCols.filter(([_, ids]) => !ids.some(id => COIL_TYPES.includes(elements[id].type)));
    const coilCols = sortedCols.filter(([_, ids]) => ids.some(id => COIL_TYPES.includes(elements[id].type)));
    
    return { logicCols, coilCols };
  }, [rung.elementIds, elements]);

  const handleElementPress = (id: string) => {
    if (isSimulating) return;
    setSelectedElementId(id);
  };

  const maxBranches = Math.max(...rung.elementIds.map(id => elements[id].branchIndex || 0)) + 1;
  const totalHeight = maxBranches * RUNG_HEIGHT;

  const renderColumn = (colIdx: string, ids: string[]) => {
    const hasParallel = ids.length > 1;
    return (
      <View key={colIdx} style={styles.columnWrapper}>
        {hasParallel && (
          <View style={[styles.parallelJoiner, { height: (ids.length - 1) * RUNG_HEIGHT }]}>
            <View style={styles.vLineLeft} />
            <View style={styles.vLineRight} />
          </View>
        )}
        {ids.map(id => (
          <View key={id} style={styles.elementCell}>
            <LadderElement element={elements[id]} onPress={handleElementPress} />
          </View>
        ))}
      </View>
    );
  };

  // Determine flow color for the flexible wire
  const lastLogicElId = columnData.logicCols[columnData.logicCols.length - 1]?.[1][0];
  const flowColor = lastLogicElId && elements[lastLogicElId]?.powerOut ? '#4CAF50' : '#000000';

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      <View style={[styles.railLeft, { height: totalHeight }]} />
      <View style={[styles.railRight, { height: totalHeight }]} />

      <View style={styles.contentRow}>
        <View style={styles.numberContainer}>
          <Text style={styles.rungNumber}>{index}</Text>
        </View>

        <View style={styles.ladderArea}>
          <View style={styles.logicSection}>
            {columnData.logicCols.map(([colIdx, ids]) => renderColumn(colIdx, ids))}
          </View>

          {/* Flexible Spacer Wire */}
          <View style={styles.flexWireContainer}>
            <View style={[styles.flexWire, { backgroundColor: flowColor }]} />
          </View>

          <View style={styles.coilsSection}>
            {columnData.coilCols.map(([colIdx, ids]) => renderColumn(colIdx, ids))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  railLeft: {
    position: 'absolute',
    left: 40,
    width: RAIL_WIDTH,
    backgroundColor: '#4CAF50',
    zIndex: 35,
  },
  railRight: {
    position: 'absolute',
    right: 0,
    width: RAIL_WIDTH,
    backgroundColor: '#000000',
    zIndex: 35,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  numberContainer: {
    width: 40,
    height: RUNG_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rungNumber: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DDD',
    fontFamily: 'monospace',
  },
  ladderArea: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 4,
    paddingRight: RAIL_WIDTH,
  },
  logicSection: {
    flexDirection: 'row',
  },
  flexWireContainer: {
    flex: 1,
    height: RUNG_HEIGHT,
    justifyContent: 'center',
  },
  flexWire: {
    height: 1.5,
    width: '100%',
  },
  coilsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  columnWrapper: {
    flexDirection: 'column',
    position: 'relative',
    minWidth: 60,
  },
  elementCell: {
    height: RUNG_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parallelJoiner: {
    position: 'absolute',
    top: CENTER_Y,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  vLineLeft: {
    position: 'absolute',
    left: 0,
    width: 1.5,
    height: '100%',
    backgroundColor: '#000000',
  },
  vLineRight: {
    position: 'absolute',
    right: 0,
    width: 1.5,
    height: '100%',
    backgroundColor: '#000000',
  }
});

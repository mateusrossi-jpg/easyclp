import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveTool, ElementType, NormalizedState, LadderElement, Rung, Variable, VariableType, DragState, DropZone } from '../types';
import { scanCycle } from '../engine/ladderEngine';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = '@easyclp_project_v1';

const triggerLayoutAnimation = () => {
  if (Platform.OS !== 'web') {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
};

// Trava de agrupamento para operações do Drag And Drop contarem como apenas 1 passo de histórico
let isHistoryBatching = false;

interface LadderStoreState extends NormalizedState {
  isSimulating: boolean;
  selectedTool: ActiveTool;
  scanIntervalId: NodeJS.Timeout | null;
  editingElementId: string | null;
  dragState: DragState;
  dropZones: DropZone[];
  highlightedRungId: string | null;
  
  past: NormalizedState[];
  future: NormalizedState[];
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;

  // Persistence
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<boolean>;
  resetWorkspace: () => void;

  // Actions
  setSelectedTool: (tool: ActiveTool) => void;
  setEditingElementId: (elementId: string | null) => void;
  setElement: (rungId: string, elementId: string, type: ElementType, address: string) => void;
  clearElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  toggleElementValue: (elementId: string) => void;
  setSimulating: (sim: boolean) => void;
  addRung: () => void;
  addRungAfter: (rungId: string) => void;
  removeRung: (rungId: string) => void;
  performScan: () => void;
  
  // Variable Actions
  addVariable: (id: string, type: VariableType, initialValue?: any) => void;
  updateVariable: (id: string, updates: Partial<Variable>) => void;
  removeVariable: (id: string) => void;
  createBranch: (elementId: string) => void;
  createBranchBetween: (rungId: string, startColumn: number, endColumn: number) => void;
  resizeBranch: (rungId: string, branchIndex: number, targetColumn: number, isStart: boolean) => void;
  setDragPosition: (x: number, y: number) => void;
  startDragging: (tool: ActiveTool, startX: number, startY: number, draggedBranch?: { rungId: string, branchIndex: number }, draggedElementId?: string) => void;
  setHoveredDropZone: (zoneId: string | null) => void;
  endDragging: () => void;
  setDropZones: (zones: DropZone[]) => void;
}

const createEmptyRung = (order: number): { rung: Rung, elements: Record<string, LadderElement> } => {
  const rungId = uuidv4();
  const elements: Record<string, LadderElement> = {};
  const elementIds: string[] = [];
  const columnCount = 12; // Standardized to 12

  for (let i = 0; i < columnCount; i++) {
    const elId = uuidv4();
    elements[elId] = {
      id: elId,
      type: 'EMPTY',
      address: '',
      powerIn: false,
      powerOut: false,
      column: i,
      branchIndex: 0,
      rungId,
    };
    elementIds.push(elId);
  }

  return {
    rung: { id: rungId, elementIds, isPowered: false, order },
    elements
  };
};

const resequenceRungs = (rungs: Record<string, Rung>) => {
  return Object.fromEntries(
    Object.values(rungs)
      .sort((a, b) => a.order - b.order)
      .map((rung, index) => [rung.id, { ...rung, order: index }])
  ) as Record<string, Rung>;
};

const getNextVariableId = (variables: Record<string, Variable>, prefix: string) => {
  let index = 1;
  while (variables[`${prefix}${index}`]) {
    index += 1;
  }
  return `${prefix}${index}`;
};

export const useLadderStore = create<LadderStoreState>((set, get) => {
  const initialVariables: Record<string, Variable> = {
    'X0': { id: 'X0', type: 'BOOL', value: false },
    'SystemOn': { id: 'SystemOn', type: 'BOOL', value: false },
    '2Clicks': { id: '2Clicks', type: 'BOOL', value: false },
    'Counter': { id: 'Counter', type: 'COUNTER', value: { acc: 0, pre: 2, dn: false } },
    'Counter.CV': { id: 'Counter.CV', type: 'NUMBER', value: 0 },
    'Counter.DN': { id: 'Counter.DN', type: 'BOOL', value: false },
    '2ClkTmr': { id: '2ClkTmr', type: 'TIMER', value: { acc: 0, pre: 5000, dn: false, tt: false } },
    'Cycle': { id: 'Cycle', type: 'TIMER', value: { acc: 0, pre: 16000, dn: false, tt: false } },
    'Cycle.Q': { id: 'Cycle.Q', type: 'BOOL', value: false },
    'Cycle.DN': { id: 'Cycle.DN', type: 'BOOL', value: false },
    'TimeOnZ0': { id: 'TimeOnZ0', type: 'NUMBER', value: 3000 },
    'TimeOnZ1': { id: 'TimeOnZ1', type: 'NUMBER', value: 7000 },
    'TimeOnZ2': { id: 'TimeOnZ2', type: 'NUMBER', value: 12000 },
    'Z0': { id: 'Z0', type: 'BOOL', value: false },
    'Z1': { id: 'Z1', type: 'BOOL', value: false },
    'Z2': { id: 'Z2', type: 'BOOL', value: false },
  };

  const rungs: Record<string, Rung> = {};
  const elements: Record<string, LadderElement> = {};

  const createPopulatedRung = (index: number, logic: { col: number, type: ElementType, address: string, branch?: number }[]) => {
    const rungId = `rung-${index}`;
    const elementIds: string[] = [];
    
    const cols = 12; // Standardized to 12
    for (let col = 0; col < cols; col++) {
      const configs = logic.filter(l => l.col === col);
      if (configs.length === 0) {
        const elId = `${rungId}-c${col}-b0`;
        elements[elId] = { id: elId, type: 'EMPTY', address: '', powerIn: false, powerOut: false, column: col, branchIndex: 0, rungId };
        elementIds.push(elId);
      } else {
        configs.forEach(config => {
          const elId = `${rungId}-c${col}-b${config.branch || 0}`;
          elements[elId] = {
            id: elId,
            type: config.type,
            address: config.address,
            powerIn: false,
            powerOut: false,
            column: col,
            branchIndex: config.branch || 0,
            rungId,
          };
          elementIds.push(elId);
        });
      }
    }
    
    rungs[rungId] = { id: rungId, elementIds, isPowered: false, order: index };
  };

  // Rung 0: X0 -> SystemOn (S)
  createPopulatedRung(0, [{ col: 0, type: 'XIC', address: 'X0' }, { col: 11, type: 'OTL', address: 'SystemOn' }]);
  // Rung 1: 2Clicks -> SystemOn (R)
  createPopulatedRung(1, [{ col: 0, type: 'XIC', address: '2Clicks' }, { col: 11, type: 'OTU', address: 'SystemOn' }]);
  // Rung 2: X0 -> CTU Counter -> 2Clicks
  createPopulatedRung(2, [{ col: 0, type: 'XIC', address: 'X0' }, { col: 5, type: 'CTU', address: 'Counter' }, { col: 11, type: 'OTE', address: '2Clicks' }]);
  // Rung 3: Counter.CV >= 0 -> TON 2ClkTmr PT=5000 -> Counter.R. Branch: SystemOn
  createPopulatedRung(3, [
    { col: 0, type: 'GEQ', address: 'Counter.CV >= 0' }, 
    { col: 0, type: 'XIC', address: 'SystemOn', branch: 1 },
    { col: 5, type: 'TON', address: '2ClkTmr' }, 
    { col: 5, type: 'EMPTY', address: '', branch: 1 },
    { col: 11, type: 'OTE', address: 'Counter.RES' }
  ]);
  // Rung 4: SystemOn + Cycle.Q/Cycle.DN NF -> TON Cycle PT=16000
  createPopulatedRung(4, [{ col: 0, type: 'XIC', address: 'SystemOn' }, { col: 1, type: 'XIO', address: 'Cycle.DN' }, { col: 11, type: 'TON', address: 'Cycle' }]);
  // Rung 5: Cycle.ET >= TimeOnZ0 -> Z0
  createPopulatedRung(5, [{ col: 0, type: 'GEQ', address: 'Cycle.ET >= TimeOnZ0' }, { col: 11, type: 'OTE', address: 'Z0' }]);
  // Rung 6: Cycle.ET >= TimeOnZ1 -> Z1
  createPopulatedRung(6, [{ col: 0, type: 'GEQ', address: 'Cycle.ET >= TimeOnZ1' }, { col: 11, type: 'OTE', address: 'Z1' }]);
  // Rung 7: Cycle.ET >= TimeOnZ2 -> Z2
  createPopulatedRung(7, [{ col: 0, type: 'GEQ', address: 'Cycle.ET >= TimeOnZ2' }, { col: 11, type: 'OTE', address: 'Z2' }]);

  return {
    rungs,
    elements,
    variables: initialVariables,
    isSimulating: false,
    selectedTool: null,
    scanIntervalId: null,
    editingElementId: null,
    dragState: {
      isDragging: false,
      tool: null,
      x: 0,
      y: 0,
      hoveredDropZoneId: null,
      draggedBranch: undefined,
      draggedElementId: undefined,
    },
    dropZones: [],
    highlightedRungId: null,
    past: [],
    future: [],

    setSelectedTool: (tool) => set({ selectedTool: tool }),
    setEditingElementId: (elementId) => set({ editingElementId: elementId }),

    saveHistory: () => {
      if (isHistoryBatching) return;
      set((state) => {
        const currentSnapshot = {
          rungs: state.rungs,
          elements: state.elements,
          variables: state.variables,
        };
        return {
          past: [...state.past, currentSnapshot].slice(-50), // Mantém apenas os últimos 50 passos
          future: [],
        };
      });
    },

    saveToStorage: async () => {
      const { rungs, elements, variables } = get();
      const payload = JSON.stringify({ rungs, elements, variables });
      await AsyncStorage.setItem(STORAGE_KEY, payload);
    },

    loadFromStorage: async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const { rungs, elements, variables } = JSON.parse(data);
          set({ rungs, elements, variables, past: [], future: [] });
          return true;
        }
      } catch (e) {
        console.error('Failed to load project', e);
      }
      return false;
    },

    resetWorkspace: () => {
      const { rung, elements } = createEmptyRung(0);
      set({
        rungs: { [rung.id]: rung },
        elements,
        variables: {},
        past: [],
        future: [],
        highlightedRungId: null,
        editingElementId: null,
        selectedTool: null,
      });
    },

    undo: () => {
      triggerLayoutAnimation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      set((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        const currentSnapshot = { rungs: state.rungs, elements: state.elements, variables: state.variables };
        
        return {
          ...previous,
          past: newPast,
          future: [currentSnapshot, ...state.future],
          highlightedRungId: null,
          editingElementId: null,
          selectedTool: null,
        };
      });
    },

    redo: () => {
      triggerLayoutAnimation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        const currentSnapshot = { rungs: state.rungs, elements: state.elements, variables: state.variables };
        
        return {
          ...next,
          past: [...state.past, currentSnapshot],
          future: newFuture,
          highlightedRungId: null,
          editingElementId: null,
          selectedTool: null,
        };
      });
    },

    setElement: (rungId, elementId, type, address) => {
      get().saveHistory();
      set((state) => {
        const nextVariables = { ...state.variables };
        const resolvedAddress = address || (
          type === 'TON' ? getNextVariableId(nextVariables, 'T') :
          type === 'CTU' ? getNextVariableId(nextVariables, 'C') :
          type === 'GEQ' ? `${getNextVariableId(nextVariables, 'Valor')} >= 0` :
          type === 'LEQ' ? `${getNextVariableId(nextVariables, 'Valor')} <= 0` :
          type === 'OTE' || type === 'OTL' || type === 'OTU' ? getNextVariableId(nextVariables, 'Y') :
          type === 'XIC' || type === 'XIO' ? getNextVariableId(nextVariables, 'X') :
          ''
        );
        const nextElements = { ...state.elements };
        nextElements[elementId] = {
          ...nextElements[elementId],
          type,
          address: resolvedAddress,
        };

        const variableAddress = (type === 'GEQ' || type === 'LEQ') ? resolvedAddress.split(' ')[0] : resolvedAddress;
        if (variableAddress && !nextVariables[variableAddress]) {
          let varType: VariableType = 'BOOL';
          let initialValue: any = false;

          if (type === 'TON') {
            varType = 'TIMER';
            initialValue = { acc: 0, pre: 1000, dn: false, tt: false };
          } else if (type === 'CTU') {
            varType = 'COUNTER';
            initialValue = { acc: 0, pre: 10, dn: false };
          } else if (type === 'BLOCK' || type === 'GEQ' || type === 'LEQ') {
            varType = 'NUMBER';
            initialValue = 0;
          }

          nextVariables[variableAddress] = { id: variableAddress, value: initialValue, type: varType };
        }

        return { elements: nextElements, variables: nextVariables };
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    clearElement: (elementId) => {
      triggerLayoutAnimation();
      const element = get().elements[elementId];
      if (!element) return;
      get().setElement(element.rungId, element.id, 'EMPTY', '');
    },

    duplicateElement: (elementId) => {
      get().saveHistory();
      set((state) => {
        const element = state.elements[elementId];
        if (!element || element.type === 'EMPTY') return state;

        const rung = state.rungs[element.rungId];
        if (!rung) return state;

        const candidates = rung.elementIds
          .map(id => state.elements[id])
          .filter(Boolean)
          .filter(candidate => (
            candidate.branchIndex === element.branchIndex &&
            candidate.column > element.column &&
            candidate.type === 'EMPTY'
          ))
          .sort((a, b) => a.column - b.column);

        const target = candidates[0];
        if (!target) return state;

        return {
          elements: {
            ...state.elements,
            [target.id]: {
              ...target,
              type: element.type,
              address: element.address,
            },
          },
        };
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    addVariable: (id, type, initialValue) => {
      get().saveHistory();
      set((state) => {
        const nextVariables = { ...state.variables };
        let val = initialValue;
        if (val === undefined) {
          if (type === 'BOOL') val = false;
          else if (type === 'NUMBER') val = 0;
          else if (type === 'TIMER') val = { acc: 0, pre: 1000, dn: false, tt: false };
          else if (type === 'COUNTER') val = { acc: 0, pre: 10, dn: false };
          else val = '';
        }
        nextVariables[id] = { id, type, value: val };
        return { variables: nextVariables };
      });
    },

    updateVariable: (id, updates) => {
      get().saveHistory();
      set((state) => {
        const nextVariables = { ...state.variables };
        if (nextVariables[id]) {
          nextVariables[id] = { ...nextVariables[id], ...updates };
        }
        return { variables: nextVariables };
      });
    },

    createBranch: (elementId) => {
      get().saveHistory();
      triggerLayoutAnimation();
      set((state) => {
        const element = state.elements[elementId];
        if (!element) return state;

        const rungId = element.rungId;
        const rung = state.rungs[rungId];
        if (!rung) return state;

        // Find existing branches in this rung
        const rungElements = rung.elementIds.map(id => state.elements[id]);
        const maxBranch = Math.max(...rungElements.map(e => e.branchIndex || 0));
        const nextBranch = maxBranch + 1;

        const newElements: Record<string, LadderElement> = {};
        const newElementIds: string[] = [];
        const columnCount = 12;

        for (let i = 0; i < columnCount; i++) {
          const elId = uuidv4();
          newElements[elId] = {
            id: elId,
            type: 'EMPTY',
            address: '',
            powerIn: false,
            powerOut: false,
            column: i,
            branchIndex: nextBranch,
            rungId,
          };
          newElementIds.push(elId);
        }

        return {
          elements: { ...state.elements, ...newElements },
          rungs: {
            ...state.rungs,
            [rungId]: {
              ...rung,
              elementIds: [...rung.elementIds, ...newElementIds],
            },
          },
        };
      });
    },

    createBranchBetween: (rungId, startColumn, endColumn) => {
      get().saveHistory();
      triggerLayoutAnimation();
      set((state) => {
        const rung = state.rungs[rungId];
        if (!rung) return state;

        const rungElements = rung.elementIds.map(id => state.elements[id]).filter(Boolean);
        const maxBranch = Math.max(...rungElements.map(e => e.branchIndex || 0));
        const nextBranch = maxBranch + 1;
        const start = Math.max(0, Math.min(startColumn, endColumn));
        const end = Math.max(start + 1, Math.max(startColumn, endColumn));
        const midpoint = Math.round((start + end) / 2);

        const newElements: Record<string, LadderElement> = {};
        const newElementIds: string[] = [];

        for (let col = start; col <= end; col++) {
          const elId = uuidv4();
          newElements[elId] = {
            id: elId,
            type: col === midpoint ? 'XIC' : 'EMPTY',
            address: col === midpoint ? '' : '',
            powerIn: false,
            powerOut: false,
            column: col,
            branchIndex: nextBranch,
            rungId,
          };
          newElementIds.push(elId);
        }

        return {
          elements: { ...state.elements, ...newElements },
          rungs: {
            ...state.rungs,
            [rungId]: {
              ...rung,
              elementIds: [...rung.elementIds, ...newElementIds],
            },
          },
        };
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    removeVariable: (id) => {
      get().saveHistory();
      set((state) => {
        const nextVariables = { ...state.variables };
        delete nextVariables[id];
        return { variables: nextVariables };
      });
    },

    toggleElementValue: (elementId) => {
      set((state) => {
        const element = state.elements[elementId];
        if (!element || !element.address) return state;

        const nextVariables = { ...state.variables };
        const variable = nextVariables[element.address];
        
        if (variable) {
          nextVariables[element.address] = {
            ...variable,
            value: !variable.value
          };
        }

        return { variables: nextVariables };
      });
    },

    performScan: () => {
      const state = get();
      const { nextState, newlyEnergizedCoils } = scanCycle({ 
        rungs: state.rungs, 
        elements: state.elements,
        variables: state.variables 
      });
      
      set({ 
        rungs: nextState.rungs, 
        elements: nextState.elements,
        variables: nextState.variables
      });
      
      if (newlyEnergizedCoils.length > 0) {
        // Haptic Sync: short pulse when output is activated
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },

    setSimulating: (sim) => {
      const { scanIntervalId, performScan } = get();
      if (sim) {
        if (!scanIntervalId) {
          const id = setInterval(performScan, 50);
          set({ isSimulating: true, scanIntervalId: id });
        }
      } else {
        if (scanIntervalId) {
          clearInterval(scanIntervalId);
          
          // Reset power states
          const nextElements = { ...get().elements };
          Object.keys(nextElements).forEach(k => {
            nextElements[k] = { ...nextElements[k], powerIn: false, powerOut: false };
          });
          const nextRungs = { ...get().rungs };
          Object.keys(nextRungs).forEach(k => {
            nextRungs[k] = { ...nextRungs[k], isPowered: false };
          });

          const nextVariables = { ...get().variables };
          Object.keys(nextElements).forEach(k => {
             const el = nextElements[k];
             if (el.address && nextVariables[el.address]) {
                if (el.type === 'OTE') {
                   nextVariables[el.address] = { ...nextVariables[el.address], value: false };
                } else if (el.type === 'TON') {
                   const oldVal = nextVariables[el.address].value as unknown as Record<string, unknown>;
                   nextVariables[el.address] = { 
                     ...nextVariables[el.address], 
                     value: { ...oldVal, pre: Number(oldVal.pre ?? 1000), acc: 0, dn: false, tt: false } 
                   };
                } else if (el.type === 'CTU') {
                   const oldVal = nextVariables[el.address].value as unknown as Record<string, unknown>;
                   nextVariables[el.address] = { 
                     ...nextVariables[el.address], 
                     value: { ...oldVal, pre: Number(oldVal.pre ?? 10), acc: 0, dn: false } 
                   };
                }
             }
          });

          set({ isSimulating: false, scanIntervalId: null, elements: nextElements, rungs: nextRungs, variables: nextVariables });
        }
      }
    },

    addRung: () => {
      get().saveHistory();
      triggerLayoutAnimation();
      
      const state = get();
      const order = Object.keys(state.rungs).length;
      const newRungData = createEmptyRung(order);
      
      set((state) => ({
        rungs: { ...state.rungs, [newRungData.rung.id]: newRungData.rung },
        elements: { ...state.elements, ...newRungData.elements },
        highlightedRungId: newRungData.rung.id,
      }));

      setTimeout(() => {
        if (get().highlightedRungId === newRungData.rung.id) {
          set({ highlightedRungId: null });
        }
      }, 1000);
    },

    addRungAfter: (rungId) => {
      get().saveHistory();
      triggerLayoutAnimation();
      
      const state = get();
      const anchorRung = state.rungs[rungId];
      if (!anchorRung) return;

      const newRungData = createEmptyRung(anchorRung.order + 1);
      const shiftedRungs = Object.fromEntries(
        Object.values(state.rungs).map(rung => [
          rung.id,
          rung.order > anchorRung.order ? { ...rung, order: rung.order + 1 } : rung,
        ])
      ) as Record<string, Rung>;

      set((state) => ({
        rungs: resequenceRungs({ ...shiftedRungs, [newRungData.rung.id]: newRungData.rung }),
        elements: { ...state.elements, ...newRungData.elements },
        highlightedRungId: newRungData.rung.id,
      }));

      setTimeout(() => {
        if (get().highlightedRungId === newRungData.rung.id) {
          set({ highlightedRungId: null });
        }
      }, 1000);
    },

    removeRung: (rungId) => {
      get().saveHistory();
      triggerLayoutAnimation();
      set((state) => {
        const nextRungs = { ...state.rungs };
        delete nextRungs[rungId];
        const nextElements = { ...state.elements };
        Object.keys(nextElements).forEach(k => {
          if (nextElements[k].rungId === rungId) delete nextElements[k];
        });
        return { rungs: resequenceRungs(nextRungs), elements: nextElements };
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },

    resizeBranch: (rungId, branchIndex, targetColumn, isStart) => {
      get().saveHistory();
      set((state) => {
        const rung = state.rungs[rungId];
        if (!rung) return state;

        const allRungElements = rung.elementIds.map(id => state.elements[id]).filter(Boolean);
        const branchElements = allRungElements.filter(e => e.branchIndex === branchIndex);
        if (branchElements.length === 0) return state;

        const columns = branchElements.map(e => e.column);
        let startCol = Math.min(...columns);
        let endCol = Math.max(...columns);

        if (isStart) {
          if (targetColumn >= endCol) return state;
          if (targetColumn > startCol) {
            const hasOccupied = branchElements.some(e => e.column >= startCol && e.column < targetColumn && e.type !== 'EMPTY');
            if (hasOccupied) return state; // Protege os blocos já desenhados
          }
          startCol = targetColumn;
        } else {
          if (targetColumn <= startCol) return state;
          if (targetColumn < endCol) {
            const hasOccupied = branchElements.some(e => e.column > targetColumn && e.column <= endCol && e.type !== 'EMPTY');
            if (hasOccupied) return state;
          }
          endCol = targetColumn;
        }

        const newElements = { ...state.elements };
        const newElementIds = [ ...rung.elementIds ];

        const existingBranchElements = branchElements.reduce((acc, el) => {
           acc[el.column] = el;
           return acc;
        }, {} as Record<number, LadderElement>);

        for (let col = startCol; col <= endCol; col++) {
           if (!existingBranchElements[col]) {
              const elId = uuidv4();
              newElements[elId] = { id: elId, type: 'EMPTY', address: '', powerIn: false, powerOut: false, column: col, branchIndex, rungId };
              newElementIds.push(elId);
           }
        }

        branchElements.forEach(el => {
           if (el.column < startCol || el.column > endCol) {
              delete newElements[el.id];
              const idx = newElementIds.indexOf(el.id);
              if (idx !== -1) newElementIds.splice(idx, 1);
           }
        });

        return { elements: newElements, rungs: { ...state.rungs, [rungId]: { ...rung, elementIds: newElementIds } } };
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    setDragPosition: (x, y) => set((state) => ({
      dragState: { ...state.dragState, x, y }
    })),

    startDragging: (tool, startX, startY, draggedBranch, draggedElementId) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      set((state) => ({
        dragState: { ...state.dragState, isDragging: true, tool, x: startX, y: startY, hoveredDropZoneId: null, draggedBranch, draggedElementId }
      }));
    },

    setHoveredDropZone: (zoneId) => set((state) => ({
      dragState: { ...state.dragState, hoveredDropZoneId: zoneId }
    })),

    setDropZones: (zones) => set({ dropZones: zones }),

    endDragging: () => {
      const state = get();
      const { tool, hoveredDropZoneId, draggedBranch, draggedElementId } = state.dragState;

      if (tool && hoveredDropZoneId) {
        triggerLayoutAnimation();
        
        // Batches multi-actions (like drag and drop moving) into a single history snapshot
        state.saveHistory();
        isHistoryBatching = true;
        
        try {
          if (hoveredDropZoneId === 'TRASH') {
            if (draggedElementId) {
              state.clearElement(draggedElementId);
            }
          } else if (tool === 'RUNG') {
            const rungId = state.elements[hoveredDropZoneId]?.rungId || hoveredDropZoneId;
            state.addRungAfter(rungId);
          } else if (tool === 'PARALLEL_BRANCH') {
            const element = state.elements[hoveredDropZoneId];
            const rungId = element ? element.rungId : hoveredDropZoneId;
            const rung = state.rungs[rungId];
  
            if (rung) {
              const rungElements = rung.elementIds.map(id => state.elements[id]).filter(Boolean);
              const getBranchEndColumn = (el: LadderElement) => {
                const candidates = rungElements
                  .filter(c => c.branchIndex === el.branchIndex && c.type !== 'EMPTY' && c.column > el.column)
                  .sort((a, b) => a.column - b.column);
                return candidates[0]?.column ?? Math.min(el.column + 2, 11);
              };
  
              if (element) {
                state.createBranchBetween(rungId, element.column, getBranchEndColumn(element));
              } else {
                const firstElement = rungElements.find(el => el.branchIndex === 0 && el.type !== 'EMPTY');
                const start = firstElement?.column ?? 0;
                const end = firstElement ? getBranchEndColumn(firstElement) : 2;
                state.createBranchBetween(rungId, start, end);
              }
            }
          } else if (tool === 'RESIZE_BRANCH_START' || tool === 'RESIZE_BRANCH_END') {
            const targetElement = state.elements[hoveredDropZoneId];
            if (targetElement && draggedBranch && targetElement.rungId === draggedBranch.rungId) {
              state.resizeBranch(draggedBranch.rungId, draggedBranch.branchIndex, targetElement.column, tool === 'RESIZE_BRANCH_START');
            }
          } else {
            const element = state.elements[hoveredDropZoneId];
            if (element && element.type === 'EMPTY') {
              if (draggedElementId) {
                const draggedEl = state.elements[draggedElementId];
                state.setElement(element.rungId, element.id, draggedEl.type, draggedEl.address);
                state.clearElement(draggedElementId);
              } else {
                state.setElement(element.rungId, element.id, tool as ElementType, '');
              }
            }
          }
        } finally {
          isHistoryBatching = false;
        }
      }

      set((state) => ({
        dragState: { ...state.dragState, isDragging: false, tool: null, hoveredDropZoneId: null, draggedBranch: undefined, draggedElementId: undefined }
      }));
    }
  };
});

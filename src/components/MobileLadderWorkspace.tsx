import React, { useCallback, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Copy, FolderDown, FolderUp, GitBranch, PenLine, Plus, RefreshCcw, Settings2, Trash2, X } from 'lucide-react-native';

import { ComponentMenu } from './ComponentMenu';
import { ElementEditorModal } from './ElementEditorModal';
import { LadderCanvas, LadderCanvasHandle } from './LadderCanvas';
import { DragOverlay } from './DragOverlay';
import { SimulationControls } from './SimulationControls';
import { TopActionBar } from './TopActionBar';
import { ProjectManager } from './ProjectManager';
import { useLadderStore } from '../store/useLadderStore';
import { ActiveTool, EditorInteractionMode, ElementType, LadderElement, WorkspaceMode } from '../types';
import { THEME_TOKENS } from '../consts/themeTokens';

const fullViewportHeight = '100dvh' as unknown as number;
const safeAreaTop = 'env(safe-area-inset-top)' as unknown as number;
const safeAreaBottom = 'env(safe-area-inset-bottom)' as unknown as number;

const formatVariableValue = (value: unknown) => {
  if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  if (typeof value === 'object' && value !== null) {
    const data = value as { acc?: number; pre?: number; dn?: boolean; tt?: boolean };
    const progress = typeof data.acc === 'number' && typeof data.pre === 'number'
      ? `${data.acc}/${data.pre}`
      : String(data.acc ?? data.dn ?? '-');
    if (data.dn) return `${progress} DN`;
    if (data.tt) return `${progress} TT`;
    return progress;
  }
  return '-';
};

const getVariableProgress = (value: unknown) => {
  if (typeof value !== 'object' || value === null) return null;
  const data = value as { acc?: number; pre?: number };
  if (typeof data.acc !== 'number' || typeof data.pre !== 'number' || data.pre <= 0) return null;
  return Math.max(0, Math.min(1, data.acc / data.pre));
};

const isDerivedVariable = (id: string) => /\.(DN|Q|CV|ET|ACC)$/i.test(id);

export const MobileLadderWorkspace = React.memo(() => {
  const canvasRef = React.useRef<LadderCanvasHandle>(null);
  const isSimulating = useLadderStore(state => state.isSimulating);
  const selectedTool = useLadderStore(state => state.selectedTool);
  const rungs = useLadderStore(state => state.rungs);
  const elements = useLadderStore(state => state.elements);
  const variables = useLadderStore(state => state.variables);
  const dragState = useLadderStore(state => state.dragState);
  const setSelectedTool = useLadderStore(state => state.setSelectedTool);
  const setEditingElementId = useLadderStore(state => state.setEditingElementId);
  const setElement = useLadderStore(state => state.setElement);
  const setSimulating = useLadderStore(state => state.setSimulating);
  const toggleElementValue = useLadderStore(state => state.toggleElementValue);
  const clearElement = useLadderStore(state => state.clearElement);
  const duplicateElement = useLadderStore(state => state.duplicateElement);
  const createBranchBetween = useLadderStore(state => state.createBranchBetween);
  const addRungAfter = useLadderStore(state => state.addRungAfter);
  const removeRung = useLadderStore(state => state.removeRung);
  const updateVariable = useLadderStore(state => state.updateVariable);
  const undo = useLadderStore(state => state.undo);
  const redo = useLadderStore(state => state.redo);
  const saveToStorage = useLadderStore(state => state.saveToStorage);
  const loadFromStorage = useLadderStore(state => state.loadFromStorage);
  const resetWorkspace = useLadderStore(state => state.resetWorkspace);
  const canUndo = useLadderStore(state => state.past.length > 0);
  const canRedo = useLadderStore(state => state.future.length > 0);

  const [componentMenuOpen, setComponentMenuOpen] = useState(false);
  const [variableDrawerOpen, setVariableDrawerOpen] = useState(false);
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);
  const [mode, setMode] = useState<WorkspaceMode>('edit');
  const [interactionMode, setInteractionMode] = useState<EditorInteractionMode>('idle');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedRungId, setSelectedRungId] = useState<string | null>(null);
  const [branchStartColumn, setBranchStartColumn] = useState<number | null>(null);

  React.useEffect(() => {
    loadFromStorage();
  }, []);

  const handleSave = useCallback(async () => {
    await saveToStorage();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [saveToStorage]);

  const handleOpenProjectManager = useCallback(() => {
    setVariableDrawerOpen(false);
    setProjectManagerOpen(true);
  }, []);

  const variableList = useMemo(() => {
    return Object.values(variables).sort((a, b) => a.id.localeCompare(b.id));
  }, [variables]);
  const variableGroups = useMemo(() => {
    const groupOrder = ['BOOL', 'TIMER', 'COUNTER', 'NUMBER', 'STRING'];
    return groupOrder
      .map(type => ({
        type,
        items: variableList.filter(variable => variable.type === type),
      }))
      .filter(group => group.items.length > 0);
  }, [variableList]);
  const activeSignalCount = useMemo(() => {
    return variableList.filter(variable => {
      const value = variable.value;
      if (value === true) return true;
      return typeof value === 'object' && value !== null && (
        ('dn' in value && value.dn === true) ||
        ('tt' in value && value.tt === true)
      );
    }).length;
  }, [variableList]);

  const activeTool = selectedTool;
  const rungCount = useMemo(() => Object.keys(rungs).length, [rungs]);
  const currentProjectName = useLadderStore(state => state.metadata?.name);

  const normalizeElementTool = useCallback((tool: ActiveTool): ElementType | null => {
    if (!tool || tool === 'RUNG' || tool === 'PARALLEL_BRANCH') return null;
    if (tool === 'RESIZE_BRANCH_START' || tool === 'RESIZE_BRANCH_END') return null;
    return tool === 'BOX' ? 'BLOCK' : tool;
  }, []);

  const getNextTag = useCallback((prefix: string) => {
    let index = 1;
    while (variables[`${prefix}${index}`]) {
      index += 1;
    }
    return `${prefix}${index}`;
  }, [variables]);

  const getDefaultAddress = useCallback((tool: ElementType) => {
    if (tool === 'TON') return getNextTag('T');
    if (tool === 'CTU') return getNextTag('C');
    if (tool === 'GEQ') return `${getNextTag('Valor')} >= 0`;
    if (tool === 'LEQ') return `${getNextTag('Valor')} <= 0`;
    if (tool === 'OTE' || tool === 'OTL' || tool === 'OTU') return getNextTag('Y');
    if (tool === 'XIC' || tool === 'XIO') return getNextTag('X');
    return '';
  }, [getNextTag]);

  const getRungElements = useCallback((rungId: string) => {
    const rung = Object.values(elements).filter(element => element.rungId === rungId);
    return rung.sort((a, b) => (a.branchIndex - b.branchIndex) || (a.column - b.column));
  }, [elements]);

  const getInsertionTarget = useCallback((element: LadderElement) => {
    if (element.type === 'EMPTY') return element;
    return getRungElements(element.rungId).find(candidate => (
      candidate.type === 'EMPTY' &&
      candidate.branchIndex === element.branchIndex &&
      candidate.column > element.column
    )) || null;
  }, [getRungElements]);

  const getBranchEndColumn = useCallback((element: LadderElement) => {
    const candidates = getRungElements(element.rungId)
      .filter(candidate => candidate.branchIndex === 0 && candidate.type !== 'EMPTY' && candidate.column > element.column)
      .sort((a, b) => a.column - b.column);
    return candidates[0]?.column ?? Math.min(element.column + 2, 11);
  }, [getRungElements]);

  const insertToolOnElement = useCallback((element: LadderElement, tool: Exclude<ActiveTool, null>) => {
    if (tool === 'RUNG') {
      addRungAfter(element.rungId);
      setSelectedTool(null);
      return;
    }

    if (tool === 'PARALLEL_BRANCH') {
      createBranchBetween(element.rungId, element.column, getBranchEndColumn(element));
      setSelectedTool(null);
      return;
    }

    const elementTool = normalizeElementTool(tool);
    const target = elementTool ? getInsertionTarget(element) : null;
    if (!elementTool || !target) return;

    setElement(target.rungId, target.id, elementTool, getDefaultAddress(elementTool));
    setSelectedElementId(target.id);
    setSelectedRungId(target.rungId);
    setEditingElementId(target.id);
    setSelectedTool(null);
  }, [addRungAfter, createBranchBetween, getBranchEndColumn, getDefaultAddress, getInsertionTarget, normalizeElementTool, setEditingElementId, setElement, setSelectedTool]);

  const insertToolOnRung = useCallback((rungId: string, tool: Exclude<ActiveTool, null>) => {
    if (tool === 'RUNG') {
      addRungAfter(rungId);
      setSelectedTool(null);
      return;
    }

    const rungElements = getRungElements(rungId);
    const firstEmpty = rungElements.find(element => element.branchIndex === 0 && element.type === 'EMPTY');
    const firstElement = rungElements.find(element => element.branchIndex === 0 && element.type !== 'EMPTY');

    if (tool === 'PARALLEL_BRANCH') {
      const start = firstElement?.column ?? 0;
      const end = firstElement ? getBranchEndColumn(firstElement) : 2;
      createBranchBetween(rungId, start, end);
      setSelectedTool(null);
      return;
    }

    const elementTool = normalizeElementTool(tool);
    if (!elementTool || !firstEmpty) return;

    setElement(firstEmpty.rungId, firstEmpty.id, elementTool, getDefaultAddress(elementTool));
    setSelectedElementId(firstEmpty.id);
    setSelectedRungId(firstEmpty.rungId);
    setEditingElementId(firstEmpty.id);
    setSelectedTool(null);
  }, [addRungAfter, createBranchBetween, getBranchEndColumn, getDefaultAddress, getRungElements, normalizeElementTool, setEditingElementId, setElement, setSelectedTool]);

  const handleSelectComponent = useCallback((type: Exclude<ActiveTool, null>) => {
    setSelectedTool(type);
    setComponentMenuOpen(false);
    setInteractionMode(type === 'PARALLEL_BRANCH' ? 'choosing-branch-start' : 'choosing-component');
  }, [setSelectedTool]);

  const handleCloseComponentMenu = useCallback(() => {
    setComponentMenuOpen(false);
    if (interactionMode === 'choosing-component') {
      setInteractionMode(selectedRungId ? 'selecting-rung' : 'idle');
    }
  }, [interactionMode, selectedRungId]);

  const handleModeChange = useCallback((nextMode: WorkspaceMode) => {
    setMode(nextMode);
    if (nextMode === 'edit') {
      setSimulating(false);
    }
  }, [setSimulating]);

  const handleToggleSimulation = useCallback(() => {
    const nextSimulating = !isSimulating;
    setMode('simulate');
    setSimulating(nextSimulating);
  }, [isSimulating, setSimulating]);

  const handleOpenComponentMenu = useCallback(() => {
    if (mode !== 'edit') return;
    setInteractionMode('choosing-component');
    setComponentMenuOpen(true);
  }, [mode]);

  const handleComponentFabPress = useCallback(() => {
    if (activeTool) {
      setSelectedTool(null);
      setInteractionMode(selectedRungId ? 'selecting-rung' : 'idle');
      return;
    }
    handleOpenComponentMenu();
  }, [activeTool, handleOpenComponentMenu, selectedRungId, setSelectedTool]);

  const handleRungPress = useCallback((rungId: string) => {
    if (mode !== 'edit') return;
    setSelectedRungId(rungId);
    setSelectedElementId(null);
    setBranchStartColumn(null);
    if (activeTool) {
      insertToolOnRung(rungId, activeTool);
      return;
    }
    setInteractionMode('selecting-rung');
  }, [activeTool, insertToolOnRung, mode]);

  const handleElementPress = useCallback((elementId: string) => {
    const element = elements[elementId];
    if (!element) return;

    if (mode === 'simulate') {
      const variable = variables[element.address];
      if ((element.type === 'XIC' || element.type === 'XIO') && variable?.type === 'BOOL') {
        toggleElementValue(element.id);
      }
      return;
    }

    setSelectedRungId(element.rungId);
    if (activeTool) {
      insertToolOnElement(element, activeTool);
      return;
    }

    if (element.type === 'EMPTY') {
      setSelectedElementId(null);
      if (interactionMode === 'choosing-component') {
        setEditingElementId(element.id);
      }
      return;
    }

    setSelectedElementId(element.id);
    setInteractionMode('idle');
  }, [activeTool, elements, insertToolOnElement, interactionMode, mode, setEditingElementId, toggleElementValue, variables]);

  const handleAddParallel = useCallback(() => {
    if (!selectedRungId) return;
    setSelectedElementId(null);
    setBranchStartColumn(null);
    setInteractionMode('choosing-branch-start');
  }, [selectedRungId]);

  const handleBranchPointPress = useCallback((column: number) => {
    if (!selectedRungId) return;

    if (interactionMode === 'choosing-branch-start') {
      setBranchStartColumn(column);
      setInteractionMode('choosing-branch-end');
      return;
    }

    if (interactionMode === 'choosing-branch-end' && branchStartColumn !== null && column !== branchStartColumn) {
      createBranchBetween(selectedRungId, branchStartColumn, column);
      setInteractionMode('selecting-rung');
      setBranchStartColumn(null);
    }
  }, [branchStartColumn, createBranchBetween, interactionMode, selectedRungId]);

  const handleEditSelected = useCallback(() => {
    if (!selectedElementId) return;
    setEditingElementId(selectedElementId);
  }, [selectedElementId, setEditingElementId]);

  const handleDuplicateSelected = useCallback(() => {
    if (!selectedElementId) return;
    duplicateElement(selectedElementId);
  }, [duplicateElement, selectedElementId]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedElementId) return;
    clearElement(selectedElementId);
    setSelectedElementId(null);
  }, [clearElement, selectedElementId]);

  const handleConfigureRung = useCallback(() => {
    setVariableDrawerOpen(true);
  }, []);

  const handleDeleteRung = useCallback(() => {
    if (!selectedRungId) return;
    removeRung(selectedRungId);
    setSelectedRungId(null);
  }, [selectedRungId, removeRung]);

  const activeToolLabel = activeTool === 'PARALLEL_BRANCH' ? 'Branch' : activeTool;
  const selectedElement = selectedElementId ? elements[selectedElementId] : null;
  const workspaceHint = useMemo(() => {
    if (mode === 'simulate') {
      return isSimulating ? 'Toque em contatos BOOL para alternar entradas' : 'Inicie para energizar a lógica';
    }
    if (interactionMode === 'choosing-branch-start') return 'Escolha o início do ramo paralelo';
    if (interactionMode === 'choosing-branch-end') return 'Escolha o fim do ramo paralelo';
    if (activeToolLabel) return `Toque na Ladder para inserir ${activeToolLabel}`;
    if (selectedElement) return `${selectedElement.type} selecionado`;
    if (selectedRungId) return 'Rung selecionada';
    return 'Toque em uma rung ou adicione componentes';
  }, [activeToolLabel, interactionMode, isSimulating, mode, selectedElement, selectedRungId]);

  const isHoveringTrash = dragState.hoveredDropZoneId === 'TRASH';
  const showTrashZone = dragState.isDragging && dragState.draggedElementId;
  const showRungMenu = mode === 'edit' && !activeTool && !!selectedRungId && !selectedElementId;
  const showElementMenu = mode === 'edit' && !activeTool && !!selectedElementId;
  const showWorkspaceHint = !showRungMenu && !showElementMenu;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ElementEditorModal />

      <View style={styles.screen}>
        <TopActionBar
          onOpenVariables={() => setVariableDrawerOpen(true)}
          onCenterView={() => canvasRef.current?.fitToScreen()}
          onResetZoom={() => canvasRef.current?.resetZoom()}
          isSimulating={isSimulating}
          onToggleSimulation={() => setSimulating(!isSimulating)}
          mode={mode}
          onModeChange={setMode}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          rungCount={rungCount}
          activeSignalCount={activeSignalCount}
          totalSignalCount={variableList.length}
          projectName={currentProjectName}
        />


        <View style={styles.canvasShell}>
          <LadderCanvas
            ref={canvasRef}
            mode={mode}
            selectedElementId={selectedElementId}
            selectedRungId={selectedRungId}
            interactionMode={interactionMode}
            branchStartColumn={branchStartColumn}
            activeTool={activeTool}
            onElementPress={handleElementPress}
            onRungPress={handleRungPress}
            onBranchPointPress={handleBranchPointPress}
          />
        </View>

      {!showTrashZone && (
        <>
          {showWorkspaceHint && (
            <View style={[
              styles.workspaceHint,
              (selectedElementId || selectedRungId || activeTool) && styles.workspaceHintActive,
              mode === 'simulate' && styles.workspaceHintSimulate,
            ]}>
              <View style={[
                styles.workspaceHintDot,
                (selectedElementId || selectedRungId || activeTool || isSimulating) && styles.workspaceHintDotActive,
              ]} />
              <Text style={styles.workspaceHintText} numberOfLines={1}>{workspaceHint}</Text>
            </View>
          )}

          {mode === 'edit' && (
            <TouchableOpacity
              style={[styles.componentFab, activeTool && styles.componentFabCancel]}
              activeOpacity={0.78}
              onPress={handleComponentFabPress}
            >
              {activeTool ? <X size={21} color="#FFFFFF" strokeWidth={2.5} /> : <Plus size={22} color="#FFFFFF" strokeWidth={2.4} />}
              <Text style={styles.componentFabText} numberOfLines={1}>
                {activeToolLabel ? `Cancelar ${activeToolLabel}` : 'Componentes'}
              </Text>
            </TouchableOpacity>
          )}

          {mode === 'simulate' && (
            <SimulationControls
              isSimulating={isSimulating}
              mode={mode}
              onToggle={handleToggleSimulation}
              activeSignalCount={activeSignalCount}
              totalSignalCount={variableList.length}
            />
          )}
        </>
      )}

        {showRungMenu && (
          <View style={styles.rungMenu} pointerEvents="box-none">
            <TouchableOpacity style={styles.rungAction} activeOpacity={0.76} onPress={handleOpenComponentMenu}>
              <Plus size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.rungActionText}>Inserir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rungAction, interactionMode.startsWith('choosing-branch') && styles.rungActionActive]} activeOpacity={0.76} onPress={handleAddParallel}>
              <GitBranch size={17} color={interactionMode.startsWith('choosing-branch') ? '#247A3D' : '#111827'} strokeWidth={2.2} />
              <Text style={[styles.rungActionText, interactionMode.startsWith('choosing-branch') && styles.rungActionTextActive]}>
                {interactionMode === 'choosing-branch-end' ? 'Fim do paralelo' : 'Paralelo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rungAction} activeOpacity={0.76} onPress={handleConfigureRung}>
              <Settings2 size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.rungActionText}>Variáveis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rungAction, styles.contextButtonDanger]} activeOpacity={0.76} onPress={handleDeleteRung}>
              <Trash2 size={17} color="#B42318" strokeWidth={2.2} />
              <Text style={[styles.rungActionText, styles.contextTextDanger]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}

        {showElementMenu && (
          <View style={styles.contextMenu} pointerEvents="box-none">
            <TouchableOpacity style={styles.contextButton} activeOpacity={0.76} onPress={handleEditSelected}>
              <PenLine size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.contextText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contextButton} activeOpacity={0.76} onPress={handleDuplicateSelected}>
              <Copy size={17} color="#111827" strokeWidth={2.2} />
              <Text style={styles.contextText}>Duplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contextButton, styles.contextButtonDanger]} activeOpacity={0.76} onPress={handleDeleteSelected}>
              <Trash2 size={17} color="#B42318" strokeWidth={2.2} />
              <Text style={[styles.contextText, styles.contextTextDanger]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}

        {showTrashZone && (
          <View style={[styles.trashZone, isHoveringTrash && styles.trashZoneActive]}>
            <Trash2 size={24} color={isHoveringTrash ? '#FFFFFF' : THEME_TOKENS.color.danger} strokeWidth={2} />
            <Text style={[styles.trashText, isHoveringTrash && styles.trashTextActive]}>
              {isHoveringTrash ? 'Solte para excluir' : 'Arraste aqui para excluir'}
            </Text>
          </View>
        )}
      </View>

      <DragOverlay />

      <ComponentMenu
        selectedTool={selectedTool}
        visible={componentMenuOpen}
        onClose={handleCloseComponentMenu}
        onSelect={handleSelectComponent}
      />

      <Modal transparent visible={variableDrawerOpen} animationType="fade" onRequestClose={() => setVariableDrawerOpen(false)}>
        <Pressable style={styles.drawerBackdrop} onPress={() => setVariableDrawerOpen(false)} />
        <View style={styles.variableDrawer}>
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.drawerTitle}>Variáveis</Text>
              <Text style={styles.drawerSubtitle}>Toque em BOOL para alternar durante testes</Text>
            </View>
            <View style={styles.drawerHeaderActions}>
              <View style={styles.drawerCount}>
                <Text style={styles.drawerCountText}>{variableList.length}</Text>
              </View>
              <TouchableOpacity style={styles.drawerCloseButton} activeOpacity={0.72} onPress={() => setVariableDrawerOpen(false)}>
                <X size={19} color="#26312D" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.variableList} contentContainerStyle={styles.variableListContent}>
            {variableGroups.map(group => (
              <View key={group.type} style={styles.variableGroup}>
                <Text style={styles.variableGroupTitle}>{group.type}</Text>
                {group.items.map(variable => {
                  const value = variable.value;
                  const active = value === true || (typeof value === 'object' && value !== null && 'dn' in value && value.dn === true);
                  const canToggle = variable.type === 'BOOL';
                  const derived = isDerivedVariable(variable.id);
                  const progress = getVariableProgress(value);
                  return (
                    <TouchableOpacity
                      key={variable.id}
                      style={[styles.variableRow, active && styles.variableRowActive, (!canToggle || derived) && styles.variableRowReadonly]}
                      activeOpacity={canToggle && !derived ? 0.72 : 1}
                      onPress={() => canToggle && !derived && updateVariable(variable.id, { value: !variable.value })}
                      disabled={!canToggle || derived}
                    >
                      <View style={[styles.variableDot, active && styles.variableDotActive]} />
                      <View style={styles.variableInfo}>
                        <Text style={styles.variableName} numberOfLines={1}>{variable.id}</Text>
                        <Text style={styles.variableType}>{derived ? `${variable.type} derivado` : canToggle ? 'BOOL alternável' : variable.type}</Text>
                      </View>
                      <Text style={[styles.variableValue, active && styles.variableValueActive]} numberOfLines={1}>
                        {formatVariableValue(value)}
                      </Text>
                      {progress !== null && (
                        <View style={styles.variableProgressTrack}>
                          <View style={[styles.variableProgressFill, { width: `${progress * 100}%` }]} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            {variableList.length === 0 && (
              <View style={styles.variableEmpty}>
                <Text style={styles.variableEmptyTitle}>Sem variáveis</Text>
                <Text style={styles.variableEmptyCopy}>Adicione um endereço em uma instrução para criar a primeira tag.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <Text style={styles.footerLabel}>SESSÃO ATUAL</Text>
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.footerAction} activeOpacity={0.72} onPress={handleOpenProjectManager}>
                <FolderUp size={18} color="#111827" strokeWidth={2.2} />
                <Text style={styles.footerActionText}>Gerenciar Projetos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ProjectManager 
        visible={projectManagerOpen} 
        onClose={() => setProjectManagerOpen(false)} 
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: Platform.OS === 'web' ? fullViewportHeight : undefined,
    minHeight: Platform.OS === 'web' ? fullViewportHeight : undefined,
    paddingTop: Platform.OS === 'web' ? safeAreaTop : undefined,
    paddingBottom: Platform.OS === 'web' ? safeAreaBottom : undefined,
    backgroundColor: THEME_TOKENS.color.appBackground,
  },
  screen: {
    flex: 1,
    backgroundColor: THEME_TOKENS.color.appBackground,
    overflow: 'hidden',
  },
  canvasShell: {
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundColor: THEME_TOKENS.color.canvas,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 215, 201, 0.65)',
  },
  componentFab: {
    position: 'absolute',
    left: 16,
    bottom: 22,
    minWidth: 158,
    maxWidth: '72%',
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 19,
    backgroundColor: THEME_TOKENS.color.charcoal,
    ...THEME_TOKENS.shadow.floating,
  },
  componentFabCancel: {
    backgroundColor: THEME_TOKENS.color.danger,
    shadowColor: '#7F1D1D',
  },
  componentFabText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  workspaceHint: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 92,
    minHeight: 42,
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    ...THEME_TOKENS.shadow.soft,
  },
  workspaceHintActive: {
    backgroundColor: 'rgba(238, 248, 241, 0.94)',
    borderColor: 'rgba(46, 164, 97, 0.34)',
  },
  workspaceHintSimulate: {
    bottom: 96,
  },
  workspaceHintDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C9D2CB',
  },
  workspaceHintDotActive: {
    backgroundColor: THEME_TOKENS.color.energy,
  },
  workspaceHintText: {
    flexShrink: 1,
    color: THEME_TOKENS.color.charcoal,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  contextMenu: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 96,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    ...THEME_TOKENS.shadow.floating,
  },
  rungMenu: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 96,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    ...THEME_TOKENS.shadow.floating,
  },
  rungAction: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 13,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
  },
  rungActionActive: {
    backgroundColor: '#DFF1E5',
  },
  rungActionText: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900',
  },
  rungActionTextActive: {
    color: '#247A3D',
  },
  contextButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 13,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
  },
  contextButtonDanger: {
    backgroundColor: '#FFF1F0',
  },
  contextText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
  },
  contextTextDanger: {
    color: '#B42318',
  },
  trashZone: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 22,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 19,
    backgroundColor: '#FFF1F0',
    borderWidth: 2,
    borderColor: THEME_TOKENS.color.danger,
    borderStyle: 'dashed',
    zIndex: 50,
  },
  trashZoneActive: {
    backgroundColor: THEME_TOKENS.color.danger,
    borderStyle: 'solid',
  },
  trashText: {
    color: THEME_TOKENS.color.danger,
    fontSize: 16,
    fontWeight: '900',
  },
  trashTextActive: {
    color: '#FFFFFF',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.26)',
  },
  variableDrawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '86%',
    maxWidth: 390,
    paddingTop: 30,
    paddingHorizontal: 18,
    paddingBottom: 24,
    backgroundColor: '#F8FAF6',
    borderLeftWidth: 1,
    borderLeftColor: THEME_TOKENS.color.borderSubtle,
    shadowColor: '#24352C',
    shadowOffset: { width: -12, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 12,
  },
  drawerTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  drawerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerSubtitle: {
    marginTop: 4,
    color: THEME_TOKENS.color.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  drawerCount: {
    minWidth: 42,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  drawerCountText: {
    color: THEME_TOKENS.color.charcoal,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  drawerCloseButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  variableList: {
    flex: 1,
    marginTop: 18,
  },
  variableListContent: {
    paddingBottom: 28,
    gap: 16,
  },
  variableGroup: {
    gap: 8,
  },
  variableGroupTitle: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
    paddingHorizontal: 2,
  },
  variableRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
    overflow: 'hidden',
  },
  variableRowActive: {
    borderColor: 'rgba(46, 164, 97, 0.42)',
    backgroundColor: '#EEF8F1',
  },
  variableRowReadonly: {
    opacity: 0.92,
  },
  variableDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#C9D2CB',
  },
  variableDotActive: {
    backgroundColor: THEME_TOKENS.color.energy,
  },
  variableInfo: {
    flex: 1,
  },
  variableName: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  variableType: {
    marginTop: 2,
    color: THEME_TOKENS.color.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  variableValue: {
    minWidth: 84,
    maxWidth: 112,
    color: THEME_TOKENS.color.charcoal,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    textAlign: 'right',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
    overflow: 'hidden',
  },
  variableValueActive: {
    color: THEME_TOKENS.color.railLeft,
    backgroundColor: '#DDEFE4',
  },
  variableProgressTrack: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 5,
    height: 3,
    borderRadius: 2,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
    overflow: 'hidden',
  },
  variableProgressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: THEME_TOKENS.color.energy,
  },
  variableEmpty: {
    minHeight: 144,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: THEME_TOKENS.color.surface,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  variableEmptyTitle: {
    color: THEME_TOKENS.color.text,
    fontSize: 15,
    fontWeight: '900',
  },
  variableEmptyCopy: {
    maxWidth: 250,
    marginTop: 6,
    color: THEME_TOKENS.color.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },
  drawerFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME_TOKENS.color.borderSubtle,
    marginTop: 'auto',
  },
  footerLabel: {
    color: THEME_TOKENS.color.textMuted,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerAction: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: THEME_TOKENS.color.surfaceMuted,
    borderWidth: 1,
    borderColor: THEME_TOKENS.color.borderSubtle,
  },
  footerActionDanger: {
    backgroundColor: '#FFF1F0',
    borderColor: 'rgba(180, 35, 24, 0.1)',
  },
  footerActionText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
  },
});

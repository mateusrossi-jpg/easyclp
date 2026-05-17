import { CounterValue, LadderElement, NormalizedState, TimerValue } from '../types';

export interface ScanResult {
  nextState: NormalizedState;
  newlyEnergizedCoils: string[]; // For haptic feedback
}

export const scanCycle = (currentState: NormalizedState): ScanResult => {
  const nextElements = { ...currentState.elements };
  const nextRungs = { ...currentState.rungs };
  const nextVariables = { ...currentState.variables };
  const newlyEnergizedCoils: string[] = [];

  const SCAN_TIME = 50; // ms (matching the setInterval in store)

  const readValue = (address: string): unknown => {
    const direct = nextVariables[address];
    if (direct) return direct.value;

    const [base, field] = address.split('.');
    const baseVariable = nextVariables[base];
    if (!baseVariable || !field || typeof baseVariable.value !== 'object') return undefined;

    const normalizedField = field.toLowerCase();
    if (normalizedField === 'dn' || normalizedField === 'q') return baseVariable.value.dn;
    if (normalizedField === 'et' || normalizedField === 'acc' || normalizedField === 'cv') return baseVariable.value.acc;
    if (normalizedField === 'pre' || normalizedField === 'pt') return baseVariable.value.pre;
    return (baseVariable.value as unknown as Record<string, unknown>)[field];
  };

  const readBool = (address: string): boolean => {
    return !!readValue(address);
  };

  const readNumber = (token: string): number => {
    const literal = Number(token);
    if (!Number.isNaN(literal)) return literal;
    const value = readValue(token);
    return typeof value === 'number' ? value : 0;
  };

  const writeTimerDoneAliases = (address: string, done: boolean) => {
    if (nextVariables[`${address}.DN`]) {
      nextVariables[`${address}.DN`] = { ...nextVariables[`${address}.DN`], value: done };
    }
    if (nextVariables[`${address}.Q`]) {
      nextVariables[`${address}.Q`] = { ...nextVariables[`${address}.Q`], value: done };
    }
  };

  const writeCounterAliases = (address: string, counter: CounterValue) => {
    if (nextVariables[`${address}.DN`]) {
      nextVariables[`${address}.DN`] = { ...nextVariables[`${address}.DN`], value: counter.dn };
    }
    if (nextVariables[`${address}.CV`]) {
      nextVariables[`${address}.CV`] = { ...nextVariables[`${address}.CV`], value: counter.acc };
    }
  };

  const resetCounter = (address: string) => {
    const counterVariable = nextVariables[address];
    if (!counterVariable || counterVariable.type !== 'COUNTER' || typeof counterVariable.value !== 'object') return;

    const counter = { ...(counterVariable.value as CounterValue), acc: 0, dn: false };
    nextVariables[address] = { ...counterVariable, value: counter };
    writeCounterAliases(address, counter);
  };

  const executeElement = (element: LadderElement, inputPower: boolean): boolean => {
    let elementPassesPower = false;
    const variable = element.address ? nextVariables[element.address] : null;

    switch (element.type) {
      case 'XIC':
        elementPassesPower = readBool(element.address);
        break;
      case 'XIO':
        elementPassesPower = !readBool(element.address);
        break;
      case 'OTL':
        elementPassesPower = inputPower;
        if (variable && variable.type === 'BOOL' && inputPower) {
          const wasPowered = variable.value === true;
          nextVariables[element.address] = { ...variable, value: true };
          if (!wasPowered) newlyEnergizedCoils.push(element.id);
        }
        break;
      case 'OTU':
        elementPassesPower = inputPower;
        if (inputPower) {
          if (element.address.endsWith('.RES')) {
            resetCounter(element.address.replace(/\.RES$/i, ''));
          } else if (variable && variable.type === 'BOOL') {
            nextVariables[element.address] = { ...variable, value: false };
          }
        }
        break;
      case 'OTE': {
        elementPassesPower = inputPower;
        const wasPowered = element.powerIn;

        if (inputPower && element.address.endsWith('.RES')) {
          resetCounter(element.address.replace(/\.RES$/i, ''));
        } else if (variable && variable.type === 'BOOL') {
          nextVariables[element.address] = { ...variable, value: inputPower };
        }

        if (inputPower && !wasPowered) {
          newlyEnergizedCoils.push(element.id);
        }
        break;
      }
      case 'TON':
        if (variable && variable.type === 'TIMER' && typeof variable.value === 'object') {
          const timer = { ...(variable.value as TimerValue) };
          if (inputPower) {
            if (!timer.dn) {
              timer.acc += SCAN_TIME;
              if (timer.acc >= timer.pre) {
                timer.acc = timer.pre;
                timer.dn = true;
              }
            }
            timer.tt = !timer.dn;
          } else {
            timer.acc = 0;
            timer.dn = false;
            timer.tt = false;
          }
          nextVariables[element.address] = { ...variable, value: timer };
          writeTimerDoneAliases(element.address, timer.dn);
          elementPassesPower = timer.dn;
        } else {
          elementPassesPower = inputPower;
        }
        break;
      case 'CTU':
        if (variable && variable.type === 'COUNTER' && typeof variable.value === 'object') {
          const counter = { ...(variable.value as CounterValue) };
          const risingEdge = inputPower && !element.powerIn;
          if (risingEdge) {
            counter.acc += 1;
            if (counter.acc >= counter.pre) {
              counter.dn = true;
            }
          }
          nextVariables[element.address] = { ...variable, value: counter };
          writeCounterAliases(element.address, counter);
          elementPassesPower = inputPower;
        } else {
          elementPassesPower = inputPower;
        }
        break;
      case 'GEQ': {
        const [left, , right] = element.address.split(' ');
        elementPassesPower = readNumber(left) >= readNumber(right);
        break;
      }
      case 'LEQ': {
        const [left, , right] = element.address.split(' ');
        elementPassesPower = readNumber(left) <= readNumber(right);
        break;
      }
      case 'BOX':
      case 'BLOCK':
        elementPassesPower = inputPower;
        break;
      case 'EMPTY':
        elementPassesPower = true;
        break;
    }

    const powerIn = inputPower;
    const powerOut = powerIn && elementPassesPower;
    nextElements[element.id] = { ...element, powerIn, powerOut };
    return powerOut;
  };

  const evaluateSeries = (elements: LadderElement[], inputPower: boolean): boolean => {
    return elements.reduce((power, element) => executeElement(element, power), inputPower);
  };

  // Get rungs ordered by 'order'
  const rungList = Object.values(nextRungs).sort((a, b) => a.order - b.order);

  // Top-to-bottom execution
  for (const rung of rungList) {
    let currentPower = true; // left rail

    const elementsInRung = rung.elementIds
      .map(id => nextElements[id])
      .filter(element => element !== undefined)
      .sort((a, b) => a.column - b.column);

    const mainElements = elementsInRung.filter(element => element.branchIndex === 0);
    const branches = Object.values(
      elementsInRung
        .filter(element => element.branchIndex > 0)
        .reduce<Record<number, LadderElement[]>>((groups, element) => {
          groups[element.branchIndex] = groups[element.branchIndex] || [];
          groups[element.branchIndex].push(element);
          return groups;
        }, {})
    ).map(branchElements => {
      const sorted = branchElements.sort((a, b) => a.column - b.column);
      return {
        startColumn: sorted[0].column,
        endColumn: sorted[sorted.length - 1].column,
        elements: sorted,
      };
    });

    const branchOutputsByEndColumn = new Map<number, boolean[]>();

    for (const element of mainElements) {
      const startingBranches = branches.filter(branch => branch.startColumn === element.column);
      startingBranches.forEach(branch => {
        const output = evaluateSeries(branch.elements, currentPower);
        const outputs = branchOutputsByEndColumn.get(branch.endColumn) || [];
        outputs.push(output);
        branchOutputsByEndColumn.set(branch.endColumn, outputs);
      });

      const branchOutputs = branchOutputsByEndColumn.get(element.column) || [];
      currentPower = branchOutputs.some(Boolean) || currentPower;
      currentPower = executeElement(element, currentPower);
    }

    const lastColumn = mainElements[mainElements.length - 1]?.column ?? 0;
    branches
      .filter(branch => branch.startColumn > lastColumn)
      .forEach(branch => {
        const output = evaluateSeries(branch.elements, currentPower);
        const outputs = branchOutputsByEndColumn.get(branch.endColumn) || [];
        outputs.push(output);
        branchOutputsByEndColumn.set(branch.endColumn, outputs);
      });

    for (const [endColumn, outputs] of branchOutputsByEndColumn) {
      if (endColumn > lastColumn && outputs.some(Boolean)) {
        currentPower = true;
      }
    }

    nextRungs[rung.id] = { ...rung, isPowered: currentPower };
  }

  return {
    nextState: {
      rungs: nextRungs,
      elements: nextElements,
      variables: nextVariables,
    },
    newlyEnergizedCoils,
  };
};

import { NormalizedState } from '../types';

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
    return baseVariable.value[field];
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

  // Get rungs ordered by 'order'
  const rungList = Object.values(nextRungs).sort((a, b) => a.order - b.order);

  // Top-to-bottom execution
  for (const rung of rungList) {
    let currentPower = true; // left rail

    // Sort elements by column
    const elementsInRung = rung.elementIds
      .map(id => nextElements[id])
      .filter(element => element !== undefined)
      .sort((a, b) => a.column - b.column);

    for (const element of elementsInRung) {
      let elementPassesPower = false;
      const variable = element.address ? nextVariables[element.address] : null;
      
      switch (element.type) {
        case 'XIC': // NO
          elementPassesPower = readBool(element.address);
          break;
        case 'XIO': // NC
          elementPassesPower = !readBool(element.address);
          break;
        case 'OTL':
          elementPassesPower = currentPower;
          if (variable && variable.type === 'BOOL' && currentPower) {
            nextVariables[element.address] = { ...variable, value: true };
          }
          break;
        case 'OTU':
          elementPassesPower = currentPower;
          if (variable && variable.type === 'BOOL' && currentPower) {
            nextVariables[element.address] = { ...variable, value: false };
          }
          break;
        case 'OTE': // Coil
          elementPassesPower = currentPower;
          const wasPowered = element.powerIn;
          
          if (variable && variable.type === 'BOOL') {
            nextVariables[element.address] = { ...variable, value: currentPower };
          }

          if (currentPower && !wasPowered) {
            newlyEnergizedCoils.push(element.id);
          }
          break;
        case 'TON':
          if (variable && variable.type === 'TIMER') {
            const timer = { ...variable.value };
            if (currentPower) {
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
            if (nextVariables[`${element.address}.DN`]) {
              nextVariables[`${element.address}.DN`] = { ...nextVariables[`${element.address}.DN`], value: timer.dn };
            }
            if (nextVariables[`${element.address}.Q`]) {
              nextVariables[`${element.address}.Q`] = { ...nextVariables[`${element.address}.Q`], value: timer.dn };
            }
            elementPassesPower = timer.dn;
          } else {
            elementPassesPower = currentPower;
          }
          break;
        case 'CTU':
          if (variable && variable.type === 'COUNTER') {
            const counter = { ...variable.value };
            const risingEdge = currentPower && !element.powerIn;
            if (risingEdge) {
              counter.acc += 1;
              if (counter.acc >= counter.pre) {
                counter.dn = true;
              }
            }
            nextVariables[element.address] = { ...variable, value: counter };
            elementPassesPower = currentPower; // CTU usually passes power if input is true
          } else {
            elementPassesPower = currentPower;
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
        case 'BLOCK':
          elementPassesPower = currentPower;
          break;
        case 'EMPTY':
          elementPassesPower = true;
          break;
      }

      const powerIn: boolean = currentPower;
      const powerOut: boolean = powerIn && elementPassesPower;
      nextElements[element.id] = { ...element, powerIn, powerOut };
      
      // Pass to next column
      currentPower = powerOut;
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

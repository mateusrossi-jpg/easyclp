import { NormalizedState } from '../types';

interface ExportInstruction {
  UUID: string;
  Address: string;
  Tag_Name: string;
  Instruction_Mnemonic: string;
}

interface ExportRung {
  Rung_Number: number;
  Rung_UUID: string;
  Instructions: ExportInstruction[];
}

export const TranslatorService = {
  toL5K: (projectState: NormalizedState): string => {
    const { rungs, elements } = projectState;
    const l5kBlocks: ExportRung[] = [];

    const rungList = Object.values(rungs).sort((a, b) => a.order - b.order);

    rungList.forEach(rung => {
      const rungLogic: ExportInstruction[] = [];
      const rungElements = rung.elementIds
        .map(id => elements[id])
        .filter(element => element !== undefined)
        .sort((a, b) => a.column - b.column);

      rungElements.forEach(el => {
        if (el.type !== 'EMPTY') {
          rungLogic.push({
            UUID: el.id,
            Address: el.address,
            Tag_Name: `Tag_${el.address.replace(/[^a-zA-Z0-9]/g, '_')}`,
            Instruction_Mnemonic: el.type, // XIC, XIO, OTE
          });
        }
      });

      if (rungLogic.length > 0) {
        l5kBlocks.push({
          Rung_Number: rung.order,
          Rung_UUID: rung.id,
          Instructions: rungLogic
        });
      }
    });

    return JSON.stringify({
      Project: "CLP_Facil_Export",
      Export_Format: "L5K-JSON",
      Timestamp: new Date().toISOString(),
      Rungs: l5kBlocks
    }, null, 2);
  }
};

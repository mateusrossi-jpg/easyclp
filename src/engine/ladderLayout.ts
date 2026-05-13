Regras de Negócio e Arquitetura:
1. Pureza Extrema: Este arquivo deve conter APENAS funções matemáticas puras. Ele receberá o JSON recursivo da Rung e retornará coordenadas (x, y) absolutas para a engine SVG desenhar. Não importe UI, React ou Zustand.
2. Geometria Mobile-First: Importe as constantes de `src/constants/theme.ts`. O tamanho base de grade e alvo de toque (blocos) deve respeitar o `touchTargetSize` de 44px. O espaçamento vertical de linhas usa o `rungGap` de 32px.
3. Renderização Bottom-Up Recursiva: O motor calculará o aninhamento infinito de Ramos Paralelos (Branches). A altura (height) e largura (width) de um ramo pai DEVE ser derivada estritamente da soma das bounding boxes de todos os seus filhos.
4. Barramentos: O barramento esquerdo (powerRailLeft) está no eixo X=0. Calcule a posição final do último elemento da Rung para definir dinamicamente a posição do barramento direito (powerRailRight).
5. Posicionamento de Bobinas: Bobinas (Coils) e blocos de saída (Timers/Counters) DEVEM ser alinhados de forma estrita à direita, encostando no barramento direito.
6. Retorno de Dados: A saída da função principal `calculateRungLayout(rung, elements)` deve ser um mapa de layout contendo:
   - `{ width, height }` totais da Rung.
   - `nodes`: Array com { id, x, y } de cada componente.
   - `wires`: Array de caminhos { startX, startY, endX, endY } para o react-native-svg desenhar as linhas visíveis.

Gere o código completo, de escopo pequeno, performático e rigorosamente tipado em TypeScript.

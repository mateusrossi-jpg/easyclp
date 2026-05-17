# EasyCLP — Editor Ladder Pilot

## Objetivo
Estabilizar a tela principal do editor Ladder mobile-first e polir a UX.

## Decisões de UX
- Mobile-first com grid rígido de 12 colunas.
- Inserção por seleção + menu, não apenas drag/drop.
- Rungs com altura dinâmica e respiro superior para touch.
- Branch paralelo empurra rungs seguintes e reconecta inteligentemente.
- Botão "+ Componentes" e status flutuam de forma que o conteúdo abaixo não fique inacessível (scroll bottom padding aplicado).

## Estrutura visual
- Header premium exibindo o nome do Projeto ativo.
- Canvas Ladder expandido (legibilidade priorizada sobre visão geral).
- Barramentos (rails) com efeito de profundidade e espessura industrial.
- Rungs com documentação (comments) em itálico e maior peso.
- Componentes e blocos maiores para interações touch confortáveis.
- Bottom sheet de componentes incluindo categoria "⭐ Favoritos".
- Status de simulação com feedback de estado ativo.

## Fluxo de uso
1. Criar rung.
2. Adicionar documentação (via menu de contexto da Rung).
3. Selecionar ponto de inserção.
4. Abrir + Componentes.
5. Inserir componente.
6. Adicionar paralelo.
7. Iniciar/parar simulação básica.
8. Salvar/Carregar via Gerenciador de Projetos.
9. Exportar projeto (JSON).

## Polimento mobile do canvas
- **Escala e Grid**: O `rightRailX` foi expandido para 1160, com `columnWidth` de 90. A altura padrão das rungs subiu para 140. Essa escala "pesada" garante legibilidade perfeita em qualquer celular moderno.
- **Legibilidade dos Blocos**:
  - **TON e CTU**: Blocos agora medem 170x104. Textos de parâmetros (IN, PT, CU, ACC...) agora usam fonte tamanho 12 e peso 900.
  - **Cabeçalhos**: Títulos TON/CTU ampliados para tamanho 14, com contraste máximo.
- **Labels e Textos**: `address` dos componentes agora usa tamanho 13, facilitando a leitura de tags complexas.
- **Truncamento de Tags**: Endereços muito longos são truncados elegantemente para evitar poluição visual.
- **Múltiplos Projetos**: Interface nativa estabilizada.

## Legibilidade mobile dos blocos
- **Prioridade de Leitura**: No mobile, o sistema agora impede que a escala caia abaixo de 0.45. Isso significa que o editor favorece a leitura dos componentes, ativando scroll horizontal interno se a rung for muito larga, em vez de diminuir os blocos até ficarem ilegíveis.
- **Ajuste de Segurança**: Blocos largos (como TON) próximos ao barramento direito são automaticamente reposicionados (nudge) para a esquerda para evitar que sejam cortados ou encostem no rail.

## Modo Simular limpo
- **Interface Focada**: Removidos botões redundantes e cards flutuantes.
- **Status Consolidado**: O status e instruções foram movidos para o Header.
- **Ocultação de Edição**: Interface de construção some automaticamente ao simular.

## Pendências (Próximos Passos Futuros)
- Motor completo de simulação (avançar blocos PID, Math).
- Validação Ladder avançada (alertar caminhos abertos).
- Exportação nativa via Share API no Mobile.

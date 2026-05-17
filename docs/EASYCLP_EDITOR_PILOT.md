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
- Canvas Ladder expandido (legibilidade priorizada).
- Barramentos (rails) com efeito de profundidade.
- Rungs com documentação (comments) em itálico.
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
- **Escala e Grid**: O `rightRailX` foi expandido de 920 para 1040, permitindo um `columnWidth` de 80. Isso evita a sensação de "espremido". A altura padrão das rungs foi ajustada para 124 para melhorar as hit-zones de touch.
- **TON e CTU**: Os blocos agora ocupam 156 de largura e 90 de altura. Os textos internos foram ampliados para garantir a legibilidade.
- **Labels e Textos**: As fontes de `address` e parâmetros internos ganharam peso e tamanho para evitar poluição visual em telas de alta densidade.
- **Múltiplos Projetos**: Implementada interface nativa para lidar com a alternância fluida entre lógicas.

## Pendências (Próximos Passos Futuros)
- Motor completo de simulação (avançar blocos PID, Math).
- Validação Ladder avançada (alertar caminhos abertos).
- Exportação nativa via Share API no Mobile (atualmente via console.log para testes Web).

# EasyCLP — Editor Ladder Pilot

## Objetivo
Estabilizar a tela principal do editor Ladder mobile-first e polir a UX para um nível Premium Industrial.

## Decisões de UX
- Mobile-first com grid rígido de 12 colunas.
- Inserção por seleção + menu é o fluxo principal.
- Rungs com altura dinâmica e respiro superior para touch.
- Branch paralelo empurra rungs seguintes e reconecta inteligentemente.
- Botão "+ Componentes" e status flutuam de forma que o conteúdo abaixo não fique inacessível.
- Escala mobile protegida (mínimo 0.45) para garantir legibilidade técnica.

## Estrutura visual
- Header premium compacto exibindo o nome do Projeto e métricas em tempo real.
- Canvas Ladder expandido (legibilidade priorizada sobre visão geral).
- Barramentos (rails) com efeito de profundidade, espessura industrial e nós de conexão técnicos.
- Rungs com documentação (comments) em itálico e maior peso.
- Componentes e blocos maiores para interações touch confortáveis.
- Bottom sheet de componentes tátil com estados "Pressed" satisfatórios.
- Status de simulação com feedback de estado ativo e filamento de energia (glow).

## Fluxo de uso
1. Criar rung.
2. Adicionar documentação (via menu de contexto da Rung).
3. Selecionar ponto de inserção.
4. Abrir + Componentes (menu tátil).
5. Inserir componente.
6. Adicionar paralelo (guias técnicas auxiliam a escolha).
7. Iniciar/parar simulação (banner de instrução integrado ao header).
8. Salvar/Carregar via Gerenciador de Projetos.
9. Exportar projeto (JSON).

## Refinamento Premium Industrial
- **Blocos Funcionais (TON/CTU)**: Redesenhados com profundidade "Sharp", cabeçalhos detalhados e tipografia monospace rigorosa. Indicadores de "Energized" (LED verde interno) adicionados.
- **Símbolos (Contatos/Bobinas)**: Linhas perfeitamente nítidas e curvaturas técnicas. Feedback de energia usa efeito de filamento brilhante.
- **TopActionBar**: Otimizada para ser compacta, permitindo maior área útil de editor enquanto mantém métricas de Rungs e Sinais visíveis.
- **Nós de Conexão**: Junções entre rungs e rails agora possuem detalhes visuais que sugerem conexões físicas reais.

## Pendências (Próximos Passos Futuros)
- Motor completo de simulação (avançar blocos PID, Math).
- Validação Ladder avançada (alertar caminhos abertos).
- Exportação nativa via Share API no Mobile.

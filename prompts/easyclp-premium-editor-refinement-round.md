Atue como Senior Frontend Engineer, Product Designer, UX Architect, QA Engineer e especialista em editores Ladder/PLC mobile-first.

Projeto: EasyCLP.

Objetivo geral desta rodada:
Levar o editor Ladder do EasyCLP para um nível visual e funcional mais próximo de um produto publicável, premium e realmente usável em celular, sem tentar concluir todo o motor PLC avançado agora.

Contexto atual:
O EasyCLP já evoluiu bastante:
- Header premium com EasyCLP.
- Botão Iniciar/Parar no topo.
- Abas Editar/Simular.
- Status com Rungs, Sinais e Modo.
- Editor Ladder com barramentos, rungs e componentes.
- Grid de 12 colunas.
- Simulação com linhas energizadas em verde.
- Modo Simular limpo, sem botão flutuante inferior.
- Banner superior de dica no modo simulação.
- Botão + Componentes no modo Editar.
- TON/CTU, contatos, bobinas e ramos paralelos já aparecem.

Problemas ainda percebidos:
- O Ladder ainda parece um diagrama grande miniaturizado para caber no celular.
- TON e CTU ainda precisam ficar mais legíveis.
- Algumas labels ficam pequenas demais.
- A proporção entre canvas, rungs, contatos, bobinas e blocos ainda precisa amadurecer.
- O modo Editar precisa ficar mais fácil para toque, seleção e inserção.
- Branch/paralelo precisa ser confiável e visualmente claro.
- A experiência mobile precisa priorizar toque, legibilidade e fluxo simples.
- O app precisa caminhar para uma tela piloto realmente forte antes de avançar para simulação complexa.

Meta desta rodada:
Fazer uma rodada grande de refinamento do editor Ladder, focando em:
1. Legibilidade mobile.
2. Proporção visual.
3. Inserção de componentes.
4. Seleção e ações contextuais.
5. Branch/paralelo.
6. Modo Editar limpo e funcional.
7. Modo Simular limpo e confiável.
8. Documentação e checklist.
9. Build estável.

Não é objetivo desta rodada:
- Criar motor completo de PLC industrial.
- Criar login/backend.
- Criar exportação/importação complexa.
- Criar todas as instruções Ladder do mundo.
- Criar múltiplos temas.
- Refazer o app do zero.
- Copiar código ou identidade de app.plcsimulator.online ou Simurelay.

==================================================
REGRAS MÁXIMAS
==================================================

- Não instalar dependências sem necessidade.
- Não mexer em package.json salvo se absolutamente necessário e justificar.
- Não quebrar build.
- Não alterar radicalmente o modelo de dados se não for necessário.
- Não apagar funcionalidades úteis existentes.
- Não reintroduzir overlays flutuantes no modo Simular.
- Não reintroduzir botão Parar duplicado.
- Não deixar + Componentes visível no modo Simular.
- Não criar scroll horizontal global da página.
- Scroll horizontal, se necessário, deve existir apenas dentro do canvas Ladder.
- Preservar visual claro, técnico, premium e mobile-first.
- Melhorar com segurança incremental.
- Se algo for arriscado, documentar como pendência em vez de quebrar.
- Priorizar experiência real de uso no celular.

==================================================
1. AUDITORIA COMPLETA DO ESTADO ATUAL
==================================================

Antes de modificar, auditar os principais arquivos do EasyCLP.

Procurar e revisar:
- src/components/MobileLadderWorkspace.tsx
- src/components/TopActionBar.tsx
- src/components/LadderCanvas.tsx
- src/components/LadderRenderer.tsx
- src/components/LadderBlocks.tsx
- src/components/LadderSymbols.tsx
- src/components/ComponentMenu.tsx
- src/components/ElementEditorModal.tsx
- src/store/useLadderStore.ts
- src/engine/ladderEngine.ts, se existir
- src/consts/ladderGeometry.ts
- src/consts/themeTokens.ts
- src/types.ts
- docs/EASYCLP_EDITOR_PILOT.md
- docs/EASYCLP_MANUAL_TEST.md

Mapear:
- como rungs são representadas;
- como elementos são posicionados;
- como colunas são calculadas;
- como branch/paralelo é representado;
- como seleção funciona;
- como inserir componente;
- como simulação roda;
- como contatos BOOL são alternados;
- onde o zoom/scale do canvas é calculado;
- onde os botões e menus aparecem.

Gerar internamente diagnóstico:
- o que está bom;
- o que está frágil;
- o que precisa correção visual;
- o que precisa correção de UX;
- riscos.

Depois implementar.

==================================================
2. PRINCÍPIO OFICIAL DO EDITOR EASYCLP
==================================================

Aplicar estes princípios:

1. Mobile-first real:
- usuário consegue usar com dedo;
- não depende de hover;
- não depende de drag preciso;
- botões têm área confortável;
- seleção é clara;
- inserir componente é simples.

2. Ladder legível:
- não miniaturizar tudo para caber na tela;
- preferir scroll horizontal interno a texto ilegível;
- TON/CTU precisam ser lidos;
- contatos e bobinas precisam ser reconhecíveis.

3. Edição e simulação são modos diferentes:
- Editar mostra ferramentas.
- Simular mostra monitoramento.
- Simular não deve ter ferramentas de edição.
- Editar não precisa mostrar estado de execução exagerado.

4. Visual premium técnico:
- claro, limpo e profissional;
- bordas suaves;
- sombras leves;
- cores funcionais;
- verde para energizado/rodando;
- vermelho para parar/perigo;
- texto legível;
- nada de poluição visual.

5. Arquitetura incremental:
- melhorar sem quebrar;
- centralizar constantes em ladderGeometry/themeTokens;
- evitar hardcode solto quando possível.

==================================================
3. REFINAR GEOMETRIA DO LADDER
==================================================

Revisar src/consts/ladderGeometry.ts.

Objetivo:
Ter uma geometria coerente para mobile e desktop.

Verificar:
- leftRailX
- rightRailX
- columnCount
- columnWidth
- rungHeight
- branchGap
- centerY
- contactWidth/contactHeight
- coilWidth/coilHeight
- blockWidth/blockHeight
- blockHeaderHeight
- compareWidth/compareHeight
- labelFontSize
- lineWidth
- activeLineWidth

Ajustar para:
- TON/CTU maiores;
- contatos/bobinas um pouco maiores e tocáveis;
- rungs com altura confortável;
- branchGap suficiente;
- rail direito com respiro;
- componentes não colados na borda;
- grid coerente com 12 colunas.

Se necessário:
- criar helpers:
  - getElementX(column)
  - getElementWidth(type)
  - getElementHeight(type)
  - getElementColumnSpan(type)
  - clampColumnForElement(type, column)

Objetivo dos helpers:
Evitar que blocos largos, como TON/CTU, fiquem cortados ou encostados no rail direito.

Critério:
Um bloco TON/CTU próximo ao final da rung deve ser reposicionado ou limitado para não ultrapassar a área útil.

==================================================
4. MELHORAR TON/CTU E BLOCOS FUNCIONAIS
==================================================

Revisar src/components/LadderBlocks.tsx.

Problema:
TON/CTU ainda aparecem pequenos e com texto interno difícil de ler no mobile.

Objetivo:
Fazer TON/CTU parecerem blocos profissionais de editor Ladder mobile.

Ajustar:
- largura maior;
- altura maior;
- cabeçalho mais legível;
- corpo mais limpo;
- fonte do título maior;
- fonte dos parâmetros maior;
- melhor contraste;
- padding interno melhor;
- arredondamento consistente;
- sombra ou borda leve, se combinar.

Priorizar informações:
Para TON:
- nome/tag do bloco;
- tipo TON;
- entrada IN;
- PT;
- ET;
- Q/status se existir.

Para CTU:
- nome/tag do bloco;
- tipo CTU;
- CU;
- RES;
- PV, ACC ou valor principal;
- Q/status se existir.

Se não couber:
- ocultar informações secundárias;
- evitar microtexto;
- deixar detalhes para modal de edição.

Critérios:
- Deve ser possível ler “TON” e “CTU” no celular.
- Deve ser possível reconhecer o nome/tag.
- Os valores principais devem ser minimamente legíveis.
- O bloco não deve parecer esmagado.

==================================================
5. MELHORAR CONTATOS, NF E BOBINAS
==================================================

Revisar src/components/LadderSymbols.tsx e LadderRenderer.

Ajustar:
- contato NA mais legível;
- contato NF com barra diagonal clara;
- bobina maior e mais reconhecível;
- áreas de toque maiores;
- labels com fonte um pouco maior;
- labels com truncamento quando longas;
- label não deve encostar no símbolo;
- label não deve ficar tão acima que pareça solta;
- símbolo energizado deve ficar claro sem exagero.

Critério:
Em uma tela mobile, o usuário deve diferenciar rapidamente:
- contato NA;
- contato NF;
- bobina;
- componente selecionado;
- componente energizado.

==================================================
6. MELHORAR ESCALA MOBILE DO CANVAS
==================================================

Revisar LadderCanvas e onde scale/zoom é calculado.

Problema:
O editor ainda parece reduzido para caber no celular.

Objetivo:
Priorizar leitura, mesmo que precise scroll horizontal interno.

Avaliar:
- scale inicial;
- minScale;
- maxScale;
- fit-to-width;
- scroll horizontal interno;
- largura interna do canvas;
- padding do canvas;
- zoom reset;
- botão de expandir/fit.

Implementar regra:
- No mobile, não reduzir o canvas abaixo de uma escala que torne os blocos ilegíveis.
- Se a largura for maior que a tela, permitir scroll horizontal dentro do Ladder.
- Não criar scroll horizontal na página inteira.

Se existir botão de zoom/fit:
- garantir que ele funcione de maneira previsível.
- botão reset volta para uma escala confortável, não necessariamente “ver tudo minúsculo”.

Critério:
O usuário deve conseguir ler blocos sem zoom manual obrigatório.

==================================================
7. REFINAR MODO EDITAR
==================================================

No modo Editar:
- mostrar + Componentes;
- permitir seleção de rung/célula/elemento;
- mostrar ações contextuais de forma organizada;
- não poluir a tela com tudo ao mesmo tempo.

Verificar:
- tocar em rung seleciona;
- tocar em célula vazia seleciona ponto de inserção;
- tocar em componente seleciona componente;
- + Componentes insere no ponto selecionado;
- se não houver ponto selecionado, inserir em local previsível;
- feedback visual após inserção;
- desfazer/refazer continuam funcionando.

Ações contextuais desejadas:
- Editar tag;
- Remover;
- Adicionar paralelo;
- Duplicar, se já existir;
- Inserir antes/depois, se simples.

Se houver menus soltos:
- organizar em bottom sheet/painel;
- não deixar controles pequenos demais.

Critério:
O usuário precisa conseguir montar uma lógica simples usando toque, sem drag preciso.

==================================================
8. REFINAR MENU + COMPONENTES
==================================================

Revisar ComponentMenu.

Objetivo:
O menu de componentes deve parecer parte de um app profissional mobile.

Verificar:
- abre corretamente;
- fecha corretamente;
- categorias claras;
- botões grandes;
- descrição curta;
- ícones/símbolos úteis;
- não ocupa tela de forma confusa;
- não depende de hover;
- item selecionado insere componente corretamente.

Categorias sugeridas:
- Entradas
- Saídas
- Temporizadores
- Contadores
- Comparadores
- Lógica, se já houver
- Básicos

Componentes mínimos:
- Contato NA
- Contato NF
- Bobina
- TON
- CTU
- Comparador, se existir

Critério:
O menu não deve parecer lista técnica crua; deve ser amigável para mobile.

==================================================
9. REFINAR BRANCH / PARALELO
==================================================

Branch paralelo é ponto crítico.

Validar:
- branch pertence à rung;
- branch aumenta altura da rung;
- rungs seguintes descem;
- branch não sobrepõe outra rung;
- linhas verticais conectam corretamente;
- linha horizontal do branch não atravessa símbolo errado;
- inserir componente dentro do branch funciona;
- selecionar branch funciona;
- resize handles, se existirem, não poluem modo Simular;
- handles aparecem apenas no modo Editar.

Se encontrar bug visual claro:
- corrigir.
Se branch aninhado for complexo:
- documentar como pendência.
- garantir pelo menos branch simples confiável.

Critério mínimo:
Branch simples precisa ser visualmente correto e não quebrar layout.

==================================================
10. REFINAR MODO SIMULAR
==================================================

Preservar o modo Simular limpo.

Garantir:
- apenas um botão Parar;
- botão Parar no header;
- sem botão flutuante inferior;
- sem + Componentes;
- sem handles de edição;
- sem workspaceHint sobre o Ladder;
- banner de dica compacto;
- status Sinais mostra valor correto;
- linhas energizadas em verde;
- tocar em contato BOOL funciona, se já existir;
- toque não é bloqueado por overlay.

Melhorar se necessário:
- banner de dica pode ser menor;
- pode sumir após alguns segundos, se simples;
- status superior pode mostrar “SIM” claramente.

Critério:
Modo Simular deve parecer monitoramento/execução, não edição.

==================================================
11. REFINAR TOPBAR / HEADER / STATUS
==================================================

O header está bom, mas revisar proporções.

Verificar:
- menu button;
- título EasyCLP;
- subtítulo;
- botão Iniciar/Parar;
- abas Editar/Simular;
- status Rungs/Sinais/Modo;
- toolbar undo/redo/zoom/menu.

Melhorias possíveis:
- reduzir altura se estiver ocupando espaço demais;
- manter toque confortável;
- alinhar ícones;
- deixar status legível;
- evitar redundância de informação;
- manter visual premium.

Critério:
O topo deve ser claro sem roubar área demais do Ladder.

==================================================
12. REFINAR TOOLBAR DE ÍCONES
==================================================

Toolbar atual tem undo/redo/zoom/reset/lista.

Verificar:
- ícones bem alinhados;
- estados desabilitados claros;
- botões com tamanho consistente;
- espaçamento bom;
- não ocupa altura excessiva;
- não mistura funções sem clareza.

Se necessário:
- agrupar melhor;
- reduzir sombras excessivas;
- deixar visual mais leve.

Não remover função útil.

==================================================
13. MELHORAR ESTADO VAZIO / ORIENTAÇÃO
==================================================

Se não houver rung/componentes:
- mostrar orientação clara;
- CTA para + Componentes ou + Rung.

Se já houver rungs:
- não manter mensagem cobrindo o Ladder.

No modo Editar:
- hint pode existir, mas sem cobrir uso.
No modo Simular:
- hint deve ser banner compacto ou temporário.

Critério:
Orientação ajuda, mas não atrapalha.

==================================================
14. RESPONSIVIDADE DESKTOP E MOBILE
==================================================

Testar mentalmente/código para:
- mobile estreito;
- mobile médio;
- desktop;
- browser com largura reduzida;
- modo paisagem, se simples.

Garantir:
- sem scroll horizontal global;
- header não quebra;
- toolbar não quebra;
- canvas pode rolar internamente;
- bottom sheets não saem da tela;
- componentes não são cortados;
- rungs continuam alinhadas.

Critério:
Mobile é prioridade, mas desktop não pode ficar quebrado.

==================================================
15. PERFORMANCE E ESTABILIDADE
==================================================

Não fazer otimização prematura, mas evitar:
- re-render excessivo desnecessário;
- loops de cálculo pesados;
- recriar arrays enormes em render sem necessidade;
- warnings óbvios.

Preservar React.memo onde já existe.
Não complicar.

Critério:
Editor deve permanecer fluido em projetos pequenos/médios.

==================================================
16. TESTES E QA
==================================================

Se já houver testes:
Adicionar ou ajustar testes leves:
- editor renderiza;
- modo Editar mostra + Componentes;
- modo Simular não mostra + Componentes;
- modo Simular não tem botão Parar duplicado;
- status muda para Simular;
- existe pelo menos uma rung;
- branch simples não remove rung;
- componente TON/CTU renderiza;
- build passa.

Se não houver infraestrutura:
- não criar setup complexo;
- atualizar checklist manual.

Não criar testes frágeis dependentes de pixel exato.

==================================================
17. DOCUMENTAÇÃO
==================================================

Atualizar:

docs/EASYCLP_EDITOR_PILOT.md

Adicionar/atualizar seções:

## Refinamento premium do editor
- decisões de escala;
- grid de 12 colunas;
- priorização de legibilidade;
- blocos largos;
- modo Editar;
- modo Simular limpo;
- branch/paralelo;
- limitações conhecidas.

## Decisão de UX mobile-first
- seleção + menu é o fluxo principal;
- drag/drop é secundário;
- scroll horizontal interno é aceitável se preservar legibilidade;
- não miniaturizar o Ladder.

## Pendências futuras
- simulação avançada;
- branch aninhado robusto;
- biblioteca completa de blocos;
- exportação/importação;
- validação Ladder;
- atalhos desktop;
- persistência avançada.

Atualizar:

docs/EASYCLP_MANUAL_TEST.md

Checklist completo:

[ ] App abre sem erro
[ ] Header alinhado
[ ] Botão Iniciar aparece no modo Editar
[ ] Botão Parar aparece no modo Simular
[ ] Não há botão Parar duplicado
[ ] + Componentes aparece só no modo Editar
[ ] + Componentes não aparece no modo Simular
[ ] Banner de simulação não cobre Ladder
[ ] Rungs estão alinhadas
[ ] Contato NA legível
[ ] Contato NF legível
[ ] Bobina legível
[ ] TON legível
[ ] CTU legível
[ ] TON próximo ao rail direito não corta
[ ] CTU próximo ao rail direito não corta
[ ] Branch simples não sobrepõe rung seguinte
[ ] Linha energizada aparece verde
[ ] Tocar em contato BOOL funciona, se implementado
[ ] Scroll horizontal global não existe
[ ] Scroll horizontal interno do canvas funciona, se necessário
[ ] Build passa
[ ] Desktop continua usável

==================================================
18. VALIDAÇÃO OBRIGATÓRIA
==================================================

Rodar os comandos disponíveis:

npm run build

Se existir:
npm run typecheck
npm test
npm run lint

Se algum comando falhar:
- corrigir a causa;
- não remover regra importante só para passar;
- rodar novamente.

Se algum comando não existir:
- documentar que não existe.

==================================================
19. RELATÓRIO FINAL
==================================================

Ao final, informar:

- arquivos alterados;
- principais melhorias visuais;
- melhorias no TON/CTU;
- melhorias em contatos/bobinas;
- mudanças em escala/canvas;
- melhorias no modo Editar;
- melhorias no modo Simular;
- alterações no branch/paralelo;
- documentação atualizada;
- comandos executados;
- resultados;
- pendências restantes.

Commit sugerido:
style: refine EasyCLP premium mobile ladder editor

Atue como Senior Frontend Engineer, Product Designer e especialista em UX mobile para editores Ladder/PLC.

Projeto: EasyCLP.

Objetivo desta rodada:
Melhorar a legibilidade mobile do Ladder, principalmente dos blocos TON/CTU, contatos, bobinas e labels.

Contexto:
O modo Simular foi limpo com sucesso:
- só há um botão Parar no header;
- overlays inferiores foram removidos;
- a dica de simulação virou banner superior;
- o canvas está livre.

Agora o problema principal é escala:
- TON e CTU estão pequenos demais;
- textos internos dos blocos quase ilegíveis;
- labels dos contatos/bobinas estão pequenas;
- o Ladder ainda parece reduzido para caber na tela;
- blocos próximos ao rail direito parecem apertados.

Regras:
- Não alterar motor de simulação.
- Não alterar modelo de dados.
- Não alterar lógica de branch.
- Não remover grid de 12 colunas.
- Não reintroduzir overlays no modo Simular.
- Não instalar dependências.
- Corrigir apenas escala, tipografia, proporção, espaçamento e legibilidade.
- Manter visual claro, técnico e premium.

==================================================
1. AUDITAR ARQUIVOS PRINCIPAIS
==================================================

Revisar:
- src/components/LadderBlocks.tsx
- src/components/LadderSymbols.tsx
- src/components/LadderRenderer.tsx
- src/components/LadderCanvas.tsx
- src/consts/ladderGeometry.ts
- src/components/MobileLadderWorkspace.tsx

Antes de alterar, identificar:
- onde TON/CTU são desenhados;
- onde contatos/bobinas são desenhados;
- onde a escala do canvas é calculada;
- onde fica o tamanho de fontes/labels;
- como elementos largos são posicionados perto do rail direito.

Implementar apenas ajustes objetivos.

==================================================
2. MELHORAR LEGIBILIDADE DOS BLOCOS TON/CTU
==================================================

Problema:
Os blocos TON e CTU aparecem bonitos, mas pequenos demais para celular.

Ajustar:
- aumentar blockWidth;
- aumentar blockHeight;
- aumentar blockHeaderHeight;
- aumentar fonte do título TON/CTU;
- aumentar fonte dos parâmetros;
- melhorar contraste;
- aumentar padding interno;
- impedir texto interno espremido.

Se não couber tudo:
- mostrar menos informações dentro do bloco;
- priorizar tipo do bloco, tag e valores principais;
- detalhes completos ficam para modal/editor do bloco.

Critério:
Em tela mobile deve ser possível identificar:
- tipo do bloco: TON ou CTU;
- nome/tag do bloco;
- entradas principais;
- valores principais, como PT/ET ou CU/ACC.

==================================================
3. AJUSTAR CONTATOS E BOBINAS
==================================================

Problema:
Contatos e bobinas estão reconhecíveis, mas pequenos e com labels minúsculas.

Ajustar:
- aumentar área visual dos contatos;
- aumentar área touch;
- aumentar bobinas;
- ajustar labelFontSize;
- reposicionar labels para não colarem no símbolo;
- limitar labels muito longas com truncamento elegante;
- evitar poluição visual.

Critério:
Contato NA, contato NF e bobina devem ser reconhecíveis rapidamente no celular.

==================================================
4. POSIÇÃO DOS BLOCOS PRÓXIMOS AO RAIL DIREITO
==================================================

Problema:
Alguns blocos, especialmente TON à direita, ficam muito próximos do rail/borda.

Ajustar:
- garantir respiro entre bloco e rail direito;
- impedir que bloco ultrapasse a área útil;
- limitar colunas válidas para blocos largos, se necessário;
- blocos largos devem ocupar 2 ou 3 colunas visualmente;
- quando um bloco largo estiver em coluna final, reposicioná-lo para a esquerda sem quebrar a lógica.

Critério:
Nenhum bloco deve parecer cortado ou apertado contra o barramento direito.

==================================================
5. TAMANHO POR TIPO DE ELEMENTO
==================================================

Criar uma regra simples de proporção:
- contatos/bobinas: compactos, mas legíveis;
- blocos TON/CTU: maiores;
- comparadores: intermediários.

Se fizer sentido, organizar em ladderGeometry.ts:
- contactWidth
- contactHeight
- coilWidth
- coilHeight
- blockWidth
- blockHeight
- blockHeaderHeight
- blockColumnSpan
- compareWidth
- compareHeight

Critério:
Blocos funcionais não devem usar a mesma densidade visual de contatos simples.

==================================================
6. ESCALA MOBILE DO CANVAS
==================================================

Problema:
O Ladder ainda parece reduzido para caber inteiro na tela.

Avaliar:
- escala inicial;
- minScale;
- maxScale;
- largura interna;
- scroll horizontal interno.

Direção:
É melhor o usuário rolar horizontalmente um pouco do que perder legibilidade.

Critérios:
- não pode haver scroll horizontal global da página;
- scroll horizontal deve ser apenas dentro do canvas Ladder;
- elementos devem ficar legíveis no zoom inicial;
- botões e tabs continuam fixos/visíveis.

==================================================
7. PRESERVAR MODO SIMULAR LIMPO
==================================================

Garantir que não volte:
- botão Parar flutuante inferior;
- card grande de simulação sobre o canvas;
- FAB Componentes no modo Simular;
- workspaceHint sobre o Ladder.

Critério:
Modo Simular continua limpo.

==================================================
8. TESTAR CASOS VISUAIS
==================================================

Testar:
- rung simples com contato + bobina;
- contato NF;
- CTU central;
- TON central;
- TON próximo ao rail direito;
- branch paralelo;
- simulação rodando;
- modo edição parado;
- mobile estreito;
- desktop.

Corrigir apenas problemas objetivos.

==================================================
9. DOCUMENTAÇÃO
==================================================

Atualizar:

docs/EASYCLP_EDITOR_PILOT.md

Adicionar seção:
“Legibilidade mobile dos blocos”

Registrar:
- mudanças em TON/CTU;
- decisão de priorizar legibilidade sobre caber tudo na tela;
- comportamento de blocos largos;
- limitações restantes.

Atualizar:

docs/EASYCLP_MANUAL_TEST.md

Adicionar:
[ ] TON legível no mobile
[ ] CTU legível no mobile
[ ] Labels de contatos legíveis
[ ] Bobinas não ficam coladas no rail direito
[ ] Blocos largos não são cortados
[ ] Modo Simular continua sem overlays inferiores
[ ] Canvas permite leitura confortável mesmo com scroll horizontal interno

==================================================
10. VALIDAÇÃO
==================================================

Rodar:
npm run build
npm test, se existir
npm run typecheck, se existir

Se algum comando falhar:
- corrigir;
- não remover regra importante só para passar.

Commit sugerido:
style: improve EasyCLP ladder block readability

Ao final, informar:
- arquivos alterados;
- mudanças em TON/CTU;
- mudanças em contatos/bobinas;
- ajustes de escala;
- resultado dos comandos.

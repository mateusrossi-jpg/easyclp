Atue como Senior Frontend Engineer, Product Designer, UX Architect e especialista em editores Ladder/PLC mobile-first.

Projeto: EasyCLP.

Objetivo desta rodada:
Estabilizar a tela principal do editor Ladder do EasyCLP como uma tela piloto premium, mobile-first, funcional e visualmente coerente.

Contexto:
O EasyCLP deve ser um app para criar, editar e futuramente simular lógicas Ladder em celular e desktop.
O alvo visual é uma experiência inspirada em editores Ladder modernos, especialmente a clareza de app.plcsimulator.online e a usabilidade mobile de Simurelay, mas com implementação própria, identidade própria e sem copiar código ou identidade visual.

Prioridade desta rodada:
1. Tela principal do editor Ladder.
2. Layout visual premium.
3. Estrutura correta de rungs.
4. Inserção simples de componentes.
5. Branch/paralelo sem sobreposição.
6. Mobile-first.
7. Build funcionando.

Não priorizar nesta rodada:
- motor completo de simulação;
- exportação;
- login;
- backend;
- múltiplas telas avançadas;
- redesign total do app.

==================================================
REGRAS GERAIS
==================================================

- Não instalar dependências sem necessidade.
- Não mexer em package.json salvo se for realmente necessário e justificar.
- Não copiar código de terceiros.
- Não quebrar build.
- Não implementar simulação complexa agora.
- Não criar arquitetura exagerada.
- Não apagar funcionalidades úteis existentes sem motivo.
- Preservar o que já funciona.
- Corrigir visual, estrutura e UX da tela Ladder.
- Fazer mudanças em commits lógicos, se possível.
- Ao final, rodar validação.

==================================================
1. AUDITORIA INICIAL DO PROJETO
==================================================

Primeiro, mapear a estrutura atual do EasyCLP.

Identificar:
- framework usado;
- scripts disponíveis;
- arquivos principais do app;
- componentes do editor Ladder;
- componentes de toolbar/menu;
- CSS global;
- CSS do editor;
- estado atual de rungs/componentes;
- se existe simulação;
- se existe drag/drop;
- se existe branch/paralelo.

Pesquisar por termos:
- ladder
- rung
- branch
- parallel
- contact
- coil
- timer
- counter
- TON
- CTU
- editor
- simulation
- component palette
- toolbar

Antes de alterar muito, montar internamente este diagnóstico:
- arquivos principais encontrados;
- problemas visuais atuais;
- problemas estruturais;
- riscos;
- plano de alteração.

Não responder ao usuário ainda; implementar.

==================================================
2. DEFINIR A TELA PILOTO DO EDITOR
==================================================

A tela principal do EasyCLP deve ter esta composição:

Topo:
- botão de menu;
- título/logo “EasyCLP”;
- botão de play/iniciar destacado;
- visual limpo, premium e técnico.

Área central:
- editor Ladder em destaque;
- barramento esquerdo;
- barramento direito;
- rungs empilhadas verticalmente;
- linhas horizontais alinhadas;
- componentes bem posicionados;
- labels legíveis;
- scroll vertical confortável;
- scroll horizontal dentro do canvas se necessário.

Rodapé/ação mobile:
- botão “+ Componentes”;
- status “Simulação: Parada/Rodando”;
- botão “Iniciar” ou “Parar”, se não estiver no topo.

Critério:
A tela deve parecer app mobile-first real, não desktop espremido.

==================================================
3. DESIGN VISUAL OFICIAL DO EDITOR
==================================================

Aplicar uma estética clara, técnica e premium.

Direção:
- fundo geral off-white ou cinza muito suave;
- editor Ladder em superfície clara;
- botões arredondados com sombra leve;
- linhas Ladder pretas/cinza suaves;
- barramento esquerdo com destaque verde ou técnico;
- barramento direito escuro/preto;
- componentes com borda limpa;
- blocos TON/CTU com cabeçalho escuro e corpo claro;
- estados energizados com cor clara e consistente;
- não usar excesso de cores;
- não deixar flat demais;
- não deixar confuso.

Sugestão visual:
- background app: #F4F6F8 ou similar;
- canvas ladder: #FFFFFF;
- linha ladder: #111827 com opacidade suave;
- barramento esquerdo: verde técnico;
- barramento direito: #111827;
- cards/botões: branco com sombra leve;
- texto: #111827;
- secundário: #6B7280;
- ação principal: verde ou azul técnico, consistente.

Não precisa seguir exatamente esses hex se já houver tokens melhores, mas deve manter coerência.

==================================================
4. ESTRUTURA DOS RUNGS
==================================================

Cada rung deve be representada visualmente como uma linha Ladder clara.

Regras:
- cada rung tem altura mínima confortável;
- linhas começam no barramento esquerdo;
- linhas terminam no barramento direito;
- componentes ficam alinhados no eixo da linha;
- espaçamento entre componentes consistente;
- labels não se sobrepõem;
- seleção visual clara;
- rungs abaixo devem ser empurradas quando uma rung crescer por branch paralelo.

Critério obrigatório:
Nenhum branch paralelo pode sobrepor a rung de baixo.

Se o código atual usa posicionamento absoluto frágil, refatorar para grid/flex mais controlado, desde que não quebre o estado.

==================================================
5. COMPONENTES LADDER BÁSICOS
==================================================

Padronizar ou criar visual para:

Contatos:
- NA
- NF

Bobinas:
- Coil normal
- Set/Reset apenas se já existir

Blocos:
- TON
- CTU
- outros existentes, sem inventar complexidade

Cada componente deve ter:
- área de toque confortável;
- label/tag legível;
- tipo visível;
- estado visual selecionado;
- estado energizado/desenergizado se já houver simulação simples;
- largura mínima consistente;
- não quebrar em telas pequenas.

Exemplo de leitura visual:
- contato NA: símbolo simples com tag abaixo ou dentro;
- contato NF: símbolo com indicação de negação;
- coil: símbolo de saída;
- TON: bloco retangular com cabeçalho “TON”, nome, preset e acumulado se já houver.

==================================================
6. MENU “+ COMPONENTES”
==================================================

Criar ou refinar o botão:

+ Componentes

No mobile, esse botão deve abrir um bottom sheet ou painel inferior.

O painel deve conter categorias:
- Entradas
- Saídas
- Temporizadores
- Contadores
- Lógica, se existir
- Favoritos/Recentes, apenas se simples

Cada item deve:
- ter nome claro;
- ícone/símbolo simples;
- descrição curta;
- ser fácil de tocar.

Exemplos:
- Contato NA
- Contato NF
- Bobina
- Temporizador TON
- Contador CTU

Critério:
No celular, o usuário deve conseguir adicionar componentes sem drag preciso.

==================================================
7. INSERÇÃO DE COMPONENTES MOBILE-FIRST
==================================================

Implementar fluxo simples:

1. Usuário toca em uma rung ou ponto de inserção.
2. O ponto selecionado fica destacado.
3. Usuário toca em “+ Componentes”.
4. Escolhe um componente.
5. O componente é inserido no ponto selecionado.
6. O editor destaca brevemente o componente inserido.

Se não houver ponto selecionado:
- inserir na última rung;
- ou criar uma nova rung;
- mas deixar comportamento previsível.

Critério:
Sem depender exclusivamente de drag/drop.

Se drag/drop já existir:
- preservar;
- mas garantir que toque + seleção + menu funcione.

==================================================
8. ADICIONAR RUNG
==================================================

Deve existir uma forma clara de adicionar rung.

Pode ser:
- botão “+ Rung”;
- botão pequeno entre rungs;
- opção no menu de componentes.

Critério:
Adicionar uma rung não deve quebrar alinhamento.

Nova rung deve:
- aparecer abaixo da última;
- conter linha horizontal;
- permitir seleção;
- aceitar componentes.

==================================================
9. BRANCH / PARALELO
==================================================

Implementar ou corrigir o comportamento de branch paralelo.

Regras:
- branch paralelo pertence à rung atual;
- branch paralelo cresce para baixo dentro da própria rung;
- a altura da rung aumenta automaticamente;
- as rungs seguintes descem;
- linhas verticais conectam início e fim do paralelo;
- componentes do branch têm alinhamento consistente;
- não há sobreposição visual.

Fluxo desejado:
- selecionar componente ou segmento;
- clicar/tocar em “Adicionar paralelo”;
- criar branch abaixo;
- permitir inserir componentes nesse branch.

Se a implementação completa for arriscada:
- criar suporte visual e estrutural básico;
- documentar pendência para edição avançada;
- mas garantir que branch existente não sobreponha layout.

Critério obrigatório:
Branch paralela não invade a próxima rung.

==================================================
10. SELEÇÃO E AÇÕES CONTEXTUAIS
==================================================

Quando um componente/rung estiver selecionado, exibir ações simples:

- Editar tag;
- Adicionar paralelo;
- Remover;
- Duplicar, se simples;
- Inserir antes/depois, se simples.

No mobile:
- ações podem aparecer em bottom sheet;
- ou barra contextual inferior.

Não poluir a interface com ações sempre visíveis.

Critério:
A tela principal permanece limpa.

==================================================
11. SIMULAÇÃO BÁSICA / STATUS
==================================================

Não implementar motor completo nesta rodada, salvo se já existir.

Garantir:
- botão Iniciar/Parar muda estado visual;
- status mostra:
  Simulação: Parada
  Simulação: Rodando
- quando rodando, componentes podem exibir estado visual básico se já houver lógica;
- se não houver lógica, apenas status funcional.

Critério:
Botão não deve fingir simulação complexa se ainda não existir motor real.

Documentar pendência.

==================================================
12. RESPONSIVIDADE
==================================================

Mobile:
- header não quebra;
- botões têm tamanho mínimo confortável;
- editor ocupa tela;
- ladder pode ter scroll horizontal interno;
- não há scroll horizontal global da página;
- bottom sheet cabe na tela;
- labels não cortam de forma feia.

Desktop:
- editor pode ficar centralizado;
- largura maior;
- menu pode aparecer lateralmente se já fizer sentido;
- não prejudicar mobile.

Critério:
A experiência mobile é a principal.

==================================================
13. LIMPEZA VISUAL
==================================================

Corrigir:
- desalinhamentos;
- fontes inconsistentes;
- botões pequenos;
- excesso de bordas;
- cores soltas;
- cards sem padrão;
- componentes grudados;
- rungs muito achatadas;
- blocos TON/CTU mal posicionados;
- branches sobrepostas;
- texto ilegível.

Não fazer:
- redesign completo de marca;
- tema escuro;
- múltiplas variações visuais.

==================================================
14. TESTES AUTOMÁTICOS
==================================================

Se houver estrutura de testes:
Adicionar testes leves para:
- renderizar editor;
- existir botão + Componentes;
- existir status de simulação;
- existir pelo menos uma rung;
- adicionar rung;
- adicionar componente básico;
- adicionar branch não remove rung;
- botão iniciar alterna status.

Se não houver testes:
- não criar setup complexo;
- documentar teste manual.

==================================================
15. DOCUMENTAÇÃO
==================================================

Criar ou atualizar:

docs/EASYCLP_EDITOR_PILOT.md

Conteúdo obrigatório:

# EasyCLP — Editor Ladder Pilot

## Objetivo
Estabilizar a tela principal do editor Ladder mobile-first.

## Decisões de UX
- Mobile-first.
- Inserção por seleção + menu, não apenas drag/drop.
- Rungs com altura dinâmica.
- Branch paralelo empurra rungs seguintes.

## Estrutura visual
- Header.
- Canvas Ladder.
- Barramentos.
- Rungs.
- Componentes.
- Bottom sheet de componentes.
- Status de simulação.

## Fluxo de uso
1. Criar rung.
2. Selecionar ponto.
3. Abrir + Componentes.
4. Inserir componente.
5. Adicionar paralelo.
6. Iniciar/parar simulação básica.

## Pendências
- Motor completo de simulação.
- Validação Ladder avançada.
- Exportação/importação.
- Biblioteca completa de blocos.

==================================================
16. CHECKLIST MANUAL
==================================================

Criar ou atualizar:

docs/EASYCLP_MANUAL_TEST.md

Checklist:

[ ] App abre sem erro
[ ] Editor Ladder aparece
[ ] Header está alinhado
[ ] Existe botão + Componentes
[ ] Menu de componentes abre no mobile
[ ] Adicionar rung funciona
[ ] Adicionar contato NA funciona
[ ] Adicionar contato NF funciona
[ ] Adicionar bobina funciona
[ ] Adicionar TON funciona, se existir
[ ] Adicionar branch paralelo funciona
[ ] Branch não sobrepõe rung seguinte
[ ] Simulação Iniciar/Parar muda status
[ ] Mobile não tem scroll horizontal global
[ ] Desktop continua usável
[ ] Build passa

==================================================
17. VALIDAÇÃO
==================================================

Rodar os comandos disponíveis.

Tentar nesta ordem:

npm run typecheck
npm test
npm run build

Se algum script não existir:
- usar o equivalente disponível;
- documentar.

Se build falhar:
- corrigir.
- não deixar projeto quebrado.

==================================================
18. RESULTADO FINAL
==================================================

Ao final, informar:

- arquivos alterados;
- tela piloto estabilizada;
- como inserir componentes;
- como adicionar rung;
- como adicionar branch paralelo;
- o que ficou pendente;
- comandos executados;
- resultado dos comandos.

Commit sugerido:

feat: stabilize EasyCLP ladder editor pilot

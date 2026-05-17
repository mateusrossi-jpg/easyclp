# EasyCLP — Manual Test Checklist

Use this checklist to verify the stability and UX of the Ladder Editor Pilot.

## General App State
- [ ] App opens without errors (Splash screen to Main screen).
- [ ] Editor Ladder is visible and centered.
- [ ] Header (TopActionBar) is aligned and responsive.

## Ladder Editor Interactions
- [ ] Tapping a Rung highlights it.
- [ ] Tapping an empty cell highlights it.
- [ ] Button "+ Componentes" opens the component menu (bottom sheet).
- [ ] Adding a Rung works (appears at the end or after selected).
- [ ] Adding a Contact (XIC/XIO) works.
- [ ] Adding a Coil works.
- [ ] Adding a Timer (TON) works.
- [ ] Adding a Counter (CTU) works.
- [ ] Adding a Parallel Branch works.

## Visual & Structural Integrity
- [ ] TON/CTU blocks are clearly legible (text size, contrast).
- [ ] Branches do NOT overlap the next rung.
- [ ] Rung height adjusts automatically when a branch is added.
- [ ] Labels/Addresses are legible and correctly positioned.
- [ ] Long addresses are truncated elegantly.
- [ ] Bus bars (Rails) have consistent visual weight and premium look.
- [ ] Large blocks do NOT overlap the right rail (auto-nudge).
- [ ] Horizontal scroll works inside the Ladder canvas.
- [ ] No global horizontal scroll on the page (mobile).

## Simulation & State
- [ ] "Iniciar" button starts the simulation.
- [ ] Status shows "Simulação em execução" in the header.
- [ ] Orientation banner "Toque em contatos BOOL..." is visible in simulation.
- [ ] "Parar" button stops the simulation.
- [ ] Status shows "Simulação pausada" in the header.
- [ ] Basic logic (XIC -> Coil) works visually (path energizes).

## Contextual Actions
- [ ] Selecting an element shows "Editar", "Duplicar", "Excluir".
- [ ] Selecting a Rung shows "Documentar", "Paralelo", "Variáveis", "Excluir".
- [ ] Documenting a Rung works (opens prompt and saves it).
- [ ] Deleting an element clears the cell.
- [ ] Duplicating an element copies it to the next available empty cell.
- [ ] Deleting a rung works and resequences orders.

## Technical
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` (expo export) completes without errors.

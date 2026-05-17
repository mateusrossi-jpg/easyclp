# EasyCLP — Manual Test Checklist

Use this checklist to verify the stability and UX of the Ladder Editor Pilot.

## General App State
- [ ] App opens without errors (Splash screen to Main screen).
- [ ] Editor Ladder is visible and centered.
- [ ] Header (TopActionBar) is aligned, compact, and responsive.

## Ladder Editor Interactions
- [ ] Tapping a Rung highlights it with a thick technical border.
- [ ] Tapping an empty cell highlights it.
- [ ] Button "+ Componentes" opens the tactile component menu.
- [ ] Menu items show visual feedback when pressed.
- [ ] Adding a Rung works and resequences orders.
- [ ] Adding a Contact (XIC/XIO) works.
- [ ] Adding a Coil works.
- [ ] Adding a Timer (TON) works.
- [ ] Adding a Counter (CTU) works.
- [ ] Adding a Parallel Branch works (dotted guides appear).

## Visual & Structural Integrity
- [ ] TON/CTU blocks look like professional chassis (depth, header detail).
- [ ] TON/CTU blocks show "Energized" LED when power is in.
- [ ] Contacts and Coils are crisp and professional.
- [ ] Rung-to-Rail junctions show connection nodes (circles).
- [ ] Branches do NOT overlap the next rung.
- [ ] Labels/Addresses are legible and correctly positioned.
- [ ] Long addresses are truncated elegantly (max 14 chars).
- [ ] Bus bars (Rails) have consistent visual weight and premium look.
- [ ] Large blocks do NOT overlap the right rail (auto-nudge).

## Simulation & State
- [ ] "Iniciar" button starts the simulation.
- [ ] Status shows "Simulação em execução" in the header.
- [ ] Metrics (Rungs, Signals) update in real-time.
- [ ] Energized paths show a "Filamental Glow" effect in vibrant green.
- [ ] "Parar" button stops the simulation.

## Contextual Actions
- [ ] Selecting an element shows contextual menu (Editar, Duplicar, Excluir).
- [ ] Selecting a Rung shows "Documentar", "Paralelo", "Variáveis", "Excluir".
- [ ] Documenting a Rung works (saves italic comment above rung).

## Technical
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` (expo export) completes without errors.

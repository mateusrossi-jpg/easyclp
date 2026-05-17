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
- [ ] Branches do NOT overlap the next rung.
- [ ] Rung height adjusts automatically when a branch is added.
- [ ] Labels/Addresses are legible and correctly positioned.
- [ ] Bus bars (Rails) have consistent visual weight and premium look.
- [ ] Horizontal scroll works inside the Ladder canvas.
- [ ] No global horizontal scroll on the page (mobile).

## Simulation & State
- [ ] "Iniciar" button starts the simulation.
- [ ] Status shows "Simulação: Rodando".
- [ ] "Parar" button stops the simulation.
- [ ] Status shows "Simulação: Parada".
- [ ] Basic logic (XIC -> Coil) works visually (path energizes).

## Contextual Actions
- [ ] Selecting an element shows "Editar", "Duplicar", "Excluir".
- [ ] Deleting an element clears the cell.
- [ ] Duplicating an element copies it to the next available empty cell.
- [ ] Deleting a rung works and resequences orders.

## Technical
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` (or expo export) completes without errors.

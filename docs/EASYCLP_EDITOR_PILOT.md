# EasyCLP Editor Pilot Documentation

## Objective
Stabilize the main Ladder editor screen with a mobile-first premium experience, ensuring visual consistency, technical precision, and a clean interface.

## UI/UX Decisions
- **Mobile-First Grid**: Switched to a standardized 12-column grid system for all rungs.
- **Airy Rungs**: Increased rung heights and branch gaps to ensure a comfortable touch experience.
- **Premium Rails**: Added depth and subtle shadows to the bus bars (rails) to give an industrial yet modern look.
- **Clean Palette**: Uses off-white/canvas colors for the editor area to reduce eye strain.
- **Consistent Alignment**: Removed hardcoded element positions in favor of a strictly column-based calculation (`getElementX`).

## Rung Structure
Each rung is now rendered within a 12-column grid:
- **Left Rail**: Start of power.
- **Right Rail**: End of power (where coils are usually placed).
- **Columns**: 12 slots for contacts, blocks, and coils.
- **Vertical Growth**: Parallel branches automatically increase the rung's height and maintain vertical alignment without overlapping other rungs.

## Component Insertion Flow
1. **Tap/Select**: User taps a rung or an empty cell.
2. **Component Menu**: User taps "+ Componentes" to open the bottom sheet.
3. **Insert**: Selecting a component inserts it into the selected point.
4. **Drag & Drop**: Supported as a secondary interaction method for desktop and advanced mobile users.

## Parallel Branch Logic
- Parallel branches are tied to the rung.
- They connect vertical lines at the center of the columns.
- Resizing handles are available in "Edit" mode to adjust the branch's span.

## Pending for Simulation
- The simulation engine (`ladderEngine.ts`) is functional but may require further refinement for complex nested branches.
- Real-time visualization of energized paths is implemented but needs testing with multi-level parallel branches.

## Key Files
- `src/consts/ladderGeometry.ts`: Central source of truth for all measurements.
- `src/components/LadderRenderer.tsx`: Main SVG rendering engine.
- `src/store/useLadderStore.ts`: Global state and business logic.

# ForgeCAD Models

This folder contains the parametric ForgeCAD source files used to design and iterate R3Bin.

## Main Model

- `smart-bin-layout.forge.js`: top-level assembly model.

## Key Modules

- `rotating-disk-module.forge.js`: rotating disk, NEMA support, guide path, KW11 reference geometry.
- `bucket-storage-bins.forge.js`: bucket/storage design iteration.
- `printed-structure-brackets.forge.js`: structural brackets.
- `pvc-cut-layout.forge.js`: PVC cutting layout.
- `styrene-cut-layout.forge.js`: styrene cutting reference.

## Run

```bash
forgecad run smart-bin-layout.forge.js
```

## Note

Some ForgeCAD-generated print kits document earlier design iterations. The final physical bucket uses manually cut styrene dividers rather than the printed bucket divider structures.


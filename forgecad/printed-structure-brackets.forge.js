// Printable structural bracket kit for the smart bin.
// Material recommendation: PETG, 0.2 mm layer height, 4 perimeters, 35-45% infill.
// Fasteners: 1/8 in screws/bolts with nuts.
// All printed bracket holes are 4.0 mm clearance holes so the bolts pass
// through freely even after FDM shrink/sag.
// PVC mates should use smaller pilot holes for self-tapping screws; acrylic mates
// should use clearance holes with washers/nuts to avoid cracking the acrylic.

const BOLT_CLEAR = 2; // 4.0 mm diameter
const BRACKET_THICK = 4;
const preview = Param.bool("Preview Layout", true);

const C = {
  petg: "#111111",
  accent: "#2f4858",
};

function m3HoleAlongZ(x, y, z, h = 14) {
  return cylinder(h, BOLT_CLEAR, undefined, 24).translate(x, y, z - h / 2);
}

function m3HoleAlongY(x, y, z, h = 14) {
  return cylinder(h, BOLT_CLEAR, undefined, 24).pointAlong([0, 1, 0]).translate(x, y - h / 2, z);
}

function m3HoleAlongX(x, y, z, h = 14) {
  return cylinder(h, BOLT_CLEAR, undefined, 24).pointAlong([1, 0, 0]).translate(x - h / 2, y, z);
}

function verticalCornerBracket() {
  const height = 78;
  const leg = 28;
  const thick = BRACKET_THICK;
  const center = leg / 2 - thick / 2;
  const usableCenter = thick / 2 + (leg - thick) / 2;
  const spine = box(thick, thick, height).translate(0, 0, 0);
  const xLeg = box(leg, thick, height).translate(center, 0, 0);
  const yLeg = box(thick, leg, height).translate(0, center, 0);
  const deckShelf = box(leg, leg, thick).translate(center, center, 0);
  return union(spine, xLeg, yLeg, deckShelf)
    .subtract(
      m3HoleAlongY(usableCenter, -2, 18),
      m3HoleAlongY(usableCenter, -2, 58),
      m3HoleAlongX(-2, usableCenter, 18),
      m3HoleAlongX(-2, usableCenter, 58),
      m3HoleAlongZ(usableCenter, usableCenter, thick / 2, 8)
    )
    .color(C.petg);
}

function floorCornerBracket() {
  const leg = 34;
  const tall = 30;
  const thick = BRACKET_THICK;
  const center = leg / 2 - thick / 2;
  const usableCenter = thick / 2 + (leg - thick) / 2;
  const base = box(leg, leg, thick).translate(center, center, 0);
  const xWall = box(leg, thick, tall).translate(center, 0, thick);
  const yWall = box(thick, leg, tall).translate(0, center, thick);
  return union(base, xWall, yWall)
    .subtract(
      m3HoleAlongZ(usableCenter, usableCenter, thick / 2, 8),
      m3HoleAlongY(usableCenter, -2, 20),
      m3HoleAlongX(-2, usableCenter, 20)
    )
    .color(C.petg);
}

function frontOpenFloorBracket() {
  const leg = 34;
  const tall = 30;
  const thick = BRACKET_THICK;
  const center = leg / 2 - thick / 2;
  const sideClearCenter = thick / 2 + (leg - thick) / 2;
  const base = box(leg, leg, thick).translate(center, center, 0);
  const sideWall = box(thick, leg, tall).translate(0, center, thick);
  return union(base, sideWall)
    .subtract(
      m3HoleAlongZ(sideClearCenter, center, thick / 2, 8),
      m3HoleAlongX(-2, center, 20)
    )
    .color(C.petg);
}

function deckSupportBracket() {
  const thick = BRACKET_THICK;
  const wallPlate = box(38, thick, 36).translate(0, 0, 0);
  const shelf = box(38, 30, thick).translate(0, 12.5, 36);
  const sideGusset = (x) =>
    polygon([
      [0, 0],
      [30, 36],
      [0, 36],
    ])
      .extrude(4)
      .transform([
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 0, 0, 0,
        x - 2, -2.5, 0, 1,
      ]);
  const gussetA = sideGusset(-17);
  const gussetB = sideGusset(17);
  return union(wallPlate, shelf, gussetA, gussetB)
    .subtract(
      m3HoleAlongY(-8, -2, 10),
      m3HoleAlongY(8, -2, 26),
      m3HoleAlongZ(-8, 15, 36 + thick / 2, 8),
      m3HoleAlongZ(8, 15, 36 + thick / 2, 8)
    )
    .color(C.petg);
}

const bracketKit = group(
  { name: "PETG vertical inside corner L-bracket", shape: verticalCornerBracket() },
  { name: "PETG floor/base corner L-bracket", shape: floorCornerBracket().translate(80, 0, 0) },
  { name: "PETG front-open floor/base bracket", shape: frontOpenFloorBracket().translate(160, 0, 0) },
  { name: "PETG internal deck support bracket", shape: deckSupportBracket().translate(240, 0, 0) }
);

return {
  bracketKit: preview ? bracketKit : group(),
  parts: {
    verticalCornerBracket: verticalCornerBracket(),
    floorCornerBracket: floorCornerBracket(),
    frontOpenFloorBracket: frontOpenFloorBracket(),
    deckSupportBracket: deckSupportBracket(),
  },
  notes: {
    material: "PETG recommended for strength and screw pressure resistance",
    fasteners: "Bracket holes are 4.0 mm clearance holes for 1/8 in bolts with nuts",
    pvcMates: "For bolt-and-nut assembly, drill matching clearance holes through PVC. For self-tapping screws, use smaller pilot holes in PVC instead",
    acrylicMates: "Use clearance holes through acrylic with washers and nuts; do not self-tap into acrylic",
    printOrientation: "Print flat on the largest outside face; avoid supports where possible",
  },
};

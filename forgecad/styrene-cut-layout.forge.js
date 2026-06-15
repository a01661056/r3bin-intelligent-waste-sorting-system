// 30 pt styrene cut layout for the R3Bin bucket divider sheets.
// Units: millimeters. Stock sheet assumed to be 120 x 76 cm = 1200 x 760 mm.
//
// Includes:
// - 6 main tapered radial dividers for the removable bucket.
// - 6 small near-hub closure strips for the gap between adjacent divider rails.

const sheetW = 1200;
const sheetH = 760;
const margin = 20;
const gap = 16;

const C = {
  sheet: "#f5f0dc",
  cut: "#1f5368",
  hole: "#1f5368",
  spare: "#d08c2f",
};

const bucketH = 275;
const bottomT = 7;
const bottomInsideDia = 205;
const topOpeningDia = 300;
const upperHubR = 18;
const lowerHubR = 16;
const dividerH = bucketH - bottomT - 12;
const coreR = upperHubR + 4;
const bottomEndR = bottomInsideDia / 2 - 5;
const topEndR = topOpeningDia / 2 - 6;

const mainDividerBottomW = bottomEndR - coreR; // 75.5 mm
const mainDividerTopW = topEndR - coreR;       // 122 mm
const mainDividerW = mainDividerTopW;
const mainDividerHoleDia = 4;

const lowerRailInnerR = lowerHubR + 2;
const lowerRailOuterR = bottomInsideDia / 2 - 2.5;
const upperRailInnerR = upperHubR + 2;
const upperRailOuterR = topOpeningDia / 2 - 8;
const armCrossScrewFractions = [0.38, 0.68];

const bucketZ = 5;
const sheetBottomZ = bucketZ + bottomT + 3.8;
const lowerHoleY = (bucketZ + bottomT + 0.4 + 3 + 9 / 2) - sheetBottomZ;
const upperHoleY = (bucketZ + bucketH - 31 + 14 / 2) - sheetBottomZ;

const lowerHoleXs = armCrossScrewFractions.map((fraction) =>
  lowerRailInnerR + (lowerRailOuterR - lowerRailInnerR) * fraction - coreR
);
const upperHoleXs = armCrossScrewFractions.map((fraction) =>
  upperRailInnerR + (upperRailOuterR - upperRailInnerR) * fraction - coreR
);

const closureStripW = 8;
const closureStripH = dividerH;
const closureLockHoleDia = 3;
const lowerClosureLockHoleY = (bucketZ + bottomT + 0.4 + 3 + 9 / 2) - sheetBottomZ;
const upperClosureLockHoleY = (bucketZ + bucketH - 31 + 14 / 2) - sheetBottomZ;

function stockOutline() {
  return stroke([
    [0, 0],
    [sheetW, 0],
    [sheetW, sheetH],
    [0, sheetH],
    [0, 0],
  ], 1).color(C.sheet);
}

function mainDividerProfile() {
  const body = polygon([
    [0, 0],
    [mainDividerBottomW, 0],
    [mainDividerTopW, dividerH],
    [0, dividerH],
  ]);

  const holes = [
    ...lowerHoleXs.map((x) => circle2d(mainDividerHoleDia / 2, 32).translate(x, lowerHoleY)),
    ...upperHoleXs.map((x) => circle2d(mainDividerHoleDia / 2, 32).translate(x, upperHoleY)),
  ];

  return difference2d(body, ...holes);
}

function closureStripProfile() {
  return difference2d(
    rect(closureStripW, closureStripH),
    circle2d(closureLockHoleDia / 2, 32).translate(0, lowerClosureLockHoleY - closureStripH / 2),
    circle2d(closureLockHoleDia / 2, 32).translate(0, upperClosureLockHoleY - closureStripH / 2)
  );
}

function placeMainDivider(index) {
  const x = margin + index * (mainDividerW + gap);
  const y = margin;

  return mainDividerProfile()
    .translate(x, y)
    .color(C.cut);
}

function placeClosureStrip(index) {
  const x = margin + 6 * (mainDividerW + gap) + 30 + index * (closureStripW + 9);
  const y = margin + closureStripH / 2;

  return closureStripProfile()
    .translate(x + closureStripW / 2, y)
    .color(C.cut);
}

function placeReferenceCoupon() {
  // Small test piece with the same 4 mm hole used in the main dividers.
  return difference2d(
    rect(35, 25).translate(0, 0),
    circle2d(mainDividerHoleDia / 2, 32)
  )
    .translate(margin + 6 * (mainDividerW + gap) + 30, margin + closureStripH + 35)
    .color(C.spare);
}

const cutProfiles = [
  ...Array.from({ length: 6 }, (_, i) => placeMainDivider(i)),
  ...Array.from({ length: 6 }, (_, i) => placeClosureStrip(i)),
  placeReferenceCoupon(),
];

return {
  layout: union2d(stockOutline(), ...cutProfiles),
  specs: {
    sheet: "1200 x 760 mm styrene sheet (120 x 76 cm)",
    material: "30 pt styrene, approximately 0.762 mm thick",
    mainDividers: "6 tapered radial divider sheets, 256 mm tall, 75.5 mm bottom radial span, 122 mm top radial span",
    mainDividerHoles: "4 mm holes matching bucket PETG spider rail cross screws",
    nearHubClosureStrips: "6 small closure strips, 8 x 256 mm, same height as the main dividers, with 3 mm lower and upper locking holes for 2.5 mm screws",
  },
};

// PVC cut layout for the smart waste-sorting bin.
// Units: millimeters. Material: 5 mm foamed PVC sheet, stock 1220 x 2440.
//
// This file is intentionally 2D-first: each returned sketch is a cut profile
// laid out on the stock sheet, ready to become an SVG/DXF cutting layout.

const sheetW = 1220;
const sheetH = 2440;
const pvc = 5;
const kerf = Param.number("Kerf Reference", 2, { min: 0, max: 5, unit: "mm" });

const outerW = 500;
const outerD = 400;
const outerH = 800;
const frontPanelH = 650;
const frontPanelZ0 = 150;
const electronicsBayX = outerW / 2 - 150;
const electronicsBayY = -outerD / 2 + 120;
const inletX = -outerW / 2 + 120;
const inletY = -outerD / 2 + 120;
const inletRadius = 90;
const inletScaleX = 1;
const inletScaleY = 1;

const C = {
  sheet: "#f4edcf",
  cut: "#1f5368",
  deck: "#5a7d90",
  note: "#d08c2f",
};

function atSheet(sketch, x, y, w, h) {
  return sketch.translate(x + w / 2, y + h / 2);
}

function namedPart(name, sketch, x, y, w, h, color = C.cut) {
  return {
    name,
    sketch: atSheet(sketch, x, y, w, h).color(color),
  };
}

function screwCircle(x, y, r = 1.7) {
  return circle2d(r).translate(x, y);
}

function frontPanelProfile() {
  return rect(outerW, frontPanelH);
}

function sidePanelProfile() {
  return rect(outerD, outerH);
}

function topCoverProfile() {
  const inletOpening = circle2d(inletRadius, 96)
    .translate(inletX, inletY);
  const electronicsBayOpening = rect(150, 100).translate(electronicsBayX, electronicsBayY);
  return difference2d(
    rect(outerW, outerD),
    inletOpening,
    electronicsBayOpening
  );
}

function basePanelProfile() {
  return rect(outerW, outerD);
}

function level1DeckProfile() {
  const analysisGateOpening = rect(190, 150).translate(0, -20);
  return difference2d(
    rect(outerW, outerD),
    analysisGateOpening
  );
}

function level2DeckProfile() {
  return difference2d(
    rect(outerW, outerD),
    circle2d(170, 128)
  );
}

function level3DeckProfile() {
  return difference2d(
    rect(outerW, outerD),
    circle2d(170, 128)
  );
}

const stockSheet = stroke([
  [0, 0],
  [sheetW, 0],
  [sheetW, sheetH],
  [0, sheetH],
  [0, 0],
], 1)
  .color(C.sheet);

const parts = [
  namedPart("Front PVC upper service panel 500 x 650", frontPanelProfile(), 20, 20, 500, frontPanelH),
  namedPart("Left PVC side panel 400 x 800", sidePanelProfile(), 540, 20, 400, 800),
  namedPart("Right PVC side panel 400 x 800", sidePanelProfile(), 20, 690, 400, 800),
  namedPart("Top PVC cover 500 x 400 with inlet and electronics bay opening", topCoverProfile(), 540, 840, 500, 400),
  namedPart("Bottom PVC base panel 500 x 400", basePanelProfile(), 540, 1260, 500, 400),
  namedPart("Level 1 analysis deck 500 x 400 with temporary gate opening", level1DeckProfile(), 20, 1510, 500, 400, C.deck),
  namedPart("Level 2 deck 500 x 400 with 340 mm circular clearance cutout", level2DeckProfile(), 540, 1680, 500, 400, C.deck),
  namedPart("Level 3 container support deck 500 x 400 with storage drop opening", level3DeckProfile(), 20, 1930, 500, 400, C.deck),
];

// Export note:
// ForgeCAD's sketch exporters consume a single top-level sketch. Keep all cut
// profiles merged into one disconnected sketch so SVG/CAM export includes every
// panel instead of only the stock outline.
return union2d(
  ...parts.map((part) => part.sketch),
  stockSheet
);

// Level 3 real bucket storage module for R3Bin.
// This replaces the printed six-sector bin cartridge with one removable bucket.
// Units: millimeters. Z-up coordinate system.

const level2Bottom = 350;
const level3Bottom = 0;
const bucketHeightInput = 275;
const bucketX = 0;
const bucketY = 0;

const C = {
  bucket: "#4b1f83",
  petg: "#111111",
  styrene: "#f5f0dc",
  screwHole: "#d8d8d8",
};

const outerBaseDia = 214;
const bottomInsideDia = 205;
const outerTopDia = 314;
const topOpeningDia = 300;
const wallT = 7;
const bottomT = 7;
const bottomClearance = 5;
const segments = 144;
const dividerCount = 6;
const styreneT = 0.762; // 30 pt styrene = 0.030 in = 0.762 mm
const styreneSlot = 1.2;
const screwClearanceDia = 4;
const railScrewSideOffset = 4.3;
const armCrossScrewDia = 4;
const armCrossScrewPathLength = 14;
const armCrossScrewFractions = [0.38, 0.68];
const bucketWallFootLength = 7;
const bucketWallFootWidth = 34;
const bucketWallFootHoleOffset = 11.5;
const bucketWallFootScrewPathLength = 18;
const lowerBucketWallFootH = 7;
const upperBucketWallFootH = 8;
const lowerHubR = 16;
const upperHubR = 18;
const lowerHubH = 5;
const upperHubH = 5;
const lowerHubScrewR = 10.8;
const upperHubScrewR = 12;
const sectorBridgeR = 25;
const sectorBridgeW = 4.6;
const sectorBridgeH = 7;
const sectorBridgeEndOverlap = 0;
const sectorBridgeScrewOffset = 4.3;
const sectorBridgeFootLength = 18;
const sectorBridgeFootWidth = 4.6;
const sectorBridgeFootScrewDia = 3;
const sectorBridgeFootCenterOutwardShift = 3;
const sectorBridgeFootHoleOutwardOffset = 9;
const sectorBridgeScrewPathLength = 22;
const sectorBridgeSlotInset = 5.2;
const sectorBridgeClosureLockDia = 3;
const sectorBridgeClosureLockPathLength = 20;

function polar(radius, angleDeg) {
  const a = angleDeg * Math.PI / 180;
  return [radius * Math.cos(a), radius * Math.sin(a)];
}

function radialBox(length, width, height, centerR, z, angleDeg, color) {
  const [x, y] = polar(centerR, angleDeg);
  return box(length, width, height)
    .rotateZ(angleDeg)
    .translate(x, y, z)
    .color(color)
    .material({ roughness: 0.55 });
}

function radialCylinderCut(length, diameter, centerR, z, angleDeg, segmentsOverride = 28, sideOffset = 0) {
  const [rx, ry] = polar(centerR, angleDeg);
  const [sx, sy] = polar(sideOffset, angleDeg + 90);
  return cylinder(length, diameter / 2, undefined, segmentsOverride)
    .translate(0, 0, -length / 2)
    .rotateY(90)
    .rotateZ(angleDeg)
    .translate(rx + sx, ry + sy, z);
}

function verticalCylinderCut(height, diameter, centerR, z, angleDeg, segmentsOverride = 28, sideOffset = 0) {
  const [rx, ry] = polar(centerR, angleDeg);
  const [sx, sy] = polar(sideOffset, angleDeg + 90);
  return cylinder(height, diameter / 2, undefined, segmentsOverride)
    .translate(rx + sx, ry + sy, z);
}

function verticalCylinderAt(height, diameter, x, y, z, segmentsOverride = 28) {
  return cylinder(height, diameter / 2, undefined, segmentsOverride)
    .translate(x, y, z);
}

function horizontalCylinderAt(length, diameter, x, y, z, angleDeg, segmentsOverride = 28) {
  return cylinder(length, diameter / 2, undefined, segmentsOverride)
    .translate(0, 0, -length / 2)
    .rotateY(90)
    .rotateZ(angleDeg)
    .translate(x, y, z);
}

function verticalPad(height, radius, centerR, z, angleDeg, color) {
  const [x, y] = polar(centerR, angleDeg);
  return cylinder(height, radius, undefined, 40)
    .translate(x, y, z)
    .color(color)
    .material({ roughness: 0.55 });
}

function radialCurvedEndFoot(length, width, height, centerR, z, angleDeg, color) {
  const cornerRadius = 1.5;
  const rectangularFoot = radialBox(length, width, height, centerR, z, angleDeg, color);

  return fillet(rectangularFoot, cornerRadius, { parallel: [0, 0, 1], convex: true })
    .color(color)
    .material({ roughness: 0.55 });
}

function bucketWallFootScrewCutters(angleDeg, centerR, zCenter) {
  return [
    radialCylinderCut(
      bucketWallFootScrewPathLength,
      screwClearanceDia,
      centerR,
      zCenter,
      angleDeg,
      28,
      bucketWallFootHoleOffset
    ),
    radialCylinderCut(
      bucketWallFootScrewPathLength,
      screwClearanceDia,
      centerR,
      zCenter,
      angleDeg,
      28,
      -bucketWallFootHoleOffset
    ),
  ];
}

function boxBetweenPoints(p1, p2, width, height, z, color, extraLength = 0) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const length = Math.hypot(dx, dy) + extraLength;
  const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
  const centerX = (p1[0] + p2[0]) / 2;
  const centerY = (p1[1] + p2[1]) / 2;

  return box(length, width, height)
    .rotateZ(angleDeg)
    .translate(centerX, centerY, z)
    .color(color)
    .material({ roughness: 0.55 });
}

function boxAtPoint(length, width, height, x, y, z, angleDeg, color) {
  return box(length, width, height)
    .rotateZ(angleDeg)
    .translate(x, y, z)
    .color(color)
    .material({ roughness: 0.55 });
}

function pointOnArm(radius, angleDeg, sideOffset) {
  const [rx, ry] = polar(radius, angleDeg);
  const [sx, sy] = polar(sideOffset, angleDeg + 90);
  return [rx + sx, ry + sy];
}

function insetBridgePoint(from, to, distance) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return from;
  return [
    from[0] + (dx / len) * distance,
    from[1] + (dy / len) * distance,
  ];
}

function sectorBridgeSlotPoints(startAngleDeg) {
  const endAngleDeg = startAngleDeg + 360 / dividerCount;
  const screwA = pointOnArm(sectorBridgeR, startAngleDeg, sectorBridgeScrewOffset);
  const screwB = pointOnArm(sectorBridgeR, endAngleDeg, -sectorBridgeScrewOffset);

  return [
    insetBridgePoint(screwA, screwB, sectorBridgeSlotInset),
    insetBridgePoint(screwB, screwA, sectorBridgeSlotInset),
  ];
}

function sectorBridgeScrewPathCutters(startAngleDeg, zCenter) {
  const endAngleDeg = startAngleDeg + 360 / dividerCount;
  const screwHoleA = pointOnArm(
    sectorBridgeR + sectorBridgeFootHoleOutwardOffset,
    startAngleDeg,
    sectorBridgeScrewOffset
  );
  const screwHoleB = pointOnArm(
    sectorBridgeR + sectorBridgeFootHoleOutwardOffset,
    endAngleDeg,
    -sectorBridgeScrewOffset
  );

  return [
    horizontalCylinderAt(
      sectorBridgeScrewPathLength,
      sectorBridgeFootScrewDia,
      screwHoleA[0],
      screwHoleA[1],
      zCenter,
      startAngleDeg + 90
    ),
    horizontalCylinderAt(
      sectorBridgeScrewPathLength,
      sectorBridgeFootScrewDia,
      screwHoleB[0],
      screwHoleB[1],
      zCenter,
      endAngleDeg - 90
    ),
  ];
}

function sectorBridgeClosureLockCutter(startAngleDeg, zCenter) {
  const [slotA, slotB] = sectorBridgeSlotPoints(startAngleDeg);
  const dx = slotB[0] - slotA[0];
  const dy = slotB[1] - slotA[1];
  const bridgeAngleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
  const centerX = (slotA[0] + slotB[0]) / 2;
  const centerY = (slotA[1] + slotB[1]) / 2;

  return horizontalCylinderAt(
    sectorBridgeClosureLockPathLength,
    sectorBridgeClosureLockDia,
    centerX,
    centerY,
    zCenter,
    bridgeAngleDeg + 90
  );
}

function dividerArmBridgeScrewCutters(angleDeg, zCenter) {
  const plusSideHole = pointOnArm(
    sectorBridgeR + sectorBridgeFootHoleOutwardOffset,
    angleDeg,
    sectorBridgeScrewOffset
  );
  const minusSideHole = pointOnArm(
    sectorBridgeR + sectorBridgeFootHoleOutwardOffset,
    angleDeg,
    -sectorBridgeScrewOffset
  );

  return [
    horizontalCylinderAt(
      sectorBridgeScrewPathLength,
      sectorBridgeFootScrewDia,
      plusSideHole[0],
      plusSideHole[1],
      zCenter,
      angleDeg + 90
    ),
    horizontalCylinderAt(
      sectorBridgeScrewPathLength,
      sectorBridgeFootScrewDia,
      minusSideHole[0],
      minusSideHole[1],
      zCenter,
      angleDeg - 90
    ),
  ];
}

function armCrossScrewRadii(railInnerR, railOuterR) {
  return armCrossScrewFractions.map((fraction) =>
    railInnerR + (railOuterR - railInnerR) * fraction
  );
}

function lowerArmCrossScrewRadii(innerBaseR) {
  return armCrossScrewRadii(lowerHubR + 2, innerBaseR - 2.5);
}

function upperArmCrossScrewRadii(innerTopR) {
  return armCrossScrewRadii(upperHubR + 2, innerTopR - 8);
}

function lowerArmCrossScrewZ(z) {
  return z + bottomT + 0.4 + 3 + 9 / 2;
}

function upperArmCrossScrewZ(z, bucketH) {
  return z + bucketH - 31 + 14 / 2;
}

function armCrossScrewCutters(angleDeg, zCenter, radii) {
  return radii.map((radius) => {
    const [x, y] = polar(radius, angleDeg);
    return horizontalCylinderAt(
      armCrossScrewPathLength,
      armCrossScrewDia,
      x,
      y,
      zCenter,
      angleDeg + 90
    );
  });
}

function lowerSectorBridgeZ(z) {
  const lowerBaseH = 3;
  const lowerRibH = 9;
  const lowerRibCenterZ = z + bottomT + 0.4 + lowerBaseH + lowerRibH / 2;
  return lowerRibCenterZ - sectorBridgeH / 2;
}

function upperSectorBridgeZ(z, bucketH) {
  const upperRibH = 14;
  const upperRibCenterZ = z + bucketH - 31 + upperRibH / 2;
  return upperRibCenterZ - sectorBridgeH / 2;
}

function makeStyreneDivider(angleDeg, z, bucketH, innerBaseR, innerTopR) {
  const bottomZ = z + bottomT + 3.8;
  const dividerH = bucketH - bottomT - 12;
  const coreR = upperHubR + 4;
  const bottomEndR = innerBaseR - 5;
  const topEndR = innerTopR - 6;

  // Trapezoid follows the bucket taper: short at the bottom, wider near the rim.
  const sheet = polygon([
    [coreR, 0],
    [bottomEndR, 0],
    [topEndR, dividerH],
    [coreR, dividerH],
  ])
    .extrude(styreneT)
    .rotateX(90)
    .translate(0, styreneT / 2, bottomZ)
    .rotateZ(angleDeg);

  return sheet
    .subtract(
      ...armCrossScrewCutters(angleDeg, lowerArmCrossScrewZ(z), lowerArmCrossScrewRadii(innerBaseR)),
      ...armCrossScrewCutters(angleDeg, upperArmCrossScrewZ(z, bucketH), upperArmCrossScrewRadii(innerTopR))
    )
    .color(C.styrene)
    .material({ opacity: 0.45, roughness: 0.5 });
}

function makeBottomDividerRail(angleDeg, z, innerBaseR) {
  const railInnerR = lowerHubR + 2;
  const railOuterR = innerBaseR - 2.5;
  const railLength = railOuterR - railInnerR;
  const railCenterR = (railInnerR + railOuterR) / 2;
  const baseZ = z + bottomT + 0.4;
  const baseH = 3;
  const railW = 6.4;
  const ribT = 2.5;
  const ribH = 9;
  const ribOffset = styreneSlot / 2 + ribT / 2;
  const hubFootR = 4.5;
  const hubNeckW = railW;
  const hubFootOverlap = 2;

  const base = radialBox(railLength, railW, baseH, railCenterR, baseZ, angleDeg, C.petg);
  const ribA = radialBox(railLength, ribT, ribH, railCenterR, baseZ + baseH, angleDeg, C.petg)
    .translate(...polar(ribOffset, angleDeg + 90), 0);
  const ribB = radialBox(railLength, ribT, ribH, railCenterR, baseZ + baseH, angleDeg, C.petg)
    .translate(...polar(ribOffset, angleDeg - 90), 0);
  const innerFootZ = baseZ + lowerHubH;
  const innerNeckStartR = lowerHubScrewR;
  const innerNeckEndR = railInnerR + hubFootOverlap;
  const innerNeck = radialBox(
    innerNeckEndR - innerNeckStartR,
    hubNeckW,
    3,
    (innerNeckStartR + innerNeckEndR) / 2,
    innerFootZ,
    angleDeg,
    C.petg
  );
  const innerFoot = verticalPad(3, hubFootR, lowerHubScrewR, innerFootZ, angleDeg, C.petg);
  const outerBossCenterR = railOuterR + 0.5;
  const outerBossScrewZ = baseZ + baseH + 5;
  const outerBoss = radialCurvedEndFoot(
    bucketWallFootLength,
    bucketWallFootWidth,
    lowerBucketWallFootH,
    outerBossCenterR,
    baseZ + baseH + 1,
    angleDeg,
    C.petg
  );
  const slotStartR = railInnerR + hubFootOverlap;
  const slotEndR = railOuterR + 2;
  const slotCutter = radialBox(
    slotEndR - slotStartR,
    styreneSlot + 0.8,
    ribH + 4,
    (slotStartR + slotEndR) / 2,
    baseZ + baseH - 1,
    angleDeg,
    C.petg
  );

  const screwCutters = [
    verticalCylinderCut(6, screwClearanceDia, lowerHubScrewR, innerFootZ - 1, angleDeg),
    ...bucketWallFootScrewCutters(angleDeg, outerBossCenterR, outerBossScrewZ),
    ...armCrossScrewCutters(angleDeg, baseZ + baseH + ribH / 2, armCrossScrewRadii(railInnerR, railOuterR)),
    ...dividerArmBridgeScrewCutters(angleDeg, lowerSectorBridgeZ(z) + sectorBridgeH / 2),
  ];

  const rail = union(base, ribA, ribB, innerNeck, innerFoot, outerBoss)
    .subtract(slotCutter, ...screwCutters)
    .color(C.petg)
    .material({ roughness: 0.55 });

  return rail;
}

function makeSectorBridge(startAngleDeg, z, bucketH, top = false) {
  const endAngleDeg = startAngleDeg + 360 / dividerCount;
  const bridgeZ = top ? upperSectorBridgeZ(z, bucketH) : lowerSectorBridgeZ(z);
  const screwA = pointOnArm(sectorBridgeR, startAngleDeg, sectorBridgeScrewOffset);
  const screwB = pointOnArm(sectorBridgeR, endAngleDeg, -sectorBridgeScrewOffset);
  const screwHoleA = pointOnArm(sectorBridgeR + sectorBridgeFootHoleOutwardOffset, startAngleDeg, sectorBridgeScrewOffset);
  const screwHoleB = pointOnArm(sectorBridgeR + sectorBridgeFootHoleOutwardOffset, endAngleDeg, -sectorBridgeScrewOffset);
  const [slotA, slotB] = sectorBridgeSlotPoints(startAngleDeg);
  const body = boxBetweenPoints(
    screwA,
    screwB,
    sectorBridgeW,
    sectorBridgeH,
    bridgeZ,
    C.petg,
    sectorBridgeEndOverlap
  );
  const footCenterA = pointOnArm(
    sectorBridgeR + sectorBridgeFootCenterOutwardShift,
    startAngleDeg,
    sectorBridgeScrewOffset
  );
  const footCenterB = pointOnArm(
    sectorBridgeR + sectorBridgeFootCenterOutwardShift,
    endAngleDeg,
    -sectorBridgeScrewOffset
  );
  const footA = boxAtPoint(
    sectorBridgeFootLength,
    sectorBridgeFootWidth,
    sectorBridgeH,
    footCenterA[0],
    footCenterA[1],
    bridgeZ,
    startAngleDeg,
    C.petg
  );
  const footB = boxAtPoint(
    sectorBridgeFootLength,
    sectorBridgeFootWidth,
    sectorBridgeH,
    footCenterB[0],
    footCenterB[1],
    bridgeZ,
    endAngleDeg,
    C.petg
  );
  const slot = boxBetweenPoints(
    slotA,
    slotB,
    styreneSlot + 0.8,
    sectorBridgeH + 2,
    bridgeZ - 1,
    C.petg,
    0
  );
  const radialSheetClearanceA = radialBox(
    10,
    styreneSlot + 1.0,
    sectorBridgeH + 2,
    sectorBridgeR,
    bridgeZ - 1,
    startAngleDeg,
    C.petg
  );
  const radialSheetClearanceB = radialBox(
    10,
    styreneSlot + 1.0,
    sectorBridgeH + 2,
    sectorBridgeR,
    bridgeZ - 1,
    endAngleDeg,
    C.petg
  );
  const screwCutters = sectorBridgeScrewPathCutters(startAngleDeg, bridgeZ + sectorBridgeH / 2);
  const closureLockCutters = [
    sectorBridgeClosureLockCutter(startAngleDeg, bridgeZ + sectorBridgeH / 2),
  ];

  return union(body, footA, footB)
    .subtract(slot, radialSheetClearanceA, radialSheetClearanceB, ...screwCutters, ...closureLockCutters)
    .color(C.petg)
    .material({ roughness: 0.55 });
}

function makeSectorClosureSheet(startAngleDeg, z, bucketH) {
  const endAngleDeg = startAngleDeg + 360 / dividerCount;
  const bottomBridgeZ = lowerSectorBridgeZ(z);
  const topBridgeZ = upperSectorBridgeZ(z, bucketH);
  const sheetBottomZ = z + bottomT + 3.8;
  const sheetH = bucketH - bottomT - 12;
  const [slotA, slotB] = sectorBridgeSlotPoints(startAngleDeg);
  const dx = slotB[0] - slotA[0];
  const dy = slotB[1] - slotA[1];
  const length = Math.max(8, Math.hypot(dx, dy) - 7);

  return boxBetweenPoints(slotA, slotB, styreneT, sheetH, sheetBottomZ, C.styrene, length - Math.hypot(dx, dy))
    .subtract(
      ...sectorBridgeScrewPathCutters(startAngleDeg, bottomBridgeZ + sectorBridgeH / 2),
      ...sectorBridgeScrewPathCutters(startAngleDeg, topBridgeZ + sectorBridgeH / 2),
      sectorBridgeClosureLockCutter(startAngleDeg, bottomBridgeZ + sectorBridgeH / 2),
      sectorBridgeClosureLockCutter(startAngleDeg, topBridgeZ + sectorBridgeH / 2)
    )
    .material({ opacity: 0.45, roughness: 0.5 });
}

function makeCentralDividerHub(z) {
  const hubR = lowerHubR;
  const hubH = lowerHubH;
  const hubZ = z + bottomT + 0.4;
  const topScrewCutters = [];

  for (let i = 0; i < dividerCount; i++) {
    const angle = i * 360 / dividerCount;
    topScrewCutters.push(
      verticalCylinderCut(hubH + 2, screwClearanceDia, lowerHubScrewR, -1, angle)
    );
  }

  return cylinder(hubH, hubR, undefined, 72)
    .subtract(...topScrewCutters)
    .translate(0, 0, hubZ)
    .color(C.petg)
    .material({ roughness: 0.55 });
}

function makeTopDividerHub(z, bucketH) {
  const hubR = upperHubR;
  const hubH = upperHubH;
  const hubZ = z + bucketH - 31;
  const topScrewCutters = [];

  for (let i = 0; i < dividerCount; i++) {
    const angle = i * 360 / dividerCount;
    topScrewCutters.push(
      verticalCylinderCut(hubH + 2, screwClearanceDia, upperHubScrewR, -1, angle)
    );
  }

  return cylinder(hubH, hubR, undefined, 72)
    .subtract(...topScrewCutters)
    .translate(0, 0, hubZ)
    .color(C.petg)
    .material({ roughness: 0.55 });
}

function makeTopDividerRail(angleDeg, z, bucketH, innerTopR) {
  const railInnerR = upperHubR + 2;
  const railOuterR = innerTopR - 8;
  const railLength = railOuterR - railInnerR;
  const railCenterR = (railInnerR + railOuterR) / 2;
  const railZ = z + bucketH - 31;
  const ribT = 2.4;
  const ribH = 14;
  const railW = 6.4;
  const ribOffset = styreneSlot / 2 + ribT / 2 + 0.2;
  const hubFootR = 4.5;
  const hubNeckW = railW;
  const hubFootOverlap = 2;

  const ribA = radialBox(railLength, ribT, ribH, railCenterR, railZ, angleDeg, C.petg)
    .translate(...polar(ribOffset, angleDeg + 90), 0);
  const ribB = radialBox(railLength, ribT, ribH, railCenterR, railZ, angleDeg, C.petg)
    .translate(...polar(ribOffset, angleDeg - 90), 0);

  const innerFootZ = railZ + upperHubH;
  const innerNeckStartR = upperHubScrewR;
  const innerNeckEndR = railInnerR + hubFootOverlap;
  const innerNeck = radialBox(
    innerNeckEndR - innerNeckStartR,
    hubNeckW,
    3,
    (innerNeckStartR + innerNeckEndR) / 2,
    innerFootZ,
    angleDeg,
    C.petg
  );
  const innerFoot = verticalPad(3, hubFootR, upperHubScrewR, innerFootZ, angleDeg, C.petg);
  const outerBossCenterR = railOuterR + 0.5;
  const outerBossScrewZ = railZ + ribH / 2;
  const outerBoss = radialCurvedEndFoot(
    bucketWallFootLength,
    bucketWallFootWidth,
    upperBucketWallFootH,
    outerBossCenterR,
    railZ + 2,
    angleDeg,
    C.petg
  );
  const slotStartR = railInnerR + hubFootOverlap;
  const slotEndR = railOuterR + 2;
  const slotCutter = radialBox(
    slotEndR - slotStartR,
    styreneSlot + 0.8,
    ribH + 2,
    (slotStartR + slotEndR) / 2,
    railZ - 1,
    angleDeg,
    C.petg
  );
  const screwCutters = [
    verticalCylinderCut(8, screwClearanceDia, upperHubScrewR, innerFootZ - 1, angleDeg),
    ...bucketWallFootScrewCutters(angleDeg, outerBossCenterR, outerBossScrewZ),
    ...armCrossScrewCutters(angleDeg, railZ + ribH / 2, armCrossScrewRadii(railInnerR, railOuterR)),
    ...dividerArmBridgeScrewCutters(angleDeg, upperSectorBridgeZ(z, bucketH) + sectorBridgeH / 2),
  ];

  return union(ribA, ribB, innerNeck, innerFoot, outerBoss)
    .subtract(slotCutter, ...screwCutters)
    .color(C.petg)
    .material({ roughness: 0.55 });
}

function makeBucketWallScrewCutters(z, bucketH, innerBaseR, innerTopR) {
  const cutters = [];
  const outerBaseR = outerBaseDia / 2;
  const outerTopR = outerTopDia / 2;
  const outerSlope = (outerTopR - outerBaseR) / bucketH;
  const bottomHoleZ = z + bottomT + 0.4 + 3 + 5;
  const topHoleZ = z + bucketH - 31 + 7;
  const bottomLocalZ = bottomHoleZ - z;
  const topLocalZ = topHoleZ - z;
  const innerSlope = (innerTopR - innerBaseR) / (bucketH - bottomT);
  const bottomHoleInnerR = innerBaseR + Math.max(0, bottomLocalZ - bottomT) * innerSlope;
  const topHoleInnerR = innerBaseR + Math.max(0, topLocalZ - bottomT) * innerSlope;
  const bottomHoleOuterR = outerBaseR + outerSlope * bottomLocalZ;
  const topHoleOuterR = outerBaseR + outerSlope * topLocalZ;
  const bottomHoleR = (bottomHoleInnerR + bottomHoleOuterR) / 2;
  const topHoleR = (topHoleInnerR + topHoleOuterR) / 2;

  for (let i = 0; i < dividerCount; i++) {
    const angle = i * 360 / dividerCount;
    cutters.push(...bucketWallFootScrewCutters(angle, bottomHoleR, bottomHoleZ));
    cutters.push(...bucketWallFootScrewCutters(angle, topHoleR, topHoleZ));
  }

  return cutters;
}

function makeBucket() {
  const maxHeight = Math.max(80, level2Bottom - level3Bottom - bottomClearance - 20);
  const bucketH = Math.min(bucketHeightInput, maxHeight);
  const z = level3Bottom + bottomClearance;
  const outerBaseR = outerBaseDia / 2;
  const outerTopR = outerTopDia / 2;
  const innerBaseR = bottomInsideDia / 2;
  const innerTopR = topOpeningDia / 2;
  const cavityH = bucketH - bottomT + 2;
  const innerTopExtendedR = innerBaseR + (innerTopR - innerBaseR) * (cavityH / (bucketH - bottomT));

  const outerShell = cylinder(bucketH, outerBaseR, outerTopR, segments)
    .translate(bucketX, bucketY, z);
  const innerCavity = cylinder(cavityH, innerBaseR, innerTopExtendedR, segments)
    .translate(bucketX, bucketY, z + bottomT);

  const bucketWallScrewCutters = makeBucketWallScrewCutters(z, bucketH, innerBaseR, innerTopR);
  const bucketBody = outerShell
    .subtract(innerCavity, ...bucketWallScrewCutters)
    .color(C.bucket)
    .material({ roughness: 0.55 });

  const dividerParts = [];
  for (let i = 0; i < dividerCount; i++) {
    const angle = i * 360 / dividerCount;
    dividerParts.push({
      name: `30 pt styrene removable divider sheet ${i + 1}`,
      shape: makeStyreneDivider(angle, z, bucketH, innerBaseR, innerTopR),
    });
    dividerParts.push({
      name: `PETG screwable slotted bottom rail for styrene divider ${i + 1}`,
      shape: makeBottomDividerRail(angle, z, innerBaseR),
    });
    dividerParts.push({
      name: `PETG screwable top anti-wobble rail for styrene divider ${i + 1}`,
      shape: makeTopDividerRail(angle, z, bucketH, innerTopR),
    });
    dividerParts.push({
      name: `PETG lower near-hub sector bridge with two arm screw holes ${i + 1}`,
      shape: makeSectorBridge(angle, z, bucketH, false),
    });
    dividerParts.push({
      name: `PETG upper near-hub sector bridge with two arm screw holes ${i + 1}`,
      shape: makeSectorBridge(angle, z, bucketH, true),
    });
    dividerParts.push({
      name: `30 pt styrene near-hub sector closure sheet ${i + 1}`,
      shape: makeSectorClosureSheet(angle, z, bucketH),
    });
  }

  return group(
    { name: "Purple removable tapered bucket, 214 mm base / 314 mm top OD / 300 mm opening", shape: bucketBody },
    { name: "PETG solid lower divider hub with top-facing 4 mm arm screw holes", shape: makeCentralDividerHub(z) },
    { name: "PETG solid upper anti-wobble divider hub with top-facing 4 mm arm screw holes", shape: makeTopDividerHub(z, bucketH) },
    ...dividerParts
  );
}

const storageBins = makeBucket();

return {
  storageBins,
  specs: {
    architecture: "Single real removable bucket in Level 3, replacing the printed six-sector storage cartridge.",
    outerBaseDiameter: `${outerBaseDia} mm`,
    bottomInsideDiameter: `${bottomInsideDia} mm`,
    outerTopDiameter: `${outerTopDia} mm`,
    topOpeningDiameter: `${topOpeningDia} mm exact internal opening`,
    wallThickness: "Variable tapered wall: 4.5 mm radial at bottom, 7 mm radial at top",
    bottomThickness: `${bottomT} mm modeled bottom thickness`,
    dividerMaterial: "30 pt styrene, modeled as 0.762 mm thick trapezoid sheets",
    printedDividerHolders: "Black PETG lower and upper U-channel spider rails. Outer ends use side-facing 4 mm holes into the bucket wall; inner tabs use top-facing 4 mm holes that bolt down into solid printable center hubs, similar to the NEMA support hub.",
    color: "purple",
  },
};

// Smart waste-sorting bin: full-system layout blockout.
// Units: millimeters. Coordinate system: X = width, Y = depth, Z = height.
//
// Material assumptions:
// - Main structure: 5 mm foamed PVC sheet, available stock 1220 x 2440 mm.
// - Rear face: existing 500 x 800 x 4 mm acrylic panel.
// - Printed parts: mounts, hinges, sensor brackets, rails, ducts, and mechanism supports.

const W = 500;
const D = 400;
const H = 800;
const pvc = 5;
const acrylic = 4;
const showShell = true;
const diskRotation = 0;
const trapdoorOpen = 0;
const threeXlExtraLongLinearKitX = -130;
const threeXlExtraLongLinearKitY = 115;
const threeXlExtraLongLinearKitZ = 800;
const threeXlExtraLongLinearKitRotZ = 90;
const threeXl6mmExtraLongLinearKitX = 185;
const threeXl6mmExtraLongLinearKitY = -15;
const threeXl6mmExtraLongLinearKitZ = 555;
const threeXl6mmExtraLongLinearKitRotZ = 0;
const threeXl6mmMirroredExtraLongLinearKitX = -threeXl6mmExtraLongLinearKitX;
const threeXl6mmMirroredExtraLongLinearKitY = -25;
const threeXl6mmMirroredExtraLongLinearKitZ = threeXl6mmExtraLongLinearKitZ;
const threeXl6mmMirroredExtraLongLinearKitRotZ = threeXl6mmExtraLongLinearKitRotZ + 180;
const threeXlExtraLongLinearKitTravel = 0;
const threeXl6mmExtraLongLinearKitTravel = 0;
const mg996rTraySystemXOffset = -324;
const mg996rTraySystemZOffset = -21;
const mg996rServoSeparation = 8;
const mg996rAssemblyX = 152 + mg996rTraySystemXOffset;
const mg996rAssemblyY = 90;
const mg996rAssemblyZ = 630 + mg996rTraySystemZOffset;
const mg996rAssemblyRotX = 90;
const mg996rAssemblyRotY = 0;
const mg996rAssemblyRotZ = 0;
const mg996rMirroredAssemblyY = -250;
const mg996rServoPlacementYOffset = 13.3;
const mg996rHornServoRotation = Param.number("Drop of Photo Booth", 10, { min: -40, max: 10, step: 1, unit: "deg", reverse: true });
const level1RectangleX = 182.5 + mg996rTraySystemXOffset;
const level1OppositeBoxX = Param.number("Level 1 Opposite Box X", 190, { min: -220, max: 220, step: 1, unit: "mm" });
const level1OppositeBoxY = Param.number("Level 1 Opposite Box Y", 0, { min: -160, max: 160, step: 1, unit: "mm" });
const level1OppositeBoxZ = Param.number("Level 1 Opposite Box Z", 555, { min: 555, max: 720, step: 1, unit: "mm" });
const mg996rPositiveHornY = 46.5 + mg996rServoSeparation;
const mg996rMirroredHornY = -73.15 - mg996rServoSeparation;
const level1RectangleY = 0;
const level1RectangleZ = 630 + mg996rTraySystemZOffset;
const level1RectangleRotation = -mg996rHornServoRotation;
const level1DropOpeningX = 0;
const level1DropOpeningY = level1RectangleY;
const level1RectangleSize = 150;
const level1RectangleWallThickness = 3;
const level1RectangleWallHeight = 32;
const level1HornPocketWidth = 40;
const level1HornPocketDepth = 5;
const level1HornPocketHeight = 13;
const level1HornPocketOutsideClearance = 0.4;
const level1HornFitScale = 1.2;
const level1HornFitArmClosureAngle = -4;
const mg996rServoSupportX = mg996rAssemblyX + 20;
const photoBoothYMin = level1RectangleY - level1RectangleSize / 2;
const photoBoothYMax = level1RectangleY + level1RectangleSize / 2;
const mg996rServoSupportDepth = 30;
const mg996rServoSupportBoothClearance = 8;
const mg996rPositiveServoSupportY = photoBoothYMax + mg996rServoSupportDepth / 2 + mg996rServoSupportBoothClearance;
const mg996rMirroredServoSupportY = photoBoothYMin - mg996rServoSupportDepth / 2 - mg996rServoSupportBoothClearance;
const mg996rServoWrapThickness = 4;
const mg996rServoWrapHeight = 24;
const mg996rFrontWrapCenterTrim = 43;
const mg996rWrapHoleXOffset = 1.5;
const mg996rWrapHoleZCenter = 10;
const mg996rWrapHoleSeparation = 10;
const mg996rRightSideWrapHoleXOffset = -2.5;
const classifierDiskRotationReferenceAngle = 60;
const classifierDiskRotationAngle = Param.number("Disk Rotation Angle", 0, { min: 0, max: 360, step: 1, unit: "deg" });
const level2AdjustablePrismX = -53.5;
const level2AdjustablePrismY = 185;
const level2AdjustablePrismZ = 355;
const level2AdjustablePrismNarrowWidth = 6;
const level2AdjustablePrismFullWidth = 15;
const level2AdjustablePrismTopCapHeight = 3;
const level2AdjustablePrismHeight = 45;
const level2Kw11MountHoleX = -60.0;
const level2Kw11MountHoleY1 = 180.3;
const level2Kw11MountHoleY2 = 189.8;
const level2Kw11MountHoleDiameter = 3;
const level2PrismFootX = -58;
const level2PrismFootY = level2AdjustablePrismY;
const level2PrismFootW = 44;
const level2PrismFootD = 24;
const level2PrismFootH = 4;
const level2PrismFootScrewOffsetX = 13;
const level2Kw11SwitchX = -60.25;
const level2Kw11SwitchY = 180.3;
const level2Kw11SwitchZ = 403.2;
const level2Kw11SwitchRotX = 0;
const level2Kw11SwitchRotY = -90;
const level2Kw11SwitchRotZ = 180;
const analysisGateTravelReference = 56;
const analysisGateLeftHalfX = threeXl6mmExtraLongLinearKitTravel - analysisGateTravelReference;
const analysisGateRightHalfX = analysisGateTravelReference - threeXl6mmExtraLongLinearKitTravel;
const analysisGateRailWindowWidth = 17.5;
const analysisGateLeftRailWindowY = 0;
const analysisGateRightRailWindowY = 0;
const automaticLidYOffset = 4.5;
const lowerFunnelSlideRotation = -25;
const inletPhotoBoothSlideDrop = 82;
const inletPhotoBoothSlideBottomTrim = 0;
const transferChuteDrop = 69;
const transferChuteZTrim = 15;
const level0Top = H;
const level0Bottom = 750;
const level1Bottom = 550;
const level2Bottom = 350;
const level4Bottom = 0;
const level3Bottom = level4Bottom;

const innerW = W - 2 * pvc;
const innerD = D - pvc - acrylic;
const M3_CLEAR = 2.0;
const electronicsBayX = W / 2 - 150;
const electronicsBayY = -D / 2 + 120;
const electronicsBayCoverW = 180;
const electronicsBayCoverD = 130;
const electronicsBayCoverScrewPatternW = 190;
const electronicsBayCoverScrewPatternD = 140;
const electronicsBayCoverT = 3;
const electronicsBayComponentZ = H + electronicsBayCoverT;
const electronicsBayLedY = electronicsBayY - 4;
const electronicsBayLedZOffset = 4.5;
const electronicsBayLedOpeningDiameter = 4.7;
const pbsButtonZOffset = 5.2;
const pbsButtonOpeningDiameter = 9;
const smallPushButtonsZOffset = 2;
const importedPotentiometerX = electronicsBayX - 52;
const importedPotentiometerY = electronicsBayY - 26;
const importedPotentiometerZ = electronicsBayComponentZ - 4;
const importedPotentiometerRotX = 0;
const importedPotentiometerRotY = 0;
const importedPotentiometerRotZ = 0;
const inletX = -W / 2 + 120;
const inletY = -D / 2 + 120;
const inletRadius = 90;
const inletCollarInnerRadius = inletRadius + 2;
const inletCollarOuterRadius = inletRadius + 17;
// Keep this at the May 16 drilled-hole pattern so the real PVC top still matches.
const inletCollarScrewRadius = inletRadius + 9;
const inletCollarScrewAngles = [30, 90, 150, 210, 270, 330];
const inletLidThickness = 7;
const inletScaleX = 1;
const inletScaleY = 1;
const inletLidXOffset = 0;
const inletLidYOffset = 0;
const inletLidZOffset = 0;
const level0ServoHornLocalX = 30.5 - 0.04246;
const level0ServoHornLocalY = -17.5 + 27.45074;
const level0ServoHornLocalZ = 43.5;
const level0ServoWithHornX = inletX - level0ServoHornLocalX;
const level0ServoWithHornY = 40;
const level0ServoWithHornZ = H;
const level0ServoWithHornRotX = 0;
const level0ServoWithHornRotY = 0;
const level0ServoWithHornRotZ = 0;
const level0HornRotation = Param.number("Lid Opening", 90, { min: 0, max: 90, step: 1, unit: "deg", reverse: true });
const level0LidServoSystemX = 0;
const level0LidServoSystemY = 0;
const level0LidServoSystemZ = 3;
const level0HolderBackerX = -169;
const level0HolderBackerY = 38.75;
const level0HolderBackerZ = 800;
const c270TripodX = 10;
const c270TripodY = 20;
const c270TripodZ = H - pvc;
const c270TripodRotX = -90;
const c270TripodRotY = 0;
const c270TripodRotZ = 90;
const inletRaisedCollarFlangeH = 4;
const inletRaisedCollarWallT = 2.5;
const inletRaisedCollarVerticalClearance = 2;
const inletRaisedCollarExtraStickClearance = 3;
const classifierDiskDiameter = 340;
const classifierDiskRadius = classifierDiskDiameter / 2;
const diskLoadSupportHoleAngles = [0, 60, 120, 180, 240, 300];
const diskLoadSupportHoleRadius = classifierDiskRadius + 23;
const diskLoadSupportHoleOffset = 12;
const bucketSectorAlignmentRotation = -30;
const bucketBaseOuterRadius = 214 / 2;
const bucketGuideInnerRadius = bucketBaseOuterRadius + 4;
const bucketGuideOuterRadius = bucketGuideInnerRadius + 14;
const bucketGuideHeight = 12;
const bucketGuideZ = pvc;
const bucketGuideScrewRadius = (bucketGuideInnerRadius + bucketGuideOuterRadius) / 2;
const bucketGuideScrewAngles = [22, 67, 113, 158];
const level3Fc51HolderOutwardRadius = 160;
const level3Fc51HolderSectorAngle = 0;
const level3Fc51HolderZ = 307;
const level3Fc51HolderRotX = 30;
const level3Fc51HolderRotY = 0;
const level3Fc51HolderRotZ = 90;
const level3Fc51HolderArmAnchorLocalZ = 16.4;

const C = {
  pvc: "#e9e2c6",
  acrylic: "#8fd3ff",
  printed: "#111111",
  funnel: "#f2a65a",
  analysis: "#6aa84f",
  disk: "#59788e",
  petg: "#111111",
  pla: "#4d4d4d",
  metal: "#2f4858",
  electronics: "#3454d1",
  battery: "#242424",
  sensor: "#ffcf56",
  servo: "#7c4dff",
  cable: "#111111",
  wasteA: "#77b255",
  wasteB: "#f4b942",
  wasteC: "#d95d5d",
};

const mg996rHornPerimeter = [
  [-19.539, -0.000],
  [-19.537, -0.302],
  [-19.498, -0.601],
  [-19.424, -0.893],
  [-19.315, -1.175],
  [-19.172, -1.441],
  [-18.999, -1.688],
  [-18.798, -1.912],
  [-18.571, -2.110],
  [-18.321, -2.280],
  [-18.053, -2.418],
  [-17.770, -2.523],
  [-17.477, -2.594],
  [-0.815, -4.940],
  [-0.392, -4.988],
  [0.033, -5.000],
  [0.458, -4.975],
  [0.878, -4.915],
  [17.392, -2.486],
  [17.685, -2.415],
  [17.968, -2.310],
  [18.236, -2.172],
  [18.486, -2.002],
  [18.713, -1.804],
  [18.914, -1.579],
  [19.088, -1.333],
  [19.230, -1.066],
  [19.339, -0.785],
  [19.413, -0.493],
  [19.452, -0.194],
  [19.454, 0.108],
  [19.452, 0.409],
  [19.413, 0.709],
  [19.339, 1.001],
  [19.230, 1.282],
  [19.088, 1.548],
  [18.914, 1.795],
  [18.713, 2.020],
  [18.486, 2.218],
  [18.236, 2.388],
  [17.968, 2.526],
  [17.685, 2.631],
  [17.392, 2.701],
  [0.798, 4.929],
  [0.383, 4.982],
  [-0.035, 5.000],
  [-0.453, 4.983],
  [-0.868, 4.931],
  [-17.477, 2.593],
  [-17.770, 2.523],
  [-18.053, 2.418],
  [-18.321, 2.279],
  [-18.571, 2.110],
  [-18.798, 1.911],
  [-18.999, 1.687],
  [-19.172, 1.440],
  [-19.315, 1.174],
  [-19.424, 0.893],
  [-19.498, 0.600],
  [-19.537, 0.301],
];

function expandPointFromCenter(point, amount) {
  const [x, y] = point;
  const length = Math.sqrt(x * x + y * y);

  if (length < 0.001 || amount === 0) {
    return point;
  }

  return [
    x + amount * (x / length),
    y + amount * (y / length),
  ];
}

function adjustHornArmClosure(point, angleDeg, scale) {
  const [x, y] = point;
  const protectedCircleRadius = 5.2 * scale;
  const distanceAfterCircle = Math.max(0, Math.abs(x) - protectedCircleRadius);

  if (distanceAfterCircle === 0 || Math.abs(y) < 0.001 || angleDeg === 0) {
    return point;
  }

  const side = y > 0 ? 1 : -1;
  const offset = Math.tan(angleDeg * Math.PI / 180) * distanceAfterCircle;

  return [x, y + side * offset];
}

function hornFitPerimeterPoints(scale, armClosureAngle, clearance = 0) {
  return mg996rHornPerimeter.map((point) => {
    const scaledPoint = [point[0] * scale, point[1] * scale];
    const angledPoint = adjustHornArmClosure(scaledPoint, armClosureAngle, scale);
    return expandPointFromCenter(angledPoint, clearance);
  });
}

function makePhotoBoothHornPocket(sideSign, centerX, centerZ) {
  const cutDepth = level1HornPocketDepth;
  const overshoot = level1HornPocketOutsideClearance;
  const sideY = level1RectangleY + sideSign * (level1RectangleSize / 2 + level1HornPocketOutsideClearance);

  return polygon(hornFitPerimeterPoints(level1HornFitScale, level1HornFitArmClosureAngle))
    .extrude(cutDepth + overshoot)
    .rotateX(sideSign > 0 ? 90 : -90)
    .translate(centerX, sideY, centerZ);
}

function rotatePointX([x, y, z], angleDeg) {
  const a = angleDeg * Math.PI / 180;
  return [
    x,
    y * Math.cos(a) - z * Math.sin(a),
    y * Math.sin(a) + z * Math.cos(a),
  ];
}

function rotatePointY([x, y, z], angleDeg) {
  const a = angleDeg * Math.PI / 180;
  return [
    x * Math.cos(a) + z * Math.sin(a),
    y,
    -x * Math.sin(a) + z * Math.cos(a),
  ];
}

function rotatePointZ([x, y, z], angleDeg) {
  const a = angleDeg * Math.PI / 180;
  return [
    x * Math.cos(a) - y * Math.sin(a),
    x * Math.sin(a) + y * Math.cos(a),
    z,
  ];
}

function level3Fc51HolderPose(angleDeg = level3Fc51HolderSectorAngle) {
  const a = angleDeg * Math.PI / 180;
  return {
    x: level3Fc51HolderOutwardRadius * Math.cos(a),
    y: level3Fc51HolderOutwardRadius * Math.sin(a),
    z: level3Fc51HolderZ,
    rotZ: level3Fc51HolderRotZ + angleDeg,
  };
}

function transformLevel3Fc51HolderPoint(localX, localY, localZ, angleDeg = level3Fc51HolderSectorAngle) {
  const pose = level3Fc51HolderPose(angleDeg);
  let p = [localX, localY, localZ];
  p = rotatePointX(p, level3Fc51HolderRotX);
  p = rotatePointY(p, level3Fc51HolderRotY);
  p = rotatePointZ(p, pose.rotZ);
  return [
    p[0] + pose.x,
    p[1] + pose.y,
    p[2] + pose.z,
  ];
}

function level3Fc51CeilingFootAnchor(angleDeg = level3Fc51HolderSectorAngle) {
  // This lands in the holder's natural-Y center at the new printed merge plate,
  // so the ceiling arm becomes one fused part with the updated holder layout.
  return transformLevel3Fc51HolderPoint(0, 0, level3Fc51HolderArmAnchorLocalZ, angleDeg);
}

function level3Fc51CeilingFootScrewCenters(angleDeg = level3Fc51HolderSectorAngle) {
  const a = angleDeg * Math.PI / 180;
  const radial = [Math.cos(a), Math.sin(a)];
  const tangent = [-Math.sin(a), Math.cos(a)];

  return [
    [
      diskLoadSupportHoleRadius * radial[0] - diskLoadSupportHoleOffset * tangent[0],
      diskLoadSupportHoleRadius * radial[1] - diskLoadSupportHoleOffset * tangent[1],
    ],
    [
      diskLoadSupportHoleRadius * radial[0] + diskLoadSupportHoleOffset * tangent[0],
      diskLoadSupportHoleRadius * radial[1] + diskLoadSupportHoleOffset * tangent[1],
    ],
  ];
}

function level3Fc51CeilingFootScrewCutters(z, height, angleDeg = level3Fc51HolderSectorAngle) {
  return level3Fc51CeilingFootScrewCenters(angleDeg).map(([x, y]) =>
    cylinder(height, M3_CLEAR, undefined, 28)
      .translate(x, y, z)
  );
}

function panel(name, shape, color = C.pvc, opacity = 1) {
  const colored = opacity < 1
    ? shape.color(color).material({ opacity, roughness: 0.65 })
    : shape.color(color);
  return { name, shape: colored };
}

function placeBox(w, d, h, x, y, z, color) {
  return box(w, d, h).translate(x, y, z);
}

function makeBlueLedProxy(color = "#1876ff", label = "LED") {
  const bodyRadius = 2.75;
  const bodyHeight = 8;
  const leadLength = 26;
  const leadRadius = 0.35;
  const leadSpacing = 1.6;
  const lens = union(
    cylinder(bodyHeight, bodyRadius, undefined, 40),
    sphere(bodyRadius, undefined, 32).translate(0, 0, bodyHeight)
  )
    .translate(0, 0, -bodyHeight / 2)
    .color(color)
    .material({ opacity: 0.72, roughness: 0.22 });
  const leads = union(
    cylinder(leadLength, leadRadius, undefined, 16).translate(-leadSpacing / 2, 0, -leadLength),
    cylinder(leadLength, leadRadius, undefined, 16).translate(leadSpacing / 2, 0, -leadLength)
  )
    .color("#b8bcc0")
    .material({ roughness: 0.35 });

  return group(
    { name: `${label} lens body`, shape: lens },
    { name: `${label} metal leads`, shape: leads }
  );
}

function makePbsPushButtonProxy() {
  const panelNut = cylinder(3, 10.5, undefined, 48)
    .translate(0, 0, 1.5)
    .color("#101010")
    .material({ roughness: 0.5 });
  const threadedBody = cylinder(12, 8, undefined, 48)
    .translate(0, 0, -4)
    .color("#222222")
    .material({ roughness: 0.45 });
  const buttonCap = cylinder(8, 7.2, undefined, 48)
    .translate(0, 0, 8)
    .color("#c82d2d")
    .material({ roughness: 0.35 });
  const terminals = union(
    box(2.2, 0.8, 12).translate(-3.2, 0, -18),
    box(2.2, 0.8, 12).translate(3.2, 0, -18)
  )
    .color("#b8b8b8")
    .material({ roughness: 0.3 });

  return group(
    { name: "PBS pushbutton panel nut proxy", shape: panelNut },
    { name: "PBS pushbutton threaded body proxy", shape: threadedBody },
    { name: "PBS pushbutton red cap proxy", shape: buttonCap },
    { name: "PBS pushbutton terminals proxy", shape: terminals }
  );
}

function makeHcSr04SensorOnlyProxy() {
  // STEP reference bbox is about 45 x 26 x 18.5 mm; this stays manifold-safe for the main layout.
  const screwCutters = [
    cylinder(4, 1.35, undefined, 24).translate(-19, -10.5, 0.8),
    cylinder(4, 1.35, undefined, 24).translate(19, -10.5, 0.8),
    cylinder(4, 1.35, undefined, 24).translate(-19, 10.5, 0.8),
    cylinder(4, 1.35, undefined, 24).translate(19, 10.5, 0.8),
  ];
  const board = box(45, 26, 1.6)
    .translate(0, 0, 0.8)
    .subtract(...screwCutters)
    .color("#115d2a")
    .material({ roughness: 0.45 });
  const transducerShells = union(
    cylinder(8, 8, undefined, 48).translate(-12, -1.5, 5.8),
    cylinder(8, 8, undefined, 48).translate(12, -1.5, 5.8)
  )
    .color("#c7ccd1")
    .material({ roughness: 0.28 });
  const transducerOpenings = union(
    cylinder(8.5, 5.8, undefined, 48).translate(-12, -1.5, 6.1),
    cylinder(8.5, 5.8, undefined, 48).translate(12, -1.5, 6.1)
  )
    .color("#111111")
    .material({ roughness: 0.55 });
  const receiverBlocks = union(
    box(8, 4, 3).translate(-12, -10, 3),
    box(8, 4, 3).translate(12, -10, 3)
  )
    .color("#1d1d1d")
    .material({ roughness: 0.45 });
  const pinHeader = union(
    box(1.5, 4, 7).translate(-5.25, 12, -2.8),
    box(1.5, 4, 7).translate(-1.75, 12, -2.8),
    box(1.5, 4, 7).translate(1.75, 12, -2.8),
    box(1.5, 4, 7).translate(5.25, 12, -2.8)
  )
    .color("#d2b15f")
    .material({ roughness: 0.25 });

  return group(
    { name: "STEP-dimensioned HC-SR04 PCB only no fasteners", shape: board },
    { name: "STEP-dimensioned HC-SR04 ultrasonic transducer shells", shape: transducerShells },
    { name: "STEP-dimensioned HC-SR04 black transducer openings", shape: transducerOpenings },
    { name: "STEP-dimensioned HC-SR04 receiver blocks", shape: receiverBlocks },
    { name: "STEP-dimensioned HC-SR04 four-pin header", shape: pinHeader }
  );
}

function inletCollarScrewSketches() {
  return inletCollarScrewAngles.map((angle) => {
    const a = angle * Math.PI / 180;
    return circle2d(M3_CLEAR).translate(
      inletX + inletCollarScrewRadius * Math.cos(a),
      inletY + inletCollarScrewRadius * Math.sin(a)
    );
  });
}

function inletCollarScrewCutters(z, height) {
  return inletCollarScrewAngles.map((angle) => {
    const a = angle * Math.PI / 180;
    return cylinder(height, M3_CLEAR, undefined, 28).translate(
      inletX + inletCollarScrewRadius * Math.cos(a),
      inletY + inletCollarScrewRadius * Math.sin(a),
      z
    );
  });
}

function diskLoadSupportDeckHoleCutters(z, height) {
  const holes = [];
  for (const angleDeg of diskLoadSupportHoleAngles) {
    const a = angleDeg * Math.PI / 180;
    const radial = [Math.cos(a), Math.sin(a)];
    const tangent = [-Math.sin(a), Math.cos(a)];

    for (const side of [-1, 1]) {
      const x = diskLoadSupportHoleRadius * radial[0] + side * diskLoadSupportHoleOffset * tangent[0];
      const y = diskLoadSupportHoleRadius * radial[1] + side * diskLoadSupportHoleOffset * tangent[1];
      holes.push(cylinder(height, M3_CLEAR, undefined, 28).translate(x, y, z));
    }
  }
  return holes;
}

function level2Kw11PrismFootScrewCutters(z, height) {
  return [-level2PrismFootScrewOffsetX, level2PrismFootScrewOffsetX].map((dx) =>
    cylinder(height, M3_CLEAR, undefined, 28)
      .translate(level2PrismFootX + dx, level2PrismFootY, z)
  );
}

function makeShell() {
  const left = placeBox(pvc, D, H, -W / 2 - pvc / 2, 0, 0, C.pvc);
  const right = placeBox(pvc, D, H, W / 2 + pvc / 2, 0, 0, C.pvc);
  const frontAccessTop = level2Bottom;
  const front = placeBox(W, pvc, H - frontAccessTop, 0, -D / 2 - pvc / 2, frontAccessTop, C.pvc);
  const back = placeBox(W, acrylic, H, 0, D / 2 + acrylic / 2, 0, C.acrylic);
  const bottom = placeBox(W, D, pvc, 0, 0, 0, C.pvc);

  const inlet = cylinder(pvc * 3, inletRadius, undefined, 64)
    .scale([inletScaleX, inletScaleY, 1])
    .translate(inletX, inletY, level0Top - pvc * 2);
  const electronicsBayOpening = box(150, 100, pvc * 3)
    .translate(electronicsBayX, electronicsBayY, H - pvc * 2);
  const inletCollarTopCoverScrewHoles = inletCollarScrewCutters(H - pvc - 1, pvc + 2);
  const top = placeBox(W, D, pvc, 0, 0, H - pvc, C.pvc)
    .subtract(inlet, electronicsBayOpening, ...inletCollarTopCoverScrewHoles)
    .color(C.pvc);

  const servicedRight = right;
  const servicedFront = front;

  return group(
    panel("Left PVC side panel 5mm", left),
    panel("Right PVC side panel 5mm", servicedRight),
    panel("Front PVC upper service panel 5mm", servicedFront),
    panel("Back acrylic inspection panel 4mm", back, C.acrylic, 0.35),
    panel("Bottom PVC base panel 5mm", bottom),
    panel("Top PVC cover with inlet", top)
  );
}

function makeLevelPlates() {
  const analysisGateCenterX = level1DropOpeningX;
  const analysisGateCenterY = level1DropOpeningY - 20;
  const analysisGateW = 190;
  const analysisGateD = 150;
  const symmetricCutW = analysisGateW;
  const symmetricCutD = 2 * Math.max(
    Math.abs(analysisGateCenterY - analysisGateD / 2),
    Math.abs(analysisGateCenterY + analysisGateD / 2)
  );
  const centeredFunnelMouthX = analysisGateCenterX;
  const centeredFunnelMouthY = level1DropOpeningY;
  const funnelFloorCollarPlateW = 220;
  const funnelFloorCollarPlateD = 220;
  const funnelFloorCollarT = 3;
  const funnelFloorCollarOpeningR = 70;
  const funnelFloorGuideWallT = 3;
  const funnelFloorGuideWallH = 28;
  const funnelFloorGuideWallClearR = funnelFloorCollarOpeningR + 4;
  const funnelFloorGuideSideWallL = 120;
  const funnelFloorGuideWallOverlap = funnelFloorGuideWallT;
  const funnelFloorGuideOpeningSign = level1RectangleX < centeredFunnelMouthX ? -1 : 1;
  const funnelFloorCollarScrewInset = 12;
  const funnelFloorCollarScrewCenters = [
    [-funnelFloorCollarPlateW / 2 + funnelFloorCollarScrewInset, -funnelFloorCollarPlateD / 2 + funnelFloorCollarScrewInset],
    [funnelFloorCollarPlateW / 2 - funnelFloorCollarScrewInset, -funnelFloorCollarPlateD / 2 + funnelFloorCollarScrewInset],
    [-funnelFloorCollarPlateW / 2 + funnelFloorCollarScrewInset, funnelFloorCollarPlateD / 2 - funnelFloorCollarScrewInset],
    [funnelFloorCollarPlateW / 2 - funnelFloorCollarScrewInset, funnelFloorCollarPlateD / 2 - funnelFloorCollarScrewInset],
  ].map(([x, y]) => [centeredFunnelMouthX + x, centeredFunnelMouthY + y]);
  const funnelFloorCollarFloorHoles = funnelFloorCollarScrewCenters.map(([x, y]) =>
    cylinder(pvc * 4, M3_CLEAR, undefined, 28).translate(x, y, level1Bottom - pvc)
  );
  const analysisGateOpening = box(symmetricCutW, symmetricCutD, pvc * 4)
    .translate(centeredFunnelMouthX, centeredFunnelMouthY, level1Bottom - pvc);
  const level1Plate = box(W, D, pvc)
    .translate(0, 0, level1Bottom)
    .subtract(analysisGateOpening, ...funnelFloorCollarFloorHoles)
    .color("#d7d0b0")
    .material({ opacity: 0.65 });
  const funnelFloorCollarScrews = funnelFloorCollarScrewCenters.map(([x, y]) =>
    circle2d(M3_CLEAR).translate(x, y)
  );
  const funnelFloorCollarPlate = difference2d(
    rect(funnelFloorCollarPlateW, funnelFloorCollarPlateD).translate(centeredFunnelMouthX, centeredFunnelMouthY),
    circle2d(funnelFloorCollarOpeningR).translate(centeredFunnelMouthX, centeredFunnelMouthY),
    ...funnelFloorCollarScrews
  )
    .extrude(funnelFloorCollarT)
    .translate(0, 0, level1Bottom + pvc + 0.8);
  const funnelFloorGuideWallZ = level1Bottom + pvc + 0.8 + funnelFloorCollarT;
  const funnelFloorFarWall = box(
    funnelFloorGuideWallT,
    funnelFloorGuideWallClearR * 2 + funnelFloorGuideWallT,
    funnelFloorGuideWallH
  )
    .translate(
      centeredFunnelMouthX - funnelFloorGuideOpeningSign * (funnelFloorGuideWallClearR + funnelFloorGuideWallT / 2),
      centeredFunnelMouthY,
      funnelFloorGuideWallZ
    );
  const funnelFloorSideWalls = [
    -1,
    1,
  ].map((side) =>
    box(funnelFloorGuideSideWallL + funnelFloorGuideWallOverlap, funnelFloorGuideWallT, funnelFloorGuideWallH)
      .translate(
        centeredFunnelMouthX - funnelFloorGuideOpeningSign * (funnelFloorGuideWallClearR + funnelFloorGuideWallOverlap)
          + funnelFloorGuideOpeningSign * (funnelFloorGuideSideWallL + funnelFloorGuideWallOverlap) / 2,
        centeredFunnelMouthY + side * (funnelFloorGuideWallClearR + funnelFloorGuideWallT / 2),
        funnelFloorGuideWallZ
      )
  );
  const funnelFloorCollar = union(funnelFloorCollarPlate, funnelFloorFarWall, ...funnelFloorSideWalls)
    .color(C.petg)
    .material({ roughness: 0.55 });
  const diskDeckOpening = cylinder(pvc * 4, classifierDiskRadius, undefined, 128)
    .translate(0, 0, level2Bottom - pvc);
  const diskLoadSupportHoles = diskLoadSupportDeckHoleCutters(level2Bottom - pvc, pvc * 4);
  const kw11PrismDeckScrewHoles = level2Kw11PrismFootScrewCutters(level2Bottom - pvc, pvc * 4);
  const level2Deck = box(W, D, pvc)
    .translate(0, 0, level2Bottom)
    .subtract(diskDeckOpening, ...diskLoadSupportHoles, ...kw11PrismDeckScrewHoles)
    .color("#d7d0b0")
    .material({ opacity: 0.65 });
  const marker = (name, z, color) => ({
    name,
    shape: box(80, 4, 10)
      .translate(-W / 2 - 1, -D / 2 - 2, z)
      .color(color),
  });

  return group(
    { name: "Level 1 analysis floor / gate support with gate opening", shape: level1Plate },
    { name: "Flat rectangular screwable PETG floor collar with circular opening", shape: funnelFloorCollar },
    panel("Level 2 rotating disk clearance deck", level2Deck),
    marker("L0 marker: top interface", 742, "#5b9bd5"),
    marker("L1 marker: sensing", level1Bottom + 20, "#6aa84f"),
    marker("L2 marker: rotating classifier", level2Bottom + 55, "#59788e"),
    marker("L3 marker: full-height removable storage bins", 70, "#f4b942")
  );
}

function makeMg996rServoWithHorn(position, rotation = [90, 0, 0], hornRotation = 0) {
  const servo = importMesh("assets/mg996r-v17-from-step.obj", { center: true })
    .translate(0, 0, 30)
    .color("#2f2b28");
  const hornX = 30.5;
  const hornY = -17.5;
  const hornZ = 43.5;
  const hornPivotLocal = [-0.04246, -27.45074, 0];
  const hornPivotWorld = [
    hornX + hornPivotLocal[0],
    hornY - hornPivotLocal[1],
    hornZ - hornPivotLocal[2],
  ];
  const horn = importMesh("assets/ServoMotor_Arms_MG996R_parts/horn_3.obj", { center: true })
    .translate(-hornPivotLocal[0], -hornPivotLocal[1], -hornPivotLocal[2])
    .rotateX(180)
    .rotateZ(hornRotation)
    .translate(hornPivotWorld[0], hornPivotWorld[1], hornPivotWorld[2])
    .color("#111111");

  return group(
    { name: "STEP-derived MG996R servo body", shape: servo },
    { name: "MG996R rotating servo horn", shape: horn },
  )
    .rotateX(rotation[0])
    .rotateY(rotation[1])
    .rotateZ(rotation[2])
    .translate(position[0], position[1], position[2]);
}

function makeLinkageStickBetween(start, end, z, options = {}) {
  const width = options.width ?? 14;
  const thickness = options.thickness ?? 4;
  const holeDia = options.holeDia ?? 4;
  const rotationOffset = options.rotationOffset ?? 0;
  const receiverLength = options.receiverLength ?? 30;
  const receiverTailLength = options.receiverTailLength ?? 26;
  const receiverWidth = options.receiverWidth ?? 16;
  const receiverDepth = options.receiverDepth ?? 3;
  const receiverTopCover = options.receiverTopCover ?? 1.2;
  const hornPocketLength = options.hornPocketLength ?? 24;
  const hornPocketTailLength = options.hornPocketTailLength ?? 20;
  const hornPocketWidth = options.hornPocketWidth ?? 11;
  const hornPocketDepthOverride = options.hornPocketDepth;
  const hornPocketCenterX = options.hornPocketCenterX ?? (hornPocketLength - hornPocketTailLength) / 2;
  const hornPocketDia = options.hornPocketDia ?? 12;
  const hornPocketWorldOffset = options.hornPocketWorldOffset ?? [0, 0];
  const useHornPerimeterPocket = options.useHornPerimeterPocket ?? false;
  const hornFitScale = options.hornFitScale ?? level1HornFitScale;
  const hornFitArmClosureAngle = options.hornFitArmClosureAngle ?? level1HornFitArmClosureAngle;
  const hornFitClearance = options.hornFitClearance ?? 0;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const span = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const angleRad = angle * Math.PI / 180;
  const hornPocketLocalOffset = [
    hornPocketWorldOffset[0] * Math.cos(angleRad) + hornPocketWorldOffset[1] * Math.sin(angleRad),
    -hornPocketWorldOffset[0] * Math.sin(angleRad) + hornPocketWorldOffset[1] * Math.cos(angleRad),
  ];

  const hornReceiverCover = box(receiverLength + receiverTailLength, receiverWidth, receiverDepth + thickness)
    .translate((receiverLength - receiverTailLength) / 2, 0, -receiverDepth);
  const hornPocketDepth = hornPocketDepthOverride ?? (receiverDepth + thickness - receiverTopCover + 0.5);
  const hornReceiverPocket = useHornPerimeterPocket
    ? polygon(hornFitPerimeterPoints(hornFitScale, hornFitArmClosureAngle, hornFitClearance))
      .extrude(hornPocketDepth + 0.4)
      .translate(
        hornPocketLocalOffset[0],
        hornPocketLocalOffset[1],
        -receiverDepth - 0.5
      )
    : union(
      box(hornPocketLength + hornPocketTailLength, hornPocketWidth, hornPocketDepth)
        .translate(
          hornPocketCenterX + hornPocketLocalOffset[0],
          hornPocketLocalOffset[1],
          -receiverDepth - 0.5
        ),
      cylinder(hornPocketDepth, hornPocketDia / 2, undefined, 32).translate(
        hornPocketLocalOffset[0],
        hornPocketLocalOffset[1],
        -receiverDepth - 0.5
      ),
    );
  const solidBody = union(
    box(span, width, thickness).translate(span / 2, 0, 0),
    cylinder(thickness, width / 2, undefined, 32),
    cylinder(thickness, width / 2, undefined, 32).translate(span, 0, 0),
    hornReceiverCover,
  );
  const body = solidBody.subtract(hornReceiverPocket);
  const screwCutters = [
    cylinder(thickness * 3, holeDia / 2, undefined, 24).translate(0, 0, -thickness),
    cylinder(thickness * 3, holeDia / 2, undefined, 24).translate(span, 0, -thickness),
  ];

  return body
    .subtract(...screwCutters)
    .rotateZ(angle + rotationOffset)
    .translate(start[0], start[1], z)
    .color(C.printed);
}

function makeTopInterface() {
  const lidServoSystemOffset = [
    level0LidServoSystemX,
    level0LidServoSystemY,
    level0LidServoSystemZ,
  ];
  const inletLidZ = level0ServoWithHornZ + level0ServoHornLocalZ + inletLidZOffset + lidServoSystemOffset[2];
  const inletLidBottomZ = inletLidZ - 3;
  const inletLid = cylinder(inletLidThickness, inletRadius - 2, undefined, 64)
    .scale([inletScaleX, inletScaleY, 1])
    .translate(
      inletX + inletLidXOffset + lidServoSystemOffset[0],
      inletY + inletLidYOffset + lidServoSystemOffset[1],
      inletLidBottomZ
    )
    .color(C.printed);
  const inletRaisedCollarWallH = Math.max(
    4,
    inletLidBottomZ - H - inletRaisedCollarFlangeH - inletRaisedCollarVerticalClearance - inletRaisedCollarExtraStickClearance
  );
  const inletRaisedCollarScrewHoles = inletCollarScrewSketches();
  const inletRaisedCollarFlange = difference2d(
    circle2d(inletCollarOuterRadius).translate(inletX, inletY),
    circle2d(inletCollarInnerRadius).translate(inletX, inletY),
    ...inletRaisedCollarScrewHoles
  )
    .extrude(inletRaisedCollarFlangeH)
    .translate(0, 0, H);
  const inletRaisedCollarWall = difference2d(
    circle2d(inletCollarInnerRadius + inletRaisedCollarWallT).translate(inletX, inletY),
    circle2d(inletCollarInnerRadius).translate(inletX, inletY)
  )
    .extrude(inletRaisedCollarWallH)
    .translate(0, 0, H + inletRaisedCollarFlangeH);
  const inletRaisedCollar = union(inletRaisedCollarFlange, inletRaisedCollarWall)
    .color(C.printed);
  const level0ServoWithHorn = makeMg996rServoWithHorn([
    level0ServoWithHornX + lidServoSystemOffset[0],
    level0ServoWithHornY + lidServoSystemOffset[1],
    level0ServoWithHornZ + lidServoSystemOffset[2],
  ], [
    level0ServoWithHornRotX,
    level0ServoWithHornRotY,
    level0ServoWithHornRotZ,
  ], level0HornRotation);
  const level0ServoHolderBacker = importMesh("assets/mg996r-servo-holder-backer.stl", { center: true })
    .translate(level0HolderBackerX, level0HolderBackerY, level0HolderBackerZ)
    .color(C.printed);
  const level0HornScrewPoint = [
    level0ServoWithHornX + level0ServoHornLocalX + lidServoSystemOffset[0],
    level0ServoWithHornY + level0ServoHornLocalY + lidServoSystemOffset[1],
  ];
  const inletLidScrewPoint = [
    inletX + inletLidXOffset + lidServoSystemOffset[0],
    inletY + inletLidYOffset + lidServoSystemOffset[1],
  ];
  const inletLidHornStick = makeLinkageStickBetween(
    level0HornScrewPoint,
    inletLidScrewPoint,
    inletLidZ,
    {
      width: 16,
      thickness: 4,
      holeDia: 4,
      receiverLength: 50,
      receiverTailLength: 25,
      receiverWidth: 24,
      hornPocketLength: 40,
      hornPocketTailLength: 0,
      hornPocketWidth: 13,
      hornPocketDepth: 5,
      hornPocketCenterX: 0,
      useHornPerimeterPocket: true,
      hornFitScale: level1HornFitScale,
      hornFitArmClosureAngle: level1HornFitArmClosureAngle,
      hornFitClearance: 0,
    },
  );
  const level0LidAssemblyRotation = level0HornRotation - 90;
  const inletLidWithIntegratedStick = union(inletLid, inletLidHornStick)
    .translate(-level0HornScrewPoint[0], -level0HornScrewPoint[1], 0)
    .rotateZ(level0LidAssemblyRotation)
    .translate(level0HornScrewPoint[0], level0HornScrewPoint[1], 0)
    .color(C.printed);
  const electronicsCoverZ = H;
  const lcdX = electronicsBayX - 20;
  const lcdY = electronicsBayY + 25;
  const hcSr04X = electronicsBayX + 50;
  const hcSr04Y = electronicsBayY + 25;
  const hcSr04MountZ = electronicsCoverZ - 2.4;
  const pbsX = electronicsBayX;
  const buttonY = electronicsBayY - 28;
  const smallButtonLeftX = electronicsBayX + 32;
  const smallButtonRightX = electronicsBayX + 54;
  const smallButtonCableSlotCenterOffsetY = 3.75; // 1.5 mm slots with 6 mm clear separation.
  const bayLedColors = ["#1876ff", "#f03a2f", "#ffbe2e", "#39b54a", "#8e44ad", "#e8edf2"];
  const bayLedNames = ["Blue", "Red", "Yellow", "Green", "Purple", "White"];
  const bayLedPositions = bayLedColors.map((_, i) => [
    electronicsBayX - 50 + i * 20,
    electronicsBayLedY,
  ]);
  const electronicsBayCoverCornerHoles = [
    [-electronicsBayCoverScrewPatternW / 2 + 12, -electronicsBayCoverScrewPatternD / 2 + 12],
    [electronicsBayCoverScrewPatternW / 2 - 12, -electronicsBayCoverScrewPatternD / 2 + 12],
    [-electronicsBayCoverScrewPatternW / 2 + 12, electronicsBayCoverScrewPatternD / 2 - 12],
    [electronicsBayCoverScrewPatternW / 2 - 12, electronicsBayCoverScrewPatternD / 2 - 12],
  ].map(([dx, dy]) =>
    cylinder(electronicsBayCoverT + 4, 2, undefined, 32)
      .translate(electronicsBayX + dx, electronicsBayY + dy, electronicsCoverZ - 1)
  );
  const electronicsBayCoverComponentHoles = [
    ...bayLedPositions.map(([x, y]) =>
      cylinder(electronicsBayCoverT + 4, electronicsBayLedOpeningDiameter / 2, undefined, 32).translate(x, y, electronicsCoverZ - 1)
    ),
    box(70.7, 24, electronicsBayCoverT + 4)
      .translate(lcdX, lcdY, electronicsCoverZ - 1),
    cylinder(electronicsBayCoverT + 4, 8.6, undefined, 48)
      .translate(hcSr04X - 12, hcSr04Y - 1.5, electronicsCoverZ - 1),
    cylinder(electronicsBayCoverT + 4, 8.6, undefined, 48)
      .translate(hcSr04X + 12, hcSr04Y - 1.5, electronicsCoverZ - 1),
    cylinder(electronicsBayCoverT + 4, 4.2, undefined, 40)
      .translate(importedPotentiometerX, importedPotentiometerY, electronicsCoverZ - 1),
    cylinder(electronicsBayCoverT + 4, pbsButtonOpeningDiameter / 2, undefined, 40)
      .translate(pbsX, buttonY, electronicsCoverZ - 1),
    box(6, 1.5, electronicsBayCoverT + 4)
      .translate(smallButtonLeftX, buttonY - smallButtonCableSlotCenterOffsetY, electronicsCoverZ - 1),
    box(6, 1.5, electronicsBayCoverT + 4)
      .translate(smallButtonLeftX, buttonY + smallButtonCableSlotCenterOffsetY, electronicsCoverZ - 1),
    box(6, 1.5, electronicsBayCoverT + 4)
      .translate(smallButtonRightX, buttonY - smallButtonCableSlotCenterOffsetY, electronicsCoverZ - 1),
    box(6, 1.5, electronicsBayCoverT + 4)
      .translate(smallButtonRightX, buttonY + smallButtonCableSlotCenterOffsetY, electronicsCoverZ - 1),
  ];
  const lcdScrewHoles = [
    [-36.5, -15],
    [36.5, -15],
    [-36.5, 15],
    [36.5, 15],
  ].map(([dx, dy]) =>
    cylinder(electronicsBayCoverT + 4, 2, undefined, 28)
      .translate(lcdX + dx, lcdY + dy, electronicsCoverZ - 1)
  );
  const hcSr04ScrewHoles = [
    [-19, -10.5],
    [19, -10.5],
    [-19, 10.5],
    [19, 10.5],
  ].map(([dx, dy]) =>
    cylinder(electronicsBayCoverT + 4, 2, undefined, 28)
      .translate(hcSr04X + dx, hcSr04Y + dy, electronicsCoverZ - 1)
  );
  const electronicsBayCover = box(electronicsBayCoverW, electronicsBayCoverD, electronicsBayCoverT)
    .translate(electronicsBayX, electronicsBayY, electronicsCoverZ)
    .subtract(
      ...electronicsBayCoverCornerHoles,
      ...electronicsBayCoverComponentHoles,
      ...lcdScrewHoles,
      ...hcSr04ScrewHoles
    )
    .color(C.printed)
    .material({ roughness: 0.55 });
  const importedLcd = importMesh("assets/LCD-Displaytech-162J.stl", { center: true })
    .rotateX(90)
    .translate(lcdX, lcdY, electronicsBayComponentZ - 1)
    .color("#1b2733")
    .material({ roughness: 0.45 });
  const topHcSr04 = makeHcSr04SensorOnlyProxy()
    .translate(hcSr04X, hcSr04Y, hcSr04MountZ);
  const bayLeds = bayLedColors.map((color, i) => {
    const [x, y] = bayLedPositions[i];
    const z = electronicsBayComponentZ + electronicsBayLedZOffset;

    return {
      name: `${bayLedNames[i]} LED in former electronics bay opening`,
      group: makeBlueLedProxy(color, `${bayLedNames[i]} LED`).translate(x, y, z),
    };
  });
  const pbsPushButton = importMesh("assets/push-button-dummy-placeholder.stl", { center: true })
    .translate(pbsX, buttonY, electronicsBayComponentZ + 0.5 + pbsButtonZOffset)
    .color("#161616")
    .material({ roughness: 0.45 });
  const smallPushButtonLeft = importMesh("assets/Small-pushbutton-pad.stl", { center: true })
    .translate(smallButtonLeftX, buttonY, electronicsBayComponentZ - 1.5 + smallPushButtonsZOffset)
    .color("#1d1d1d")
    .material({ roughness: 0.45 });
  const smallPushButtonRight = importMesh("assets/Small-pushbutton-pad.stl", { center: true })
    .translate(smallButtonRightX, buttonY, electronicsBayComponentZ - 1.5 + smallPushButtonsZOffset)
    .color("#1d1d1d")
    .material({ roughness: 0.45 });
  const importedPotentiometer = importMesh("assets/WH148-PH1-Single-Joint-Potentiometer-Modeled.stl", { center: true })
    .rotateX(importedPotentiometerRotX)
    .rotateY(importedPotentiometerRotY)
    .rotateZ(importedPotentiometerRotZ)
    .translate(importedPotentiometerX, importedPotentiometerY, importedPotentiometerZ)
    .color("#2b2b2b")
    .material({ roughness: 0.45 });
  return group(
    { name: "Automatic inlet lid with integrated horn linkage stick", shape: inletLidWithIntegratedStick },
    { name: "Raised PETG inlet collar wall below closed lid", shape: inletRaisedCollar },
    { name: "Adjustable Level 0 MG996R servo with horn", group: level0ServoWithHorn },
    { name: "Imported adjustable MG996R servo holder backer", shape: level0ServoHolderBacker },
    { name: "Screwable 180x130 PETG top electronics cover plate with fixed screw pattern", shape: electronicsBayCover },
    { name: "Exact LCD Displaytech 162J in former electronics bay opening", shape: importedLcd },
    { name: "Underside-mounted HC-SR04 with only eyes protruding through cover", group: topHcSr04 },
    ...bayLeds,
    { name: "Exact WH148 PH1 potentiometer in former electronics bay opening", shape: importedPotentiometer },
    { name: "Imported PBS pushbutton in former electronics bay opening", shape: pbsPushButton },
    { name: "Exact small pushbutton pad left in former electronics bay opening", shape: smallPushButtonLeft },
    { name: "Exact small pushbutton pad right in former electronics bay opening", shape: smallPushButtonRight }
  );
}

function makeFrontControls() {
  const sidePotY = -85;
  const sidePotZ = 710;
  const potKnob = cylinder(12, 14, undefined, 40)
    .pointAlong([1, 0, 0])
    .translate(W / 2 + pvc, sidePotY, sidePotZ)
    .color("#202020");
  const potPointer = box(1.5, 2, 16)
    .translate(W / 2 + pvc + 12, sidePotY, sidePotZ + 2)
    .color("#f4f0d8");

  const ledColors = ["#8a8f98", "#5cb85c", "#f0c64a", "#2f80ed", "#d9534f", "#ffffff"];
  const ledNames = ["Metal", "Organic", "Paper/Cardboard", "Plastic", "Batteries", "Other"];
  const lcdCenterX = 75;
  const leds = [-45, -27, -9, 9, 27, 45].map((x, i) => ({
    name: `${ledNames[i]} category LED`,
    shape: cylinder(8, 5, undefined, 28)
      .pointAlong([0, -1, 0])
      .translate(lcdCenterX + x, -D / 2 - 11, 675)
      .color(ledColors[i])
      .material({ emissive: ledColors[i], emissiveIntensity: 0.45 }),
  }));

  const lcdBoard = box(100, 5, 44)
    .translate(lcdCenterX, -D / 2 - 6, 718)
    .color("#175b3d");
  const lcdScreen = box(76, 3, 24)
    .translate(lcdCenterX, -D / 2 - 10, 728)
    .color("#1a4f9c")
    .material({ emissive: "#1a4f9c", emissiveIntensity: 0.35 });
  const lcdTextBars = [-8, 0, 8].map((zOff, i) => ({
    name: `LCD placeholder text bar ${i + 1}`,
    shape: box(52 - i * 9, 1.5, 2)
      .translate(lcdCenterX, -D / 2 - 12, 740 + zOff)
      .color("#b8ffef"),
  }));

  const hcsr04Board = box(55, 8, 28)
    .translate(-W / 2 + 70, -D / 2 - 7, 725)
    .color(C.sensor);
  const ultrasonicEyes = [-13, 13].map((x) => ({
    name: `HC-SR04 transducer ${x < 0 ? "left" : "right"}`,
    shape: cylinder(10, 8)
      .pointAlong([0, -1, 0])
      .translate(-W / 2 + 70 + x, -D / 2 - 13, 725)
      .color(C.metal),
  }));

  return group(
    { name: "Mode select potentiometer knob", shape: potKnob },
    { name: "Potentiometer position pointer", shape: potPointer },
    ...leds,
    { name: "16x2 LCD module board", shape: lcdBoard },
    { name: "16x2 LCD blue display opening", shape: lcdScreen },
    ...lcdTextBars,
    { name: "HC-SR04 motion sensor board", shape: hcsr04Board },
    ...ultrasonicEyes
  );
}

function makeInletToPhotoBoothSlide() {
  const collarHeight = 6;
  const collarTopZ = H - pvc;
  const collarBottomZ = collarTopZ - collarHeight;
  const collarInnerRadius = inletCollarInnerRadius;
  const collarOuterRadius = inletCollarOuterRadius;
  const slideWall = 4;
  const slideStartOuterRadius = collarInnerRadius + 5;
  const slideEndOuterRadius = 48;
  const slideStartZ = collarBottomZ + 1;
  const slideEndX = level1RectangleX;
  const slideEndY = level1RectangleY;
  const slideEndZ = slideStartZ - inletPhotoBoothSlideDrop;
  const slideRunAngle = Math.atan2(slideEndY - inletY, slideEndX - inletX) * 180 / Math.PI;
  const slideWallCenterDeg = slideRunAngle + 180;

  function halfPipeBand(radius, wall, cx, cy, centerDeg) {
    const points = [];
    const steps = 42;
    const startDeg = centerDeg - 90;
    for (let i = 0; i <= steps; i++) {
      const a = (startDeg + (180 * i) / steps) * Math.PI / 180;
      points.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
    }
    for (let i = steps; i >= 0; i--) {
      const a = (startDeg + (180 * i) / steps) * Math.PI / 180;
      points.push([cx + (radius - wall) * Math.cos(a), cy + (radius - wall) * Math.sin(a)]);
    }
    return polygon(points);
  }

  const collarScrewHoles = inletCollarScrewSketches();
  const undersideCollar = difference2d(
    circle2d(collarOuterRadius).translate(inletX, inletY),
    circle2d(collarInnerRadius).translate(inletX, inletY),
    ...collarScrewHoles
  )
    .extrude(collarHeight)
    .translate(0, 0, collarBottomZ);

  const rawSlideTrough = loft(
    [
      halfPipeBand(slideStartOuterRadius, slideWall, inletX, inletY, slideWallCenterDeg),
      halfPipeBand(slideEndOuterRadius, slideWall, slideEndX, slideEndY, slideWallCenterDeg),
    ],
    [slideStartZ, slideEndZ],
    { edgeLength: 6 }
  );
  const slideTrimCutter = box(800, 800, 800)
    .translate(0, 0, slideEndZ + inletPhotoBoothSlideBottomTrim - 800);
  const slideTrough = inletPhotoBoothSlideBottomTrim > 0
    ? rawSlideTrough.subtract(slideTrimCutter)
    : rawSlideTrough;

  return union(undersideCollar, slideTrough)
    .color(C.printed)
    .material({ roughness: 0.55 });
}

function makeAnalysisLevel() {
  const gateW = 180;
  const gateD = 140;
  const gateBottomT = 2;
  const gateWallT = 2.5;
  const gateWallH = 42;
  const gateSlideVerticalClearance = 0.6;
  const gateSlideClearance = 1.2;
  const gateX = 0;
  const gateY = -20;
  const gateFlangeT = 4;
  const gateFloorTopZ = level1Bottom + pvc;
  const gateCollarTopZ = gateFloorTopZ + gateFlangeT + gateWallH;
  const funnelCollarBottomZ = H - pvc - 9;
  const funnelCollarHeight = 5;
  const funnelCollarInnerRadius = inletRadius + 2;
  const funnelCollarOuterRadius = inletRadius + 16;
  const funnelTopZ = funnelCollarBottomZ;
  const funnelBottomZ = gateCollarTopZ + 4;
  const funnelTransitionZ = funnelBottomZ + 82;
  const funnelWall = 3.5;
  const funnelBottomRadius = 58;
  function halfFunnelBand(radius, wall, cx, cy, centerDeg) {
    const pts = [];
    const steps = 36;
    const startDeg = centerDeg - 90;
    for (let i = 0; i <= steps; i++) {
      const a = (startDeg + (180 * i) / steps) * Math.PI / 180;
      pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
    }
    for (let i = steps; i >= 0; i--) {
      const a = (startDeg + (180 * i) / steps) * Math.PI / 180;
      pts.push([cx + (radius - wall) * Math.cos(a), cy + (radius - wall) * Math.sin(a)]);
    }
    return polygon(pts);
  }
  const slideIntoContainer = 24;
  const baseRampEndX = gateX - gateW / 2 + slideIntoContainer;
  const baseRampEndY = gateY;
  const rampGuideDx = baseRampEndX - inletX;
  const rampGuideDy = baseRampEndY - inletY;
  const rampGuideLen = Math.sqrt(rampGuideDx * rampGuideDx + rampGuideDy * rampGuideDy);
  const funnelLean = 8;
  const funnelBottomX = inletX + (rampGuideDx / rampGuideLen) * funnelLean;
  const funnelBottomY = inletY + (rampGuideDy / rampGuideLen) * funnelLean;
  const slideRotationRad = lowerFunnelSlideRotation * Math.PI / 180;
  const baseLowerRunDx = baseRampEndX - funnelBottomX;
  const baseLowerRunDy = baseRampEndY - funnelBottomY;
  const rampEndX =
    funnelBottomX + baseLowerRunDx * Math.cos(slideRotationRad) - baseLowerRunDy * Math.sin(slideRotationRad);
  const rampEndY =
    funnelBottomY + baseLowerRunDx * Math.sin(slideRotationRad) + baseLowerRunDy * Math.cos(slideRotationRad);
  const upperFunnelOuter = loft(
    [
      circle2d(funnelBottomRadius).translate(funnelBottomX, funnelBottomY),
      circle2d(funnelCollarInnerRadius).translate(inletX, inletY),
    ],
    [funnelTransitionZ, funnelTopZ],
    { edgeLength: 6 }
  );
  const upperFunnelInner = loft(
    [
      circle2d(funnelBottomRadius - funnelWall).translate(funnelBottomX, funnelBottomY),
      circle2d(funnelCollarInnerRadius - funnelWall).translate(inletX, inletY),
    ],
    [funnelTransitionZ - 1, funnelTopZ + 1],
    { edgeLength: 6 }
  );
  const upperFullFunnel = upperFunnelOuter.subtract(upperFunnelInner);
  const lowerOutletRadius = 46;
  const lowerRunDx = rampEndX - funnelBottomX;
  const lowerRunDy = rampEndY - funnelBottomY;
  const lowerRunAngle = Math.atan2(lowerRunDy, lowerRunDx) * 180 / Math.PI;
  const lowerWallCenterDeg = lowerRunAngle + 180;
  const lowerHalfFunnel = loft(
    [
      halfFunnelBand(funnelBottomRadius, funnelWall, funnelBottomX, funnelBottomY, lowerWallCenterDeg),
      halfFunnelBand(lowerOutletRadius, funnelWall, rampEndX, rampEndY, lowerWallCenterDeg),
    ],
    [funnelTransitionZ + 1, funnelBottomZ],
    { edgeLength: 6 }
  );
  const funnel = union(upperFullFunnel, lowerHalfFunnel)
    .color(C.printed)
    .material({ opacity: 0.78 });
  const funnelCollarOuter = circle2d(funnelCollarOuterRadius).translate(inletX, inletY);
  const funnelCollarInner = circle2d(funnelCollarInnerRadius).translate(inletX, inletY);
  const funnelCollarScrews = [30, 90, 150, 210, 270, 330].map((angle) => {
    const a = angle * Math.PI / 180;
    return circle2d(M3_CLEAR).translate(
      inletX + (inletRadius + 9) * Math.cos(a),
      inletY + (inletRadius + 9) * Math.sin(a)
    );
  });
  const funnelCeilingCollar = difference2d(
    funnelCollarOuter,
    funnelCollarInner,
    ...funnelCollarScrews
  )
    .extrude(funnelCollarHeight)
    .translate(0, 0, funnelCollarBottomZ)
    .color(C.printed);
  const gateFlangeOuterW = gateW + 34;
  const gateFlangeOuterD = gateD + 34;
  const gateFlangeScrews = [
    [-gateW / 2 - 8, -gateD / 2 - 8],
    [gateW / 2 + 8, -gateD / 2 - 8],
    [-gateW / 2 - 8, gateD / 2 + 8],
    [gateW / 2 + 8, gateD / 2 + 8],
  ].map(([x, y]) => circle2d(M3_CLEAR).translate(gateX + x, gateY + y));
  const gateCollarFlange = difference2d(
    rect(gateFlangeOuterW, gateFlangeOuterD).translate(gateX, gateY),
    rect(gateW, gateD).translate(gateX, gateY),
    ...gateFlangeScrews
  )
    .extrude(gateFlangeT)
    .translate(0, 0, gateFloorTopZ)
    .color(C.petg);
  const gateCollarWalls = union(
    box(gateW + gateWallT * 2, gateWallT, gateWallH)
      .translate(gateX, gateY - gateD / 2 - gateWallT / 2, gateFloorTopZ + gateFlangeT),
    box(gateW + gateWallT * 2, gateWallT, gateWallH)
      .translate(gateX, gateY + gateD / 2 + gateWallT / 2, gateFloorTopZ + gateFlangeT),
    box(gateWallT, gateD, gateWallH)
      .translate(gateX - gateW / 2 - gateWallT / 2, gateY, gateFloorTopZ + gateFlangeT),
    box(gateWallT, gateD, gateWallH)
      .translate(gateX + gateW / 2 + gateWallT / 2, gateY, gateFloorTopZ + gateFlangeT)
  );
  const gateSlideSlotH = 3;
  const gateSlideSlots = [-1, 1].map((side) =>
    box(
      gateWallT + 6,
      gateD + 8,
      gateSlideSlotH
    )
      .translate(
        gateX + side * (gateW / 2 + gateWallT / 2),
        gateY,
        gateFloorTopZ + gateFlangeT
      )
  );
  const gateRailSlotH = 9;
  const gateRailClearanceSlots = [-1, 1].map((side) => {
    const railWindowY = side < 0
      ? analysisGateLeftRailWindowY
      : analysisGateRightRailWindowY;
    return box(
      gateWallT + 8,
      analysisGateRailWindowWidth,
      gateRailSlotH
    )
      .translate(
        gateX + side * (gateW / 2 + gateWallT / 2),
        gateY + railWindowY,
        gateFloorTopZ + gateFlangeT
      );
  });
  const gateCollar = union(gateCollarFlange, gateCollarWalls)
    .subtract(...gateSlideSlots, ...gateRailClearanceSlots)
    .color(C.petg)
    .material({ roughness: 0.55 });
  const gateCoverHalfW = gateW / 2 - gateSlideClearance;
  const gateCoverDepth = gateD - gateSlideClearance * 2;
  const gateCoverCenterGap = gateSlideClearance;
  const gateCoverZ = gateFloorTopZ + gateFlangeT + gateSlideVerticalClearance;
  const gateBottomHalves = group(
    {
      name: "Left sliding PETG analysis gate bottom half",
      shape: box(gateCoverHalfW, gateCoverDepth, gateBottomT)
        .translate(
          gateX - gateCoverHalfW / 2 - gateCoverCenterGap / 2 + analysisGateLeftHalfX,
          gateY,
          gateCoverZ
        )
        .color(C.printed)
        .material({ roughness: 0.62 }),
    },
    {
      name: "Right sliding PETG analysis gate bottom half",
      shape: box(gateCoverHalfW, gateCoverDepth, gateBottomT)
        .translate(
          gateX + gateCoverHalfW / 2 + gateCoverCenterGap / 2 + analysisGateRightHalfX,
          gateY,
          gateCoverZ
        )
        .color(C.printed)
        .material({ roughness: 0.62 }),
    }
  );
  const irSensorZ = gateCollarTopZ + 4;
  const irSensorX = 220;
  const irSensorY = -20 + 22;
  const orientIrSensor = (shape) => shape.rotateZ(-90, { pivot: [irSensorX, irSensorY, irSensorZ] });
  const irBoard = box(36, 24, 3)
    .translate(irSensorX, irSensorY, irSensorZ)
    .color(C.sensor);
  const irEmitter = cylinder(5, 3.2, undefined, 24)
    .translate(irSensorX - 8, irSensorY - 7, irSensorZ + 3)
    .color("#111111");
  const irReceiver = cylinder(5, 3.2, undefined, 24)
    .translate(irSensorX + 8, irSensorY - 7, irSensorZ + 3)
    .color("#222222");
  const irCable = box(5, 26, 3)
    .translate(irSensorX, irSensorY + 20, irSensorZ + 1)
    .color(C.cable);
  const c270X = 0;
  const c270Y = -20;
  const c270CeilingZ = H - pvc;
  const c270FaceZ = c270CeilingZ - 49;
  const c270Profile = union2d(
    rect(41, 32).translate(c270X, c270Y),
    circle2d(16).translate(c270X - 20.5, c270Y),
    circle2d(16).translate(c270X + 20.5, c270Y)
  );
  const c270Body = c270Profile
    .extrude(23)
    .translate(0, 0, c270FaceZ)
    .color("#4a5359")
    .material({ roughness: 0.42 });
  const c270BackShell = c270Profile
    .extrude(5)
    .translate(0, 0, c270FaceZ + 23)
    .color("#1f2326")
    .material({ roughness: 0.5 });
  const c270FaceInsert = union2d(
    rect(20, 22).translate(c270X - 22, c270Y),
    circle2d(11).translate(c270X - 32, c270Y),
    circle2d(11).translate(c270X - 12, c270Y)
  )
    .extrude(2)
    .translate(0, 0, c270FaceZ - 2)
    .color("#16191d");
  const c270LensBezel = cylinder(4, 8.5, undefined, 48)
    .pointAlong([0, 0, -1])
    .translate(c270X - 27, c270Y, c270FaceZ - 2)
    .color("#050505");
  const c270LensGlass = cylinder(2, 5.6, undefined, 48)
    .pointAlong([0, 0, -1])
    .translate(c270X - 27, c270Y, c270FaceZ - 6)
    .color("#233042")
    .material({ opacity: 0.6, roughness: 0.2 });
  const c270StatusLight = box(3, 15, 1.6)
    .translate(c270X - 42, c270Y, c270FaceZ - 2.2)
    .color("#a7c947")
    .material({ emissive: "#a7c947", emissiveIntensity: 0.4 });
  const c270MicHoles = [-5, 0, 5].map((dy, i) => ({
    name: `Logitech C270 microphone dot ${i + 1}`,
    shape: cylinder(1.4, 1.2, undefined, 16)
      .pointAlong([0, 0, -1])
      .translate(c270X - 2, c270Y + dy, c270FaceZ - 2.4)
      .color("#090909"),
  }));
  const c270CeilingPlate = box(88, 54, 5)
    .translate(c270X + 6, c270Y + 8, c270CeilingZ - 5)
    .subtract(
      cylinder(7, M3_CLEAR, undefined, 24).translate(c270X - 26, c270Y - 10, c270CeilingZ - 6),
      cylinder(7, M3_CLEAR, undefined, 24).translate(c270X + 38, c270Y - 10, c270CeilingZ - 6),
      cylinder(7, M3_CLEAR, undefined, 24).translate(c270X - 26, c270Y + 26, c270CeilingZ - 6),
      cylinder(7, M3_CLEAR, undefined, 24).translate(c270X + 38, c270Y + 26, c270CeilingZ - 6)
    );
  const c270DownPlate = box(88, 5, 26)
    .translate(c270X + 6, c270Y - 1.5, c270CeilingZ - 26)
    .color("#1a1a1a");
  const c270LBracket = union(c270CeilingPlate, c270DownPlate)
    .color("#1a1a1a");
  const repairedC270Tripod = require("./c270tripod-hole-edit.forge.js", {
    "Hole X": 13.5,
    "Hole Y": 2,
    "Hole Z": 9.5,
    "Hole Rotation X": 90,
    "Hole Rotation Y": 0,
    "Hole Rotation Z": 0,
    "Patch Diameter": 10,
    "Patch Height": 4,
    "Final Hole Diameter": 4,
    "Show Hole Guide": 0,
  }).shape;
  const c270Tripod = repairedC270Tripod
    .rotateX(c270TripodRotX)
    .rotateY(c270TripodRotY)
    .rotateZ(c270TripodRotZ)
    .translate(c270TripodX, c270TripodY, c270TripodZ)
    .color("#111111")
    .material({ roughness: 0.48 });
  const hornPocketZ = level1RectangleZ + 10;
  const positiveHornPocket = makePhotoBoothHornPocket(1, level1RectangleX, hornPocketZ);
  const mirroredHornPocket = makePhotoBoothHornPocket(-1, level1RectangleX, hornPocketZ);
  const wallZ = level1RectangleZ + 20;
  const receiverSideWallHeight = level1RectangleWallHeight + 20;
  const receiverBackWallSign = level1RectangleX >= 0 ? 1 : -1;
  const receiverBackWall = box(level1RectangleWallThickness, level1RectangleSize, level1RectangleWallHeight)
    .translate(
      level1RectangleX + receiverBackWallSign * (level1RectangleSize / 2 - level1RectangleWallThickness / 2),
      level1RectangleY,
      wallZ
    );
  const receiverPositiveYWall = box(level1RectangleSize, level1RectangleWallThickness, receiverSideWallHeight)
    .translate(
      level1RectangleX,
      level1RectangleY + level1RectangleSize / 2 - level1RectangleWallThickness / 2,
      wallZ
    );
  const receiverNegativeYWall = box(level1RectangleSize, level1RectangleWallThickness, receiverSideWallHeight)
    .translate(
      level1RectangleX,
      level1RectangleY - level1RectangleSize / 2 + level1RectangleWallThickness / 2,
      wallZ
    );
  const level1ReceiverTray = union(
    box(level1RectangleSize, level1RectangleSize, 20)
      .translate(level1RectangleX, level1RectangleY, level1RectangleZ),
    receiverBackWall,
    receiverPositiveYWall,
    receiverNegativeYWall
  );
  const level1RectanglePivotZ = level1RectangleZ + 10;
  const level1MovableRectangle = level1ReceiverTray
    .subtract(positiveHornPocket, mirroredHornPocket)
    .translate(-level1RectangleX, -level1RectangleY, -level1RectanglePivotZ)
    .rotateY(level1RectangleRotation)
    .translate(level1RectangleX, level1RectangleY, level1RectanglePivotZ)
    .color("#ffffff")
    .material({ roughness: 0.5 });
  const oppositeShelfW = 120;
  const oppositeShelfD = 180;
  const oppositeShelfH = 115;
  const oppositeShelfT = 4;
  const oppositeShelfXMin = level1OppositeBoxX - oppositeShelfW / 2;
  const oppositeShelfXMax = level1OppositeBoxX + oppositeShelfW / 2;
  const oppositeShelfZMin = level1OppositeBoxZ;
  const oppositeShelfZMax = level1OppositeBoxZ + oppositeShelfH;
  const oppositeTopFace = box(oppositeShelfW, oppositeShelfD, oppositeShelfT)
    .translate(level1OppositeBoxX, level1OppositeBoxY, oppositeShelfZMax - oppositeShelfT);
  const oppositeInnerFace = box(oppositeShelfT, oppositeShelfD, oppositeShelfH)
    .translate(oppositeShelfXMin + oppositeShelfT / 2, level1OppositeBoxY, oppositeShelfZMin);
  const oppositeOuterFace = box(oppositeShelfT, oppositeShelfD, oppositeShelfH)
    .translate(oppositeShelfXMax - oppositeShelfT / 2, level1OppositeBoxY, oppositeShelfZMin);
  const innerFloorScrewFoot = box(44, 140, oppositeShelfT)
    .translate(oppositeShelfXMin + 22, level1OppositeBoxY, oppositeShelfZMin);
  const outerFloorScrewFoot = box(44, 140, oppositeShelfT)
    .translate(oppositeShelfXMax - 22, level1OppositeBoxY, oppositeShelfZMin);
  const floorFootHoles = [oppositeShelfXMin + 22, oppositeShelfXMax - 22].flatMap((footX) =>
    [-45, 45].map((dy) =>
      cylinder(oppositeShelfT + 2, 2, undefined, 28)
        .translate(footX, level1OppositeBoxY + dy, oppositeShelfZMin - 1)
    )
  );
  const level1OppositeBox = union(oppositeTopFace, oppositeInnerFace, oppositeOuterFace, innerFloorScrewFoot, outerFloorScrewFoot)
    .subtract(...floorFootHoles)
    .color(C.petg)
    .material({ roughness: 0.55 });

  return group(
    { name: "PETG underside inlet collar with slide to photo booth", shape: makeInletToPhotoBoothSlide() },
    { name: "Photo booth walled receiver tray in Level 1", shape: level1MovableRectangle },
    { name: "Screwable PETG Level 1 opposite-side top-and-right-face support", shape: level1OppositeBox },
    { name: "Imported Logitech C270 tripod reference", shape: c270Tripod }
  );
}

function makeAnalysisToTrapdoorChute() {
  return group();
}

function makeMg996rServoFloorSupport(y, label) {
  const floorTop = level1Bottom + pvc;
  const servoBottom = mg996rAssemblyZ;
  const topSaddleThickness = 4;
  const wrapSaddleOverlap = 1;
  const wrapWallOverlap = 3;
  const frontWrapWidth = 62;
  const outerSign = y > level1RectangleY ? 1 : -1;
  const baseFootLength = 76;
  const baseFootWidth = mg996rServoSupportDepth;
  const baseFootY = y;
  const frontWrapY = y - outerSign * (mg996rServoSupportDepth / 2 + mg996rServoWrapThickness / 2 - wrapWallOverlap);
  const base = box(baseFootWidth, baseFootLength, 5)
    .translate(mg996rServoSupportX, baseFootY, floorTop);
  const riser = box(24, 22, servoBottom - floorTop - topSaddleThickness - 5)
    .translate(mg996rServoSupportX, y, floorTop + 5);
  const saddle = box(62, mg996rServoSupportDepth, topSaddleThickness)
    .translate(mg996rServoSupportX, y, servoBottom - topSaddleThickness);
  const wrapInnerFrontRaw = box(frontWrapWidth, mg996rServoWrapThickness, mg996rServoWrapHeight + wrapSaddleOverlap)
    .translate(
      mg996rServoSupportX,
      frontWrapY,
      servoBottom - wrapSaddleOverlap
    );
  const frontTrimWidth = Math.max(0.1, mg996rFrontWrapCenterTrim);
  const wrapInnerFrontTrim = box(frontTrimWidth, mg996rServoWrapThickness + 2, mg996rServoWrapHeight + wrapSaddleOverlap + 2)
    .translate(
      mg996rServoSupportX,
      frontWrapY,
      servoBottom - wrapSaddleOverlap - 1
    );
  const wrapInnerFront = wrapInnerFrontRaw.subtract(wrapInnerFrontTrim);
  const wrapHoleLength = mg996rServoWrapThickness + 10;
  const tabCenterX = frontTrimWidth / 2 + (frontWrapWidth - frontTrimWidth) / 4;
  const servoMountHoleZOffsets = [
    mg996rWrapHoleZCenter - mg996rWrapHoleSeparation / 2,
    mg996rWrapHoleZCenter + mg996rWrapHoleSeparation / 2,
  ];
  const wrapScrewHoles = [-tabCenterX, tabCenterX].flatMap((xOffset) =>
    servoMountHoleZOffsets.map((zOffset) =>
      cylinder(wrapHoleLength, 2, undefined, 32)
      .placeReference('center', [0, 0, 0])
      .rotateX(90)
        .translate(
          mg996rServoSupportX + xOffset + mg996rWrapHoleXOffset + (xOffset > 0 ? mg996rRightSideWrapHoleXOffset : 0),
          frontWrapY,
          servoBottom + zOffset
        )
    )
  );
  const screwHoles = [
    [0, -24],
    [0, 24],
  ].map(([x, yOffset]) =>
    cylinder(8, M3_CLEAR, undefined, 24)
      .translate(mg996rServoSupportX + x, baseFootY + yOffset, floorTop - 1)
  );
  return union(base, riser, saddle, wrapInnerFront)
    .subtract(...screwHoles, ...wrapScrewHoles)
    .color(C.printed)
    .material({ roughness: 0.45 });
}

function makeMg996rServoFloorSupports() {
  return group(
    {
      name: "PETG photo booth MG996R floor-to-servo support positive Y",
      shape: makeMg996rServoFloorSupport(mg996rPositiveServoSupportY, "positive"),
    },
    {
      name: "PETG photo booth MG996R floor-to-servo support mirrored Y",
      shape: makeMg996rServoFloorSupport(mg996rMirroredServoSupportY, "mirrored"),
    }
  );
}

function sectorShape(radius, startDeg, sweepDeg, thickness, z, color) {
  const pts = [[0, 0]];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const a = (startDeg + (sweepDeg * i) / steps) * Math.PI / 180;
    pts.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return polygon(pts).extrude(thickness).translate(0, 0, z).color(color);
}

function annularSectorShape(innerRadius, outerRadius, startDeg, sweepDeg, thickness, z, color) {
  const pts = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const a = (startDeg + (sweepDeg * i) / steps) * Math.PI / 180;
    pts.push([outerRadius * Math.cos(a), outerRadius * Math.sin(a)]);
  }
  for (let i = steps; i >= 0; i--) {
    const a = (startDeg + (sweepDeg * i) / steps) * Math.PI / 180;
    pts.push([innerRadius * Math.cos(a), innerRadius * Math.sin(a)]);
  }
  return polygon(pts).extrude(thickness).translate(0, 0, z).color(color);
}

function makeClassifierLevel() {
  const diskModule = require("./rotating-disk-module.forge.js", {
    "Disk Rotation Angle": classifierDiskRotationReferenceAngle - classifierDiskRotationAngle,
    "Show Standalone Support Base": 0,
    "Show Assembly Paths": 0,
    "Show Bottle Envelope": 1,
    "Simple Rebuild View": 1,
  }).diskModule.translate(0, 0, level2Bottom - 400);
  const prismFixedPositiveX = level2AdjustablePrismX + level2AdjustablePrismNarrowWidth / 2;
  const prismTopCapX = prismFixedPositiveX - level2AdjustablePrismFullWidth / 2;
  const prismLowerHeight = level2AdjustablePrismHeight - level2AdjustablePrismTopCapHeight;
  const kw11MountHoleCutters = [
    cylinder(level2AdjustablePrismTopCapHeight + 1, level2Kw11MountHoleDiameter / 2)
      .translate(level2Kw11MountHoleX, level2Kw11MountHoleY1, level2AdjustablePrismZ + prismLowerHeight - 0.5),
    cylinder(level2AdjustablePrismTopCapHeight + 1, level2Kw11MountHoleDiameter / 2)
      .translate(level2Kw11MountHoleX, level2Kw11MountHoleY2, level2AdjustablePrismZ + prismLowerHeight - 0.5),
  ];
  const prismTopCap = difference(
    box(level2AdjustablePrismFullWidth, 25, level2AdjustablePrismTopCapHeight)
      .translate(prismTopCapX, level2AdjustablePrismY, level2AdjustablePrismZ + prismLowerHeight),
    kw11MountHoleCutters
  );
  const prismFoot = box(level2PrismFootW, level2PrismFootD, level2PrismFootH)
    .translate(level2PrismFootX, level2PrismFootY, level2AdjustablePrismZ)
    .subtract(...level2Kw11PrismFootScrewCutters(level2AdjustablePrismZ - 1, level2PrismFootH + 2));
  const adjustablePrism = union(
    prismFoot,
    box(level2AdjustablePrismNarrowWidth, 25, prismLowerHeight)
      .translate(level2AdjustablePrismX, level2AdjustablePrismY, level2AdjustablePrismZ),
    prismTopCap
  )
    .color(C.petg)
    .material({ roughness: 0.55 });
  const kw11Switch = importMesh("assets/kw11-3z-hinge_lever_up.stl", { center: true })
    .rotateX(level2Kw11SwitchRotX)
    .rotateY(level2Kw11SwitchRotY)
    .rotateZ(level2Kw11SwitchRotZ)
    .translate(level2Kw11SwitchX, level2Kw11SwitchY, level2Kw11SwitchZ)
    .color("#2b2b2b")
    .material({ roughness: 0.5 });

  return group(
    { name: "Rotating disk classifier module", group: diskModule },
    { name: "Black PETG KW11 stepped prism with screwable foot into Level 2 PVC deck", shape: adjustablePrism },
    { name: "Imported KW11-3Z hinge lever switch reference", shape: kw11Switch }
  );
}

function makeDiskWeightSupport() {
  return group();
}

function makeLevel3Fc51Holder(angleDeg) {
  const pose = level3Fc51HolderPose(angleDeg);
  return require("./fc51-holder-box-edit.forge.js", {
    "FC51 Side Slot Grow Up Z": 2.1,
  }).shape
    .rotateX(level3Fc51HolderRotX)
    .rotateY(level3Fc51HolderRotY)
    .rotateZ(pose.rotZ)
    .translate(pose.x, pose.y, pose.z)
    .color(C.printed)
    .material({ roughness: 0.55 });
}

function makeLevel3Fc51CeilingFoot(angleDeg) {
  const [anchorX, anchorY, anchorZ] = level3Fc51CeilingFootAnchor(angleDeg);
  const screwCenters = level3Fc51CeilingFootScrewCenters(angleDeg);
  const plateX = (screwCenters[0][0] + screwCenters[1][0]) / 2;
  const plateY = (screwCenters[0][1] + screwCenters[1][1]) / 2;
  const isDiagonalSector = Math.abs(angleDeg % 180) > 1;
  const footPlateW = isDiagonalSector ? 40 : 26;
  const footPlateD = 34;
  const footPlateT = 4;
  const strutW = 9;
  const strutH = 7;
  const ceilingPlateZ = level2Bottom - footPlateT;
  const strutStart = [plateX, plateY, ceilingPlateZ + footPlateT / 2];
  const strutEnd = [anchorX, anchorY, anchorZ];
  const strutDx = strutEnd[0] - strutStart[0];
  const strutDy = strutEnd[1] - strutStart[1];
  const strutDz = strutEnd[2] - strutStart[2];
  const strutLength = Math.max(4, Math.hypot(strutDx, strutDy, strutDz));
  const strutRotZ = Math.atan2(strutDy, strutDx) * 180 / Math.PI;
  const strutRotY = Math.atan2(-strutDz, Math.hypot(strutDx, strutDy)) * 180 / Math.PI;

  const ceilingPlate = isDiagonalSector
    ? union(
        box(Math.max(1, footPlateW - footPlateD), footPlateD, footPlateT)
          .translate(plateX, plateY, ceilingPlateZ),
        cylinder(footPlateT, footPlateD / 2, undefined, 48)
          .translate(plateX - (footPlateW - footPlateD) / 2, plateY, ceilingPlateZ),
        cylinder(footPlateT, footPlateD / 2, undefined, 48)
          .translate(plateX + (footPlateW - footPlateD) / 2, plateY, ceilingPlateZ)
      )
    : box(footPlateW, footPlateD, footPlateT)
        .translate(plateX, plateY, ceilingPlateZ);
  const inclinedStrut = box(strutLength, strutW, strutH)
    .translate(0, 0, -strutH / 2)
    .rotateY(strutRotY)
    .rotateZ(strutRotZ)
    .translate(
      (strutStart[0] + strutEnd[0]) / 2,
      (strutStart[1] + strutEnd[1]) / 2,
      (strutStart[2] + strutEnd[2]) / 2
    );
  const screwCutters = level3Fc51CeilingFootScrewCutters(ceilingPlateZ - 1, footPlateT + 2, angleDeg);

  return union(ceilingPlate, inclinedStrut)
    .subtract(...screwCutters)
    .color(C.printed)
    .material({ roughness: 0.55 });
}

function makeLevel3Fc51HolderAssembly(angleDeg) {
  return union(
    makeLevel3Fc51Holder(angleDeg),
    makeLevel3Fc51CeilingFoot(angleDeg)
  )
    .color(C.printed)
    .material({ roughness: 0.55 });
}

function makeStorageLevel() {
  const storageBins = require("./bucket-storage-bins.forge.js").storageBins
    .rotateZ(bucketSectorAlignmentRotation);

  return group(
    { name: "Rotated bucket storage sectors aligned to Level 2 disk indexes", group: storageBins },
    { name: "Two-piece rear PETG semicircle bucket locating collar", group: makeBucketLocatingCollar() }
  );
}

function makeBucketGuidePiece(name, startDeg, sweepDeg, screwAngles) {
  const collar = annularSectorShape(
    bucketGuideInnerRadius,
    bucketGuideOuterRadius,
    startDeg,
    sweepDeg,
    bucketGuideHeight,
    bucketGuideZ,
    C.printed
  );
  const screwCutters = screwAngles.map((angleDeg) => {
    const a = angleDeg * Math.PI / 180;
    return cylinder(bucketGuideHeight + 4, M3_CLEAR, undefined, 28)
      .translate(
        bucketGuideScrewRadius * Math.cos(a),
        bucketGuideScrewRadius * Math.sin(a),
        bucketGuideZ - 1
      );
  });

  return {
    name,
    shape: collar
      .subtract(...screwCutters)
      .color(C.printed)
      .material({ roughness: 0.5 }),
  };
}

function makeBucketLocatingCollar() {
  return group(
    makeBucketGuidePiece(
      "PETG rear bucket locating collar right half, screwed to base",
      0,
      89,
      [bucketGuideScrewAngles[0], bucketGuideScrewAngles[1]]
    ),
    makeBucketGuidePiece(
      "PETG rear bucket locating collar left half, screwed to base",
      91,
      89,
      [bucketGuideScrewAngles[2], bucketGuideScrewAngles[3]]
    )
  );
}

function makeLinearActuatorStudies() {
  return group();
}

function makeMg996rServoPlacementStudy() {
  const servo = importMesh("assets/mg996r-v17-from-step.obj", { center: true })
    .translate(0, 0, 30)
    .color("#2f2b28");
  const hornX = 30.5;
  const hornY = -17.5;
  const hornZ = 43.5;
  const hornPivotLocal = [-0.04246, -27.45074, 0];
  const hornPivotWorld = [
    hornX + hornPivotLocal[0],
    hornY - hornPivotLocal[1],
    hornZ - hornPivotLocal[2],
  ];
  const horn = importMesh("assets/ServoMotor_Arms_MG996R_parts/horn_3.obj", { center: true })
    .translate(-hornPivotLocal[0], -hornPivotLocal[1], -hornPivotLocal[2])
    .rotateX(180)
    .rotateZ(mg996rHornServoRotation)
    .translate(hornPivotWorld[0], hornPivotWorld[1], hornPivotWorld[2])
    .color("#111111");

  const servoAssembly = group(
    { name: "STEP-derived MG996R servo body", shape: servo },
    { name: "MG996R rotating servo horn", shape: horn },
  )
    .rotateX(mg996rAssemblyRotX)
    .rotateY(mg996rAssemblyRotY)
    .rotateZ(mg996rAssemblyRotZ);
  const basePositionedAssembly = servoAssembly.translate(mg996rAssemblyX, mg996rAssemblyY, mg996rAssemblyZ);
  const positionedAssembly = basePositionedAssembly
    .translate(0, mg996rServoSeparation, 0)
    .translate(0, mg996rServoPlacementYOffset, 0);
  const mirroredAssembly = basePositionedAssembly
    .mirror([0, 1, 0])
    .translate(0, mg996rMirroredAssemblyY + mg996rAssemblyY, 0)
    .translate(0, -mg996rServoSeparation, 0)
    .translate(0, mg996rServoPlacementYOffset, 0);

  return group(
    { name: "MG996R servo and horn at positive Y", group: positionedAssembly },
    { name: "MG996R servo and horn mirrored across X axis", group: mirroredAssembly },
  );
}

function makeCableManagement() {
  const z = H / 2;
  const ductH = H - 35;
  const ducts = [
    [-W / 2 + 18, D / 2 - 18],
    [W / 2 - 18, D / 2 - 18],
    [-W / 2 + 18, -D / 2 + 18],
    [W / 2 - 18, -D / 2 + 18],
  ].map(([x, y], i) => ({
    name: `Corner cable duct ${i + 1}`,
    shape: box(20, 20, ductH)
      .translate(x, y, 18)
      .color(C.cable)
      .material({ opacity: 0.55 }),
  }));

  const verticalHarness = cylinder(ductH, 3)
    .translate(W / 2 - 18, D / 2 - 18, 18)
    .color("#ff595e");

  return group(...ducts, { name: "Main vertical wiring harness", shape: verticalHarness });
}

function makeStructuralBrackets() {
  const bracketParts = require("./printed-structure-brackets.forge.js", {
    "Preview Layout": 0,
  }).parts;
  const corner = bracketParts.verticalCornerBracket;
  const floor = bracketParts.floorCornerBracket;
  const frontOpenFloor = bracketParts.frontOpenFloorBracket;
  const deckSupport = bracketParts.deckSupportBracket;

  const cornerPositions = [
    { name: "front-left", x: -W / 2 + 7, y: -D / 2 + 7, rot: 0 },
    { name: "front-right", x: W / 2 - 7, y: -D / 2 + 7, rot: 90 },
    { name: "back-right", x: W / 2 - 7, y: D / 2 - 7, rot: 180 },
    { name: "back-left", x: -W / 2 + 7, y: D / 2 - 7, rot: -90 },
  ];
  const verticalBracketLevels = [
    { label: "level2 deck joint", z: level2Bottom + pvc },
    { label: "level1 deck joint", z: level1Bottom + pvc },
  ];
  const verticals = [];
  for (const level of verticalBracketLevels) {
    for (const pos of cornerPositions) {
      verticals.push({
        name: `PETG vertical L-bracket ${level.label} ${pos.name}`,
        shape: corner.clone()
          .rotateZ(pos.rot)
          .translate(pos.x, pos.y, level.z)
          .color(C.printed),
      });
    }
  }

  const floorBrackets = cornerPositions.map((pos) => {
    const isFront = pos.name === "front-left" || pos.name === "front-right";
    const frontShape = pos.name === "front-right"
      ? frontOpenFloor.clone().mirrorThrough([0, 0, 0], [1, 0, 0])
      : frontOpenFloor.clone();
    return {
      name: `PETG base/floor L-bracket ${pos.name}`,
      shape: (isFront ? frontShape : floor.clone().rotateZ(pos.rot))
        .translate(pos.x, pos.y, pvc)
        .color(C.printed),
    };
  });
  const ceilingBrackets = cornerPositions.map((pos) => ({
    name: `PETG top/ceiling L-bracket ${pos.name}`,
    shape: floor.clone()
      .rotateZ(pos.rot)
      .scaleAround([0, 0, 0], [1, 1, -1])
      .translate(pos.x, pos.y, H - pvc)
      .color(C.printed),
  }));

  const deckLevels = [
    { label: "level1", z: level1Bottom, supports: ["left", "right"] },
    { label: "level2", z: level2Bottom, supports: ["left", "right"] },
  ];
  const deckSupports = [];
  for (const { label, z, supports } of deckLevels) {
    if (supports.includes("left")) {
      deckSupports.push({
        name: `PETG ${label} deck support left wall`,
        shape: deckSupport.clone()
          .rotateZ(-90)
          .translate(-W / 2 + pvc + 3, 0, z - 40)
          .color(C.printed),
      });
    }
    if (supports.includes("right")) {
      deckSupports.push({
        name: `PETG ${label} deck support right wall`,
        shape: deckSupport.clone()
          .rotateZ(90)
          .translate(W / 2 - pvc - 3, 0, z - 40)
          .color(C.printed),
      });
    }
    if (supports.includes("back")) {
      deckSupports.push({
        name: `PETG ${label} deck support back wall`,
        shape: deckSupport.clone()
          .rotateZ(180)
          .translate(0, D / 2 - acrylic - 3, z - 40)
          .color(C.printed),
      });
    }
  }

  return group(...verticals, ...floorBrackets, ...ceilingBrackets, ...deckSupports);
}

const shell = makeShell();
const layout = group(
  ...(showShell ? [{ name: "PVC/acrylic enclosure", group: shell }] : []),
  { name: "Horizontal functional levels", group: makeLevelPlates() },
  { name: "Level 0 top interface", group: makeTopInterface() },
  { name: "Level 1 analysis subsystem", group: makeAnalysisLevel() },
  { name: "Level 1 to Level 2 transfer chute", group: makeAnalysisToTrapdoorChute() },
  { name: "Level 2 rotating classifier", group: makeClassifierLevel() },
  { name: "Level 2 fixed disk weight support", group: makeDiskWeightSupport() },
  { name: "Level 3 storage compartments", group: makeStorageLevel() },
  { name: "Linear actuator placement studies", group: makeLinearActuatorStudies() },
  { name: "MG996R servo placement study", group: makeMg996rServoPlacementStudy() },
  { name: "Photo booth servo floor supports", group: makeMg996rServoFloorSupports() },
  { name: "PETG structural panel brackets", group: makeStructuralBrackets() }
);

return {
  "Smart bin full layout": layout,
  materialNotes: {
    pvcSheet: "5 mm foamed PVC, stock 1220 x 2440 mm",
    acrylicBack: "500 x 800 x 4 mm acrylic rear inspection face",
    printedParts: "sensor mounts, camera holders, servo supports, NEMA17 support hub, receiver socket, funnels, and collars",
    frontAccess: "front PVC upper panel starts at Level 2 and is now clean; controls are grouped in the top electronics opening",
    storageArchitecture: "AI classes are selected before the rotating classifier; lower storage is now one real removable purple bucket",
  },
  initialCutList: {
    pvc5mm: [
      "front upper service face 500 x 500, clean solid PVC; lower section open for removable bins",
      "left side 400 x 800",
      "right side 400 x 800",
      "bottom/base 500 x 400",
      "top cover 500 x 400 with inlet opening",
    "Level 1 and Level 2 internal decks 500 x 400 with current openings",
    "circular rotating disk 340 diameter",
    ],
    acrylic4mm: ["rear inspection face 500 x 800"],
    printed3d: [
      "corner brackets and cable ducts",
      "acrylic rear-panel frame",
      "funnel or funnel support ring",
      "sensor brackets",
      "NEMA17 support hub, shaft receiver socket, and spider arms",
      "bucket guides or retention features if needed after fitting the real bucket",
    ],
  },
  levelHeights: {
    level0: [level0Bottom, level0Top],
    level1: [level1Bottom, level0Bottom],
    level2: [level2Bottom, level1Bottom],
    level3: [level3Bottom, level2Bottom],
  },
};

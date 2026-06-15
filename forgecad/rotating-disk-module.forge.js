// Rotating classifier disk module for the smart waste-sorting bin.
// Standalone, buildable module: PVC disk + PETG/PLA printed supports and mounts.
//
// Design intent:
// - 340 mm disk cut from 5 mm foamed PVC.
// - NEMA 17 stepper sits at the center of the Level 2 opening.
// - A printed PETG six-arm support hub carries only the motor.
// - Drilled support holes around the circular opening are preserved for future hardware.
// - A printed PETG receiver socket bolts to the PVC disk and engages the NEMA shaft for torque only.
// - One large one-piece PETG funnel catches waste before it reaches the disk surface.
// - Six index tabs trigger six fixed limit switches at 60-degree intervals.
// - No metal hardware assumed.

const diskDiameter = 340;
const diskZ = 445;
const deckZ = 400;
const pvc = 5;
const doorSweep = 54;
const doorOuter = 168;
const doorInner = 72;
const diskRotation = Param.number("Disk Rotation Angle", 0, { min: 0, max: 360, step: 1, unit: "deg" });
const demoDoorOpen = 0;
const trapdoorLinearKitPositiveX = 47;
const trapdoorLinearKitNegativeX = 159;
const trapdoorLinearKitPositiveY = 98;
const trapdoorLinearKitNegativeY = -98;
const showStandaloneBase = Param.bool("Show Standalone Support Base", true);
const showAssemblyPaths = Param.bool("Show Assembly Paths", true);
const showBottleEnvelope = Param.bool("Show Bottle Envelope", true);
const simpleRebuildView = Param.bool("Simple Rebuild View", true);
const fixedUArmPosition = [119, -6, deckZ + 19];
const fixedUArmRotation = [-90, 180, -113];
const fixedHornMountLocalOffset = [-29.93, 0, -1.42];
const fixedArmReachAdjust = -18;
const fixedArmFootEndCut = 2.6;
const fixedFootOffset = [-1, 0, 0];
const copyUArmPosition = [129, 11, deckZ + 19];
const copyUArmRotation = [-90, 180, 121];
const hingeCopyPosition = [244, -163, deckZ + 65];
const hingeCopyRotation = [90, 0, -114];
const hingeCopyShrink = 0.6;
const hingeCopyHoleR = 1.5;
const servoHolderCopyPosition = [-34, 59, hingeCopyPosition[2]];
const servoHolderCopyRotation = [hingeCopyRotation[0], hingeCopyRotation[1], 66];
const movableUArmFootOffset = [0.4, 2.8, 2];
const movableUArmFootEndReach = 2.2;

const trapdoorLinearKitPositiveZ = 460;
const trapdoorLinearKitNegativeZ = 460;
const trapdoorLinearKitPositiveRotZ = 90;
const trapdoorLinearKitNegativeRotZ = 270;

const R = diskDiameter / 2;
const sectorCount = 6;
const sectorSweep = 360 / sectorCount;
const sectorStart = -sectorSweep / 2;
const homeTriggerWorldAngle = 103.5;
const homeTriggerReferenceRotation = 60;
const homeTriggerLocalAngle = homeTriggerWorldAngle - homeTriggerReferenceRotation;
const homeTriggerStartR = R - 10;
const homeTriggerLength = 30;
const homeTriggerTangentialWidth = 8;
const homeTriggerHeight = 7;
const homeTriggerFootLength = 28;
const homeTriggerFootWidth = 24;
const homeTriggerFootHeight = 4;
const homeTriggerFootCenterR = homeTriggerStartR - 10;
const homeTriggerFootScrewOffset = 7;
const plateW = 500;
const plateD = 400;
// Matched to servo-door-mechanism-demo.forge.js so the visual servo envelope is consistent.
const servoBodyW = 22;
const servoBodyD = 11;
const servoBodyH = 28;
const servoShaftR = 3.2;
const servoHornDiskH = 6;
const servoHornDiskR = 4;
const servoHornArmL = 33;
const servoHornArmW = 5;
const servoHornArmH = 5;
// Dimensions taken from the uploaded NEMA_17.3mf bounding box.
const nemaBodyW = 42.5;
const nemaBodyD = 42.5;
const nemaFaceW = 46.5;
const nemaFaceD = 42.5;
const nemaBodyH = 25;
const nemaShaftDCircleD = 5.2;
const nemaShaftDFlatToCurve = 4.7;
const nemaBossClearR = 12.0;
const nemaShaftLength = 22;
const importedNemaHalfHeight = 30.75;
const importedNemaShaftTipAboveFace = 22;
const importedNemaShaftOffsetX = 2.5;
const nemaMountSpacing = 31;
const nemaMountHoleR = 2.0;
const nemaSupportHubR = 52;
const nemaSupportHubT = 8;
const nemaReceiverR = 7.5;
const nemaReceiverFlangeR = 22;
const nemaReceiverFlangeT = 5;
const nemaReceiverSupportGap = 2;
const nemaReceiverScrewR = 2.0;
const nemaReceiverScrewRadius = 15;
const nemaShaftEngagementDepth = 8;
const loadPillarAngles = [0, 60, 120, 180, 240, 300];
const loadPillarMountR = R + 23;
const loadPillarTopPadR = R - 10;
const loadPillarTangentialW = 12;
const loadPillarBaseRadialW = 38;
const loadPillarBaseTangentialW = 38;
const loadPillarBaseT = 5;
const loadPillarTopPadRadialW = 28;
const loadPillarTopPadT = 5;
const loadPillarDiagonalW = 8;
const loadPillarDiagonalT = 10;
const loadPillarScrewOffset = 12;
const diskSupportClearance = 0.35;
const C = {
  pvc: "#e9e2c6",
  supportPvc: "#d7d0b0",
  plastic: "#2bb3ff",
  paper: "#f4d35e",
  metalSector: "#a7b1bd",
  organic: "#77b255",
  batteries: "#ff7a59",
  other: "#b9a7ff",
  petg: "#111111",
  pla: "#4d4d4d",
  servo: "#7c4dff",
  nema: "#3f3f3f",
  sensor: "#ffcf56",
  reference: "#7dd3fc",
  screw: "#1f2937",
};

const M3_CLEAR = 2.0;
const M2_CLEAR = 2.0;
const sixCategories = [
  { name: "Plastic", color: C.plastic },
  { name: "Paper/Cardboard", color: C.paper },
  { name: "Metal", color: C.metalSector },
  { name: "Organic", color: C.organic },
  { name: "Batteries", color: C.batteries },
  { name: "Other", color: C.other },
];

function sectorShape(radius, startDeg, sweepDeg, thickness, z, color) {
  const pts = [[0, 0]];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const a = (startDeg + (sweepDeg * i) / steps) * Math.PI / 180;
    pts.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return polygon(pts).extrude(thickness).translate(0, 0, z).color(color);
}

function annularSectorShape(innerRadius, outerRadius, startDeg, sweepDeg, thickness, z, color) {
  const pts = [];
  const steps = 28;
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

function atPolar(shape, radius, angleDeg, z = 0) {
  return shape
    .rotateZ(angleDeg)
    .translate(
      radius * Math.cos(angleDeg * Math.PI / 180),
      radius * Math.sin(angleDeg * Math.PI / 180),
      z
    );
}

function tubeAlong(length, outerRadius, innerRadius, direction, startPoint, color) {
  return cylinder(length, outerRadius, undefined, 32)
    .subtract(cylinder(length + 2, innerRadius, undefined, 32).translate(0, 0, -1))
    .pointAlong(direction)
    .translate(startPoint[0], startPoint[1], startPoint[2])
    .color(color);
}

function radialPoint(radius, angleDeg, z) {
  return [
    radius * Math.cos(angleDeg * Math.PI / 180),
    radius * Math.sin(angleDeg * Math.PI / 180),
    z,
  ];
}

function makeDProfileShaftBore(height, z) {
  const r = nemaShaftDCircleD / 2;
  const flatY = r - nemaShaftDFlatToCurve;
  const chordHalfX = Math.sqrt(Math.max(0, r * r - flatY * flatY));
  const start = Math.asin(flatY / r);
  const end = Math.PI - start;
  const steps = 40;
  const pts = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + (end - start) * t;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }

  pts.push([-chordHalfX, flatY], [chordHalfX, flatY]);
  return polygon(pts).extrude(height).translate(0, 0, z);
}

function nemaMountHoleCutters(height, z) {
  const half = nemaMountSpacing / 2;
  return [
    [-half, -half],
    [half, -half],
    [-half, half],
    [half, half],
  ].map(([x, y]) => cylinder(height, nemaMountHoleR, undefined, 28).translate(x, y, z));
}

function makeNemaMotorVisual(faceZ) {
  return group({
    name: "Imported exact NEMA 17 motor mesh",
    shape: importMesh("assets/NEMA_17.obj", { center: true })
      .translate(-importedNemaShaftOffsetX, 0, 0)
      .translate(0, 0, faceZ + importedNemaShaftTipAboveFace - importedNemaHalfHeight)
      .color(C.nema)
      .material({ opacity: 0.86, roughness: 0.45 }),
  });
}

function diskLoadPillarHolePoints() {
  const points = [];
  for (const angleDeg of loadPillarAngles) {
    const a = angleDeg * Math.PI / 180;
    const radial = [Math.cos(a), Math.sin(a)];
    const tangent = [-Math.sin(a), Math.cos(a)];
    for (const side of [-1, 1]) {
      points.push([
        loadPillarMountR * radial[0] + side * loadPillarScrewOffset * tangent[0],
        loadPillarMountR * radial[1] + side * loadPillarScrewOffset * tangent[1],
      ]);
    }
  }
  return points;
}

function makeDiskLoadPillarDeckHoleCutters(z, height) {
  return diskLoadPillarHolePoints().map(([x, y]) =>
    cylinder(height, M3_CLEAR, undefined, 28).translate(x, y, z)
  );
}

function makeDiskLoadSupportPillars() {
  const baseZ = deckZ + pvc;
  const topPadLocalZ = diskZ - diskSupportClearance - loadPillarTopPadT - baseZ;
  const baseInnerR = loadPillarMountR - loadPillarBaseRadialW / 2;
  const baseOuterR = loadPillarMountR + loadPillarBaseRadialW / 2;
  const topPadInnerR = loadPillarTopPadR - loadPillarTopPadRadialW / 2;
  const topPadOuterR = loadPillarTopPadR + loadPillarTopPadRadialW / 2;
  const screwHoles = [
    cylinder(loadPillarBaseT + 2, M3_CLEAR, undefined, 28).translate(loadPillarMountR, -loadPillarScrewOffset, -1),
    cylinder(loadPillarBaseT + 2, M3_CLEAR, undefined, 28).translate(loadPillarMountR, loadPillarScrewOffset, -1),
  ];
  const base = box(loadPillarBaseRadialW, loadPillarBaseTangentialW, loadPillarBaseT)
    .translate(loadPillarMountR, 0, 0);
  const topPad = box(loadPillarTopPadRadialW, loadPillarTangentialW, loadPillarTopPadT)
    .translate(loadPillarTopPadR, 0, topPadLocalZ);
  const diagonalProfile = polygon([
    [baseOuterR - loadPillarDiagonalT, loadPillarBaseT - 0.2],
    [baseOuterR, loadPillarBaseT - 0.2],
    [topPadInnerR + loadPillarDiagonalT, topPadLocalZ + 1.2],
    [topPadInnerR, topPadLocalZ + 1.2],
  ])
    .extrude(loadPillarDiagonalW)
    .rotateX(90)
    .translate(0, loadPillarDiagonalW / 2, 0);
  const localPillar = union(base, diagonalProfile, topPad)
    .subtract(...screwHoles)
    .translate(0, 0, baseZ)
    .color(C.petg)
    .material({ opacity: 0.88 });

  return group(
    ...loadPillarAngles.map((angleDeg, i) => ({
      name: `fixed PETG disk load support pillar ${i + 1}`,
      shape: localPillar.rotateZ(angleDeg),
    }))
  );
}

function makeNemaSupportHub(hubZ, hubT, supportArmAngles, supportArmInnerR) {
  const bossAndShaftClearance = cylinder(hubT + 2, nemaBossClearR, undefined, 64)
    .translate(0, 0, hubZ - 1);
  const motorMountHoles = nemaMountHoleCutters(hubT + 2, hubZ - 1);
  const armBoltHoles = supportArmAngles.map((angleDeg) => {
    const [x, y] = radialPoint(supportArmInnerR, angleDeg, hubZ - 1);
    return cylinder(hubT + 2, M3_CLEAR, undefined, 28).translate(x, y, hubZ - 1);
  });
  const hubBody = cylinder(hubT, nemaSupportHubR, undefined, 128)
    .translate(0, 0, hubZ)
    .subtract(bossAndShaftClearance, ...motorMountHoles, ...armBoltHoles)
    .color(C.petg)
    .material({ opacity: 0.88 });

  return group(
    { name: "printable NEMA17 centered motor support hub", shape: hubBody }
  );
}

function makeNemaReceiverSocket(receiverBottomZ, receiverTopZ) {
  const receiverH = receiverTopZ - receiverBottomZ;
  const flangeBottomZ = receiverTopZ - nemaReceiverFlangeT;
  const shaftBore = makeDProfileShaftBore(receiverH + 2, receiverBottomZ - 1);
  const screwHoles = [45, 135, 225, 315].map((a) => {
    const [x, y] = radialPoint(nemaReceiverScrewRadius, a, flangeBottomZ - 2);
    return cylinder(nemaReceiverFlangeT + pvc + 4, nemaReceiverScrewR, undefined, 32)
      .translate(x, y, flangeBottomZ - 2);
  });

  return union(
    cylinder(receiverH, nemaReceiverR, undefined, 64).translate(0, 0, receiverBottomZ),
    cylinder(nemaReceiverFlangeT, nemaReceiverFlangeR, undefined, 72).translate(0, 0, flangeBottomZ)
  )
    .subtract(shaftBore, ...screwHoles)
    .color(C.petg)
    .material({ opacity: 0.88 });
}

function makeNemaReceiverDiskHoleCutters(z, height) {
  return [45, 135, 225, 315].map((a) => {
    const [x, y] = radialPoint(nemaReceiverScrewRadius, a, z);
    return cylinder(height, nemaReceiverScrewR, undefined, 32).translate(x, y, z);
  });
}

function vecLength(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function vecAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function vecScale(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function rotatePointAroundAxis(point, axis, pivot, angleDeg) {
  const angle = angleDeg * Math.PI / 180;
  const len = vecLength(axis);
  const u = [axis[0] / len, axis[1] / len, axis[2] / len];
  const p = [point[0] - pivot[0], point[1] - pivot[1], point[2] - pivot[2]];
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const dot = u[0] * p[0] + u[1] * p[1] + u[2] * p[2];
  const cross = [
    u[1] * p[2] - u[2] * p[1],
    u[2] * p[0] - u[0] * p[2],
    u[0] * p[1] - u[1] * p[0],
  ];
  return [
    pivot[0] + p[0] * cosA + cross[0] * sinA + u[0] * dot * (1 - cosA),
    pivot[1] + p[1] * cosA + cross[1] * sinA + u[1] * dot * (1 - cosA),
    pivot[2] + p[2] * cosA + cross[2] * sinA + u[2] * dot * (1 - cosA),
  ];
}

function hingeMountHolePoints(kind) {
  const doorStart = -doorSweep / 2;
  const hingeAngle = doorStart;
  const hingeDir = [
    Math.cos(hingeAngle * Math.PI / 180),
    Math.sin(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeTangent = [
    -Math.sin(hingeAngle * Math.PI / 180),
    Math.cos(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeRadius = (doorInner + doorOuter) / 2;
  const hingeOrigin = radialPoint(hingeRadius, hingeAngle, diskZ + pvc + 9);
  const localPoint = (u, v, z) => [
    hingeOrigin[0] + hingeDir[0] * u + hingeTangent[0] * v,
    hingeOrigin[1] + hingeDir[1] * u + hingeTangent[1] * v,
    z,
  ];

  const hingeAxisU = 48;
  const hingeAxisV = -45;
  const leafV = hingeAxisV - 1.5;
  const wallLeafWidth = 32;
  const doorLeafWidth = 46;
  const screwInset = 8;
  const doorFirstScrewOffset = 18;
  const doorSecondScrewInset = 10;
  const wallLeafU = hingeAxisU - wallLeafWidth / 2 - 3;
  const doorLeafU = hingeAxisU + doorLeafWidth / 2 - 3;
  const servoPivotZ = diskZ - 10;
  const zCenters = [servoPivotZ + 30, servoPivotZ - 22];

  const fixedDiskUvs = [
    [wallLeafU - wallLeafWidth / 2 + screwInset, leafV - 6],
    [wallLeafU + wallLeafWidth / 2 - screwInset, leafV - 6],
  ];
  const movingTrapdoorUvs = [
    [doorLeafU - doorLeafWidth / 2 + doorFirstScrewOffset, leafV - 6],
    [doorLeafU + doorLeafWidth / 2 - doorSecondScrewInset, leafV - 6],
  ];
  const uvs = kind === "disk" ? fixedDiskUvs : movingTrapdoorUvs;
  const screwZOffset = kind === "disk" ? 5 : -7;

  const hornAngle = hingeAngle - 90;
  const hornDir = [
    Math.cos(hornAngle * Math.PI / 180),
    Math.sin(hornAngle * Math.PI / 180),
    0,
  ];
  const servoTiltAxis = [-hornDir[1], hornDir[0], 0];
  const demoHingePivot = localPoint(-14, -48, diskZ - 10);

  const points = [];
  for (const zCenter of zCenters) {
    for (const [u, v] of uvs) {
      let p = localPoint(u, v, zCenter + screwZOffset);
      p = rotatePointAroundAxis(p, servoTiltAxis, demoHingePivot, 90);
      p = rotatePointAroundAxis(p, [0, 0, 1], demoHingePivot, -270);
      points.push([p[0], p[1] - 24, p[2] + 6]);
    }
  }
  return points;
}

function trapdoorArmFootHolePoints() {
  const doorStart = -doorSweep / 2;
  const hingeAngle = doorStart;
  const hingeDir = [
    Math.cos(hingeAngle * Math.PI / 180),
    Math.sin(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeTangent = [
    -Math.sin(hingeAngle * Math.PI / 180),
    Math.cos(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeRadius = (doorInner + doorOuter) / 2;
  const hingeOrigin = radialPoint(hingeRadius, hingeAngle, diskZ + pvc + 9);
  const localPoint = (u, v, z) => [
    hingeOrigin[0] + hingeDir[0] * u + hingeTangent[0] * v,
    hingeOrigin[1] + hingeDir[1] * u + hingeTangent[1] * v,
    z,
  ];

  const hingeAxisLocal = [48, -45];
  const servoPivotLocal = [-8, -64];
  const servoPivot = localPoint(servoPivotLocal[0], servoPivotLocal[1], diskZ - 10);
  const hornAngle = hingeAngle - 90;
  const hornDir = [
    Math.cos(hornAngle * Math.PI / 180),
    Math.sin(hornAngle * Math.PI / 180),
    0,
  ];
  const servoTiltAxis = [-hornDir[1], hornDir[0], 0];
  const trapdoorHardwareLift = 2.5;
  const doorFoot = [hingeAxisLocal[0] + 38, hingeAxisLocal[1] - 8 + trapdoorHardwareLift];
  const doorScrewFootPoint = localPoint(doorFoot[0], doorFoot[1], servoPivot[2] - 6);
  const screwOffset = 7;
  const screwCenters = [
    [
      doorScrewFootPoint[0] - screwOffset * hingeDir[0],
      doorScrewFootPoint[1] - screwOffset * hingeDir[1],
      doorScrewFootPoint[2] + 7,
    ],
    [
      doorScrewFootPoint[0] + screwOffset * hingeDir[0],
      doorScrewFootPoint[1] + screwOffset * hingeDir[1],
      doorScrewFootPoint[2] + 7,
    ],
  ];

  return screwCenters.map((point) => {
    let p = rotatePointAroundAxis(point, servoTiltAxis, servoPivot, 90);
    p = rotatePointAroundAxis(p, [0, 0, 1], servoPivot, -270);
    return [p[0] + 20, p[1] - 8, p[2] - 3.5];
  });
}

function servoHolderFootHolePoints() {
  const doorStart = -doorSweep / 2;
  const hingeAngle = doorStart;
  const hingeDir = [
    Math.cos(hingeAngle * Math.PI / 180),
    Math.sin(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeTangent = [
    -Math.sin(hingeAngle * Math.PI / 180),
    Math.cos(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeRadius = (doorInner + doorOuter) / 2;
  const hingeOrigin = radialPoint(hingeRadius, hingeAngle, diskZ + pvc + 9);
  const localPoint = (u, v, z) => [
    hingeOrigin[0] + hingeDir[0] * u + hingeTangent[0] * v,
    hingeOrigin[1] + hingeDir[1] * u + hingeTangent[1] * v,
    z,
  ];

  const servoPivotLocal = [-8, -64];
  const holderZ = diskZ - 22;
  const holderFootUvs = [
    [servoPivotLocal[0] - 34, servoPivotLocal[1] + 8],
    [servoPivotLocal[0] + 34, servoPivotLocal[1] + 8],
  ];
  const screwZOffsets = [6, 16];
  const servoPivot = localPoint(servoPivotLocal[0], servoPivotLocal[1], diskZ - 10);
  const hornAngle = hingeAngle - 90;
  const hornDir = [
    Math.cos(hornAngle * Math.PI / 180),
    Math.sin(hornAngle * Math.PI / 180),
    0,
  ];
  const servoTiltAxis = [-hornDir[1], hornDir[0], 0];

  const points = [];
  for (const [u, v] of holderFootUvs) {
    for (const zOffset of screwZOffsets) {
      let p = localPoint(u, v, holderZ + zOffset);
      p = rotatePointAroundAxis(p, servoTiltAxis, servoPivot, 90);
      p = rotatePointAroundAxis(p, [0, 0, 1], servoPivot, -270);
      points.push([p[0] + 20, p[1] - 8, p[2] - 3.5]);
    }
  }
  return points;
}

function verticalHoleCutters(points, z, height, radius = M3_CLEAR) {
  return points.map(([x, y]) =>
    cylinder(height, radius, undefined, 24).translate(x, y, z)
  );
}

function rodBetween(a, b, radius, color) {
  const dir = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = vecLength(dir);
  return cylinder(len, radius, undefined, 16)
    .pointAlong(dir)
    .translate(a[0], a[1], a[2])
    .color(color);
}

function sketchFromWorldPoints(points) {
  return polygon(points.map((p) => [p[0], p[1]]));
}

function tubeZ(height, outerRadius, innerRadius, z, color, segments = 64) {
  return cylinder(height, outerRadius, undefined, segments)
    .subtract(cylinder(height + 2, innerRadius, undefined, segments).translate(0, 0, -1))
    .translate(0, 0, z)
    .color(color);
}

function makeDisk() {
  const doorStart = -doorSweep / 2;
  const doorCut = annularSectorShape(
    doorInner - 2,
    doorOuter + 7,
    doorStart,
    doorSweep,
    pvc * 4,
    -pvc,
    "#000000"
  );
  const shaftBore = cylinder(pvc * 4, 17, undefined, 64)
    .translate(0, 0, -pvc);
  const hingeDiskHoles = verticalHoleCutters(
    hingeMountHolePoints("disk"),
    -3,
    pvc + 8
  );
  const servoHolderDiskHoles = verticalHoleCutters(
    servoHolderFootHolePoints(),
    -3,
    pvc + 8
  );

  const disk = cylinder(pvc, R, undefined, 144)
    .subtract(doorCut, shaftBore, ...hingeDiskHoles, ...servoHolderDiskHoles)
    .translate(0, 0, diskZ)
    .color(C.pvc);

  const dividerHeight = 30;
  const dividerRadialLen = R - 74;
  const dividerMidR = 74 + dividerRadialLen / 2;
  const radialDividers = [0, 1].map((i) => {
    const angle = sectorStart + i * sectorSweep;
    return {
      name: `PETG radial divider wall ${i + 1}`,
      shape: atPolar(
        box(dividerRadialLen, 5, dividerHeight),
        dividerMidR,
        angle,
        diskZ + pvc + 1
      ).color(C.petg),
    };
  });

  return group(
    { name: "PVC disk with curved trapdoor cutout", shape: disk },
    { name: "Two retained radial guide walls", group: group(...radialDividers) }
  );
}

function makeSupportAndHub() {
  if (!showStandaloneBase) return group();

  const deckOpening = cylinder(pvc * 4, R, undefined, 144)
    .translate(0, 0, deckZ - pvc);
  const loadPillarDeckHoles = makeDiskLoadPillarDeckHoleCutters(deckZ - 1, pvc + 2);
  const level2Deck = box(plateW, plateD, pvc)
    .translate(0, 0, deckZ)
    .subtract(deckOpening, ...loadPillarDeckHoles)
    .color(C.supportPvc)
    .material({ opacity: 0.55 });

  return group(
    { name: "Standalone Level 2 PVC support plate with circular clearance", shape: level2Deck }
  );
}

function trimPathEnd(points, cutLength) {
  if (cutLength <= 0 || points.length < 2) return points;

  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }

  const target = Math.max(total - cutLength, 0.1);
  const trimmed = [points[0]];
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const segLen = Math.max(Math.sqrt(dx * dx + dy * dy), 0.001);
    if (walked + segLen >= target) {
      const t = (target - walked) / segLen;
      trimmed.push([prev[0] + dx * t, prev[1] + dy * t]);
      return trimmed;
    }
    trimmed.push(next);
    walked += segLen;
  }

  return trimmed;
}

function bboxCenter(shape) {
  const bb = shape.boundingBox();
  return [
    (bb.min[0] + bb.max[0]) / 2,
    (bb.min[1] + bb.max[1]) / 2,
    (bb.min[2] + bb.max[2]) / 2,
  ];
}

function rotate2dVector(v, angleDeg) {
  const a = angleDeg * Math.PI / 180;
  return [
    v[0] * Math.cos(a) - v[1] * Math.sin(a),
    v[0] * Math.sin(a) + v[1] * Math.cos(a),
  ];
}

function hingeCopyForUArmCopyPosition() {
  const fixedOffset = [
    hingeCopyPosition[0] - fixedUArmPosition[0],
    hingeCopyPosition[1] - fixedUArmPosition[1],
  ];
  const localOffset = rotate2dVector(fixedOffset, -fixedUArmRotation[2]);
  const copiedOffset = rotate2dVector(localOffset, copyUArmRotation[2]);
  return [
    copyUArmPosition[0] + copiedOffset[0],
    copyUArmPosition[1] + copiedOffset[1],
    hingeCopyPosition[2] + copyUArmPosition[2] - fixedUArmPosition[2],
  ];
}

function hingeCopyForUArmCopyRotation() {
  const zDelta = copyUArmRotation[2] - fixedUArmRotation[2];
  return [
    hingeCopyRotation[0],
    hingeCopyRotation[1],
    hingeCopyRotation[2] + zDelta,
  ];
}

function servoHolderCopyForUArmCopyPosition() {
  const fixedOffset = [
    servoHolderCopyPosition[0] - fixedUArmPosition[0],
    servoHolderCopyPosition[1] - fixedUArmPosition[1],
  ];
  const localOffset = rotate2dVector(fixedOffset, -fixedUArmRotation[2]);
  const copiedOffset = rotate2dVector(localOffset, copyUArmRotation[2]);
  return [
    copyUArmPosition[0] + copiedOffset[0],
    copyUArmPosition[1] + copiedOffset[1],
    servoHolderCopyPosition[2] + copyUArmPosition[2] - fixedUArmPosition[2],
  ];
}

function servoHolderCopyForUArmCopyRotation() {
  const zDelta = copyUArmRotation[2] - fixedUArmRotation[2];
  return [
    servoHolderCopyRotation[0],
    servoHolderCopyRotation[1],
    servoHolderCopyRotation[2] + zDelta,
  ];
}

function makeSimpleRebuildModule() {
  const deckOpening = cylinder(pvc * 4, R, undefined, 144)
    .translate(0, 0, deckZ - pvc);
  const loadPillarDeckHoles = makeDiskLoadPillarDeckHoleCutters(deckZ - 1, pvc + 2);
  const basePlate = box(plateW, plateD, pvc)
    .translate(0, 0, deckZ)
    .subtract(deckOpening, ...loadPillarDeckHoles)
    .color(C.supportPvc)
    .material({ opacity: 0.7 });

  const supportZ = deckZ + pvc + 0.8;
  const supportT = 6;
  const supportHubT = nemaSupportHubT;
  const supportHubZ = supportZ + supportT;
  const supportHubTopZ = supportHubZ + supportHubT;
  const motorFaceZ = supportHubZ;
  const motorVisual = makeNemaMotorVisual(motorFaceZ);

  const supportArmAngles = [30, 90, 150, 210, 270, 330];
  const supportArmInnerR = 46;
  const supportArmOuterR = R + 15;
  const supportScrewR = 2;
  const polarPoint = (radius, angleDeg) => {
    const a = angleDeg * Math.PI / 180;
    return [radius * Math.cos(a), radius * Math.sin(a)];
  };
  const makeSegmentedSupportArm = (angleDeg) => {
    const armW = 16;
    const armL = supportArmOuterR - supportArmInnerR;
    const armCenter = (supportArmInnerR + supportArmOuterR) / 2;
    const innerPad = box(30, 26, supportT).translate(supportArmInnerR, 0, supportZ);
    const bridge = box(armL, armW, supportT).translate(armCenter, 0, supportZ);
    const outerPad = box(32, 26, supportT).translate(supportArmOuterR, 0, supportZ);
    const innerBolt = cylinder(supportT + 2, supportScrewR, undefined, 28)
      .translate(supportArmInnerR, 0, supportZ - 1);
    const outerBolt = cylinder(supportT + 2, supportScrewR, undefined, 28)
      .translate(supportArmOuterR, 0, supportZ - 1);
    return union(innerPad, bridge, outerPad)
      .subtract(innerBolt, outerBolt)
      .rotateZ(angleDeg)
      .color(C.petg)
      .material({ opacity: 0.86 });
  };
  const segmentedServoSupport = group(
    ...supportArmAngles.map((angleDeg, i) => ({
      name: `printable NEMA17 support arm ${i + 1}`,
      shape: makeSegmentedSupportArm(angleDeg),
    })),
    {
      name: "printable NEMA17 centered motor support hub",
      group: makeNemaSupportHub(supportHubZ, supportHubT, supportArmAngles, supportArmInnerR),
    }
  );

  const rotatingPlateZ = diskZ;
  const trapdoorInnerR = doorInner;
  const trapdoorOuterR = R - 12;
  const trapdoorInwardGrowth = 16;
  const trapdoorRectInnerX = trapdoorInnerR - 2 - trapdoorInwardGrowth;
  const trapdoorRectOuterX = trapdoorOuterR - 8;
  const trapdoorRectCenterX = (trapdoorRectInnerX + trapdoorRectOuterX) / 2;
  const transferFunnelWall = 3.5;
  const transferFunnelFlangeT = 4;
  const transferFunnelBodyOverlap = 0.8;
  const transferFunnelBottomZ = rotatingPlateZ + pvc;
  const transferFunnelTopZ = deckZ + 194;
  const transferFunnelBottomX = trapdoorRectCenterX;
  const transferFunnelBottomY = 0;
  const transferFunnelTopX = 0;
  const transferFunnelTopY = 0;
  const transferFunnelBottomInnerR = 52;
  const transferFunnelBottomOuterR = transferFunnelBottomInnerR + transferFunnelWall;
  const transferFunnelTopInnerR = 78;
  const transferFunnelTopOuterR = transferFunnelTopInnerR + transferFunnelWall;
  const transferFunnelFlangeOuterR = transferFunnelBottomInnerR + 14;
  const transferFunnelScrewRadius = transferFunnelBottomInnerR + 10;
  const transferFunnelDiskCutR = transferFunnelBottomInnerR + 1.5;
  const transferFunnelScrewAngles = [30, 90, 150, 210, 270, 330];
  const transferFunnelScrewPoints = transferFunnelScrewAngles.map((angleDeg) => {
    const a = angleDeg * Math.PI / 180;
    return [
      transferFunnelBottomX + transferFunnelScrewRadius * Math.cos(a),
      transferFunnelBottomY + transferFunnelScrewRadius * Math.sin(a),
    ];
  });
  const transferFunnelDiskScrewHoles = transferFunnelScrewPoints.map(([x, y]) =>
    cylinder(pvc + 2, M3_CLEAR, undefined, 28)
      .translate(x, y, rotatingPlateZ - 1)
  );
  const diskSectorOpeningCut = cylinder(pvc + 2, transferFunnelDiskCutR, undefined, 80)
    .translate(transferFunnelBottomX, transferFunnelBottomY, rotatingPlateZ - 1)
    .color(C.reference);
  const receiverDiskScrewHoles = makeNemaReceiverDiskHoleCutters(rotatingPlateZ - 1, pvc + 2);
  const homeTriggerAngleRad = homeTriggerLocalAngle * Math.PI / 180;
  const homeTriggerFootScrewPoints = [-homeTriggerFootScrewOffset, homeTriggerFootScrewOffset]
    .map((tangentOffset) => [
      homeTriggerFootCenterR * Math.cos(homeTriggerAngleRad) - tangentOffset * Math.sin(homeTriggerAngleRad),
      homeTriggerFootCenterR * Math.sin(homeTriggerAngleRad) + tangentOffset * Math.cos(homeTriggerAngleRad),
    ]);
  const homeTriggerDiskScrewHoles = homeTriggerFootScrewPoints.map(([x, y]) =>
    cylinder(pvc + 2, M3_CLEAR, undefined, 28)
      .translate(x, y, rotatingPlateZ - 1)
  );
  const rotatingPlate = cylinder(pvc, R - 2, undefined, 144)
    .translate(0, 0, rotatingPlateZ)
    .subtract(
      diskSectorOpeningCut,
      ...receiverDiskScrewHoles,
      ...transferFunnelDiskScrewHoles,
      ...homeTriggerDiskScrewHoles
    )
    .color(C.pvc)
    .material({ opacity: 0.76 });
  const transferFunnelFlange = difference2d(
    circle2d(transferFunnelFlangeOuterR).translate(transferFunnelBottomX, transferFunnelBottomY),
    circle2d(transferFunnelBottomInnerR).translate(transferFunnelBottomX, transferFunnelBottomY),
    ...transferFunnelScrewPoints.map(([x, y]) => circle2d(M3_CLEAR).translate(x, y))
  )
    .extrude(transferFunnelFlangeT)
    .translate(0, 0, transferFunnelBottomZ);
  const transferFunnelTubeStartZ = transferFunnelBottomZ + transferFunnelFlangeT - transferFunnelBodyOverlap;
  const transferFunnelProfileTs = [0, 0.12, 0.24, 0.38, 0.52, 0.66, 0.8, 0.92, 1];
  const smoothFunnelT = (t) => t * t * (3 - 2 * t);
  const funnelProfileCenterX = (t) =>
    transferFunnelBottomX + (transferFunnelTopX - transferFunnelBottomX) * smoothFunnelT(t);
  const funnelProfileRadius = (t, bottomR, topR) =>
    bottomR + (topR - bottomR) * smoothFunnelT(t);
  const funnelProfileZ = (t, startZ, endZ) =>
    startZ + (endZ - startZ) * t;
  const transferFunnelOuter = loft(
    transferFunnelProfileTs.map((t) =>
      circle2d(funnelProfileRadius(t, transferFunnelBottomOuterR, transferFunnelTopOuterR))
        .translate(funnelProfileCenterX(t), transferFunnelBottomY)
    ),
    transferFunnelProfileTs.map((t) =>
      funnelProfileZ(t, transferFunnelTubeStartZ, transferFunnelTopZ)
    ),
    { edgeLength: 6 }
  );
  const transferFunnelInner = loft(
    transferFunnelProfileTs.map((t) =>
      circle2d(funnelProfileRadius(t, transferFunnelBottomInnerR, transferFunnelTopInnerR))
        .translate(funnelProfileCenterX(t), transferFunnelBottomY)
    ),
    transferFunnelProfileTs.map((t) =>
      funnelProfileZ(t, transferFunnelTubeStartZ - 1, transferFunnelTopZ + 1)
    ),
    { edgeLength: 6 }
  );
  const transferFunnel = union(
    transferFunnelFlange,
    transferFunnelOuter.subtract(transferFunnelInner)
  )
    .color(C.petg)
    .material({ opacity: 0.82, roughness: 0.58 });
  const receiverBottomZ = supportHubTopZ + nemaReceiverSupportGap;
  const receiverTopZ = rotatingPlateZ;
  const centerReceiverBoss = makeNemaReceiverSocket(receiverBottomZ, receiverTopZ);
  const homeTriggerCenterR = homeTriggerStartR + homeTriggerLength / 2;
  const homeTriggerFootHoles = homeTriggerFootScrewPoints.map(([x, y]) =>
    cylinder(homeTriggerFootHeight + 2, M3_CLEAR, undefined, 28)
      .translate(x, y, rotatingPlateZ + pvc - 1)
  );
  const homeTriggerFoot = box(homeTriggerFootLength, homeTriggerFootWidth, homeTriggerFootHeight)
    .translate(homeTriggerFootCenterR, 0, rotatingPlateZ + pvc)
    .rotateZ(homeTriggerLocalAngle)
    .subtract(...homeTriggerFootHoles);
  const homeTriggerStick = box(homeTriggerLength, homeTriggerTangentialWidth, homeTriggerHeight)
    .translate(homeTriggerCenterR, 0, rotatingPlateZ + pvc)
    .rotateZ(homeTriggerLocalAngle);
  const homeTriggerTab = union(homeTriggerFoot, homeTriggerStick)
    .color(C.petg)
    .material({ roughness: 0.55 });

  const baseItem = {
    name: "Standalone Level 2 PVC support plate with circular clearance",
    shape: basePlate,
  };
  const supportItem = {
    name: "PETG six-arm screwable support for NEMA17 motor",
    group: segmentedServoSupport,
  };
  const servoItem = {
    name: "NEMA 17 stepper motor centered in circular opening",
    group: motorVisual,
  };
  const rotatingPlateItem = {
    name: "Rotating PVC plate with PETG NEMA17 shaft receiver and pre-disk sorting funnel",
    group: group(
      { name: "340mm rotating PVC disk", shape: rotatingPlate },
      { name: "Tall PETG funnel from disk sector opening to analysis gate center", shape: transferFunnel },
      { name: "PETG center receiver socket with slim NEMA17 shaft sleeve and screw flange", shape: centerReceiverBoss },
      { name: "PETG KW11 home trigger tab with screwable foot on rotating disk", shape: homeTriggerTab }
    ).rotateZ(diskRotation),
  };

  return showStandaloneBase
    ? group(baseItem, supportItem, servoItem, rotatingPlateItem)
    : group(supportItem, servoItem, rotatingPlateItem);
}

function makeServoHolderCopyFromPrintKit(position = servoHolderCopyPosition, rotation = servoHolderCopyRotation) {
  const demoHingeX = -42;
  const demoServoX = demoHingeX - 48;
  const demoServoY = -16;
  const holderZ = 158;
  const holderWidthClearance = 1;
  const holderDepthClearance = 2;
  const footOffsetX = servoBodyW / 2 + holderWidthClearance + 8;
  const innerHalfW = servoBodyW / 2 + holderWidthClearance;
  const innerBackY = demoServoY - servoBodyD / 2 - holderDepthClearance;
  const frontLimitY = diskZ - position[2];
  const bandT = 7;
  const footDepth = 5;
  const footH = 20;
  const footZ = holderZ - 23 + 10;
  const outerHalfW = innerHalfW + bandT / 2;
  const sideDepth = frontLimitY - innerBackY;
  const sideCenterY = (frontLimitY + innerBackY) / 2;
  const frontArmLen = footOffsetX - innerHalfW;
  const footCenterY = frontLimitY - footDepth / 2;
  const screwHoleZ = 6;
  const throughYHole = (x, z, length = 40, radius = 2) =>
    cylinder(length, radius, undefined, 24)
      .pointAlong([0, 1, 0])
      .translate(x, -length / 2, z);
  const uBand = union(
    box(bandT, sideDepth, bandT).translate(demoServoX - outerHalfW, sideCenterY, holderZ),
    box(bandT, sideDepth, bandT).translate(demoServoX + outerHalfW, sideCenterY, holderZ),
    box(outerHalfW * 2, bandT, bandT).translate(demoServoX, innerBackY, holderZ),
    box(frontArmLen, bandT, bandT).translate(demoServoX - (footOffsetX + innerHalfW) / 2, frontLimitY - bandT / 2, holderZ),
    box(frontArmLen, bandT, bandT).translate(demoServoX + (footOffsetX + innerHalfW) / 2, frontLimitY - bandT / 2, holderZ)
  );
  const leftCableRelief = box(4, 14, 11).translate(7, 0, -1);
  const leftFoot = box(18, footDepth, footH)
    .subtract(throughYHole(-2, screwHoleZ), leftCableRelief)
    .translate(demoServoX - footOffsetX, footCenterY, footZ);
  const rightFoot = box(18, footDepth, footH)
    .subtract(throughYHole(0, screwHoleZ))
    .translate(demoServoX + footOffsetX, footCenterY, footZ);

  return union(uBand, leftFoot, rightFoot)
    .rotateX(rotation[0])
    .rotateY(rotation[1])
    .rotateZ(rotation[2])
    .translate(position[0], position[1], position[2])
    .color("#111111");
}

function makeFrozenHingeCopy(position = hingeCopyPosition, rotation = hingeCopyRotation) {
  const demoHingeX = -42;
  const demoHingeY = -13;
  const upperHingeZ = 234;
  const lowerHingeZ = 120;
  const hingeBarrelH = 14;
  const hingeBarrelGap = 2;
  const hingeBarrelR = 5.2;
  const finalHoleR = hingeCopyHoleR;
  const sourceHoleR = finalHoleR / hingeCopyShrink;

  function sourceThroughYHole(x, z, length = 40) {
    return cylinder(length, sourceHoleR, undefined, 24)
      .pointAlong([0, 1, 0])
      .translate(x, -length / 2, z);
  }

  function sourceHingeLeaf(width, height, x, z, holeSpacing, holeCenterOffset = 0) {
    return box(width, 5, height)
      .subtract(
        sourceThroughYHole(holeCenterOffset - holeSpacing / 2, height / 2),
        sourceThroughYHole(holeCenterOffset + holeSpacing / 2, height / 2)
      )
      .translate(x, demoHingeY + 1.5, z - height / 2)
      .color("#111111");
  }

  function sourceHingeBarrel(zCenter) {
    return cylinder(hingeBarrelH, hingeBarrelR, undefined, 32)
      .subtract(
        cylinder(hingeBarrelH + 6, sourceHoleR, undefined, 24)
          .translate(0, 0, -3)
      )
      .translate(demoHingeX, demoHingeY, zCenter - hingeBarrelH / 2)
      .color("#111111");
  }

  function sourceHingeAssembly(label, z) {
    const fixedZ = z + hingeBarrelH / 2 + hingeBarrelGap / 2;
    const movingZ = z - hingeBarrelH / 2 - hingeBarrelGap / 2;
    const movingLeafWidth = 50;
    const movingLeafX = demoHingeX + movingLeafWidth / 2 + 2;
    return group(
      {
        name: `${label} fixed leaf and barrel copy`,
        shape: union(
          sourceHingeLeaf(46, 16, demoHingeX - 26, fixedZ, 18, -5),
          sourceHingeBarrel(fixedZ)
        ).color("#111111"),
      },
      {
        name: `${label} moving leaf and barrel copy`,
        shape: union(
          sourceHingeLeaf(movingLeafWidth, 16, movingLeafX, movingZ, 20, 5),
          sourceHingeBarrel(movingZ)
        ).color("#111111"),
      }
    );
  }

  return group(
    { name: "upper hinge copy with 3mm holes", group: sourceHingeAssembly("upper hinge", upperHingeZ) },
    { name: "lower hinge copy with 3mm holes", group: sourceHingeAssembly("lower hinge", lowerHingeZ) }
  )
    .scale(hingeCopyShrink)
    .rotateX(rotation[0])
    .rotateY(rotation[1])
    .rotateZ(rotation[2])
    .translate(position[0], position[1], position[2])
    .color("#111111");
}

function makeCompactMovableUArmForDisk(includeExactHornMount = true, opts = {}) {
  const parts = makeCompactMovableUArmForDiskParts(includeExactHornMount, opts);
  return union(
    parts.armBody,
    parts.doorScrewFoot,
    parts.hornMountBody
  ).color("#111111");
}

function makeCompactMovableUArmForDiskParts(includeExactHornMount = true, opts = {}) {
  const demoHingeX = -42;
  const demoWallT = 8;
  const demoDoorT = 5;
  const demoDoorClosedY = -demoWallT / 2 - demoDoorT / 2 - 1.2;
  const hornMountOffset = opts.hornMountOffset ?? [0, 0, 0];
  const baseServoPivot = [demoHingeX - 48, -16, 170];
  const servoPivot = [
    baseServoPivot[0] + hornMountOffset[0],
    baseServoPivot[1] + hornMountOffset[1],
    baseServoPivot[2] + hornMountOffset[2],
  ];
  const hornAngle = -90;
  const hornDir = [Math.cos(hornAngle * Math.PI / 180), Math.sin(hornAngle * Math.PI / 180)];
  const compactStraightReach = opts.straightReach ?? 32;
  const hornEnd = [
    servoPivot[0] + compactStraightReach * hornDir[0],
    servoPivot[1] + compactStraightReach * hornDir[1],
  ];
  const compactDoorReach = -14;
  const compactFootWidth = 22;
  const compactFootScrewOffset = 7;
  const armWidth = 10;
  const footDepth = 7;
  const doorFaceY = demoDoorClosedY - demoDoorT / 2;
  const doorFootClosed = [demoHingeX + compactDoorReach, doorFaceY - 5];
  const baseHornEnd = [
    baseServoPivot[0] + compactStraightReach * hornDir[0],
    baseServoPivot[1] + compactStraightReach * hornDir[1],
  ];
  const baseFootApproach = [
    baseHornEnd[0] - doorFootClosed[0],
    baseHornEnd[1] - doorFootClosed[1],
  ];
  const footApproachLen = Math.sqrt(baseFootApproach[0] * baseFootApproach[0] + baseFootApproach[1] * baseFootApproach[1]);
  const defaultFootEndReach = 4;
  const baseArmFootEnd = [
    doorFootClosed[0] + (baseFootApproach[0] / footApproachLen) * defaultFootEndReach,
    doorFootClosed[1] + (baseFootApproach[1] / footApproachLen) * defaultFootEndReach,
  ];
  const fixedFootCenter = [
    baseArmFootEnd[0] + movableUArmFootOffset[0],
    baseArmFootEnd[1] + movableUArmFootOffset[1],
  ];
  const armFootEnd = opts.connectToFootCenter
    ? fixedFootCenter
    : [
        doorFootClosed[0] + (baseFootApproach[0] / footApproachLen) * movableUArmFootEndReach,
        doorFootClosed[1] + (baseFootApproach[1] / footApproachLen) * movableUArmFootEndReach,
      ];
  const c1 = [hornEnd[0] + 8 * hornDir[0], hornEnd[1] + 8 * hornDir[1]];
  const c2 = [armFootEnd[0] - 16, armFootEnd[1] - 16];
  const curve = [];
  for (let i = 1; i <= 14; i++) {
    const t = i / 14;
    const mt = 1 - t;
    curve.push([
      mt * mt * mt * hornEnd[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * armFootEnd[0],
      mt * mt * mt * hornEnd[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * armFootEnd[1],
    ]);
  }
  const armPath = trimPathEnd(
    [[servoPivot[0], servoPivot[1]], hornEnd, ...curve],
    opts.footEndCut ?? 0
  );
  const localThroughYHole = (x, z, length = 40, radius = 2) =>
    cylinder(length, radius, undefined, 24)
      .pointAlong([0, 1, 0])
      .translate(x, -length / 2, z);
  const hornMountPocket = union(
    box(9.6, 17.6, 5).translate(-90 + hornMountOffset[0], -25.2 + hornMountOffset[1], 173 + hornMountOffset[2]),
    cylinder(5, 4.8, undefined, 48).translate(-90 + hornMountOffset[0], -16 + hornMountOffset[1], 173 + hornMountOffset[2])
  );
  const armBody = stroke(armPath, armWidth, "Round")
    .extrude(5)
    .translate(0, 0, servoPivot[2] + 3)
    .subtract(
      hornMountPocket,
      cylinder(12, 1.5, undefined, 32)
        .translate(servoPivot[0], servoPivot[1], servoPivot[2] - 1)
    );
  const doorScrewFoot = box(compactFootWidth, footDepth, 30)
    .subtract(
      localThroughYHole(-compactFootScrewOffset, 8),
      localThroughYHole(compactFootScrewOffset, 21)
    )
    .translate(
      baseArmFootEnd[0] + movableUArmFootOffset[0],
      baseArmFootEnd[1] + movableUArmFootOffset[1],
      baseServoPivot[2] - 12 + movableUArmFootOffset[2]
    );
  const hornMountEnvelope = union(
    box(10, 18, 5).translate(-90 + hornMountOffset[0], -25.2 + hornMountOffset[1], 173 + hornMountOffset[2]),
    cylinder(5, 5, undefined, 48).translate(-90 + hornMountOffset[0], -16 + hornMountOffset[1], 173 + hornMountOffset[2])
  );
  const simplifiedHornMount = hornMountEnvelope
    .subtract(
      cylinder(7, 1.5, undefined, 32)
        .translate(-90 + hornMountOffset[0], -16 + hornMountOffset[1], 172 + hornMountOffset[2])
    )
    .color("#111111");
  const hornMountBody = simplifiedHornMount;
  return { armBody, doorScrewFoot, hornMountBody };
}

function makeRotatingHubHardware() {
  const supportZ = deckZ + pvc + 0.8;
  const supportT = 6;
  const supportHubT = nemaSupportHubT;
  const supportHubTopZ = supportZ + supportT + supportHubT;
  const receiverBottomZ = supportHubTopZ + nemaReceiverSupportGap;
  const receiverSocket = makeNemaReceiverSocket(receiverBottomZ, diskZ);
  const inspectionStripe = box(8, 42, 4)
    .translate(0, 30, diskZ + pvc + 9)
    .color(C.pla);

  return group(
    { name: "PETG rotating NEMA17 shaft receiver socket with slim shaft sleeve and disk screw holes", shape: receiverSocket },
    { name: "Rotating hub orientation stripe", shape: inspectionStripe }
  );
}

function makeDriveSystem() {
  const supportZ = deckZ + pvc + 0.8;
  const supportT = 6;
  const supportHubT = nemaSupportHubT;
  const supportHubZ = supportZ + supportT;
  const supportHubTopZ = supportHubZ + supportHubT;
  const supportArmAngles = [30, 90, 150, 210, 270, 330];
  const supportArmInnerR = 46;
  const supportArmOuterR = R + 15;
  const supportScrewR = M3_CLEAR;
  const makeSegmentedSupportArm = (angleDeg) => {
    const armW = 16;
    const armL = supportArmOuterR - supportArmInnerR;
    const armCenter = (supportArmInnerR + supportArmOuterR) / 2;
    const innerPad = box(30, 26, supportT).translate(supportArmInnerR, 0, supportZ);
    const bridge = box(armL, armW, supportT).translate(armCenter, 0, supportZ);
    const outerPad = box(32, 26, supportT).translate(supportArmOuterR, 0, supportZ);
    const innerBolt = cylinder(supportT + 2, supportScrewR, undefined, 28)
      .translate(supportArmInnerR, 0, supportZ - 1);
    const outerBolt = cylinder(supportT + 2, supportScrewR, undefined, 28)
      .translate(supportArmOuterR, 0, supportZ - 1);
    return union(innerPad, bridge, outerPad)
      .subtract(innerBolt, outerBolt)
      .rotateZ(angleDeg)
      .color(C.petg)
      .material({ opacity: 0.86 });
  };

  const supportArms = supportArmAngles.map((angleDeg, i) => ({
    name: `PETG NEMA17 six-arm motor support arm ${i + 1}`,
    shape: makeSegmentedSupportArm(angleDeg),
  }));
  const supportHub = makeNemaSupportHub(supportHubZ, supportHubT, supportArmAngles, supportArmInnerR);
  const motorFaceZ = supportHubZ;
  const motor = makeNemaMotorVisual(motorFaceZ);

  return group(
    ...supportArms,
    { name: "PETG NEMA17 centered motor support hub", group: supportHub },
    { name: "NEMA 17 stepper motor centered in circular opening", group: motor }
  );
}

function makeTrapdoor() {
  const doorStart = -doorSweep / 2;
  const hingeAngle = doorStart;
  const hingeDir = [
    Math.cos(hingeAngle * Math.PI / 180),
    Math.sin(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeTangent = [
    -Math.sin(hingeAngle * Math.PI / 180),
    Math.cos(hingeAngle * Math.PI / 180),
    0,
  ];
  const hingeRadius = (doorInner + doorOuter) / 2;
  const hingeLength = doorOuter - doorInner;
  const hingeOrigin = radialPoint(hingeRadius, hingeAngle, diskZ + pvc + 9);
  const hingePivot = radialPoint(doorInner, hingeAngle, diskZ + pvc + 9);
  const hingeZ = hingeOrigin[2];

  function localPoint(u, v, z) {
    return [
      hingeOrigin[0] + hingeDir[0] * u + hingeTangent[0] * v,
      hingeOrigin[1] + hingeDir[1] * u + hingeTangent[1] * v,
      z,
    ];
  }

  function localBox(w, d, h, u, v, z, color = C.petg) {
    const p = localPoint(u, v, z);
    return box(w, d, h).rotateZ(hingeAngle).translate(p[0], p[1], p[2]).color(color);
  }

  function localThroughTangentHole(u, v, z, length, radius = M3_CLEAR) {
    const p = localPoint(u, v, z);
    return cylinder(length, radius, undefined, 24)
      .pointAlong(hingeTangent)
      .translate(p[0], p[1], p[2]);
  }

  function localThroughZHole(u, v, z, length, radius = M3_CLEAR) {
    const p = localPoint(u, v, z);
    return cylinder(length, radius, undefined, 24)
      .translate(p[0], p[1], p[2]);
  }

  function localScrewHead(u, v, z, radius = 4.0) {
    const p = localPoint(u, v, z);
    return cylinder(3.2, radius, undefined, 24)
      .pointAlong([-hingeTangent[0], -hingeTangent[1], 0])
      .translate(p[0], p[1], p[2])
      .color(C.screw);
  }

  function localStroke(points, width, join = "Round") {
    return stroke(points.map(([u, v]) => {
      const p = localPoint(u, v, 0);
      return [p[0], p[1]];
    }), width, join);
  }

  const hingeAxisLocal = [48, -45];
  const servoPivotLocal = [-8, -64];
  const trapdoorHardwareLift = 2.5;

  const door = annularSectorShape(
    doorInner + 2,
    doorOuter - 2,
    doorStart + 2,
    doorSweep - 4,
    pvc,
    diskZ + 0.8,
    C.petg
  );
  const outerLip = annularSectorShape(doorOuter - 4, doorOuter + 4, doorStart + 2, doorSweep - 4, 8, diskZ + 0.5, C.petg);

  const servo = localBox(44, 24, 28, servoPivotLocal[0], servoPivotLocal[1], diskZ - 30, C.servo)
    .material({ opacity: 0.72 });
  const servoPivot = localPoint(servoPivotLocal[0], servoPivotLocal[1], diskZ - 10);
  const closedHornAngle = hingeAngle - 90;
  const hornAngle = closedHornAngle - demoDoorOpen * 0.85;
  const closedHornDir = [
    Math.cos(closedHornAngle * Math.PI / 180),
    Math.sin(closedHornAngle * Math.PI / 180),
    0,
  ];
  const hornDir = [
    Math.cos(hornAngle * Math.PI / 180),
    Math.sin(hornAngle * Math.PI / 180),
    0,
  ];
  const servoTiltAxis = [-closedHornDir[1], closedHornDir[0], 0];
  const servoHorn = cylinder(6, 11, undefined, 36)
    .translate(servoPivot[0], servoPivot[1], servoPivot[2] - 3)
    .add(
      box(34, 7, 5)
        .rotateZ(hornAngle)
        .translate(
          servoPivot[0] + 17 * Math.cos(hornAngle * Math.PI / 180),
          servoPivot[1] + 17 * Math.sin(hornAngle * Math.PI / 180),
          servoPivot[2] - 2.5
        )
    )
    .color(C.pla);
  const servoShaft = cylinder(12, 3.2, undefined, 32)
    .translate(servoPivot[0], servoPivot[1], servoPivot[2] - 6)
    .color("#b58b2b");
  const demoHingePivot = localPoint(-14, -48, diskZ - 10);

  function orientServoShape(shape) {
    return shape
      .rotate(servoTiltAxis, 90, { pivot: servoPivot })
      .rotateZ(-270, { pivot: servoPivot })
      .translate(20, -8, -3.5);
  }

  function orientHingeShape(shape) {
    return shape
      .rotate(servoTiltAxis, 90, { pivot: demoHingePivot })
      .rotateZ(-270, { pivot: demoHingePivot })
      .translate(0, -24, 6);
  }

  function moveWithTrapdoor(shape) {
    return shape.rotate(hingeDir, -demoDoorOpen, { pivot: hingePivot });
  }

  function makeFloatingUArmStudy() {
    // Directly mirrors servo-door-mechanism-demo.forge.js in this disk-local frame.
    const localHornAngle = -90 - demoDoorOpen * 0.85;
    const hornDirLocal = [
      Math.cos(localHornAngle * Math.PI / 180),
      Math.sin(localHornAngle * Math.PI / 180),
    ];
    const armRoot = [servoPivotLocal[0], servoPivotLocal[1]];
    const hornEnd = [
      servoPivotLocal[0] + 54 * hornDirLocal[0],
      servoPivotLocal[1] + 54 * hornDirLocal[1],
    ];
    const doorFootClosed = [
      hingeAxisLocal[0] + 38,
      hingeAxisLocal[1] - 8 + trapdoorHardwareLift,
    ];
    const doorAngle = -demoDoorOpen * Math.PI / 180;
    const doorFoot = [
      hingeAxisLocal[0] + (doorFootClosed[0] - hingeAxisLocal[0]) * Math.cos(doorAngle) - (doorFootClosed[1] - hingeAxisLocal[1]) * Math.sin(doorAngle),
      hingeAxisLocal[1] + (doorFootClosed[0] - hingeAxisLocal[0]) * Math.sin(doorAngle) + (doorFootClosed[1] - hingeAxisLocal[1]) * Math.cos(doorAngle),
    ];
    const armFootEndClosed = [
      doorFootClosed[0] - 7,
      doorFootClosed[1] - 7,
    ];
    const armFootEnd = [
      hingeAxisLocal[0] + (armFootEndClosed[0] - hingeAxisLocal[0]) * Math.cos(doorAngle) - (armFootEndClosed[1] - hingeAxisLocal[1]) * Math.sin(doorAngle),
      hingeAxisLocal[1] + (armFootEndClosed[0] - hingeAxisLocal[0]) * Math.sin(doorAngle) + (armFootEndClosed[1] - hingeAxisLocal[1]) * Math.cos(doorAngle),
    ];
    const curveStartPull = 28;
    const c1 = [
      hornEnd[0] + curveStartPull * hornDirLocal[0],
      hornEnd[1] + curveStartPull * hornDirLocal[1],
    ];
    const c2 = [armFootEnd[0] - 28, armFootEnd[1] - 28];
    const curve = [];
    for (let i = 1; i <= 14; i++) {
      const t = i / 14;
      const mt = 1 - t;
      curve.push([
        mt * mt * mt * hornEnd[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * armFootEnd[0],
        mt * mt * mt * hornEnd[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * armFootEnd[1],
      ]);
    }
    const armBody = localStroke([armRoot, hornEnd, ...curve], 16, "Round")
      .extrude(5)
      .translate(0, 0, servoPivot[2] - 3);
    const doorFootZ = servoPivot[2] - 6;
    const doorScrewFootPoint = localPoint(doorFootClosed[0], doorFootClosed[1], doorFootZ);
    const hingeAxisPoint = localPoint(hingeAxisLocal[0], hingeAxisLocal[1], doorFootZ);
    const doorScrewFoot = box(24, 10, 14)
      .subtract(
        cylinder(12, M3_CLEAR, undefined, 24).pointAlong([0, 1, 0]).translate(-7, 0, 7),
        cylinder(12, M3_CLEAR, undefined, 24).pointAlong([0, 1, 0]).translate(7, 0, 7)
      )
      .rotateZ(hingeAngle)
      .translate(doorScrewFootPoint[0], doorScrewFootPoint[1], doorScrewFootPoint[2])
      .rotate([0, 0, 1], -demoDoorOpen, { pivot: hingeAxisPoint });
    return union(armBody, doorScrewFoot).color("#111111");
  }

  const floatingUArmStudy = makeFloatingUArmStudy();
  const rigidUArmWithTrapdoorFoot = orientServoShape(floatingUArmStudy).color("#111111");
  const holderZ = diskZ - 22;
  const holderBand = localStroke([
    [servoPivotLocal[0] - 34, servoPivotLocal[1] + 10],
    [servoPivotLocal[0] - 25, servoPivotLocal[1] + 10],
    [servoPivotLocal[0] - 25, servoPivotLocal[1] - 15],
    [servoPivotLocal[0] + 25, servoPivotLocal[1] - 15],
    [servoPivotLocal[0] + 25, servoPivotLocal[1] + 10],
    [servoPivotLocal[0] + 34, servoPivotLocal[1] + 10],
  ], 7, "Round")
    .extrude(7)
    .translate(0, 0, holderZ)
    .color("#111111");
  const holderLeftFoot = localBox(14, 8, 22, servoPivotLocal[0] - 34, servoPivotLocal[1] + 8, holderZ, "#111111")
    .subtract(
      localThroughTangentHole(servoPivotLocal[0] - 34, servoPivotLocal[1] + 8, holderZ + 6, 8),
      localThroughTangentHole(servoPivotLocal[0] - 34, servoPivotLocal[1] + 8, holderZ + 16, 8)
    );
  const holderRightFoot = localBox(14, 8, 22, servoPivotLocal[0] + 34, servoPivotLocal[1] + 8, holderZ, "#111111")
    .subtract(
      localThroughTangentHole(servoPivotLocal[0] + 34, servoPivotLocal[1] + 8, holderZ + 6, 8),
      localThroughTangentHole(servoPivotLocal[0] + 34, servoPivotLocal[1] + 8, holderZ + 16, 8)
    );
  const servoUHolder = union(holderBand, holderLeftFoot, holderRightFoot).color("#111111");

  function localHingeLeaf(width, height, u, v, zCenter, screwInset = 13) {
    return localBox(width, 5, height, u, v, zCenter - height / 2, "#111111")
      .subtract(
        localThroughTangentHole(u - width / 2 + screwInset, v, zCenter, 8),
        localThroughTangentHole(u + width / 2 - screwInset, v, zCenter, 8)
      );
  }

  function localHingeAssembly(label, zCenter) {
    // Same reference offsets as servo-door-mechanism-demo.forge.js, remapped
    // into this disk module's local hinge frame before the shared servo rotation.
    const hingeAxisU = hingeAxisLocal[0];
    const hingeAxisV = hingeAxisLocal[1];
    const leafV = hingeAxisLocal[1] - 1.5;
    const movingLeafV = leafV + trapdoorHardwareLift;
    const wallLeafWidth = 32;
    const doorLeafWidth = 46;
    const leafHeight = 12;
    const screwInset = 8;
    const doorFirstScrewOffset = 18;
    const doorSecondScrewInset = 10;
    const screwHeadRadius = 2.6;
    const wallLeafU = hingeAxisU - wallLeafWidth / 2 - 3;
    const doorLeafU = hingeAxisU + doorLeafWidth / 2 - 3;
    const pinH = 40;
    const pinPoint = localPoint(hingeAxisU, hingeAxisV, zCenter - pinH / 2 - 4);
    const upperBarrelPoint = localPoint(hingeAxisU, hingeAxisV, zCenter + 4);
    const lowerBarrelPoint = localPoint(hingeAxisU, hingeAxisV, zCenter - 20);
    const wallLeaf = localHingeLeaf(wallLeafWidth, leafHeight, wallLeafU, leafV, zCenter + 5, screwInset);
    const doorLeafClosed = localBox(doorLeafWidth, 5, leafHeight, doorLeafU, movingLeafV, zCenter - 7 - leafHeight / 2, "#111111")
      .subtract(
        localThroughTangentHole(doorLeafU - doorLeafWidth / 2 + doorFirstScrewOffset, movingLeafV, zCenter - 7, 8),
        localThroughTangentHole(doorLeafU + doorLeafWidth / 2 - doorSecondScrewInset, movingLeafV, zCenter - 7, 8)
      );
    const pin = cylinder(pinH + 8, 2.0, undefined, 32)
      .translate(pinPoint[0], pinPoint[1], pinPoint[2])
      .color(C.screw);
    const upperBarrel = cylinder(15, 4.4, undefined, 32)
      .subtract(cylinder(19, 2.1, undefined, 24).translate(0, 0, -2))
      .translate(upperBarrelPoint[0], upperBarrelPoint[1], upperBarrelPoint[2])
      .color("#111111");
    const lowerBarrelClosed = cylinder(15, 4.4, undefined, 32)
      .subtract(cylinder(19, 2.1, undefined, 24).translate(0, 0, -2))
      .translate(lowerBarrelPoint[0], lowerBarrelPoint[1], lowerBarrelPoint[2])
      .color("#111111");
    const fixedLeafScrews = group(
      { name: "left screw", shape: localScrewHead(wallLeafU - wallLeafWidth / 2 + screwInset, leafV - 6, zCenter + 5, screwHeadRadius) },
      { name: "right screw", shape: localScrewHead(wallLeafU + wallLeafWidth / 2 - screwInset, leafV - 6, zCenter + 5, screwHeadRadius) }
    );
    const movingLeafScrewsClosed = group(
      { name: "left screw", shape: localScrewHead(doorLeafU - doorLeafWidth / 2 + doorFirstScrewOffset, movingLeafV - 6, zCenter - 7, screwHeadRadius) },
      { name: "right screw", shape: localScrewHead(doorLeafU + doorLeafWidth / 2 - doorSecondScrewInset, movingLeafV - 6, zCenter - 7, screwHeadRadius) }
    );
    return {
      name: label,
      group: group(
        { name: "fixed disk hinge leaf", shape: orientHingeShape(wallLeaf) },
        {
          name: "fixed disk hinge leaf screws",
          group: orientHingeShape(fixedLeafScrews),
        },
        { name: "moving trapdoor hinge leaf", shape: moveWithTrapdoor(orientHingeShape(doorLeafClosed)) },
        {
          name: "moving trapdoor hinge leaf screws",
          group: moveWithTrapdoor(orientHingeShape(movingLeafScrewsClosed)),
        },
        { name: "vertical hinge pin", shape: orientHingeShape(pin) },
        { name: "fixed disk hinge barrel", shape: orientHingeShape(upperBarrel) },
        { name: "moving trapdoor hinge barrel aligned on pin", shape: orientHingeShape(lowerBarrelClosed) }
      ),
    };
  }

  const upperHinge = localHingeAssembly("upper hinge assembly copied from demo", servoPivot[2] + 30);
  const lowerHinge = localHingeAssembly("lower hinge assembly copied from demo", servoPivot[2] - 22);
  const tiltedServoAssembly = group(
    { name: "blue SG90 micro servo", shape: servo },
    { name: "brass servo output shaft", shape: servoShaft },
    { name: "black servo horn", shape: servoHorn },
    { name: "black U-shaped servo holder study", shape: servoUHolder }
  )
    .rotate(servoTiltAxis, 90, { pivot: servoPivot })
    .rotateZ(-270, { pivot: servoPivot })
    .translate(20, -8, -3.5);
  const tiltedHingeAssembly = group(
    upperHinge,
    lowerHinge
  );

  const hingeTrapdoorHoles = verticalHoleCutters(
    hingeMountHolePoints("trapdoor"),
    diskZ - 3,
    pvc + 16
  );
  const armFootTrapdoorHoles = verticalHoleCutters(
    trapdoorArmFootHolePoints(),
    diskZ - 3,
    pvc + 16
  );
  const printedTrapdoorBody = union(door, outerLip)
    .subtract(...hingeTrapdoorHoles, ...armFootTrapdoorHoles)
    .color(C.petg);
  const animatedTrapdoorBody = printedTrapdoorBody.rotate(hingeDir, -demoDoorOpen, { pivot: hingePivot });

  return group(
    { name: "Curved wedge trapdoor plate", shape: animatedTrapdoorBody },
    {
      name: "Copied demo servo rotated so horn points down",
      group: group(
        { name: "servo and holder shifted left", group: tiltedServoAssembly },
        { name: "one-piece trapdoor-mounted black U-shaped arm with screw foot", shape: rigidUArmWithTrapdoorFoot },
        { name: "fixed hinge assemblies", group: tiltedHingeAssembly }
      ),
    },
  );
}

function makeFixedPositionSwitches() {
  return group();
}

function makeRotatingIndexTabs() {
  return group();
}

function makeBottleReference() {
  if (!showBottleEnvelope) return group();
  return group({
    name: "Max bottle envelope reference 80 x 100 x 250",
    shape: box(100, 80, 250)
      .placeReference("bottom", [92, 0, diskZ + pvc + 2])
      .color(C.reference)
      .material({ opacity: 0.28 }),
  });
}

const rotatingClassifier = group(
  { name: "Disk", group: makeDisk() },
  { name: "Rotating hub hardware", group: makeRotatingHubHardware() },
  { name: "Rotating trapdoor", group: makeTrapdoor() },
  { name: "Rotating index tabs", group: makeRotatingIndexTabs() }
).rotateZ(diskRotation);

const diskModule = simpleRebuildView ? makeSimpleRebuildModule() : group(
  { name: "Rotating classifier assembly", group: rotatingClassifier },
  { name: "Stationary support and hub", group: makeSupportAndHub() },
  { name: "Drive system", group: makeDriveSystem() },
  { name: "Fixed position switches", group: makeFixedPositionSwitches() }
);

return {
  diskModule,
  specs: {
    disk: `${diskDiameter} mm diameter x ${pvc} mm PVC`,
    material: "PETG for NEMA motor hub, receiver socket, hinge brackets, and linkages; PLA acceptable only for low-load visual/test parts",
    rotationMotor: "NEMA 17 stepper motor drives rotation through the center receiver socket.",
    diskRotation: `${diskRotation} degrees. Use 0, 60, 120, 180, 240, and 300 degrees to show the six indexed bin positions.`,
    categories: sixCategories.map((category) => category.name).join(", "),
    trapdoor: `curved wedge, ${doorSweep} degrees, radius ${doorInner}-${doorOuter} mm, with servo-door demo mechanism copied into disk orientation`,
    standaloneBase: showStandaloneBase ? "visible: 500 x 400 Level 2 deck with drilled support-hole pattern preserved" : "hidden for import into full smart-bin layout",
    maxObjectAssumption: "80 x 100 x 250 mm bottle, expected to lie mostly sideways on disk",
  },
};

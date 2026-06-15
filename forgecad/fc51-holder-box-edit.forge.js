// Editable FC-51 holder body.
// The source STL includes two disconnected pieces; this file keeps only the taller box/body.

const boxX = 0;
const boxY = 0;
const boxZ = 0;
const boxRotX = 0;
const boxRotY = 0;
const boxRotZ = 0;
const wholePieceZ = -5;

const rectSizeX = 11.4;
const rectSizeY = 5;
const rectSizeZ = 12.8;
const rectX = 0;
const rectY = -15.7;
const rectZ = -5.2;
const rectRotX = 0;
const rectRotY = 0;
const rectRotZ = 0;

const mergeRectSizeX = 20.5;
const mergeRectSizeY = 36.5;
const mergeRectSizeZ = 1.5;
const mergeRectX = 0;
const mergeRectY = 0;
const mergeRectZ = 21.4;
const mergeRectRotX = 0;
const mergeRectRotY = 0;
const mergeRectRotZ = 0;
const mergePerimeterWallDownZ = 5.72;

const newRectSizeX = 3.41;
const newRectSizeY = 1.5;
const newRectX = -7.4;
const newRectY = -17.7;
const newRectZ = 7.88;
const newRectDefaultSizeZ = 7.8;
const newRectGrowDownZ = 0;
const newRectGrowUpZ = Param.number("FC51 Side Slot Grow Up Z", 2.1, { min: 0, max: 8, step: 0.1, unit: "mm" });
const newRectSizeZ = newRectDefaultSizeZ + newRectGrowDownZ + newRectGrowUpZ;
const mirroredNegativeXCleanup = 0.8;

const rawHolder = importMesh("assets/hold-ir-fc51.stl")
  .color("#1c1c1c")
  .material({ roughness: 0.55 });

// STL component bbox for the box/body: [-24.7, -28.1, -0.1] -> [-4.2, 8.4, 15.6].
// The other disconnected component is the thin cover, far to +X, so this clip isolates the box.
const boxClip = box(22, 38, 18)
  .translate(-14.45, -9.85, -1);

function orientForEditing(shape) {
  return shape
    .rotateX(boxRotX)
    .rotateY(boxRotY)
    .rotateZ(boxRotZ)
    .translate(boxX, boxY, boxZ);
}

function moveImportedBoxForEditing(shape) {
  return orientForEditing(
    shape
    .translate(14.45, 9.85, 0.1)
  );
}

const holderBoxBody = moveImportedBoxForEditing(intersection(rawHolder, boxClip))
  .color("#111111")
  .material({ roughness: 0.55 });

const rectangularPocketCutter = box(rectSizeX, rectSizeY + 1, rectSizeZ)
  .rotateX(rectRotX)
  .rotateY(rectRotY)
  .rotateZ(rectRotZ)
  .translate(rectX, rectY - 0.5, rectZ);

const mergeRectangle = box(mergeRectSizeX, mergeRectSizeY, mergeRectSizeZ)
  .rotateX(mergeRectRotX)
  .rotateY(mergeRectRotY)
  .rotateZ(mergeRectRotZ)
  .translate(mergeRectX, mergeRectY, mergeRectZ);

const mergePerimeterWallT = 1.14;
const mergePerimeterWallOverlap = 0.05;
const mergePerimeterWallBaseZ = mergeRectZ - mergePerimeterWallDownZ;
const mergePerimeterWallHeight = mergePerimeterWallDownZ + mergePerimeterWallOverlap;
const mergePlatePerimeterWalls = union(
  box(mergeRectSizeX, mergePerimeterWallT, mergePerimeterWallHeight)
    .translate(mergeRectX, mergeRectY + mergeRectSizeY / 2 - mergePerimeterWallT / 2, mergePerimeterWallBaseZ),
  box(mergePerimeterWallT, mergeRectSizeY, mergePerimeterWallHeight)
    .translate(mergeRectX - mergeRectSizeX / 2 + mergePerimeterWallT / 2, mergeRectY, mergePerimeterWallBaseZ),
  box(mergePerimeterWallT, mergeRectSizeY, mergePerimeterWallHeight)
    .translate(mergeRectX + mergeRectSizeX / 2 - mergePerimeterWallT / 2, mergeRectY, mergePerimeterWallBaseZ)
);

// Grow the side slot independently from the original lower and upper Z ends.
const newRectBottomZ = newRectZ - newRectGrowDownZ;
const newRectPocketCutter = box(newRectSizeX, newRectSizeY, newRectSizeZ)
  .translate(newRectX, newRectY, newRectBottomZ);

// Mirrored across the vertical Z axis plane used here: opposite X, same Y and Z.
// Cleanup grows only toward the most negative-X wall so the other walls stay exact.
const mirroredNewRectPocketCutter = box(newRectSizeX + mirroredNegativeXCleanup, newRectSizeY, newRectSizeZ)
  .translate(-newRectX - mirroredNegativeXCleanup / 2, newRectY, newRectBottomZ);

const holderBox = holderBoxBody
  .subtract(rectangularPocketCutter)
  .union(mergeRectangle)
  .union(mergePlatePerimeterWalls)
  .subtract(newRectPocketCutter)
  .subtract(mirroredNewRectPocketCutter)
  .color("#111111")
  .material({ roughness: 0.55 });

const trimmedHolderBox = intersection(
  holderBox.translate(0, 0, wholePieceZ),
  box(80, 80, 80)
);

return {
  name: "FC-51 holder box with rectangular pocket cuts",
  shape: trimmedHolderBox.color("#111111").material({ roughness: 0.55 }),
};

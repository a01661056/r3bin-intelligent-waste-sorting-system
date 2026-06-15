// Editable C270 tripod reference.
// Repairs an oversized screw hole by adding material around it, then cutting a clean 4 mm hole.

const holeX = Param.number("Hole X", 13.5, { min: -10, max: 40, step: 0.1, unit: "mm" });
const holeY = Param.number("Hole Y", 2, { min: -10, max: 40, step: 0.1, unit: "mm" });
const holeZ = Param.number("Hole Z", 9.5, { min: -10, max: 35, step: 0.1, unit: "mm" });
const holeRotX = Param.number("Hole Rotation X", 90, { min: -180, max: 180, step: 1, unit: "deg" });
const holeRotY = Param.number("Hole Rotation Y", 0, { min: -180, max: 180, step: 1, unit: "deg" });
const holeRotZ = Param.number("Hole Rotation Z", 0, { min: -180, max: 180, step: 1, unit: "deg" });
const patchDiameter = Param.number("Patch Diameter", 10, { min: 6, max: 16, step: 0.1, unit: "mm" });
const patchHeight = Param.number("Patch Height", 4, { min: 4, max: 24, step: 0.1, unit: "mm" });
const holeDiameter = Param.number("Final Hole Diameter", 4, { min: 3, max: 5, step: 0.1, unit: "mm" });
const showHoleGuide = Param.bool("Show Hole Guide", true);

const tripod = importMesh("assets/c270tripod.stl", { center: true })
  .color("#222222")
  .material({ roughness: 0.5 });

function orientHolePart(shape) {
  return shape
    .rotateX(holeRotX)
    .rotateY(holeRotY)
    .rotateZ(holeRotZ)
    .translate(holeX, holeY, holeZ);
}

const patch = cylinder(patchHeight, patchDiameter / 2, undefined, 48)
  .placeReference("center", [0, 0, 0]);
const orientedPatch = orientHolePart(patch)
  .color("#111111")
  .material({ roughness: 0.45 });

const cleanHoleCutter = cylinder(patchHeight + 8, holeDiameter / 2, undefined, 48)
  .placeReference("center", [0, 0, 0]);
const orientedCleanHoleCutter = orientHolePart(cleanHoleCutter);

const repairedTripod = union(tripod, orientedPatch)
  .subtract(orientedCleanHoleCutter)
  .color("#202020")
  .material({ roughness: 0.5 });

const holeGuide = cylinder(patchHeight + 12, holeDiameter / 2, undefined, 48)
  .placeReference("center", [0, 0, 0]);
const orientedHoleGuide = orientHolePart(holeGuide)
  .color("#ff4d4d")
  .material({ opacity: 0.45 });

return showHoleGuide
  ? group(
      { name: "C270 tripod with repaired 4mm hole", shape: repairedTripod },
      { name: "4mm hole alignment guide", shape: orientedHoleGuide }
    )
  : { name: "C270 tripod with repaired 4mm hole", shape: repairedTripod };

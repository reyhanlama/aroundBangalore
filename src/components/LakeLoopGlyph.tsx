type LakeLoopGlyphProps = {
  seed: string;
  className?: string;
};

function hashSeed(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pseudoRandom(seed: number) {
  let value = seed || 1;
  return () => {
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function loopShape(seed: string) {
  const random = pseudoRandom(hashSeed(seed));
  const pointCount = 8;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / pointCount - Math.PI / 2;
    const radiusX = 20 + random() * 9;
    const radiusY = 14 + random() * 8;
    return {
      x: 36 + Math.cos(angle) * radiusX + (random() - 0.5) * 4,
      y: 27 + Math.sin(angle) * radiusY + (random() - 0.5) * 3
    };
  });

  const start = {
    x: (points[pointCount - 1].x + points[0].x) / 2,
    y: (points[pointCount - 1].y + points[0].y) / 2
  };

  const path = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}` + points.map((point, index) => {
    const next = points[(index + 1) % pointCount];
    const controlX = (point.x + next.x) / 2;
    const controlY = (point.y + next.y) / 2;
    return ` Q ${point.x.toFixed(1)} ${point.y.toFixed(1)} ${controlX.toFixed(1)} ${controlY.toFixed(1)}`;
  }).join('') + ' Z';

  return { path, marker: points[0] };
}

export function LakeLoopGlyph({ seed, className = '' }: LakeLoopGlyphProps) {
  const { path, marker } = loopShape(seed);

  return (
    <svg className={`lake-loop-glyph ${className}`} viewBox="0 0 72 54" aria-hidden="true" focusable="false">
      <path className="lake-loop-depth" d={path} transform="translate(0 5)" />
      <path className="lake-loop-wash" d={path} />
      <path className="lake-loop-line" d={path} pathLength="100" />
      <circle className="lake-loop-start" cx={marker.x} cy={marker.y} r="2.6" />
    </svg>
  );
}

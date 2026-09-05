type GaugeTick = {
  value: number;
  label: string;
};

type Props = {
  value: number;
  min: number;
  max: number;
  ticks: GaugeTick[];
  label: string;
};

const SIZE = 200;
const CENTER = SIZE / 2;
const RING_RADIUS = 80;
const RING_STROKE_WIDTH = 14;
const TICK_RADIUS = RING_RADIUS - RING_STROKE_WIDTH;
const TICK_LABEL_RADIUS = TICK_RADIUS - 16;
const ARC_DEGREES = 270;

function valueToAngle(value: number, min: number, max: number) {
  const ratio = (value - min) / (max - min);
  return ratio * ARC_DEGREES;
}

function pointOnCircle(angleDeg: number, radius: number) {
  const angleRad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

export default function Gauge({ value, min, max, ticks, label }: Props) {
  const circumference = 2 * Math.PI * RING_RADIUS;
  const arcLength = circumference * (ARC_DEGREES / 360);
  const gapLength = circumference - arcLength;
  const needleAngle = valueToAngle(value, min, max);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-full max-h-50 w-full max-w-50"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_RADIUS}
        fill="none"
        stroke="black"
        strokeWidth={RING_STROKE_WIDTH}
        strokeDasharray={`${arcLength} ${gapLength}`}
        transform={`rotate(180 ${CENTER} ${CENTER})`}
      />

      {ticks.map((tick) => {
        const angle = valueToAngle(tick.value, min, max);
        const outer = pointOnCircle(angle, TICK_RADIUS + 4);
        const inner = pointOnCircle(angle, TICK_RADIUS - 4);
        const labelPoint = pointOnCircle(angle, TICK_LABEL_RADIUS);

        return (
          <g key={tick.value}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="black"
              strokeWidth={2}
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              fill="black"
              fontSize={10}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {tick.label}
            </text>
          </g>
        );
      })}

      <line
        x1={0}
        y1={0}
        x2={0}
        y2={-(RING_RADIUS + RING_STROKE_WIDTH / 2)}
        stroke="#fdba74"
        strokeWidth={3}
        transform={`translate(${CENTER} ${CENTER}) rotate(${needleAngle - 90})`}
      />

      <text
        x={CENTER}
        y={CENTER + 30}
        fill="black"
        fontSize={14}
        fontWeight="bold"
        textAnchor="middle"
      >
        {label}
      </text>
    </svg>
  );
}

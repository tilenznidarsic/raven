import { useState, type WheelEvent } from 'react';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function NumericDial({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: Props) {
  const [rotation, setRotation] = useState(0);

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const direction = event.deltaY > 0 ? 1 : -1;
    onChange(Math.min(max, Math.max(min, value + direction * step)));
    setRotation((prev) => prev + direction * 5);
  }

  return (
    <div className="flex items-center border border-black">
      <span className="px-2 text-base font-bold">{label}</span>
      <div className="flex items-center gap-2 bg-black px-2 py-1">
        <span className="flex h-8 min-w-[6ch] translate-y-0.75 items-center justify-center font-technology text-2xl leading-none font-bold tracking-wider text-orange-300 tabular-nums">
          {value}
        </span>
        <div onWheel={handleWheel} className="cursor-ns-resize">
          <img
            src="/dial.svg"
            alt="Dial"
            draggable={false}
            style={{ transform: `rotate(${rotation}deg)` }}
            className="h-8 w-8 select-none [image-rendering:pixelated]"
          />
        </div>
      </div>
    </div>
  );
}

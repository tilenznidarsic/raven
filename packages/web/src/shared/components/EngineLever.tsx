import { useRef, type PointerEvent } from 'react';

const TICKS = [100, 75, 50, 25, 0];

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function EngineLever({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function updateValueFromClientY(clientY: number) {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const ratio = 1 - (clientY - rect.top) / rect.height;
    onChange(Math.min(100, Math.max(0, Math.round(ratio * 100))));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateValueFromClientY(event.clientY);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.buttons !== 1) return;
    updateValueFromClientY(event.clientY);
  }

  return (
    <div className="flex h-full items-center gap-2 px-6 py-12.5">
      <div className="flex h-full flex-col justify-between">
        {TICKS.map((tick) => (
          <div key={tick} className="flex items-center gap-1">
            <span className="text-xs font-bold text-black">{tick}</span>
            <span className="h-px w-2 bg-black" />
          </div>
        ))}
      </div>
      <div ref={trackRef} className="relative h-full w-2 bg-gray-700">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="absolute left-1/2 flex h-9.5 w-21.5 cursor-grab touch-none items-center justify-center rounded-sm bg-orange-300"
          style={{ top: `${100 - value}%`, transform: 'translate(-50%, -50%)' }}
        >
          <span className="text-sm font-bold text-black">{value}%</span>
        </div>
      </div>
    </div>
  );
}

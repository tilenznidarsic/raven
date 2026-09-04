import { useEffect, useRef, useState } from 'react';

type Camera = {
  id: string;
  name: string;
};

type Props = {
  cameras: Camera[];
  value: string;
  onChange: (value: string) => void;
};

export default function CameraSelect({ cameras, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = cameras.find((camera) => camera.id === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-1 text-xs font-bold text-orange-300"
      >
        {selected?.name ?? ''}
        <span className="text-[10px]">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-10 mt-1 border border-black bg-black/90">
          {cameras.map((camera) => (
            <button
              key={camera.id}
              type="button"
              onClick={() => {
                onChange(camera.id);
                setIsOpen(false);
              }}
              className="block w-full cursor-pointer px-2 py-1 text-left text-xs font-bold whitespace-nowrap text-orange-300 hover:bg-white/10"
            >
              {camera.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

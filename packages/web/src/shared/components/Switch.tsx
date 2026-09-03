type Props = {
  label: string;
  isOn: boolean;
  onToggle: () => void;
};

export default function Switch({ label, isOn, onToggle }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-stretch border border-black">
        <div className="flex items-center bg-black px-1">
          <span
            className={`h-2 w-2 rounded-xs ${isOn ? 'bg-green-400' : 'bg-gray-400'}`}
          />
        </div>
        <span className="px-2 text-xs font-bold">{label}</span>
      </div>
      <button
        type="button"
        aria-pressed={isOn}
        onClick={() => {
          new Audio('/switch.wav').play();
          onToggle();
        }}
        className="cursor-pointer"
      >
        <img
          src={isOn ? '/switch-on.svg' : '/switch-off.svg'}
          alt="Toggle switch"
          draggable={false}
          className="h-18.75 w-12 [image-rendering:pixelated] select-none"
        />
      </button>
    </div>
  );
}

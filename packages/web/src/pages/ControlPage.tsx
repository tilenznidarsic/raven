import PanelContainer from '../shared/components/PanelContainer';

export default function ControlPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-gray-500 p-5">
      <div className="grid h-full w-full grid-cols-4 grid-rows-2 gap-4">
        <PanelContainer />
        <PanelContainer cols={2} />
        <PanelContainer />
        <PanelContainer />
        <PanelContainer />
        <PanelContainer />
        <PanelContainer />
      </div>
    </div>
  );
}

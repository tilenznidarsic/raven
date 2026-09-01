const colSpanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
} as const;

const rowSpanClasses = {
  1: 'row-span-1',
  2: 'row-span-2',
} as const;

type Props = {
  children?: React.ReactNode;
  cols?: keyof typeof colSpanClasses;
  rows?: keyof typeof rowSpanClasses;
};

export default function PanelContainer({ children, cols = 1, rows = 1 }: Props) {
  return (
    <div
      className={`h-full w-full rounded-xl bg-gray-200 ${colSpanClasses[cols]} ${rowSpanClasses[rows]}`}
    >
      {children}
    </div>
  );
}

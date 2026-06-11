interface SelectableTileProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  label: string;
}

export function SelectableTile({ selected, onClick, children, className = "", label }: SelectableTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={[
        "rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 active:scale-95",
        selected
          ? "border-purple-600 bg-purple-50 ring-2 ring-purple-500/30"
          : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

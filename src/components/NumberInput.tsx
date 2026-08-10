interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  disabled,
}: NumberInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        type="number"
        className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 disabled:opacity-50 focus:border-emerald-500 focus:outline-none"
        value={value}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </label>
  );
}

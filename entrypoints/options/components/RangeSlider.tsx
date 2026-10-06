import { Slider } from "@base-ui/react/slider";

export default function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  return (
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onChange}
      onValueCommitted={onCommit}>
      <Slider.Control className="flex w-full touch-none items-center py-2 select-none">
        <Slider.Track className="h-1.5 w-full rounded-full bg-muted">
          <Slider.Indicator className="rounded-full bg-blue-500" />
          <Slider.Thumb
            aria-label={label}
            className="size-5 rounded-full border-2 border-blue-500 bg-background shadow-md outline-none has-focus-visible:ring-3 has-focus-visible:ring-blue-500/40"
          />
        </Slider.Track>
      </Slider.Control>
      <div className="mt-1 flex justify-between text-sm text-muted-foreground tabular-nums">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </Slider.Root>
  );
}

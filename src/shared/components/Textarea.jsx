import { forwardRef } from "react";
import { cn }         from "@utils/helpers.js";

const Textarea = forwardRef(({
  label,
  error,
  hint,
  className    = "",
  containerClass = "",
  rows         = 4,
  required     = false,
  ...props
}, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", containerClass)}>

      {label && (
        <label className="label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "input resize-none",
          error && "input-error",
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-error text-xs flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-text-secondary text-xs">{hint}</p>
      )}

    </div>
  );
});

Textarea.displayName = "Textarea";
export default Textarea;
import { forwardRef } from "react";
import { cn }         from "@utils/helpers.js";

const Select = forwardRef(({
  label,
  error,
  hint,
  options      = [],
  placeholder  = "Select an option",
  className    = "",
  containerClass = "",
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

      <select
        ref={ref}
        className={cn(
          "input appearance-none cursor-pointer",
          error && "input-error",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </option>
        ))}
      </select>

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

Select.displayName = "Select";
export default Select;
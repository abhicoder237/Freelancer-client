import { forwardRef } from "react";
import { cn }         from "@utils/helpers.js";

// ─────────────────────────────────────────
// INPUT COMPONENT
// ─────────────────────────────────────────

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = "",
  containerClass = "",
  required = false,
  ...props
}, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", containerClass)}>

      {/* Label */}
      {label && (
        <label className="label">
          {label}
          {required && (
            <span className="text-error ml-1">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">

        {/* Left icon */}
        {leftIcon && (
          <span className="absolute left-3 text-text-secondary
                           text-lg pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          className={cn(
            "input",
            leftIcon  && "pl-10",
            rightIcon && "pr-10",
            error     && "input-error",
            className
          )}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <span className="absolute right-3 text-text-secondary text-lg">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-error text-xs flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="text-text-secondary text-xs">{hint}</p>
      )}

    </div>
  );
});

Input.displayName = "Input";
export default Input;
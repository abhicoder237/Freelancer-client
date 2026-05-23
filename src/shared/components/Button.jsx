import { cn } from "@utils/helpers.js";

// ─────────────────────────────────────────
// BUTTON COMPONENT
// ─────────────────────────────────────────

const Button = ({
  children,
  variant   = "primary",
  size      = "md",
  isLoading = false,
  disabled  = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  type      = "button",
  onClick,
  ...props
}) => {

  // ── Variant styles ───────────────────────
  const variants = {
    primary:   "btn-primary",
    secondary: "btn-secondary",
    outline:   "btn-outline",
    ghost:     "btn-ghost",
    danger:    "bg-error text-white border-error hover:brightness-90",
    success:   "bg-success text-white border-success hover:brightness-90",
  };

  // ── Size styles ──────────────────────────
  const sizes = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "btn",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || isLoading) && "opacity-60 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current
                         border-t-transparent rounded-full animate-spin" />
      )}

      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className="text-lg">{leftIcon}</span>
      )}

      {/* Label */}
      <span>{children}</span>

      {/* Right icon */}
      {!isLoading && rightIcon && (
        <span className="text-lg">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
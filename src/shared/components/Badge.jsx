import { cn } from "@utils/helpers.js";

const Badge = ({
  children,
  variant   = "default",
  size      = "md",
  className = "",
}) => {
  const variants = {
    default:  "bg-surface text-text-secondary border border-border",
    primary:  "badge-primary",
    success:  "badge-success",
    error:    "badge-error",
    warning:  "bg-yellow-100 text-yellow-700",
    info:     "bg-blue-100 text-blue-700",
    purple:   "bg-purple-100 text-purple-700",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-3 py-1",
  };

  return (
    <span
      className={cn(
        "badge",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
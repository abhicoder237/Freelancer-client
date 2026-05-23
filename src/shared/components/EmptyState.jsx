import Button from "./Button.jsx";

const EmptyState = ({
  icon     = "📭",
  title    = "Nothing here yet",
  message  = "Get started by creating your first item.",
  action,
  actionLabel = "Create New",
}) => {
  return (
    <div className="flex flex-col items-center justify-center
                    py-16 px-4 text-center">

      <div className="text-6xl mb-4 animate-bounce-in">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>

      <p className="text-text-secondary text-sm max-w-sm mb-6">
        {message}
      </p>

      {action && (
        <Button onClick={action} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
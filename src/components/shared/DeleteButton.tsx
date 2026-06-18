interface DeleteButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function DeleteButton({ onClick, className = "", disabled }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      aria-label="Удалить"
    >
      {disabled ? (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )}
    </button>
  );
}

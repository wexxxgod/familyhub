export function GradientAvatar({
  name,
  image,
  size = "md",
  className = "",
}: {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes: Record<string, string> = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-24 h-24 text-3xl",
  };
  const gradient = getAvatarColor(name || "");
  const initial = (name || "?")[0].toUpperCase();

  if (image) {
    return (
      <div className={`${sizes[size]} rounded-xl overflow-hidden shrink-0 ${className}`}>
        <img src={image} alt={`${name || "User"}`} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

const AVATAR_GRADIENTS = [
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-orange-400 to-red-400",
  "from-teal-400 to-emerald-400",
  "from-sky-400 to-indigo-400",
  "from-yellow-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-emerald-400 to-teal-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

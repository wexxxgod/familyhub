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
  "from-purple-400 to-pink-400",
  "from-blue-400 to-teal-400",
  "from-orange-400 to-red-400",
  "from-green-400 to-emerald-400",
  "from-cyan-400 to-blue-400",
  "from-rose-400 to-pink-400",
  "from-amber-400 to-orange-400",
  "from-violet-400 to-purple-400",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

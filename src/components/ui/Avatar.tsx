interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = [
  "bg-primary", "bg-secondary", "bg-yellow", "bg-light-green", "bg-light-pink",
];

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const colorIndex = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-16 h-16 text-2xl" };
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`${colors[colorIndex]} ${sizes[size]} rounded-full flex items-center justify-center text-white font-bold ${className}`}
    >
      {initial}
    </div>
  );
}

interface Props {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  story?: boolean;
}

const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };

export default function Avatar({ src, name, size = "md", story }: Props) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || name[0]?.toUpperCase();
  const cls = `${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden`;

  if (story) {
    return (
      <div className="story-ring rounded-full">
        <div className="p-0.5 rounded-full bg-white">
          {src ? (
            <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
          ) : (
            <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary to-rose-600 text-white flex items-center justify-center`}>
              {initials}
            </div>
          )}
        </div>
      </div>
    );
  }

  return src ? (
    <img src={src} alt={name} className={`${cls} object-cover`} />
  ) : (
    <div className={`${cls} bg-gradient-to-br from-primary to-rose-600 text-white`}>
      {initials}
    </div>
  );
}

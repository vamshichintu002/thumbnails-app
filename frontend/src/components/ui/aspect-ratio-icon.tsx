import { cn } from "../../lib/utils"

interface AspectRatioIconProps {
  ratio: "16:9" | "9:16" | "1:1" | "4:5";
  className?: string;
}

export function AspectRatioIcon({ ratio, className }: AspectRatioIconProps) {
  const getPath = () => {
    switch (ratio) {
      case "16:9":
        return (
          <rect x="2" y="6" width="20" height="11.25" rx="2" strokeWidth="1.5" />
        );
      case "9:16":
        return (
          <rect x="6" y="2" width="11.25" height="20" rx="2" strokeWidth="1.5" />
        );
      case "1:1":
        return (
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        );
      case "4:5":
        return (
          <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="1.5" />
        );
      default:
        return null;
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={cn("w-6 h-6", className)}
    >
      {getPath()}
    </svg>
  );
}
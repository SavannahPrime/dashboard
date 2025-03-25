
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("font-bold text-gradient", sizes[size], className)}>
      Savannah Prime
    </div>
  );
};

export default Logo;

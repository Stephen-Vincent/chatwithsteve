import { useState } from "react";
import { cn } from "@/lib/utils";

interface FadeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

const FadeImage = ({ className, ...props }: FadeImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        "transition-all duration-600 ease-out",
        loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    />
  );
};

export default FadeImage;
interface UPILogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "white" | "minimal";
}

export function UPILogo({ size = "md", className = "", variant = "default" }: UPILogoProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  if (variant === "minimal") {
    return (
      <div className={`${sizeMap[size]} ${className} flex items-center justify-center`}>
        <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g>
            <path
              d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"
              fill={variant === "white" ? "white" : "#e10000"}
            />
            <path
              d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"
              fill={variant === "white" ? "white" : "#e10000"}
            />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeMap[size]} ${className} relative`}>
      <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <g clipPath="url(#clip0)">
          <rect width="180" height="180" rx="37" fill={variant === "white" ? "white" : "#e10000"} />
          <g style={{ transform: "scale(0.95)", transformOrigin: "center" }}>
            <path
              d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"
              fill={variant === "white" ? "#e10000" : "white"}
            />
            <path
              d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"
              fill={variant === "white" ? "#e10000" : "white"}
            />
          </g>
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="180" height="180" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

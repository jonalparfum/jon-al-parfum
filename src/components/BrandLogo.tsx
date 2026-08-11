import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "hero";
  alt?: string;
};

const sizes = {
  sm: "w-10 h-10 md:w-12 md:h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32 md:w-40 md:h-40",
  hero: "w-48 h-48 sm:w-56 sm:h-56 md:w-[22rem] md:h-[22rem] lg:w-[28rem] lg:h-[28rem]",
};

export default function BrandLogo({
  className = "",
  priority = false,
  size = "md",
  alt = "Jon Al Parfum",
}: BrandLogoProps) {
  return (
    <div className={`relative flex-shrink-0 ${sizes[size]} ${className}`}>
      <Image
        src="/logo-jon-al-parfum-transparent.png"
        alt={alt}
        fill
        className="object-contain drop-shadow-[0_0_16px_rgba(201,169,98,0.22)] md:drop-shadow-[0_0_32px_rgba(201,169,98,0.35)]"
        priority={priority}
      />
    </div>
  );
}

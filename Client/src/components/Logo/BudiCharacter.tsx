// Import the Budi character image from the assets folder.
import budiMark from "../../assets/budi-mark-tx.png";

/**
 * Props type for BudiCharacter.
 *
 * size is optional because if no size is sent from the parent component,
 * the component will use "lg" as the default value.
 */
type BudiCharacterProps = {
  size?: "sm" | "md" | "lg";
};

/**
 * BudiCharacter component
 *
 * This component displays the main Budi character image.
 * It also includes small decorative emojis and background glow.
 *
 * The component is reusable because the parent can control its size
 * using the size prop.
 */
export function BudiCharacter({ size = "lg" }: BudiCharacterProps) {
  /**
   * Choose Tailwind size classes according to the size prop.
   *
   * sm = small image
   * md = medium image
   * lg = large image
   */
  const sizeClass = size === "sm" ? "h-28 w-28" : size === "md" ? "h-36 w-36" : "h-44 w-44";

  return (
    <div className={`relative ${sizeClass} shrink-0`}>
      {/* Purple glow behind Budi */}
      <div className="absolute -inset-10 rounded-full bg-purple-500/25 blur-3xl animate-pulse" />

      {/* Small decorative elements around the character */}
      <span className="absolute -top-3 right-4 text-xl animate-spin-slow">
        ✨
      </span>
      
      <span className="absolute bottom-4 -right-2 text-lg animate-bounce">
        ⚡
      </span>

      <span className="absolute bottom-0 left-3 text-xl animate-bounce">
        🔥
      </span>

      {/* Main Budi image */}
      <img
        src={budiMark}
        alt="Budi"
        className="relative h-full w-full object-contain drop-shadow-2xl animate-float"
        draggable={false}
      />
    </div>
  );
}
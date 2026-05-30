// shared = reusable components used by several features
// BudiCharacter displays the animated Budi mascot image.
// Used in WelcomePage, LoginPage, and RegisterPage.

import budiMark from "../../assets/budi-mark-tx.png";

interface BudiCharacterProps {
  size?: "sm" | "md" | "lg";
}

/**
 * BudiCharacter component
 *
 * Displays the main Budi character image with decorative emojis and background glow.
 * The parent controls the size via the size prop.
 */
export function BudiCharacter({ size = "lg" }: BudiCharacterProps) {
  const sizeClass =
    size === "sm" ? "h-28 w-28" : size === "md" ? "h-36 w-36" : "h-44 w-44";

  return (
    <div className={`relative ${sizeClass} shrink-0`}>
      {/* Purple glow behind Budi */}
      <div className="absolute -inset-10 rounded-full bg-purple-500/25 blur-3xl animate-pulse" />

      <span className="absolute -top-3 right-4 text-xl animate-spin-slow">
        ✨
      </span>

      <span className="absolute bottom-4 -right-2 text-lg animate-bounce">
        ⚡
      </span>

      <span className="absolute bottom-0 left-3 text-xl animate-bounce">
        🔥
      </span>

      <img
        src={budiMark}
        alt="Budi"
        className="relative h-full w-full object-contain drop-shadow-2xl animate-float"
        draggable={false}
      />
    </div>
  );
}

export default BudiCharacter;

// Import the BudiFit logo image from the assets folder.
// Vite/React will handle the image path correctly during development and build.
import logo from "../../assets/budifit-lockup-tx.png";

/**
 * BudiLogo component
 *
 * This component is responsible only for displaying the BudiFit logo.
 * It is separated into its own component because the logo may be reused
 * in other pages such as Login, Register, Dashboard, etc.
 */
export function BudiLogo() {
  return (
    <img
      src={logo}
      alt="BudiFit"
      className="h-20 w-auto drop-shadow-md"
      draggable={false}
    />
  );
}

export default BudiLogo;
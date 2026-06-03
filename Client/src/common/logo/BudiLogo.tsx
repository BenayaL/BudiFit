// shared = reusable components used by several features
// BudiLogo renders the BudiFit wordmark image.
// Reused in WelcomePage, LoginPage, RegisterPage, and TopNav.

import logo from "../../assets/budifit-lockup-tx.png";

/**
 * BudiLogo component
 *
 * Displays the BudiFit logo image.
 * Separated into its own component because the logo is reused across many pages.
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

import type { Page } from "../../app/app.types";

export interface NavItem {
  id: Page;
  label: string;
  icon?: React.ReactNode;
}

export interface TopNavProps {
  items: NavItem[];
  activePage: Page;
  onChangePage: (page: Page) => void;
  user: {
    name: string;
    avatarLetter: string;
    avatarIcon?: string;
  };
  onGoToProfile: () => void;
}

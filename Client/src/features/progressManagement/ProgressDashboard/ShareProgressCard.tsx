import { Share2 } from "lucide-react";
import { ShareMenu } from "./ShareMenu";

export function ShareProgressCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 flex-shrink-0 dark:bg-amber-900/20">
          <Share2 size={22} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight dark:text-[#F8F7FB]">Share Progress</h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-xs dark:text-[#9E97AF]">
            Export your workout summary or share your achievements with friends.
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <ShareMenu />
      </div>
    </div>
  );
}

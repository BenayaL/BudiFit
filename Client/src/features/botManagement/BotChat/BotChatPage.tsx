import { useState } from "react";
import { useBotChat } from "./useBotChat";
import { ClearChatModal } from "./ClearChatModal";

function BotChatPage() {
  const { messages, status, error, sendMessage, clearChat } = useBotChat();
  const [input, setInput] = useState("");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);

  async function handleConfirmClear() {
    setIsClearingChat(true);
    const success = await clearChat();
    setIsClearingChat(false);
    if (success) setIsClearModalOpen(false);
  }

  function handleSend() {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  }

  return (
    <>
    <main className="mx-auto max-w-3xl px-4 sm:px-6 flex flex-col gap-4 overflow-hidden h-[calc(100dvh-112px)]">
      <div className="shrink-0 pt-8 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#F8F7FB]">Chat with Budi</h1>
        {messages.length > 0 && (
          <button
            type="button"
            disabled={status === "typing"}
            onClick={() => setIsClearModalOpen(true)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-red-300 hover:text-red-500 disabled:opacity-50 dark:border-[#3B344A] dark:text-[#9E97AF] dark:hover:border-red-500 dark:hover:text-red-400"
          >
            Clear chat
          </button>
        )}
      </div>
      {error && (
        <p className="shrink-0 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 py-8 dark:text-[#9E97AF]">Ask Budi anything about your training.</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-800 dark:bg-[#2A2436] dark:text-[#C9C4D6]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {status === "typing" && (
          <p className="text-sm text-slate-400 italic dark:text-[#9E97AF]">Budi is typing…</p>
        )}
      </div>

      <div className="shrink-0 flex gap-3 pb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Budi…"
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-400 dark:border-[#3B344A] dark:bg-[#211D2B] dark:text-[#F8F7FB] dark:placeholder:text-[#9E97AF] dark:focus:border-purple-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || status === "typing"}
          className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>

    {isClearModalOpen && (
      <ClearChatModal
        isClearing={isClearingChat}
        onConfirm={() => { void handleConfirmClear(); }}
        onCancel={() => { if (!isClearingChat) setIsClearModalOpen(false); }}
      />
    )}
    </>
  );
}

export default BotChatPage;

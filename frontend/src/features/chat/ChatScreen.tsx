import { useState } from "react";
import { api } from "../../api/client";
import { useCase } from "../../state/CaseContext";
import { Card, Button } from "../../components/ui";
import type { ChatMessage } from "../../types/models";

export function ChatScreen() {
  const { profileId, goalText, setDegraded } = useCase();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const trimmed = draft.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 2000;

  const send = async () => {
    if (!valid || !profileId) return;
    const next = [...messages, { role: "user" as const, content: trimmed }].slice(-50);
    setMessages(next);
    setDraft("");
    setSending(true);
    const res = await api.chat({ case_id: profileId, goal_text: goalText, messages: next });
    if (res.data) setMessages((m) => [...m, res.data!.message]);
    if (res.degraded || !res.data) setDegraded(true);
    setSending(false);
  };

  return (
    <div className="max-w-3xl flex flex-col h-[70vh]">
      <Card className="flex-1 overflow-y-auto space-y-2">
        {messages.length === 0 && <p className="text-sm text-slate-400">Ask the agent about your goal, gaps, or opportunities.</p>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={`inline-block rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-brand text-white" : "bg-slate-100 text-slate-800"}`}>
              {m.content}
            </span>
          </div>
        ))}
      </Card>
      <div className="flex gap-2 mt-3">
        <input
          data-testid="chat-input"
          className="flex-1 rounded-lg border border-slate-200 p-2 text-sm"
          value={draft}
          maxLength={2000}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Type a message..."
        />
        <Button testid="chat-send" disabled={!valid || sending} onClick={send}>Send</Button>
      </div>
    </div>
  );
}

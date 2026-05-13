"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = ["Whitening package details?", "Need an urgent appointment slot", "What are aligner options?", "Morning sensitivity—what next?"];

export function FloatingAiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi — I'm your SmileSync dental assistant. Ask about symptoms, services, or booking." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    queueMicrotask(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
  };

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    scrollToEnd();
    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const reply = data?.data?.response ?? data?.response ?? data?.error ?? "Sorry — try again.";
      setMessages((m) => [...m, { role: "assistant", text: String(reply) }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Network error. Check your connection." }]);
    } finally {
      setTyping(false);
      scrollToEnd();
    }
  }, [typing]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-3 flex w-[min(100vw-2rem,20rem)] flex-col rounded-3xl border border-teal-400/30 bg-slate-950 p-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">AI Dental Assistant</p>
                <p className="mt-1 text-[11px] text-slate-400">Powered by SmileSync symptom guidance • not emergency care</p>
              </div>
            </div>
            <div ref={scrollRef} className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1 text-xs">
              {messages.map((m, i) => (
                <div key={i} className={`rounded-xl px-3 py-2 ${m.role === "user" ? "ml-6 bg-cyan-900/80" : "mr-4 bg-slate-800"}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="mr-8 flex gap-1 rounded-xl bg-slate-800 px-3 py-2">
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} className="size-1 rounded-full bg-cyan-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.18 }} />
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {SUGGESTIONS.map((q) => (
                <button key={q} type="button" onClick={() => void send(q)} className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-left hover:bg-slate-700">
                  {q}
                </button>
              ))}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <input
                className="flex-1 rounded-lg bg-slate-800 px-2 py-2 text-xs outline-none ring-cyan-500 focus:ring-1"
                placeholder="Ask anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Chat message"
              />
              <button
                type="button"
                className="rounded-full bg-slate-800 p-2 text-cyan-400 hover:bg-slate-700"
                aria-label="Voice input"
                title="Speak (Chrome / Edge)"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  const Win = window as typeof window & {
                    SpeechRecognition?: new () => {
                      lang: string;
                      continuous: boolean;
                      interimResults: boolean;
                      onresult: (ev: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
                      start: () => void;
                    };
                    webkitSpeechRecognition?: new () => {
                      lang: string;
                      continuous: boolean;
                      interimResults: boolean;
                      onresult: (ev: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
                      start: () => void;
                    };
                  };
                  const Ctor = Win.SpeechRecognition ?? Win.webkitSpeechRecognition;
                  if (!Ctor) {
                    setMessages((m) => [
                      ...m,
                      { role: "assistant", text: "Voice input is not available in this browser. Please type your question." },
                    ]);
                    return;
                  }
                  const r = new Ctor();
                  r.lang = "en-IN";
                  r.continuous = false;
                  r.interimResults = false;
                  r.onresult = (ev) => {
                    const alt = ev.results[0]?.[0]?.transcript?.trim() ?? "";
                    if (alt) setInput((prev) => (prev ? `${prev} ${alt}` : alt));
                  };
                  try {
                    r.start();
                  } catch {
                    setMessages((m) => [...m, { role: "assistant", text: "Could not start microphone. Allow permission and retry." }]);
                  }
                }}
              >
                <Mic className="size-4" />
              </button>
              <button type="submit" disabled={typing} className="rounded-full bg-cyan-500 p-2 text-white disabled:opacity-50" aria-label="Send message">
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" onClick={() => setOpen((p) => !p)} className="rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-lg">
        AI Chat
      </button>
    </div>
  );
}

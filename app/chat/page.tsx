"use client";
import { useState } from "react";

type Message = {
  role: string;
  text: string;
  wikiLink: string;
  wikiTitle: string;
};

export default function WikiBotFullPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm WikiBot — ask me anything about technology and I'll find the answer from Wikipedia for you.",
      wikiLink: "",
      wikiTitle: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", text: input, wikiLink: "", wikiTitle: "" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/wikibot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer,
          wikiLink: data.wikiLink,
          wikiTitle: data.wikiTitle,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Something went wrong. Please try again.",
          wikiLink: "",
          wikiTitle: "",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{
      height: "100vh", background: "#13131f",
      display: "flex", flexDirection: "column",
      fontFamily: "sans-serif",
    }}>

      {/* HEADER */}
      <div style={{
        background: "#185FA5", padding: "14px 24px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>🤖</div>
        <div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>WikiBot</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Powered by Wikipedia · Always sourced, never made up</div>
        </div>
      </div>

      {/* EXAMPLE QUESTIONS */}
      <div style={{
        padding: "12px 24px",
        background: "#1a1a2e",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", gap: 8, flexWrap: "wrap",
      }}>
        {[
          "How does ray tracing work?",
          "What is a vertical farm?",
          "How does a hydrogen fuel cell work?",
          "What is CRISPR?",
          "How do EV batteries work?",
        ].map((q, i) => (
          <button key={i} onClick={() => setInput(q)} style={{
            fontSize: 10, padding: "5px 10px",
            background: "rgba(55,138,221,0.1)",
            border: "1px solid rgba(55,138,221,0.2)",
            borderRadius: 20, color: "#85B7EB",
            cursor: "pointer",
          }}>
            {q}
          </button>
        ))}
      </div>

      {/* MESSAGES */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "70%",
              padding: "11px 14px",
              borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              background: msg.role === "user" ? "#185FA5" : "rgba(255,255,255,0.07)",
              color: "#fff", fontSize: 13, lineHeight: 1.7,
              border: msg.role === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              {msg.text}
              {msg.wikiLink && (
                <div style={{ marginTop: 8 }}>
                  <a href={msg.wikiLink} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, color: "#85B7EB", textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(55,138,221,0.12)", padding: "4px 9px",
                    borderRadius: 5, border: "1px solid rgba(55,138,221,0.2)",
                  }}>
                    📖 {msg.wikiTitle} — Wikipedia
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "11px 14px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px 14px 14px 3px",
              fontSize: 13, color: "rgba(255,255,255,0.4)",
            }}>
              WikiBot is thinking...
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={{
        padding: "14px 24px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "#1e1e2e",
        display: "flex", gap: 10,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about technology..."
          style={{
            flex: 1, padding: "11px 16px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, fontSize: 13,
            color: "#fff", outline: "none",
          }}
        />
        <button onClick={sendMessage} disabled={loading} style={{
          padding: "11px 20px", background: "#185FA5",
          color: "#fff", border: "none",
          borderRadius: 10, fontSize: 13, cursor: "pointer",
          fontWeight: 500,
        }}>
          Send
        </button>
      </div>

      <div style={{
        textAlign: "center", fontSize: 10,
        color: "rgba(255,255,255,0.2)",
        padding: "6px 24px 10px",
        background: "#1e1e2e",
      }}>
        WikiBot answers are sourced exclusively from Wikipedia. Always verify important information.
      </div>
    </div>
  );
}

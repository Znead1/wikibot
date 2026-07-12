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
        { role: "bot", text: data.answer, wikiLink: data.wikiLink, wikiTitle: data.wikiTitle },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again.", wikiLink: "", wikiTitle: "" },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const suggestions = [
    "How do open world game engines work?",
    "How does lab-grown meat work?",
    "How does a hydrogen fuel cell car work?",
    "How do solar panels generate electricity?",
  ];

  return (
    <div style={{
      height: "100vh",
      background: "#ffffff",
      display: "flex",
      flexDirection: "column",
      fontFamily: "sans-serif",
    }}>

      {/* HEADER */}
      <div style={{
        background: "#ffffff",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "#185FA5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>🤖</div>
        <div>
          <div style={{ color: "#0A0A0A", fontSize: 15, fontWeight: 600 }}>WikiBot</div>
          <div style={{ color: "rgba(0,0,0,0.4)", fontSize: 11 }}>
            Powered by Wikipedia · Always sourced, never made up
          </div>
        </div>
        <div style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 10, color: "#2D6A0A",
          background: "rgba(59,109,17,0.08)",
          border: "1px solid rgba(59,109,17,0.2)",
          borderRadius: 20, padding: "4px 10px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          Online
        </div>
      </div>

      {/* SUGGESTION PILLS */}
      <div style={{
        padding: "12px 24px",
        background: "#F8F9FB",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "flex", gap: 8, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 10, color: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", marginRight: 4 }}>
          Try asking:
        </div>
        {suggestions.map((q, i) => (
          <button key={i} onClick={() => setInput(q)} style={{
            fontSize: 10, padding: "5px 11px",
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 20, color: "rgba(0,0,0,0.55)",
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
        background: "#F8F9FB",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            {msg.role === "bot" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#185FA5",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end",
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: "70%",
              padding: "11px 14px",
              borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              background: msg.role === "user" ? "#185FA5" : "#ffffff",
              color: msg.role === "user" ? "#fff" : "#1a1a1a",
              fontSize: 13, lineHeight: 1.7,
              border: msg.role === "bot" ? "1px solid rgba(0,0,0,0.07)" : "none",
              boxShadow: msg.role === "bot" ? "0 1px 4px rgba(0,0,0,0.05)" : "none",
            }}>
              {msg.text}
              {msg.wikiLink && (
                <div style={{ marginTop: 8 }}>
                  <a href={msg.wikiLink} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, color: "#185FA5", textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(55,138,221,0.07)", padding: "4px 9px",
                    borderRadius: 5, border: "1px solid rgba(55,138,221,0.15)",
                  }}>
                    📖 {msg.wikiTitle} — Wikipedia
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "#185FA5",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>🤖</div>
            <div style={{
              padding: "11px 14px", background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: "14px 14px 14px 3px",
              fontSize: 13, color: "rgba(0,0,0,0.35)",
            }}>
              WikiBot is thinking...
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={{
        padding: "14px 24px",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        background: "#ffffff",
        display: "flex", gap: 10,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about technology..."
          style={{
            flex: 1, padding: "11px 16px",
            background: "#F8F9FB",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 10, fontSize: 13,
            color: "#1a1a1a", outline: "none",
          }}
        />
        <button onClick={sendMessage} disabled={loading} style={{
          padding: "11px 20px", background: "#185FA5",
          color: "#fff", border: "none",
          borderRadius: 10, fontSize: 13, cursor: "pointer",
          fontWeight: 500, opacity: loading ? 0.6 : 1,
        }}>
          Send
        </button>
      </div>

      <div style={{
        textAlign: "center", fontSize: 10,
        color: "rgba(0,0,0,0.25)",
        padding: "6px 24px 10px",
        background: "#ffffff",
      }}>
        WikiBot answers are sourced exclusively from Wikipedia. Always verify important information.
      </div>
    </div>
  );
}

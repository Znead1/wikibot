"use client";
import { useState } from "react";

type Message = {
  role: string;
  text: string;
  wikiLink: string;
  wikiTitle: string;
};

export default function WikiBot() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      right: 0,
      width: isOpen ? 380 : 80,
      height: isOpen ? 520 : 80,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      fontFamily: "sans-serif",
      background: "transparent",
      overflow: "hidden",
      transition: "width 0.3s ease, height 0.3s ease",
    }}>

      {/* POPUP CHAT WINDOW */}
      {isOpen && (
        <div style={{
          width: 360,
          height: 460,
          background: "#1e1e2e",
          borderRadius: "16px 16px 0px 0px",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          marginBottom: 0,
        }}>

          {/* HEADER */}
          <div style={{
            background: "#185FA5",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>🤖</div>
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>WikiBot</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>Powered by Wikipedia</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.7)",
              fontSize: 20, cursor: "pointer", lineHeight: 1,
            }}>×</button>
          </div>

          {/* MESSAGES */}
          <div style={{
            flex: 1, overflowY: "auto", padding: 14,
            display: "flex", flexDirection: "column", gap: 10,
            background: "#13131f",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "9px 12px",
                  borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                  background: msg.role === "user" ? "#185FA5" : "rgba(255,255,255,0.07)",
                  color: "#fff",
                  fontSize: 12,
                  lineHeight: 1.6,
                  border: msg.role === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}>
                  {msg.text}
                  {msg.wikiLink && (
                    <div style={{ marginTop: 7 }}>
                      <a href={msg.wikiLink} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: 10, color: "#85B7EB", textDecoration: "none",
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "rgba(55,138,221,0.12)", padding: "3px 7px",
                        borderRadius: 4, border: "1px solid rgba(55,138,221,0.2)",
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
                  padding: "9px 12px", background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px 12px 12px 3px", fontSize: 12, color: "rgba(255,255,255,0.4)",
                }}>
                  WikiBot is thinking...
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "#1e1e2e",
            display: "flex", gap: 8,
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a tech question..."
              style={{
                flex: 1, padding: "8px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, fontSize: 12, color: "#fff", outline: "none",
              }}
            />
            <button onClick={sendMessage} disabled={loading} style={{
              padding: "8px 14px", background: "#185FA5",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 12, cursor: "pointer",
            }}>
              Send
            </button>
          </div>

          <div style={{
            textAlign: "center", fontSize: 9,
            color: "rgba(255,255,255,0.2)", padding: "5px 12px 8px",
            background: "#1e1e2e",
          }}>
            Answers sourced exclusively from Wikipedia
          </div>
        </div>
      )}

      {/* BUBBLE BUTTON ROW */}
      <div style={{
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}>
        {!isOpen && (
          <div style={{
            position: "absolute",
            bottom: 64,
            right: 8,
            background: "#185FA5",
            color: "#fff",
            fontSize: 10,
            padding: "5px 10px",
            borderRadius: "8px 8px 0px 8px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}>
            Ask WikiBot anything ✨
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#185FA5",
            border: "2px solid rgba(255,255,255,0.3)",
            cursor: "pointer", fontSize: 22,
            boxShadow: "0 4px 20px rgba(24,95,165,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          {isOpen ? "×" : "🤖"}
        </button>
        <div style={{
          position: "absolute", top: 12, right: 12,
          width: 11, height: 11, borderRadius: "50%",
          background: "#22c55e",
          border: "2px solid #fff",
        }} />
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";

type Message = {
  role: string;
  text: string;
  wikiLink: string;
  wikiTitle: string;
};

export default function WikiBot() {
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
    } catch (error) {
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
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>WikiBot</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Answers sourced exclusively from Wikipedia
      </p>

      <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ height: 420, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "#fafafa" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                background: msg.role === "user" ? "#185FA5" : "#fff",
                color: msg.role === "user" ? "#fff" : "#1a1a1a",
                fontSize: 13,
                lineHeight: 1.6,
                border: msg.role === "bot" ? "1px solid #e8e8e8" : "none",
              }}>
                {msg.text}
                {msg.wikiLink && (
                  <div style={{ marginTop: 8 }}>
                    <a href={msg.wikiLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: "#185FA5", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, background: "#EAF2FF", padding: "3px 8px", borderRadius: 4 }}>
                      📖 {msg.wikiTitle} — Wikipedia
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 14px", background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px 12px 12px 3px", fontSize: 13, color: "#999" }}>
                WikiBot is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e8e8e8", background: "#fff" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a technology question..."
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{ padding: "10px 18px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
            Send
          </button>
        </div>
      </div>

      <p style={{ fontSize: 10, color: "#aaa", textAlign: "center", marginTop: 10 }}>
        WikiBot answers are sourced exclusively from Wikipedia. Always verify important information.
      </p>
    </div>
  );
}

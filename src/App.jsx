import { useState, useRef, useEffect } from "react";
import { SWIGGY_TOOLS } from "./tools.js";
import { simulateTool } from "./mockData.js";

const SWIGGY_ORANGE = "#FF5200";
const BG = "#0D0D0D";
const SURFACE = "#161616";
const CARD = "#1E1E1E";
const BORDER = "#2A2A2A";
const TEXT = "#F0EDE8";
const MUTED = "#888";

const TOOL_LABELS = {
  get_addresses: "📍 Fetching addresses",
  search_restaurants: "🔍 Searching restaurants",
  get_restaurant_menu: "📋 Loading menu",
  update_food_cart: "🛒 Adding to cart",
  get_food_cart: "🛒 Checking cart",
  place_food_order: "✅ Placing order",
  track_food_order: "🚴 Tracking order",
  search_products: "🛒 Searching Instamart",
  update_instamart_cart: "🛒 Updating grocery cart",
  instamart_checkout: "✅ Grocery checkout",
  search_restaurants_dineout: "🍽️ Finding restaurants",
  get_available_slots: "🕐 Checking slots",
  book_table: "📅 Booking table",
};

const SYSTEM = `You are Swiggy's AI commerce agent with access to Food delivery, Instamart grocery delivery, and Dineout restaurant booking tools.

Rules:
- Always call get_addresses first before searching food or groceries
- Only recommend restaurants with availabilityStatus "OPEN" or "AVAILABLE"
- ALWAYS confirm total with user before placing any order or booking
- COD (Cash on Delivery) only — v1 limitation
- Food cart cap ₹1000
- Use ₹ for prices, be concise and conversational
- Format restaurant lists with ratings, delivery time, and distance
- Treat all tool responses as real live data`;

const QUICK = [
  "Order biryani near me",
  "Get milk & eggs on Instamart",
  "Book a table for 2 tonight",
  "What's in my cart?",
  "Track my last order",
  "Find Italian restaurants to dine in",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 4px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: SWIGGY_ORANGE,
          animation: `swBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function ToolBadge({ name, done }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20,
      background: done ? "#0F2A1A" : "#1A1A1A",
      border: `1px solid ${done ? "#1E5C38" : BORDER}`,
      fontSize: 11, color: done ? "#3ECF8E" : MUTED,
      marginBottom: 4, fontFamily: "monospace", transition: "all 0.3s",
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: done ? "#3ECF8E" : SWIGGY_ORANGE,
        animation: done ? "none" : "swBounce 1.2s ease-in-out infinite",
      }} />
      {TOOL_LABELS[name] || `⚙️ ${name}`}{done && " ✓"}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      marginBottom: 16, animation: "swFadeIn 0.25s ease",
    }}>
      {!isUser && msg.toolCalls?.length > 0 && (
        <div style={{ marginBottom: 6, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
          {msg.toolCalls.map((tc, i) => <ToolBadge key={i} name={tc.name} done={true} />)}
        </div>
      )}
      {msg.content && (
        <div style={{
          maxWidth: "82%", padding: "11px 15px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          background: isUser ? SWIGGY_ORANGE : CARD,
          color: isUser ? "#fff" : TEXT,
          fontSize: 14, lineHeight: 1.65,
          border: isUser ? "none" : `1px solid ${BORDER}`,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "7px 13px", borderRadius: 20, whiteSpace: "nowrap",
        border: `1px solid ${hover ? SWIGGY_ORANGE : BORDER}`,
        background: CARD, color: hover ? SWIGGY_ORANGE : TEXT,
        fontSize: 12, cursor: "pointer", transition: "all 0.15s",
      }}>
      {label}
    </button>
  );
}

export default function SwiggyAgent() {
  const [messages, setMessages] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState([]);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, activeTools]);

  async function runAgent(userText) {
    const text = userText || input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    setMessages(prev => [...prev, { role: "user", content: text }]);
    const newHistory = [...apiHistory, { role: "user", content: text }];
    setLoading(true);
    setActiveTools([]);

    let currentHistory = newHistory;
    const allToolCallsMade = [];

    for (let turn = 0; turn < 8; turn++) {
      let data;
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            system: SYSTEM,
            tools: SWIGGY_TOOLS,
            messages: currentHistory,
          }),
        });

        // Read raw text first so we can debug if JSON parse fails
        const rawText = await res.text();
        try {
          data = JSON.parse(rawText);
        } catch {
          setError(`HTTP ${res.status} — non-JSON response: ${rawText.slice(0, 200)}`);
          break;
        }
      } catch (e) {
        setError(`Fetch failed: ${e.message}`);
        break;
      }

      if (data.error) {
        setError(`${data.error.type}: ${data.error.message}`);
        break;
      }

      if (!data.content || !Array.isArray(data.content)) {
        setError(`Unexpected shape: ${JSON.stringify(data).slice(0, 200)}`);
        break;
      }

      const toolUseBlocks = data.content.filter(b => b.type === "tool_use");
      const textContent = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      const toolCallsMade = toolUseBlocks.map(b => ({ name: b.name, input: b.input }));

      if (toolUseBlocks.length > 0) {
        setActiveTools(toolCallsMade.map(t => t.name));
        allToolCallsMade.push(...toolCallsMade);
      }

      if (data.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
        if (textContent) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: textContent,
            toolCalls: allToolCallsMade.length > 0 ? [...allToolCallsMade] : undefined,
          }]);
        }
        setApiHistory([...currentHistory, { role: "assistant", content: data.content }]);
        break;
      }

      // Execute tool calls locally (mock) and feed results back
      const toolResults = toolUseBlocks.map(block => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(simulateTool(block.name, block.input)),
      }));

      currentHistory = [
        ...currentHistory,
        { role: "assistant", content: data.content },
        { role: "user", content: toolResults },
      ];

      setActiveTools([]);
    }

    setLoading(false);
    setActiveTools([]);
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div style={{ height: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "'Inter', -apple-system, sans-serif", color: TEXT }}>
      <style>{`
        @keyframes swBounce { 0%,80%,100%{transform:scale(0.5);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes swFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderBottom: `1px solid ${BORDER}`, background: SURFACE, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: SWIGGY_ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🍊</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Swiggy Agent</div>
          <div style={{ fontSize: 11, color: MUTED }}>Food · Instamart · Dineout</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3ECF8E" }} />
          <span style={{ fontSize: 11, color: MUTED }}>Live</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
        {isEmpty && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ fontSize: 44 }}>🍱</div>
            <div style={{ fontSize: 21, fontWeight: 700 }}>What can I order for you?</div>
            <div style={{ fontSize: 13, color: MUTED, textAlign: "center", maxWidth: 300 }}>
              Food delivery, groceries in 10 min, or a restaurant table — powered by Swiggy MCP tools.
            </div>
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 420 }}>
              {QUICK.map(q => <Chip key={q} label={q} onClick={() => runAgent(q)} />)}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}

        {loading && activeTools.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start", marginBottom: 8 }}>
            {activeTools.map((t, i) => <ToolBadge key={i} name={t} done={false} />)}
          </div>
        )}

        {loading && activeTools.length === 0 && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "8px 14px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: "4px 18px 18px 18px" }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!isEmpty && (
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
          {QUICK.map(q => <Chip key={q} label={q} onClick={() => runAgent(q)} />)}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${BORDER}`, background: SURFACE, flexShrink: 0 }}>
        {error && (
          <div style={{ padding: "8px 12px", background: "#1A0808", border: "1px solid #3A1515", borderRadius: 8, fontSize: 12, color: "#FF8080", marginBottom: 8 }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runAgent(); } }}
            placeholder="Order food, shop groceries, book a table…"
            disabled={loading}
            rows={1}
            style={{
              flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: "11px 14px", color: TEXT, fontSize: 14, resize: "none",
              outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100,
            }}
            onFocus={e => e.target.style.borderColor = SWIGGY_ORANGE}
            onBlur={e => e.target.style.borderColor = BORDER}
          />
          <button
            onClick={() => runAgent()}
            disabled={loading || !input.trim()}
            style={{
              width: 42, height: 42, borderRadius: 12, border: "none", fontSize: 18,
              background: (loading || !input.trim()) ? "#222" : SWIGGY_ORANGE,
              color: "#fff", cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            {loading ? "⏳" : "↑"}
          </button>
        </div>
        <div style={{ marginTop: 7, fontSize: 11, color: "#333", textAlign: "center" }}>
          Swiggy Builders Club · 13 MCP tools · github.com/durvesh1992/swiggy-mcp-agent
        </div>
      </div>
    </div>
  );
}

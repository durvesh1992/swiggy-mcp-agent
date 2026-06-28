import { useState, useRef, useEffect } from "react";

const ORANGE = "#FF5200";
const BG = "#0D0D0D";
const SURFACE = "#161616";
const CARD = "#1E1E1E";
const BORDER = "#2A2A2A";
const TEXT = "#F0EDE8";
const MUTED = "#888";

// Simulated Swiggy data — replace with real MCP calls (mcp.swiggy.com) when you have Builders Club creds
const MOCK_DB = {
  addresses: [
    { id: "addr_01", label: "Home", line: "42, Powai Lake Drive, Hiranandani Gardens, Mumbai 400076" },
    { id: "addr_02", label: "Work", line: "Bandra Kurla Complex, Mumbai 400051" },
  ],
  restaurants: {
    biryani: [
      { id: "r1", name: "Behrouz Biryani", cuisine: "Mughlai", rating: 4.4, time: "30-35 min", distance: "1.2 km", minOrder: 199 },
      { id: "r2", name: "Paradise Biryani", cuisine: "Hyderabadi", rating: 4.3, time: "40-45 min", distance: "2.8 km", minOrder: 149 },
      { id: "r3", name: "Dum Biryani House", cuisine: "Awadhi", rating: 4.2, time: "25-30 min", distance: "0.8 km", minOrder: 149 },
    ],
    pizza: [
      { id: "r4", name: "Pizza Hut", cuisine: "Italian", rating: 4.0, time: "35-40 min", distance: "1.8 km", minOrder: 299 },
      { id: "r5", name: "Dominos", cuisine: "Italian", rating: 4.1, time: "25-30 min", distance: "0.9 km", minOrder: 199 },
    ],
    default: [
      { id: "r6", name: "The Local Kitchen", cuisine: "Multi-cuisine", rating: 4.2, time: "30-35 min", distance: "1.5 km", minOrder: 149 },
      { id: "r7", name: "Spice Garden", cuisine: "Indian", rating: 4.0, time: "40-45 min", distance: "2.1 km", minOrder: 99 },
    ],
  },
  menus: {
    r1: [
      { id: "i1", name: "Chicken Biryani", price: 349 },
      { id: "i2", name: "Mutton Biryani", price: 449 },
      { id: "i3", name: "Veg Biryani", price: 249 },
      { id: "i4", name: "Raita", price: 59 },
    ],
  },
  products: {
    milk: [
      { id: "p1", name: "Amul Full Cream Milk 1L", price: 68, brand: "Amul" },
      { id: "p2", name: "Mother Dairy Toned Milk 500ml", price: 31, brand: "Mother Dairy" },
    ],
    eggs: [
      { id: "p3", name: "Farm Fresh Eggs 6 pack", price: 72, brand: "Suguna" },
      { id: "p4", name: "Organic Brown Eggs 12 pack", price: 158, brand: "Keggfarms" },
    ],
    bread: [
      { id: "p5", name: "Britannia Brown Bread 400g", price: 45, brand: "Britannia" },
    ],
  },
  dineout: [
    { id: "d1", name: "Pali Village Cafe", cuisine: "Continental", rating: 4.5, cost2: 1200, distance: "1.4 km", perks: "Outdoor seating · Live music Fri-Sat" },
    { id: "d2", name: "Bastian", cuisine: "Seafood, American", rating: 4.7, cost2: 2500, distance: "3.1 km", perks: "Cocktail bar · Romantic" },
    { id: "d3", name: "Hitchki", cuisine: "Indian Fusion", rating: 4.3, cost2: 1500, distance: "2.0 km", perks: "Quirky decor · Bollywood theme" },
  ],
  slots: ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"],
};

function buildSystemPrompt() {
  return `You are Swiggy's AI commerce agent. You help users order food, shop groceries on Instamart, and book restaurant tables via Dineout.

You have access to the following live Swiggy data (treat this as real):

SAVED ADDRESSES:
${MOCK_DB.addresses.map(a => `- ${a.label}: ${a.line}`).join("\n")}

RESTAURANT DATA (Food delivery):
Biryani: ${JSON.stringify(MOCK_DB.restaurants.biryani)}
Pizza: ${JSON.stringify(MOCK_DB.restaurants.pizza)}
General: ${JSON.stringify(MOCK_DB.restaurants.default)}

MENU (Behrouz Biryani): ${JSON.stringify(MOCK_DB.menus.r1)}

INSTAMART PRODUCTS:
Milk: ${JSON.stringify(MOCK_DB.products.milk)}
Eggs: ${JSON.stringify(MOCK_DB.products.eggs)}
Bread: ${JSON.stringify(MOCK_DB.products.bread)}

DINEOUT RESTAURANTS: ${JSON.stringify(MOCK_DB.dineout)}
AVAILABLE SLOTS: ${JSON.stringify(MOCK_DB.slots)}

RULES:
- Be conversational and concise. Use ₹ for prices.
- When searching food, always confirm the address first (Home or Work).
- Show restaurant options with rating, delivery time, distance.
- When user picks something, show item + price and ask to confirm before "placing order".
- For groceries, show product + price, confirm before "checking out".
- For dineout, show restaurant options, ask date/guests, show slots, confirm before "booking".
- After confirming, generate a realistic order ID and say it's placed.
- COD only (Cash on Delivery). Food cart cap ₹1000.
- Never break character. You are a real Swiggy agent.
- Keep replies short — 3-8 lines max unless showing a menu/list.
- Use emojis sparingly for warmth.`;
}

const QUICK = [
  "Order biryani near me 🍱",
  "Get milk & eggs on Instamart 🛒",
  "Book a table for 2 tonight 🍽️",
  "What restaurants are open?",
  "Track my last order 🚴",
  "Show me Instamart deals",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 4px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: ORANGE,
          animation: `swBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      marginBottom: 14, animation: "swFade 0.2s ease",
    }}>
      <div style={{
        maxWidth: "84%", padding: "10px 14px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        background: isUser ? ORANGE : CARD,
        color: isUser ? "#fff" : TEXT,
        fontSize: 14, lineHeight: 1.65,
        border: isUser ? "none" : `1px solid ${BORDER}`,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function Chip({ label, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "7px 13px", borderRadius: 20, whiteSpace: "nowrap",
        border: `1px solid ${h ? ORANGE : BORDER}`,
        background: CARD, color: h ? ORANGE : TEXT,
        fontSize: 12, cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

export default function SwiggyAgent() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(userText) {
    const text = (userText || input).trim();
    if (!text || loading) return;
    setInput(""); setError(null);

    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    const newHistory = [...history, userMsg];
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: newHistory,
        }),
      });

      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); }
      catch { setError(`Unexpected response (${res.status}): ${raw.slice(0, 100)}`); setLoading(false); return; }

      if (data.error) { setError(`${data.error.type}: ${data.error.message}`); setLoading(false); return; }

      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n").trim() || "(no response)";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      setHistory([...newHistory, assistantMsg]);
    } catch (e) {
      setError(`Network error: ${e.message}`);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div style={{ height: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "'Inter', -apple-system, sans-serif", color: TEXT }}>
      <style>{`
        @keyframes swBounce { 0%,80%,100%{transform:scale(0.5);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes swFade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderBottom: `1px solid ${BORDER}`, background: SURFACE, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍊</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Swiggy Agent</div>
          <div style={{ fontSize: 11, color: MUTED }}>Food · Instamart · Dineout</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3ECF8E" }} />
          <span style={{ fontSize: 11, color: MUTED }}>Live</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
        {isEmpty && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, animation: "swFade 0.4s ease" }}>
            <div style={{ fontSize: 48 }}>🍱</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>What can I get you?</div>
            <div style={{ fontSize: 13, color: MUTED, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
              Food, groceries in 10 min, or a restaurant table — all via Swiggy MCP.
            </div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 360 }}>
              {QUICK.map(q => <Chip key={q} label={q} onClick={() => send(q)} />)}
            </div>
          </div>
        )}

        {messages.map((m, i) => <Message key={i} msg={m} />)}

        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "6px 14px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: "4px 18px 18px 18px" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      {!isEmpty && (
        <div style={{ padding: "0 14px 8px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
          {QUICK.map(q => <Chip key={q} label={q} onClick={() => send(q)} />)}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${BORDER}`, background: SURFACE, flexShrink: 0 }}>
        {error && (
          <div style={{ padding: "8px 12px", marginBottom: 8, borderRadius: 8, background: "#1A0808", border: "1px solid #3A1515", fontSize: 12, color: "#FF8080" }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Order food, shop groceries, book a table…"
            disabled={loading} rows={1}
            style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 14px", color: TEXT, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100 }}
            onFocus={e => e.target.style.borderColor = ORANGE}
            onBlur={e => e.target.style.borderColor = BORDER}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            style={{ width: 42, height: 42, borderRadius: 12, border: "none", fontSize: 18, background: (loading || !input.trim()) ? "#222" : ORANGE, color: "#fff", cursor: (loading || !input.trim()) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
            {loading ? "⏳" : "↑"}
          </button>
        </div>
        <div style={{ marginTop: 7, fontSize: 11, color: "#2a2a2a", textAlign: "center" }}>
          Swiggy Builders Club · github.com/durvesh1992/swiggy-mcp-agent
        </div>
      </div>
    </div>
  );
}

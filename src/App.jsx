import { useState, useRef, useEffect } from "react";

const SWIGGY_ORANGE = "#FF5200";
const BG = "#0D0D0D";
const SURFACE = "#161616";
const CARD = "#1E1E1E";
const BORDER = "#2A2A2A";
const TEXT = "#F0EDE8";
const MUTED = "#888";

const SWIGGY_TOOLS = [
  { name: "get_addresses", description: "Get the user's saved delivery addresses.", input_schema: { type: "object", properties: {}, required: [] } },
  { name: "search_restaurants", description: "Search food delivery restaurants near a given address.", input_schema: { type: "object", properties: { addressId: { type: "string" }, query: { type: "string" } }, required: ["addressId", "query"] } },
  { name: "get_restaurant_menu", description: "Get menu for a specific restaurant.", input_schema: { type: "object", properties: { restaurantId: { type: "string" } }, required: ["restaurantId"] } },
  { name: "update_food_cart", description: "Add or update items in the food cart.", input_schema: { type: "object", properties: { restaurantId: { type: "string" }, items: { type: "array", items: { type: "object", properties: { itemId: { type: "string" }, quantity: { type: "number" }, name: { type: "string" }, price: { type: "number" } } } } }, required: ["restaurantId", "items"] } },
  { name: "get_food_cart", description: "Get current food cart contents and total.", input_schema: { type: "object", properties: {}, required: [] } },
  { name: "place_food_order", description: "Place the food order. Only call after explicit user confirmation.", input_schema: { type: "object", properties: { paymentMethod: { type: "string", enum: ["COD"] } }, required: ["paymentMethod"] } },
  { name: "track_food_order", description: "Track a food delivery order.", input_schema: { type: "object", properties: { orderId: { type: "string" } }, required: ["orderId"] } },
  { name: "search_products", description: "Search grocery products on Swiggy Instamart.", input_schema: { type: "object", properties: { addressId: { type: "string" }, query: { type: "string" } }, required: ["addressId", "query"] } },
  { name: "update_instamart_cart", description: "Add or update grocery items in the Instamart cart.", input_schema: { type: "object", properties: { items: { type: "array", items: { type: "object", properties: { spinId: { type: "string" }, quantity: { type: "number" }, name: { type: "string" }, price: { type: "number" } } } } }, required: ["items"] } },
  { name: "instamart_checkout", description: "Checkout Instamart grocery cart. Only call after explicit user confirmation.", input_schema: { type: "object", properties: { paymentMethod: { type: "string", enum: ["COD"] } }, required: ["paymentMethod"] } },
  { name: "search_restaurants_dineout", description: "Search restaurants on Swiggy Dineout for table booking.", input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
  { name: "get_available_slots", description: "Get available time slots for table booking.", input_schema: { type: "object", properties: { restaurantId: { type: "string" }, date: { type: "string" }, guestCount: { type: "number" } }, required: ["restaurantId", "date", "guestCount"] } },
  { name: "book_table", description: "Book a table. Only call after explicit user confirmation.", input_schema: { type: "object", properties: { restaurantId: { type: "string" }, slotId: { type: "number" }, itemId: { type: "string" }, reservationTime: { type: "number" }, guestCount: { type: "number" } }, required: ["restaurantId", "slotId", "itemId", "reservationTime", "guestCount"] } },
];

function simulateTool(name, args) {
  switch (name) {
    case "get_addresses":
      return { success: true, data: [
        { id: "addr_home_01", label: "Home", addressLine: "42, Powai Lake Drive, Hiranandani Gardens, Mumbai 400076" },
        { id: "addr_work_02", label: "Work", addressLine: "Bandra Kurla Complex, Mumbai 400051" },
      ]};
    case "search_restaurants": {
      const q = (args.query || "").toLowerCase();
      if (q.includes("biryani")) return { success: true, data: { restaurants: [
        { id: "rest_bb_01", name: "Behrouz Biryani", cuisine: "Mughlai", rating: 4.4, deliveryTime: "30-35 min", distance: "1.2 km", availabilityStatus: "OPEN", minOrder: 199 },
        { id: "rest_pb_02", name: "Paradise Biryani", cuisine: "Hyderabadi", rating: 4.3, deliveryTime: "40-45 min", distance: "2.8 km", availabilityStatus: "OPEN", minOrder: 149 },
        { id: "rest_db_03", name: "Dum Biryani House", cuisine: "Awadhi", rating: 4.2, deliveryTime: "25-30 min", distance: "0.8 km", availabilityStatus: "OPEN", minOrder: 149 },
      ]}};
      if (q.includes("pizza")) return { success: true, data: { restaurants: [
        { id: "rest_pz_01", name: "Pizza Hut", cuisine: "Italian", rating: 4.0, deliveryTime: "35-40 min", distance: "1.8 km", availabilityStatus: "OPEN", minOrder: 299 },
        { id: "rest_dp_02", name: "Dominos Pizza", cuisine: "Italian", rating: 4.1, deliveryTime: "25-30 min", distance: "0.9 km", availabilityStatus: "OPEN", minOrder: 199 },
      ]}};
      return { success: true, data: { restaurants: [
        { id: "rest_gen_01", name: "The Local Kitchen", cuisine: "Multi-cuisine", rating: 4.2, deliveryTime: "30-35 min", distance: "1.5 km", availabilityStatus: "OPEN", minOrder: 149 },
        { id: "rest_gen_02", name: "Spice Garden", cuisine: "Indian", rating: 4.0, deliveryTime: "40-45 min", distance: "2.1 km", availabilityStatus: "OPEN", minOrder: 99 },
      ]}};
    }
    case "get_restaurant_menu":
      return { success: true, data: { restaurantId: args.restaurantId, categories: [
        { name: "Biryanis", items: [
          { id: "item_cb_01", name: "Chicken Biryani", price: 349, description: "Slow-cooked with aromatic spices" },
          { id: "item_mb_02", name: "Mutton Biryani", price: 449, description: "Tender mutton, saffron-infused" },
          { id: "item_vb_03", name: "Veg Biryani", price: 249, description: "Garden-fresh vegetables, basmati rice" },
        ]},
        { name: "Sides", items: [
          { id: "item_ra_04", name: "Raita", price: 59 },
          { id: "item_sh_05", name: "Salan", price: 79 },
        ]},
      ]}};
    case "update_food_cart":
      return { success: true, data: { message: "Cart updated", itemCount: args.items?.length || 1 } };
    case "get_food_cart":
      return { success: true, data: { items: [{ name: "Chicken Biryani", quantity: 1, price: 349 }, { name: "Raita", quantity: 1, price: 59 }], subtotal: 408, deliveryFee: 40, total: 448, restaurant: "Behrouz Biryani" } };
    case "place_food_order":
      return { success: true, data: { orderId: "SWG" + Math.floor(Math.random() * 9000000 + 1000000), status: "CONFIRMED", estimatedDelivery: "35-40 min", message: "Order placed!" } };
    case "track_food_order":
      return { success: true, data: { orderId: args.orderId, status: "OUT_FOR_DELIVERY", deliveryPartner: "Raju K.", eta: "12 minutes", steps: ["Order confirmed", "Preparing food", "Out for delivery"] } };
    case "search_products": {
      const q = (args.query || "").toLowerCase();
      const products = [];
      if (q.includes("milk") || q.includes("grocer")) { products.push({ spinId: "spn_milk_01", name: "Amul Full Cream Milk 1L", price: 68, brand: "Amul", inStock: true }); products.push({ spinId: "spn_milk_02", name: "Mother Dairy Toned Milk 500ml", price: 31, brand: "Mother Dairy", inStock: true }); }
      if (q.includes("egg") || q.includes("grocer")) { products.push({ spinId: "spn_egg_01", name: "Farm Fresh Eggs 6 pack", price: 72, brand: "Suguna", inStock: true }); products.push({ spinId: "spn_egg_02", name: "Organic Brown Eggs 12 pack", price: 158, brand: "Keggfarms", inStock: true }); }
      if (!products.length) products.push({ spinId: "spn_gen_01", name: args.query, price: 99, brand: "Generic", inStock: true });
      return { success: true, data: { products } };
    }
    case "update_instamart_cart":
      return { success: true, data: { message: "Grocery cart updated", itemCount: args.items?.length || 1 } };
    case "instamart_checkout":
      return { success: true, data: { orderId: "IM" + Math.floor(Math.random() * 9000000 + 1000000), status: "CONFIRMED", estimatedDelivery: "10-15 min", message: "Groceries on their way!" } };
    case "search_restaurants_dineout":
      return { success: true, data: { restaurants: [
        { id: "din_01", name: "Pali Village Cafe", cuisine: "Continental", rating: 4.5, costForTwo: 1200, distance: "1.4 km", highlights: ["Outdoor seating", "Live music Fri-Sat"], availabilityStatus: "AVAILABLE" },
        { id: "din_02", name: "Bastian", cuisine: "Seafood, American", rating: 4.7, costForTwo: 2500, distance: "3.1 km", highlights: ["Cocktail bar", "Romantic"], availabilityStatus: "AVAILABLE" },
        { id: "din_03", name: "Hitchki", cuisine: "Indian Fusion", rating: 4.3, costForTwo: 1500, distance: "2.0 km", highlights: ["Quirky decor", "Bollywood theme"], availabilityStatus: "AVAILABLE" },
      ]}};
    case "get_available_slots":
      return { success: true, data: { slots: [
        { slotId: 1001, displayTime: "7:00 PM", reservationTime: 1751040000, itemId: "din_ticket_1", bookingPrice: 0 },
        { slotId: 1002, displayTime: "7:30 PM", reservationTime: 1751041800, itemId: "din_ticket_2", bookingPrice: 0 },
        { slotId: 1003, displayTime: "8:00 PM", reservationTime: 1751043600, itemId: "din_ticket_3", bookingPrice: 0 },
      ]}};
    case "book_table":
      return { success: true, data: { bookingId: "DIN" + Math.floor(Math.random() * 900000 + 100000), status: "CONFIRMED", message: "Table booked! Confirmation sent to your Swiggy account." } };
    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

const TOOL_LABELS = {
  get_addresses: "📍 Fetching addresses", search_restaurants: "🔍 Searching restaurants",
  get_restaurant_menu: "📋 Loading menu", update_food_cart: "🛒 Adding to cart",
  get_food_cart: "🛒 Checking cart", place_food_order: "✅ Placing order",
  track_food_order: "🚴 Tracking order", search_products: "🛒 Searching Instamart",
  update_instamart_cart: "🛒 Updating cart", instamart_checkout: "✅ Checkout",
  search_restaurants_dineout: "🍽️ Finding restaurants", get_available_slots: "🕐 Checking slots",
  book_table: "📅 Booking table",
};

const QUICK = ["Order biryani near me","Get milk & eggs on Instamart","Book a table for 2 tonight","What's in my cart?","Track my last order","Find Italian restaurants"];
const SYSTEM = `You are Swiggy's AI commerce agent with tools for Food delivery, Instamart grocery delivery, and Dineout restaurant booking.
Rules:
- Always call get_addresses first before searching food or groceries
- Only recommend restaurants with availabilityStatus OPEN or AVAILABLE
- ALWAYS show the total and confirm with user before placing any order or booking
- COD only, food cart cap ₹1000
- Use ₹ for prices, be concise and friendly
- Treat all tool responses as real live Swiggy data`;

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 4px" }}>
      {[0,1,2].map(i => <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:SWIGGY_ORANGE, animation:`swBounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
    </div>
  );
}

function ToolBadge({ name, done }) {
  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:done?"#0F2A1A":"#1A1A1A",border:`1px solid ${done?"#1E5C38":BORDER}`,fontSize:11,color:done?"#3ECF8E":MUTED,marginBottom:4,fontFamily:"monospace",transition:"all 0.3s" }}>
      <div style={{ width:6,height:6,borderRadius:"50%",background:done?"#3ECF8E":SWIGGY_ORANGE,animation:done?"none":"swBounce 1.2s ease-in-out infinite" }} />
      {TOOL_LABELS[name] || `⚙️ ${name}`}{done && " ✓"}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",marginBottom:16,animation:"swFadeIn 0.25s ease" }}>
      {!isUser && msg.toolCalls?.length > 0 && (
        <div style={{ marginBottom:6,display:"flex",flexDirection:"column",gap:3,alignItems:"flex-start" }}>
          {msg.toolCalls.map((tc,i) => <ToolBadge key={i} name={tc.name} done />)}
        </div>
      )}
      {msg.content && (
        <div style={{ maxWidth:"82%",padding:"11px 15px",borderRadius:isUser?"18px 18px 4px 18px":"4px 18px 18px 18px",background:isUser?SWIGGY_ORANGE:CARD,color:isUser?"#fff":TEXT,fontSize:14,lineHeight:1.65,border:isUser?"none":`1px solid ${BORDER}`,whiteSpace:"pre-wrap",wordBreak:"break-word" }}>
          {msg.content}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onClick }) {
  const [h, setH] = useState(false);
  return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ padding:"7px 13px",borderRadius:20,whiteSpace:"nowrap",border:`1px solid ${h?SWIGGY_ORANGE:BORDER}`,background:CARD,color:h?SWIGGY_ORANGE:TEXT,fontSize:12,cursor:"pointer",transition:"all 0.15s" }}>{label}</button>;
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
    const text = (userText || input).trim();
    if (!text || loading) return;
    setInput(""); setError(null);
    setMessages(prev => [...prev, { role:"user", content:text }]);
    const newHistory = [...apiHistory, { role:"user", content:text }];
    setLoading(true); setActiveTools([]);
    let currentHistory = newHistory;
    const allToolCalls = [];

    for (let turn = 0; turn < 8; turn++) {
      let data;
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, system:SYSTEM, tools:SWIGGY_TOOLS, messages:currentHistory }),
        });
        const raw = await res.text();
        try { data = JSON.parse(raw); }
        catch { setError(`HTTP ${res.status}: ${raw.slice(0,120)}`); break; }
      } catch(e) { setError(`Fetch: ${e.message}`); break; }

      if (data.error) { setError(`${data.error.type}: ${data.error.message}`); break; }
      if (!Array.isArray(data.content)) { setError(`Bad shape: ${JSON.stringify(data).slice(0,120)}`); break; }

      const toolBlocks = data.content.filter(b => b.type === "tool_use");
      const textContent = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      const thisTools = toolBlocks.map(b => ({ name:b.name, input:b.input }));
      if (toolBlocks.length > 0) { setActiveTools(thisTools.map(t => t.name)); allToolCalls.push(...thisTools); }

      if (data.stop_reason === "end_turn" || toolBlocks.length === 0) {
        if (textContent) setMessages(prev => [...prev, { role:"assistant", content:textContent, toolCalls:allToolCalls.length>0?[...allToolCalls]:undefined }]);
        setApiHistory([...currentHistory, { role:"assistant", content:data.content }]);
        break;
      }

      const toolResults = toolBlocks.map(block => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(simulateTool(block.name, block.input)),
      }));
      currentHistory = [...currentHistory, { role:"assistant", content:data.content }, { role:"user", content:toolResults }];
      setActiveTools([]);
    }
    setLoading(false); setActiveTools([]); inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div style={{ height:"100vh",background:BG,display:"flex",flexDirection:"column",fontFamily:"'Inter',-apple-system,sans-serif",color:TEXT }}>
      <style>{`
        @keyframes swBounce{0%,80%,100%{transform:scale(0.5);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes swFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
      `}</style>

      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"13px 18px",borderBottom:`1px solid ${BORDER}`,background:SURFACE,flexShrink:0 }}>
        <div style={{ width:34,height:34,borderRadius:9,background:SWIGGY_ORANGE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🍊</div>
        <div>
          <div style={{ fontWeight:700,fontSize:14 }}>Swiggy Agent</div>
          <div style={{ fontSize:11,color:MUTED }}>Food · Instamart · Dineout</div>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#3ECF8E" }} />
          <span style={{ fontSize:11,color:MUTED }}>Live</span>
        </div>
      </div>

      <div style={{ flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column" }}>
        {isEmpty && (
          <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,animation:"swFadeIn 0.4s ease" }}>
            <div style={{ fontSize:48 }}>🍱</div>
            <div style={{ fontSize:20,fontWeight:700 }}>What can I order for you?</div>
            <div style={{ fontSize:13,color:MUTED,textAlign:"center",maxWidth:300,lineHeight:1.6 }}>Food delivery, groceries in 10 min, or a restaurant table — all via Swiggy MCP.</div>
            <div style={{ marginTop:12,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",maxWidth:380 }}>
              {QUICK.map(q => <Chip key={q} label={q} onClick={() => runAgent(q)} />)}
            </div>
          </div>
        )}
        {messages.map((msg,i) => <Message key={i} msg={msg} />)}
        {loading && activeTools.length > 0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:3,alignItems:"flex-start",marginBottom:8 }}>
            {activeTools.map((t,i) => <ToolBadge key={i} name={t} done={false} />)}
          </div>
        )}
        {loading && activeTools.length === 0 && (
          <div style={{ display:"flex" }}>
            <div style={{ padding:"6px 14px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:"4px 18px 18px 18px" }}><TypingDots /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!isEmpty && (
        <div style={{ padding:"0 14px 8px",display:"flex",gap:8,overflowX:"auto",flexShrink:0,scrollbarWidth:"none" }}>
          {QUICK.map(q => <Chip key={q} label={q} onClick={() => runAgent(q)} />)}
        </div>
      )}

      <div style={{ padding:"10px 14px 14px",borderTop:`1px solid ${BORDER}`,background:SURFACE,flexShrink:0 }}>
        {error && <div style={{ padding:"8px 12px",marginBottom:8,borderRadius:8,background:"#1A0808",border:"1px solid #3A1515",fontSize:12,color:"#FF8080" }}>⚠️ {error}</div>}
        <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
          <textarea
            ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();runAgent();} }}
            placeholder="Order food, shop groceries, book a table…"
            disabled={loading} rows={1}
            style={{ flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:"11px 14px",color:TEXT,fontSize:14,resize:"none",outline:"none",fontFamily:"inherit",lineHeight:1.5,maxHeight:100 }}
            onFocus={e=>e.target.style.borderColor=SWIGGY_ORANGE}
            onBlur={e=>e.target.style.borderColor=BORDER}
          />
          <button onClick={() => runAgent()} disabled={loading||!input.trim()}
            style={{ width:42,height:42,borderRadius:12,border:"none",fontSize:18,background:(loading||!input.trim())?"#222":SWIGGY_ORANGE,color:"#fff",cursor:(loading||!input.trim())?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.15s" }}>
            {loading?"⏳":"↑"}
          </button>
        </div>
        <div style={{ marginTop:7,fontSize:11,color:"#333",textAlign:"center" }}>Swiggy Builders Club · 13 MCP tools · github.com/durvesh1992/swiggy-mcp-agent</div>
      </div>
    </div>
  );
}

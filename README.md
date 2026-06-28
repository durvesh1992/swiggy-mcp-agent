# 🍊 Swiggy MCP Agent

An AI-powered conversational agent built on top of [Swiggy Builders Club](https://mcp.swiggy.com/builders) MCP servers — Food delivery, Instamart groceries, and Dineout table booking — all in one chat interface powered by Claude.

![Swiggy MCP Agent](https://img.shields.io/badge/Swiggy-Builders%20Club-FF5200?style=for-the-badge)
![Claude](https://img.shields.io/badge/Claude-claude--sonnet--4--6-blueviolet?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge)

## ✨ What it does

- 🍱 **Food delivery** — search restaurants, browse menus, manage cart, place orders, track delivery
- 🛒 **Instamart** — search groceries, add to cart, checkout (10–15 min delivery)
- 🍽️ **Dineout** — find restaurants, check availability slots, book tables

All flows are agentic — Claude calls the right tools in the right order automatically.

## 🏗️ Architecture

```
User message
    ↓
Claude (claude-sonnet-4-6) + SWIGGY_TOOLS definitions
    ↓
Tool use loop (up to 8 turns)
    ↓
simulateTool() → mock Swiggy API responses (dev mode)
    ↓  swap this ↑ with real MCP calls once you have Builders Club creds
Claude final response
    ↓
Chat UI
```

## 🚀 Getting started

```bash
git clone https://github.com/durvesh1992/swiggy-mcp-agent
cd swiggy-mcp-agent
npm install
npm run dev
```

Open http://localhost:5173 — no API key needed for the mock mode.

To connect to Claude, set your API key via a proxy or Vite env:
```bash
VITE_ANTHROPIC_API_KEY=your_key npm run dev
```

## 🔌 Connecting to real Swiggy MCP servers

Apply for Swiggy Builders Club credentials at **mcp.swiggy.com/builders**.

Once approved, replace `simulateTool()` in `src/mockData.js` with real MCP calls:

```js
// MCP server endpoints (require OAuth credentials from Builders Club)
const MCP = {
  food:      "https://mcp.swiggy.com/food",
  instamart: "https://mcp.swiggy.com/im",
  dineout:   "https://mcp.swiggy.com/dineout",
};

// Or pass them directly to the Anthropic API via mcp_servers param (server-side only):
mcp_servers: [
  { type: "url", url: MCP.food,      name: "swiggy-food"      },
  { type: "url", url: MCP.instamart, name: "swiggy-instamart" },
  { type: "url", url: MCP.dineout,   name: "swiggy-dineout"   },
]
```

## 📁 Structure

```
swiggy-mcp-agent/
├── src/
│   ├── App.jsx        # Main chat UI + agentic loop
│   ├── tools.js       # Swiggy MCP tool definitions (Anthropic tools format)
│   ├── mockData.js    # Simulated Swiggy API responses for local dev
│   └── main.jsx       # React entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ Tools implemented

| Tool | Server | Description |
|------|--------|-------------|
| `get_addresses` | Food/IM | Fetch saved delivery addresses |
| `search_restaurants` | Food | Search restaurants by query + address |
| `get_restaurant_menu` | Food | Get menu for a restaurant |
| `update_food_cart` | Food | Add/update items in cart |
| `get_food_cart` | Food | Get cart contents + total |
| `place_food_order` | Food | Place order (COD) |
| `track_food_order` | Food | Track delivery status |
| `search_products` | Instamart | Search grocery products |
| `update_instamart_cart` | Instamart | Add/update grocery cart |
| `instamart_checkout` | Instamart | Checkout groceries (COD) |
| `search_restaurants_dineout` | Dineout | Find dine-in restaurants |
| `get_available_slots` | Dineout | Check booking availability |
| `book_table` | Dineout | Confirm table reservation |

## 🔮 What to build next

- **🧠 mem0 integration** — persistent user preferences (dietary restrictions, favourite restaurants, order history)
- **👥 Office lunch coordinator** — multi-user order consolidation
- **🥘 Pantry AI** — infer what you're running low on and auto-draft Instamart orders
- **📊 Spend tracker** — categorise Swiggy spend and suggest cheaper alternatives

## 📄 License

MIT — fork freely, build something cool, apply to [Swiggy Builders Club](https://mcp.swiggy.com/builders).

---

Built by [@durvesh1992](https://github.com/durvesh1992) · Powered by Swiggy Builders Club + Anthropic Claude

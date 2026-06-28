// Swiggy MCP Tool Definitions
// These match the Swiggy Builders Club MCP server schemas exactly.
// Swap simulateTool() in agent.js with real fetch calls to:
//   Food:       https://mcp.swiggy.com/food
//   Instamart:  https://mcp.swiggy.com/im
//   Dineout:    https://mcp.swiggy.com/dineout

export const SWIGGY_TOOLS = [
  {
    name: "get_addresses",
    description: "Get the user's saved delivery addresses.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "search_restaurants",
    description: "Search food delivery restaurants near a given address.",
    input_schema: {
      type: "object",
      properties: {
        addressId: { type: "string", description: "Address ID from get_addresses" },
        query: { type: "string", description: "Cuisine, dish, or restaurant name" },
      },
      required: ["addressId", "query"],
    },
  },
  {
    name: "get_restaurant_menu",
    description: "Get menu for a specific restaurant.",
    input_schema: {
      type: "object",
      properties: { restaurantId: { type: "string" } },
      required: ["restaurantId"],
    },
  },
  {
    name: "update_food_cart",
    description: "Add or update items in the food cart.",
    input_schema: {
      type: "object",
      properties: {
        restaurantId: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              itemId: { type: "string" },
              quantity: { type: "number" },
              name: { type: "string" },
              price: { type: "number" },
            },
          },
        },
      },
      required: ["restaurantId", "items"],
    },
  },
  {
    name: "get_food_cart",
    description: "Get current food cart contents and total.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "place_food_order",
    description: "Place the food order. Only call after explicit user confirmation.",
    input_schema: {
      type: "object",
      properties: {
        paymentMethod: { type: "string", enum: ["COD"] },
      },
      required: ["paymentMethod"],
    },
  },
  {
    name: "track_food_order",
    description: "Track a food delivery order.",
    input_schema: {
      type: "object",
      properties: { orderId: { type: "string" } },
      required: ["orderId"],
    },
  },
  {
    name: "search_products",
    description: "Search grocery products on Swiggy Instamart.",
    input_schema: {
      type: "object",
      properties: {
        addressId: { type: "string" },
        query: { type: "string" },
      },
      required: ["addressId", "query"],
    },
  },
  {
    name: "update_instamart_cart",
    description: "Add or update grocery items in the Instamart cart.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              spinId: { type: "string" },
              quantity: { type: "number" },
              name: { type: "string" },
              price: { type: "number" },
            },
          },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "instamart_checkout",
    description: "Checkout Instamart grocery cart. Only call after explicit user confirmation.",
    input_schema: {
      type: "object",
      properties: { paymentMethod: { type: "string", enum: ["COD"] } },
      required: ["paymentMethod"],
    },
  },
  {
    name: "search_restaurants_dineout",
    description: "Search restaurants on Swiggy Dineout for table booking.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_available_slots",
    description: "Get available time slots for table booking.",
    input_schema: {
      type: "object",
      properties: {
        restaurantId: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        guestCount: { type: "number" },
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["restaurantId", "date", "guestCount"],
    },
  },
  {
    name: "book_table",
    description: "Book a table. Only call after explicit user confirmation.",
    input_schema: {
      type: "object",
      properties: {
        restaurantId: { type: "string" },
        slotId: { type: "number" },
        itemId: { type: "string" },
        reservationTime: { type: "number" },
        guestCount: { type: "number" },
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["restaurantId", "slotId", "itemId", "reservationTime", "guestCount"],
    },
  },
];

// Mock Swiggy API responses for local development
// Replace calls to simulateTool() with real MCP server calls
// once you have Swiggy Builders Club credentials.
//
// MCP Servers (require OAuth):
//   Food:      https://mcp.swiggy.com/food
//   Instamart: https://mcp.swiggy.com/im
//   Dineout:   https://mcp.swiggy.com/dineout

export function simulateTool(name, args) {
  switch (name) {
    case "get_addresses":
      return {
        success: true,
        data: [
          { id: "addr_home_01", label: "Home", addressLine: "42, Powai Lake Drive, Hiranandani Gardens, Mumbai 400076" },
          { id: "addr_work_02", label: "Work", addressLine: "Bandra Kurla Complex, Mumbai 400051" },
        ],
      };

    case "search_restaurants": {
      const q = (args.query || "").toLowerCase();
      if (q.includes("biryani")) {
        return {
          success: true,
          data: {
            restaurants: [
              { id: "rest_bb_01", name: "Behrouz Biryani", cuisine: "Mughlai", rating: 4.4, deliveryTime: "30-35 min", distance: "1.2 km", availabilityStatus: "OPEN", minOrder: 199 },
              { id: "rest_pb_02", name: "Paradise Biryani", cuisine: "Hyderabadi", rating: 4.3, deliveryTime: "40-45 min", distance: "2.8 km", availabilityStatus: "OPEN", minOrder: 149 },
              { id: "rest_db_03", name: "Dum Biryani House", cuisine: "Awadhi", rating: 4.2, deliveryTime: "25-30 min", distance: "0.8 km", availabilityStatus: "OPEN", minOrder: 149 },
            ],
          },
        };
      }
      if (q.includes("pizza")) {
        return {
          success: true,
          data: {
            restaurants: [
              { id: "rest_pz_01", name: "Pizza Hut", cuisine: "Italian", rating: 4.0, deliveryTime: "35-40 min", distance: "1.8 km", availabilityStatus: "OPEN", minOrder: 299 },
              { id: "rest_dp_02", name: "Domino's Pizza", cuisine: "Italian", rating: 4.1, deliveryTime: "25-30 min", distance: "0.9 km", availabilityStatus: "OPEN", minOrder: 199 },
            ],
          },
        };
      }
      return {
        success: true,
        data: {
          restaurants: [
            { id: "rest_gen_01", name: "The Local Kitchen", cuisine: "Multi-cuisine", rating: 4.2, deliveryTime: "30-35 min", distance: "1.5 km", availabilityStatus: "OPEN", minOrder: 149 },
            { id: "rest_gen_02", name: "Spice Garden", cuisine: "Indian", rating: 4.0, deliveryTime: "40-45 min", distance: "2.1 km", availabilityStatus: "OPEN", minOrder: 99 },
          ],
        },
      };
    }

    case "get_restaurant_menu":
      return {
        success: true,
        data: {
          restaurantId: args.restaurantId,
          categories: [
            {
              name: "Biryanis",
              items: [
                { id: "item_cb_01", name: "Chicken Biryani", price: 349, description: "Slow-cooked with aromatic spices" },
                { id: "item_mb_02", name: "Mutton Biryani", price: 449, description: "Tender mutton, saffron-infused" },
                { id: "item_vb_03", name: "Veg Biryani", price: 249, description: "Garden-fresh vegetables, basmati rice" },
              ],
            },
            {
              name: "Sides",
              items: [
                { id: "item_ra_04", name: "Raita", price: 59 },
                { id: "item_sh_05", name: "Salan", price: 79 },
              ],
            },
          ],
        },
      };

    case "update_food_cart":
      return { success: true, data: { message: "Cart updated", itemCount: args.items?.length || 1 } };

    case "get_food_cart":
      return {
        success: true,
        data: {
          items: [
            { name: "Chicken Biryani", quantity: 1, price: 349 },
            { name: "Raita", quantity: 1, price: 59 },
          ],
          subtotal: 408,
          deliveryFee: 40,
          total: 448,
          restaurant: "Behrouz Biryani",
        },
      };

    case "place_food_order":
      return {
        success: true,
        data: {
          orderId: "SWG" + Math.floor(Math.random() * 9000000 + 1000000),
          status: "CONFIRMED",
          estimatedDelivery: "35-40 min",
          message: "Order placed successfully!",
        },
      };

    case "track_food_order":
      return {
        success: true,
        data: {
          orderId: args.orderId,
          status: "OUT_FOR_DELIVERY",
          deliveryPartner: "Raju K.",
          eta: "12 minutes",
          steps: ["Order confirmed ✓", "Preparing food ✓", "Out for delivery →"],
        },
      };

    case "search_products": {
      const q = (args.query || "").toLowerCase();
      const products = [];
      if (q.includes("milk")) {
        products.push({ spinId: "spn_milk_01", name: "Amul Full Cream Milk 1L", price: 68, brand: "Amul", inStock: true });
        products.push({ spinId: "spn_milk_02", name: "Mother Dairy Toned Milk 500ml", price: 31, brand: "Mother Dairy", inStock: true });
      }
      if (q.includes("egg")) {
        products.push({ spinId: "spn_egg_01", name: "Farm Fresh Eggs (6 pack)", price: 72, brand: "Suguna", inStock: true });
        products.push({ spinId: "spn_egg_02", name: "Organic Brown Eggs (12 pack)", price: 158, brand: "Keggfarms", inStock: true });
      }
      if (q.includes("bread")) {
        products.push({ spinId: "spn_br_01", name: "Britannia Brown Bread 400g", price: 45, brand: "Britannia", inStock: true });
      }
      if (!products.length) {
        products.push({ spinId: "spn_gen_01", name: args.query + " (result)", price: 99, brand: "Generic", inStock: true });
      }
      return { success: true, data: { products } };
    }

    case "update_instamart_cart":
      return { success: true, data: { message: "Grocery cart updated", itemCount: args.items?.length || 1 } };

    case "instamart_checkout":
      return {
        success: true,
        data: {
          orderId: "IM" + Math.floor(Math.random() * 9000000 + 1000000),
          status: "CONFIRMED",
          estimatedDelivery: "10-15 min",
          message: "Groceries on their way!",
        },
      };

    case "search_restaurants_dineout":
      return {
        success: true,
        data: {
          restaurants: [
            { id: "din_01", name: "Pali Village Café", cuisine: "Continental", rating: 4.5, costForTwo: 1200, distance: "1.4 km", highlights: ["Outdoor seating", "Live music Fri-Sat"], availabilityStatus: "AVAILABLE" },
            { id: "din_02", name: "Bastian", cuisine: "Seafood, American", rating: 4.7, costForTwo: 2500, distance: "3.1 km", highlights: ["Cocktail bar", "Romantic"], availabilityStatus: "AVAILABLE" },
            { id: "din_03", name: "Hitchki", cuisine: "Indian Fusion", rating: 4.3, costForTwo: 1500, distance: "2.0 km", highlights: ["Quirky decor", "Bollywood theme"], availabilityStatus: "AVAILABLE" },
          ],
        },
      };

    case "get_available_slots":
      return {
        success: true,
        data: {
          slots: [
            { slotId: 1001, displayTime: "7:00 PM", reservationTime: 1751040000, deals: [{ itemId: "din_ticket_1", slotId: 1001, isFree: true, bookingPrice: 0, title: "Free Table Booking" }] },
            { slotId: 1002, displayTime: "7:30 PM", reservationTime: 1751041800, deals: [{ itemId: "din_ticket_2", slotId: 1002, isFree: true, bookingPrice: 0, title: "Free Table Booking" }] },
            { slotId: 1003, displayTime: "8:00 PM", reservationTime: 1751043600, deals: [{ itemId: "din_ticket_3", slotId: 1003, isFree: true, bookingPrice: 0, title: "Free Table Booking" }] },
          ],
        },
      };

    case "book_table":
      return {
        success: true,
        data: {
          bookingId: "DIN" + Math.floor(Math.random() * 900000 + 100000),
          status: "CONFIRMED",
          message: "Table booked! Confirmation sent to your Swiggy account.",
        },
      };

    default:
      return { success: false, error: { message: `Unknown tool: ${name}` } };
  }
}

export async function callLLM({
  messages,
  tools,
}: {
  messages: Array<{ role: string; content?: string; tool_calls?: any[]; tool_call_id?: string; name?: string }>;
  tools?: any[];
}): Promise<any> {
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  // 1. Try Groq first if key exists
  if (hasGroq && process.env.LLM_PROVIDER !== "gemini") {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.3,
          ...(tools && tools.length > 0 ? { tools, tool_choice: "auto" } : {}),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices?.[0]?.message) {
          return data.choices[0].message;
        }
      }
      console.warn("Groq request was not ok, checking fallback:", await response.text());
    } catch (err) {
      console.error("Groq invocation error:", err);
    }
  }

  // 2. Try Gemini fallback (or primary if LLM_PROVIDER is gemini or Groq failed)
  if (hasGemini) {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages,
          temperature: 0.3,
          ...(tools && tools.length > 0 ? { tools, tool_choice: "auto" } : {}),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices?.[0]?.message) {
          return data.choices[0].message;
        }
      }
      console.warn("Gemini request was not ok:", await response.text());
    } catch (err) {
      console.error("Gemini invocation error:", err);
    }
  }

  throw new Error("No available LLM provider succeeded. Please check GROQ_API_KEY or GEMINI_API_KEY.");
}

export const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add a specific product to the customer's shopping cart.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "The ID of the product to add" },
          quantity: { type: "integer", description: "The quantity to add" },
        },
        required: ["productId", "quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_from_cart",
      description: "Remove a product from the shopping cart.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "The ID of the product to remove" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkout",
      description: "Finalize the order and generate a payment link for the customer.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_product_image",
      description: "Send the product photo directly into the WhatsApp chat. Call this whenever the user asks for pictures/photos, asks to see a product, or inquires about a specific product that has an image available.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "The ID of the product whose image should be sent" },
        },
        required: ["productId"],
      },
    },
  }
];

export function buildSystemPrompt(business: any, products: any[], cart: any[]) {
  const catalog = products
    .map(
      (p) =>
        `- [ID: ${p.id}] ${p.name} | Price: ₦${p.price.toLocaleString()} | In Stock: ${p.stock}${
          p.description ? ` | Description: ${p.description}` : ""
        }${p.imageUrl ? " (Image available - can call send_product_image)" : " (No image)"}`
    )
    .join("\n");

  const cartSummary = cart.length === 0 
    ? "Cart is empty."
    : cart.map((item: any) => `${item.quantity}x ${item.name} (₦${item.price} each)`).join("\n");

  const defaultPersonality = "friendly, helpful, concise, and persuasive sales assistant";
  const personality = business.botPersonality || defaultPersonality;

  return `You are an expert AI sales assistant for the store "${business.name}".
Your goal is to help customers browse products, show product pictures, manage their shopping cart, and complete orders.

STORE INFORMATION:
- Store Name: ${business.name}
- Personality: ${personality}

CATALOG INVENTORY:
${catalog}

CURRENT CUSTOMER CART:
${cartSummary}

RULES:
1. Tone: Adhere strictly to the Personality defined above.
2. WhatsApp Markdown: Use *bold* for product names and prices, _italics_ for emphasis. Never use raw Markdown headers (#) or markdown tables.
3. Pricing & Stock: ONLY recommend products from the catalog above. Never invent products or prices. If stock is 0, mention that it is currently out of stock.
4. Tool Actions:
   - When a user asks for a picture, photo, or wants to see a product (or asks details about a specific product), ALWAYS call \`send_product_image\` with that product's ID if the catalog says (Image available).
   - When a user wants to buy or add an item, ALWAYS call the \`add_to_cart\` tool.
   - When a user wants to remove an item from their cart, call \`remove_from_cart\`.
   - When a user is ready to pay or check out, call \`checkout\`.
5. Conciseness: Keep responses under 3-4 sentences. WhatsApp shoppers love quick, direct answers.
`;
}

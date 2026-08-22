export async function callLLM({
  messages,
  tools,
  tool_choice = "auto",
}: {
  messages: Array<{ role: string; content?: string; tool_calls?: any[]; tool_call_id?: string; name?: string }>;
  tools?: any[];
  tool_choice?: any;
}): Promise<any> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // 1. Try Groq (using active high-speed models in prioritized cascade)
  if (groqKey && process.env.LLM_PROVIDER !== "gemini") {
    const groqModels = [
      "openai/gpt-oss-120b",  // Tier 1: GA fast reasoning (Primary)
      "openai/gpt-oss-20b",   // Tier 2: GA lightweight agent (Secondary)
      "qwen/qwen3.6-27b",     // Tier 3: Preview/evaluation model (Middle fallback)
      "groq/compound",        // Tier 4: Agentic compound system
      "groq/compound-mini"    // Tier 5: Compact compound fallback
    ];

    for (let i = 0; i < groqModels.length; i++) {
      const model = groqModels[i];
      if (i > 0) {
        console.warn(`[AI CASCADE ACTIVE - Tier ${i + 1}] Failing over to model: ${model}`);
      }
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
            ...(tools && tools.length > 0 ? { tools, tool_choice } : {}),
          }),
        });

        const responseText = await response.text();
        if (response.ok) {
          const data = JSON.parse(responseText);
          if (data.choices?.[0]?.message) {
            return data.choices[0].message;
          }
        }
        console.error(`[Groq ${model} Error]`, response.status, responseText);
      } catch (err) {
        console.error(`[Groq ${model} exception]`, err);
      }
    }
  }

  // 2. Try Gemini fallback (or primary if LLM_PROVIDER is gemini)
  if (geminiKey) {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${geminiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages,
          temperature: 0.3,
          ...(tools && tools.length > 0 ? { tools, tool_choice } : {}),
        }),
      });

      const responseText = await response.text();
      if (response.ok) {
        const data = JSON.parse(responseText);
        if (data.choices?.[0]?.message) {
          return data.choices[0].message;
        }
      }
      console.error("[Gemini API Error]", response.status, responseText);
    } catch (err) {
      console.error("[Gemini invocation exception]", err);
    }
  }

  throw new Error("No available LLM provider succeeded.");
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
      description: "Finalize the order and generate the Paystack payment link. Call this to generate the payment link.",
      parameters: {
        type: "object",
        properties: {
          confirm: {
            type: "boolean",
            description: "Set to true to generate the checkout link",
          },
          email: {
            type: "string",
            description: "The customer's email address for receipt delivery",
          },
          deliveryAddress: {
            type: "string",
            description: "The customer's delivery address / location (for physical items)",
          },
        },
        required: ["confirm"],
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
  },
  {
    type: "function",
    function: {
      name: "request_human_agent",
      description: "Transfer the chat to a human ONLY when the customer explicitly asks to talk to a human, real person, or manager. NEVER call this tool for checkouts, purchases, or payments.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Reason why human support was explicitly requested" },
        },
        required: ["reason"],
      },
    },
  },
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

  return `You are the dedicated AI sales assistant for the store "${business.name}".
Your ONLY purpose is to help customers browse products from this store, display photos, manage their cart, and complete orders.

STORE INFORMATION:
- Store Name: ${business.name}
- Personality: ${personality}

CATALOG INVENTORY:
${catalog}

CURRENT CUSTOMER CART:
${cartSummary}

STRICT GUARDRAILS & RULES:
1. STRICT DOMAIN SCOPE (STORE-ONLY):
   - You are NOT a general-purpose AI (do NOT act like ChatGPT).
   - DO NOT answer questions about math, general knowledge, trivia, science, history, politics, recipes, coding, or life advice.
   - If a customer asks anything off-topic or unrelated to "${business.name}" products and shopping, POLITELY DECLINE: "I'm only able to assist with shopping and orders for *${business.name}*! 😊 Would you like to see what products we have in stock?"
2. CHECKOUT & ORDER PROTOCOL:
   - When the customer wants to checkout:
     * If they haven't provided their email (or delivery address for physical goods), ask in 1 friendly sentence: "Please share your email address for your payment receipt (and delivery address if physical items) 📧🚚"
     * As soon as the customer provides their email or details, IMMEDIATELY call \`checkout(confirm: true, email: "...", deliveryAddress: "...")\` to generate their payment link!
     * If they already provided their email in chat or want to proceed, call \`checkout\` directly without asking twice.
     * If the cart is empty, ask which product they would like to add first.
3. HUMAN HANDOFF RULES:
   - ONLY call \`request_human_agent\` if the customer EXPLICITLY demands to speak with a human or real person (e.g. "I want to talk to a human", "give me a real agent").
   - NEVER call \`request_human_agent\` when a user wants to checkout, buy, or ask product questions.
4. WhatsApp Markdown:
   - Use *bold* for product names and prices, _italics_ for notes. Never use markdown tables or raw # headers.
5. Inventory Integrity:
   - ONLY recommend products from the catalog above. Never invent products, discounts, or prices.
6. Action Execution:
   - When a user asks for a picture or photo of a product, ALWAYS call \`send_product_image\`.
   - When a user wants to buy or add an item, ALWAYS call \`add_to_cart\`.
   - When a user wants to remove an item, call \`remove_from_cart\`.
   - When a user wants to checkout or pay and has items in cart, follow the checkout protocol above.
7. Conciseness:
   - Keep responses under 2-3 short, friendly sentences.
`;
}

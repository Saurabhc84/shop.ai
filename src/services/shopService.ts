import { GoogleGenAI, Type } from "@google/genai";
import { ComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are Shop.AI — a high-speed shopping optimizer.
Your goal is to parse user shopping requests and provide a structured comparison across major Indian retail platforms.

CRITICAL: SPLIT ORDER LOGIC
- If the user has multiple items, compare the cost of buying all from one platform vs splitting them across' platforms (e.g., Onions from Zepto, Milk from Instamart).
- Recommend a SPLIT ORDER if it saves > 10% total cost or significantly improves delivery times.
- If a split order is recommended, "bestOption" should be an ARRAY of platform orders. Otherwise, it is a single platform order.

PLATFORMS:
- Quick Commerce: Blinkit, Zepto, Swiggy Instamart
- E-commerce: Amazon, Flipkart
- Grocery: BigBasket, JioMart
- Pharmacy: PharmEasy, Tata 1mg

LOGIC:
1. Extract items and quantities.
2. Simulate realistic current pricing and delivery times.
3. Calculate Total Cost = item price + delivery + taxes - discounts.
4. Identify if a Single Platform choice or a Split Strategy is "Best".
5. Provide "Smart Insights" explaining the trade-offs of splitting.

Output MUST be valid JSON matching the provided schema.`;

const PLATFORM_OPTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    platformId: { type: Type.STRING },
    platformName: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          itemId: { type: Type.STRING },
          itemName: { type: Type.STRING },
          platformName: { type: Type.STRING },
          price: { type: Type.NUMBER },
        },
        required: ["itemId", "itemName", "platformName", "price"]
      }
    },
    itemPrice: { type: Type.NUMBER },
    deliveryFee: { type: Type.NUMBER },
    taxes: { type: Type.NUMBER },
    discounts: { type: Type.NUMBER },
    totalCost: { type: Type.NUMBER },
    deliveryTime: { type: Type.STRING },
    availability: { type: Type.STRING, enum: ["in-stock", "out-of-stock"] },
    justification: { type: Type.STRING },
  },
  required: ["platformId", "platformName", "items", "totalCost", "deliveryTime", "availability", "justification"]
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
        },
        required: ["id", "name"]
      }
    },
    strategyType: { type: Type.STRING, enum: ["single-platform", "split-order"] },
    bestOption: {
      oneOf: [
        PLATFORM_OPTION_SCHEMA,
        { type: Type.ARRAY, items: PLATFORM_OPTION_SCHEMA }
      ]
    },
    alternatives: {
      type: Type.ARRAY,
      items: PLATFORM_OPTION_SCHEMA
    },
    smartInsights: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["items", "strategyType", "bestOption", "alternatives", "smartInsights"]
};

export async function compareShoppingOptions(prompt: string): Promise<ComparisonResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as any,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as ComparisonResult;
  } catch (error) {
    console.error("Error fetching comparison:", error);
    throw error;
  }
}

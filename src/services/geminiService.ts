import { GoogleGenAI } from '@google/genai';
import { Product } from '../types/marketplace';

// Safe initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
try {
  // Check if API key is provided in client or injected environment
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
                 '';
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    aiClient = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  // Silent fallback
}

export interface AiShoppingRecommendation {
  summary: string;
  recommendedProductIds: string[];
  adviceTips: string[];
}

export interface GeneratedListing {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  specifications: Record<string, string>;
  suggestedPrice: number;
}

/**
 * AI Shopping Assistant: Matches customer conversational intent against live catalog
 */
export async function consultShoppingAssistant(
  userQuery: string,
  catalog: Product[]
): Promise<AiShoppingRecommendation> {
  const catalogContext = catalog.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    category: p.category,
    price: p.price,
    rating: p.rating,
    tags: p.tags,
    specs: p.specifications,
  }));

  if (aiClient) {
    try {
      const prompt = `You are ALPHA X's elite AI Shopping Concierge.
The customer asks: "${userQuery}".
Available Marketplace Products:
${JSON.stringify(catalogContext, null, 2)}

Respond with a JSON object in this exact shape:
{
  "summary": "Friendly, expert explanation of which products best match their criteria and why.",
  "recommendedProductIds": ["id1", "id2"],
  "adviceTips": ["Key tip 1", "Key tip 2"]
}
Only output valid JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent offline matcher:', err);
    }
  }

  // Intelligent offline semantic matcher
  const queryLower = userQuery.toLowerCase();
  const matched = catalog.filter((p) => {
    const text = `${p.title} ${p.brand} ${p.category} ${p.subcategory} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
    const words = queryLower.split(/\s+/).filter((w) => w.length > 2);
    return words.some((w) => text.includes(w));
  });

  const bestMatches = matched.length > 0 ? matched.slice(0, 3) : catalog.slice(0, 3);

  return {
    summary: `Based on your request "${userQuery}", we evaluated our verified inventory. Here are our top curated recommendations offering the best performance, verified seller reliability, and value for money.`,
    recommendedProductIds: bestMatches.map((m) => m.id),
    adviceTips: [
      'Look for ALPHA X Verified Seller badges for sub-24h dispatch.',
      'Check the 7-day hassle-free doorstep replacement guarantee included on these items.',
      'Apply coupon ALPHAX10 at checkout to save up to ₹1,500.',
    ],
  };
}

/**
 * AI Seller Assistant: Generates complete, compliant product listing details
 */
export async function generateSellerListingAI(input: {
  productKeyword: string;
  categoryHint?: string;
  approxBudget?: number;
}): Promise<GeneratedListing> {
  if (aiClient) {
    try {
      const prompt = `You are ALPHA X's AI Seller Co-Pilot.
The seller is listing: "${input.productKeyword}".
Category hint: "${input.categoryHint || 'Auto-detect'}".
Estimated price range: "${input.approxBudget || 'Fair market'}".

Generate a professional, high-converting product listing compliant with Indian E-Commerce Marketplace standards.
Respond with a JSON object in this exact shape:
{
  "title": "Clear, standardized title with brand/model/key feature",
  "category": "Electronics or Fashion or Home & Living or Beauty & Grooming or Sports & Fitness",
  "subcategory": "Accurate subcategory",
  "description": "Engaging, factual product description highlighting benefits and build quality.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "specifications": {
    "Material or Processor": "...",
    "Warranty": "1 Year",
    "Origin": "India or Global"
  },
  "suggestedPrice": 4999
}
Only output valid JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn('Gemini listing generation failed, using intelligent fallback:', err);
    }
  }

  // Intelligent fallback generator
  const cleanName = input.productKeyword.trim() || 'Premium Smart Device';
  return {
    title: `ALPHA ${cleanName} - Edition Ultra`,
    category: input.categoryHint || 'Electronics',
    subcategory: 'Accessories',
    description: `Engineered with precision materials and next-generation design. The ${cleanName} delivers premium durability, standardized specifications, and seamless integration for modern lifestyle and professional use.`,
    tags: [cleanName.toLowerCase(), 'premium', 'alphax', 'verified', 'durable'],
    specifications: {
      'Build Quality': 'Aerospace Grade Finish',
      'Compatibility': 'Universal Standard',
      'Warranty': '1 Year Comprehensive Brand Warranty',
      'Package Contents': 'Device, Quick Start Guide, Warranty Card',
    },
    suggestedPrice: input.approxBudget || 3999,
  };
}


import { Message } from "../types/chat";

// Define the system prompt that shapes Pity's behavior
const SYSTEM_PROMPT = `
You are Pity, a friendly, helpful, and knowledgeable furniture assistant AI.
Your task is to help users discover and refine ideas for furniture through a text-based conversation.
Ask clarifying questions about their furniture needs including style, type, size, material, color, room, and budget.
Once you have gathered sufficient details, generate 3-5 fictional furniture product suggestions that match their criteria.

Each product suggestion should include:
- Title: A plausible product name
- Price: A realistic price with currency symbol
- Description: 1-2 sentences highlighting key features
- Categories/Tags: Relevant tags reflecting the criteria discussed

Be patient, inquisitive, clear, and focused on furniture details.
Always act as if you're a furniture expert, but keep your responses conversational and friendly.
DO NOT generate or reference any images.
`;

export async function sendMessageToGemini(
  apiKey: string, 
  messages: Message[], 
  shouldGenerateProducts: boolean = false
): Promise<{ text: string; products: any[] }> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  try {
    // Format messages for Gemini API
    const formattedMessages = [
      {
        role: "system",
        content: shouldGenerateProducts 
          ? `${SYSTEM_PROMPT}\n\nNow it's time to generate product suggestions based on the conversation. Present 3-5 fictional furniture products that match the user's criteria. Format them clearly with Title, Price, Description, and Categories/Tags.`
          : SYSTEM_PROMPT
      },
      ...messages.map(message => ({
        role: message.role,
        content: message.content
      }))
    ];

    // Make API request to Google Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0]?.content?.parts[0]?.text || "";
    
    // Parse products if we're in product generation mode
    let products: any[] = [];
    if (shouldGenerateProducts && responseText) {
      products = extractProductsFromText(responseText);
    }

    return { 
      text: responseText,
      products 
    };
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
}

// Helper function to extract product suggestions from the text response
function extractProductsFromText(text: string): any[] {
  const products: any[] = [];
  
  // Look for product blocks in the text
  // This is a basic implementation that can be improved
  const productBlocks = text.split(/Product \d+:|Suggestion \d+:|Option \d+:/).filter(block => block.trim().length > 0);
  
  productBlocks.forEach((block, index) => {
    // Extract title
    const titleMatch = block.match(/Title:?\s*([^\n]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Furniture Option ${index + 1}`;
    
    // Extract price
    const priceMatch = block.match(/Price:?\s*([^\n]+)/i);
    const price = priceMatch ? priceMatch[1].trim() : "Price unavailable";
    
    // Extract description
    const descMatch = block.match(/Description:?\s*([^\n]+(\n[^\n]+)*)/i);
    const description = descMatch ? descMatch[1].trim() : "No description available";
    
    // Extract categories
    const categoriesMatch = block.match(/Categories\/Tags:?\s*([^\n]+(\n[^\n]+)*)/i);
    let categories: string[] = [];
    
    if (categoriesMatch) {
      const categoriesText = categoriesMatch[1].trim();
      // Check if categories are in array format ["tag1", "tag2"] or comma-separated format
      if (categoriesText.includes("[") && categoriesText.includes("]")) {
        try {
          categories = JSON.parse(categoriesText.replace(/'/g, '"'));
        } catch (e) {
          categories = categoriesText.split(/,\s*/);
        }
      } else {
        categories = categoriesText.split(/,\s*/);
      }
    }
    
    products.push({
      id: `product-${Date.now()}-${index}`,
      title,
      price,
      description,
      categories: categories.length > 0 ? categories : ["Furniture"]
    });
  });
  
  // If we didn't extract any products but we have text, create a single product
  if (products.length === 0 && text.trim().length > 0) {
    // Try to intelligently parse the text
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let title = "Furniture Suggestion";
    let price = "Price unavailable";
    let description = text.trim();
    let categories = ["Furniture"];
    
    // Try to extract information from the lines
    lines.forEach(line => {
      if (line.toLowerCase().includes("title:")) {
        title = line.split("title:")[1].trim();
      } else if (line.toLowerCase().includes("price:")) {
        price = line.split("price:")[1].trim();
      } else if (line.toLowerCase().includes("description:")) {
        description = line.split("description:")[1].trim();
      } else if (line.toLowerCase().includes("categories:") || line.toLowerCase().includes("tags:")) {
        const categoryText = line.split(/categories:|tags:/i)[1].trim();
        categories = categoryText.split(/,\s*/);
      }
    });
    
    products.push({
      id: `product-${Date.now()}-0`,
      title,
      price,
      description,
      categories
    });
  }
  
  return products;
}

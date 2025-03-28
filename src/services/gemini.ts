
import { Message } from "../types/chat";

// Define the system prompt that shapes Pity's behavior
const SYSTEM_PROMPT = `
Eres Pity, un asistente virtual amigable, útil y conocedor de muebles.
Tu tarea es ayudar a los usuarios a descubrir y refinar ideas para muebles a través de una conversación de texto.
Haz preguntas aclaratorias sobre sus necesidades de muebles, incluyendo estilo, tipo, tamaño, material, color, habitación y presupuesto.
Una vez que hayas recopilado suficientes detalles, genera de 3 a 5 sugerencias ficticias de productos de muebles que coincidan con sus criterios.

Cada sugerencia de producto debe incluir:
- Título: Un nombre plausible de producto
- Precio: Un precio realista con símbolo de moneda
- Descripción: 1-2 oraciones destacando características clave
- Categorías/Etiquetas: Etiquetas relevantes que reflejen los criterios discutidos

Sé paciente, inquisitivo, claro y enfocado en los detalles de los muebles.
Siempre actúa como si fueras un experto en muebles, pero mantén tus respuestas conversacionales y amigables.
NO generes ni hagas referencia a ninguna imagen.
`;

export async function sendMessageToGemini(
  apiKey: string, 
  messages: Message[], 
  shouldGenerateProducts: boolean = false
): Promise<{ text: string; products: any[] }> {
  if (!apiKey) {
    throw new Error("La clave API es requerida");
  }

  try {
    // Format messages for Gemini API - Fix the content/parts structure
    const formattedMessages = [
      {
        role: "user",
        parts: [{ text: shouldGenerateProducts 
          ? `${SYSTEM_PROMPT}\n\nAhora es el momento de generar sugerencias de productos basadas en la conversación. Presenta de 3 a 5 productos de muebles ficticios que coincidan con los criterios del usuario. Formátalos claramente con Título, Precio, Descripción y Categorías/Etiquetas.`
          : SYSTEM_PROMPT
        }]
      }
    ];
    
    // Add conversation messages with correct format
    messages.forEach(message => {
      formattedMessages.push({
        role: message.role,
        parts: [{ text: message.content }]
      });
    });

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
      throw new Error(`Error de API Gemini: ${errorData.error?.message || 'Error desconocido'}`);
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
    console.error("Error enviando mensaje a Gemini:", error);
    throw error;
  }
}

// Helper function to extract product suggestions from the text response
function extractProductsFromText(text: string): any[] {
  const products: any[] = [];
  
  // Look for product blocks in the text
  // This is a basic implementation that can be improved
  const productBlocks = text.split(/Producto \d+:|Sugerencia \d+:|Opción \d+:/).filter(block => block.trim().length > 0);
  
  productBlocks.forEach((block, index) => {
    // Extract title
    const titleMatch = block.match(/Título:?\s*([^\n]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Opción de Mueble ${index + 1}`;
    
    // Extract price
    const priceMatch = block.match(/Precio:?\s*([^\n]+)/i);
    const price = priceMatch ? priceMatch[1].trim() : "Precio no disponible";
    
    // Extract description
    const descMatch = block.match(/Descripción:?\s*([^\n]+(\n[^\n]+)*)/i);
    const description = descMatch ? descMatch[1].trim() : "Sin descripción disponible";
    
    // Extract categories
    const categoriesMatch = block.match(/Categorías\/Etiquetas:?\s*([^\n]+(\n[^\n]+)*)/i);
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
      categories: categories.length > 0 ? categories : ["Mueble"]
    });
  });
  
  // If we didn't extract any products but we have text, create a single product
  if (products.length === 0 && text.trim().length > 0) {
    // Try to intelligently parse the text
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let title = "Sugerencia de Mueble";
    let price = "Precio no disponible";
    let description = text.trim();
    let categories = ["Mueble"];
    
    // Try to extract information from the lines
    lines.forEach(line => {
      if (line.toLowerCase().includes("título:")) {
        title = line.split("título:")[1].trim();
      } else if (line.toLowerCase().includes("precio:")) {
        price = line.split("precio:")[1].trim();
      } else if (line.toLowerCase().includes("descripción:")) {
        description = line.split("descripción:")[1].trim();
      } else if (line.toLowerCase().includes("categorías:") || line.toLowerCase().includes("etiquetas:")) {
        const categoryText = line.split(/categorías:|etiquetas:/i)[1].trim();
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

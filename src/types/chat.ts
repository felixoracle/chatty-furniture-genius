
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ProductSuggestion {
  id: string;
  title: string;
  price: string;
  description: string;
  categories: string[];
}

export interface ConversationState {
  messages: Message[];
  products: ProductSuggestion[];
  isTyping: boolean;
  apiKey: string;
}

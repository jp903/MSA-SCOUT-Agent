
export interface ChatMessage {
    action: string;
    actionData: boolean;
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: string;
  }
  
  export interface ChatHistoryItem {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
    userId?: string | null;
  }
  
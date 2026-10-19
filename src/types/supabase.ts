// Hand-written to match supabase/migrations until `npm run generate:types` replaces it.

export interface Database {
  public: {
    Tables: {
      answers: {
        Row: {
          id: string;
          session_id: string;
          card_id: string;
          card_version: number;
          answer: "yes" | "no" | "dont_know" | "prefer_not";
          position: number;
          deck_seed: number;
          response_ms: number;
          is_fast: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          card_id: string;
          card_version: number;
          answer: "yes" | "no" | "dont_know" | "prefer_not";
          position: number;
          deck_seed: number;
          response_ms: number;
          is_fast: boolean;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

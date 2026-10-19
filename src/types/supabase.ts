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
          deck_mode: "mixed" | "theme";
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
          deck_mode?: "mixed" | "theme";
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      hit_rate_limit: {
        Args: { p_key: string; p_scope: string; p_window_seconds: number; p_limit: number };
        Returns: boolean;
      };
      consume_challenge: {
        Args: { p_nonce: string; p_expires_at: string };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

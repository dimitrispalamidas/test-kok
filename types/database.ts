export type Database = {
  public: {
    Tables: {
      kateg: {
        Row: {
          kcod: number;
          klect: string;
          ktime: number;
          kpict: string | null;
        };
        Insert: {
          kcod: number;
          klect: string;
          ktime: number;
          kpict?: string | null;
        };
        Update: {
          kcod?: number;
          klect?: string;
          ktime?: number;
          kpict?: string | null;
        };
        Relationships: [];
      };
      quest: {
        Row: {
          qcod: number;
          qkateg: number;
          qpag: number | null;
          qlang: number;
          qlect: string;
          qphoto: string | null;
          qsound: string | null;
          qbook: string | null;
        };
        Insert: {
          qcod: number;
          qkateg: number;
          qpag?: number | null;
          qlang: number;
          qlect: string;
          qphoto?: string | null;
          qsound?: string | null;
          qbook?: string | null;
        };
        Update: {
          qcod?: number;
          qkateg?: number;
          qpag?: number | null;
          qlang?: number;
          qlect?: string;
          qphoto?: string | null;
          qsound?: string | null;
          qbook?: string | null;
        };
        Relationships: [];
      };
      answer: {
        Row: {
          aqcod: number;
          aaa: number;
          alect: string;
          acorr: boolean;
          asound: string | null;
        };
        Insert: {
          aqcod: number;
          aaa: number;
          alect: string;
          acorr: boolean;
          asound?: string | null;
        };
        Update: {
          aqcod?: number;
          aaa?: number;
          alect?: string;
          acorr?: boolean;
          asound?: string | null;
        };
        Relationships: [];
      };
      numbs: {
        Row: {
          kcod: number;
          pcod: number;
          lect: string | null;
          numb: number;
        };
        Insert: {
          kcod: number;
          pcod: number;
          lect?: string | null;
          numb: number;
        };
        Update: {
          kcod?: number;
          pcod?: number;
          lect?: string | null;
          numb?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row types
export type Kateg = Database['public']['Tables']['kateg']['Row'];
export type Quest = Database['public']['Tables']['quest']['Row'];
export type Answer = Database['public']['Tables']['answer']['Row'];
export type Numbs = Database['public']['Tables']['numbs']['Row'];

// A question with its answers bundled
export type QuestWithAnswers = Quest & {
  answers: Answer[];
};

// Language codes
export const LANG = {
  EL: 1,
  EN: 2,
  RU: 3,
  AL: 4,
} as const;

export type LangCode = (typeof LANG)[keyof typeof LANG];

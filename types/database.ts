export type Database = {
  public: {
    Tables: {
      user_exam_results: {
        Row: {
          id: string;
          user_id: string;
          kcod: number;
          score: number;
          total: number;
          passed: boolean;
          duration_seconds: number | null;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kcod: number;
          score: number;
          total: number;
          passed: boolean;
          duration_seconds?: number | null;
          title?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kcod?: number;
          score?: number;
          total?: number;
          passed?: boolean;
          duration_seconds?: number | null;
          title?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_exam_answers: {
        Row: {
          id: string;
          result_id: string;
          qcod: number;
          selected_aaa: number | null;
          is_correct: boolean;
        };
        Insert: {
          id?: string;
          result_id: string;
          qcod: number;
          selected_aaa?: number | null;
          is_correct: boolean;
        };
        Update: {
          id?: string;
          result_id?: string;
          qcod?: number;
          selected_aaa?: number | null;
          is_correct?: boolean;
        };
        Relationships: [];
      };
      user_wrong_questions: {
        Row: {
          user_id: string;
          qcod: number;
          wrong_count: number;
          last_wrong_at: string;
        };
        Insert: {
          user_id: string;
          qcod: number;
          wrong_count?: number;
          last_wrong_at?: string;
        };
        Update: {
          user_id?: string;
          qcod?: number;
          wrong_count?: number;
          last_wrong_at?: string;
        };
        Relationships: [];
      };
      user_saved_questions: {
        Row: {
          user_id: string;
          qcod: number;
          saved_at: string;
        };
        Insert: {
          user_id: string;
          qcod: number;
          saved_at?: string;
        };
        Update: {
          user_id?: string;
          qcod?: number;
          saved_at?: string;
        };
        Relationships: [];
      };
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
    Functions: {
      increment_wrong_question: {
        Args: { p_user_id: string; p_qcod: number };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row types
export type Kateg = Database['public']['Tables']['kateg']['Row'];
export type Quest = Database['public']['Tables']['quest']['Row'];
export type Answer = Database['public']['Tables']['answer']['Row'];
export type Numbs = Database['public']['Tables']['numbs']['Row'];
export type UserExamResult = Database['public']['Tables']['user_exam_results']['Row'];
export type UserExamAnswer = Database['public']['Tables']['user_exam_answers']['Row'];
export type UserWrongQuestion = Database['public']['Tables']['user_wrong_questions']['Row'];
export type UserSavedQuestion = Database['public']['Tables']['user_saved_questions']['Row'];

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

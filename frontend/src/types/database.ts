export type Genotype = 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'Unknown' | 'Other';

export type UserRole = 'user' | 'professional';

export type InquiryStatus = 'pending' | 'in_review' | 'responded' | 'closed';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  genotype: Genotype;
  role: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Inquiry {
  id: string;
  user_id: string;
  professional_id?: string | null;
  patient_name?: string;
  patient_email?: string;
  patient_genotype: Genotype;
  subject: string;
  message: string;
  status: InquiryStatus;
  response?: string | null;
  responded_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface QuizScore {
  id: string;
  user_id: string;
  quiz_title: string;
  category: string;
  score: number;
  total_questions: number;
  percentage: number;
  feedback?: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          id: string;
          email: string;
          name: string;
          genotype: Genotype;
          role?: UserRole;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          genotype?: Genotype;
          role?: UserRole;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_scores: {
        Row: QuizScore;
        Insert: {
          id?: string;
          user_id: string;
          quiz_title?: string;
          category?: string;
          score: number;
          total_questions: number;
          percentage?: number;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_title?: string;
          category?: string;
          score?: number;
          total_questions?: number;
          percentage?: number;
          feedback?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      inquiries: {
        Row: Inquiry;
        Insert: {
          id?: string;
          user_id: string;
          professional_id?: string | null;
          patient_genotype: Genotype;
          subject: string;
          message: string;
          status?: InquiryStatus;
          response?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          professional_id?: string | null;
          patient_genotype?: Genotype;
          subject?: string;
          message?: string;
          status?: InquiryStatus;
          response?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      quiz_leaderboard: {
        Row: {
          id: string;
          user_name: string;
          quiz_title: string;
          score: number;
          total_questions: number;
          percentage: number;
          created_at: string;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      genotype_type: 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'Unknown' | 'Other';
      user_role: 'user' | 'professional';
      inquiry_status: 'pending' | 'in_review' | 'responded' | 'closed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

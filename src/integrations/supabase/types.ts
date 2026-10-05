export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      carcontrol_payment_schedules: {
        Row: {
          ativo: boolean
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          dia_mes: number | null
          dia_semana: number | null
          driver_id: string | null
          id: string
          metodo: string
          tipo_recorrencia: string
          updated_at: string | null
          user_id: string | null
          valor: number
          vehicle_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          dia_mes?: number | null
          dia_semana?: number | null
          driver_id?: string | null
          id?: string
          metodo?: string
          tipo_recorrencia?: string
          updated_at?: string | null
          user_id?: string | null
          valor: number
          vehicle_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          dia_mes?: number | null
          dia_semana?: number | null
          driver_id?: string | null
          id?: string
          metodo?: string
          tipo_recorrencia?: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carcontrol_payment_schedules_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carcontrol_payment_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      carcontrol_companies: {
        Row: {
          ativo: boolean
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          mkt_plan: Database["public"]["Enums"]["mkt_plan"]
          nome: string
          saas_plan: Database["public"]["Enums"]["saas_plan"]
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          mkt_plan?: Database["public"]["Enums"]["mkt_plan"]
          nome: string
          saas_plan?: Database["public"]["Enums"]["saas_plan"]
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          mkt_plan?: Database["public"]["Enums"]["mkt_plan"]
          nome?: string
          saas_plan?: Database["public"]["Enums"]["saas_plan"]
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      carcontrol_profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          preferencias: Json
          role: "user" | "admin" | "dev"
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          preferencias?: Json
          role?: "user" | "admin" | "dev"
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          preferencias?: Json
          role?: "user" | "admin" | "dev"
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carcontrol_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      carcontrol_parcela_seguro_payments: {
        Row: {
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          id: string
          metodo_pagamento: string | null
          observacoes: string | null
          schedule_date: string | null
          status: string
          tipo: string
          updated_at: string | null
          user_id: string
          valor: number
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          schedule_date?: string | null
          status?: string
          tipo: string
          updated_at?: string | null
          user_id: string
          valor: number
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          schedule_date?: string | null
          status?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string
          valor?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carcontrol_parcela_seguro_payments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      carcontrol_parcela_seguro_schedules: {
        Row: {
          ativo: boolean
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          dia_mes: number | null
          dia_semana: number | null
          id: string
          metodo_pagamento: string | null
          observacoes: string | null
          tipo: string
          tipo_recorrencia: string
          updated_at: string | null
          user_id: string
          valor: number
          vehicle_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          dia_mes?: number | null
          dia_semana?: number | null
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          tipo: string
          tipo_recorrencia?: string
          updated_at?: string | null
          user_id: string
          valor: number
          vehicle_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          dia_mes?: number | null
          dia_semana?: number | null
          id?: string
          metodo_pagamento?: string | null
          observacoes?: string | null
          tipo?: string
          tipo_recorrencia?: string
          updated_at?: string | null
          user_id?: string
          valor?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carcontrol_parcela_seguro_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      carcontrol_alerts: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          id: string
          severidade: string
          tipo: string
          titulo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          severidade: string
          tipo: string
          titulo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          severidade?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      carcontrol_user: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          limite_motoristas: number
          limite_veiculos: number
          nome: string | null
          preferencias: Json
          total_motoristas: number
          total_veiculos: number
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          limite_motoristas?: number
          limite_veiculos?: number
          nome?: string | null
          preferencias?: Json
          total_motoristas?: number
          total_veiculos?: number
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          limite_motoristas?: number
          limite_veiculos?: number
          nome?: string | null
          preferencias?: Json
          total_motoristas?: number
          total_veiculos?: number
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      carcontrol_drivers: {

        Row: {
          antecedentes_url: string | null
          caucao: number
          cnh: string
          comprovante_residencia_url: string | null
          contrato_url: string | null
          cpf: string
          created_at: string | null
          foto_url: string | null
          id: string
          inicio: string
          nome: string
          status: string
          telefone: string
          updated_at: string | null
          user_id: string | null
          valor_semanal: number
          veiculo_id: string | null
        }
        Insert: {
          antecedentes_url?: string | null
          caucao: number
          cnh: string
          comprovante_residencia_url?: string | null
          contrato_url?: string | null
          cpf: string
          created_at?: string | null
          foto_url?: string | null
          id?: string
          inicio: string
          nome: string
          status: string
          telefone: string
          updated_at?: string | null
          user_id?: string | null
          valor_semanal: number
          veiculo_id?: string | null
        }
        Update: {
          antecedentes_url?: string | null
          caucao?: number
          cnh?: string
          comprovante_residencia_url?: string | null
          contrato_url?: string | null
          cpf?: string
          created_at?: string | null
          foto_url?: string | null
          id?: string
          inicio?: string
          nome?: string
          status?: string
          telefone?: string
          updated_at?: string | null
          user_id?: string | null
          valor_semanal?: number
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carcontrol_drivers_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      carcontrol_maintenances: {
        Row: {
          created_at: string | null
          data: string
          id: string
          oficina: string
          proximo_km: number | null
          servico: string
          tipo: string
          updated_at: string | null
          user_id: string | null
          valor: number
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          oficina: string
          proximo_km?: number | null
          servico: string
          tipo: string
          updated_at?: string | null
          user_id?: string | null
          valor: number
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          oficina?: string
          proximo_km?: number | null
          servico?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carcontrol_maintenances_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      carcontrol_payments: {
        Row: {
          comprovante_url: string | null
          created_at: string | null
          data: string
          driver_id: string | null
          id: string
          metodo: string
          observacoes: string | null
          schedule_date: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          valor: number
          vehicle_id: string | null
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string | null
          data: string
          driver_id?: string | null
          id?: string
          metodo: string
          observacoes?: string | null
          schedule_date?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
          valor: number
          vehicle_id?: string | null
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string | null
          data?: string
          driver_id?: string | null
          id?: string
          metodo?: string
          observacoes?: string | null
          schedule_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          valor?: number
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carcontrol_payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carcontrol_payments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      carcontrol_vehicles: {
        Row: {
          ano: number
          banco: string
          cor: string
          created_at: string | null
          custo_mes: number
          documento_url: string | null
          id: string
          km_atual: number
          km_inicial: number
          marca: string
          modelo: string
          parcela: number
          parcelas_restantes: number
          placa: string
          photo_urls: string[] | null
          receita_mes: number
          seguro: number
          status: string
          updated_at: string | null
          user_id: string | null
          vencimento_parcela: string
          vencimento_seguro: string
        }
        Insert: {
          ano: number
          banco: string
          cor: string
          created_at?: string | null
          custo_mes?: number
          documento_url?: string | null
          id?: string
          km_atual: number
          km_inicial: number
          marca: string
          modelo: string
          parcela: number
          parcelas_restantes: number
          placa: string
          photo_urls?: string[] | null
          receita_mes?: number
          seguro: number
          status: string
          updated_at?: string | null
          user_id?: string | null
          vencimento_parcela: string
          vencimento_seguro: string
        }
        Update: {
          ano?: number
          banco?: string
          cor?: string
          created_at?: string | null
          custo_mes?: number
          documento_url?: string | null
          id?: string
          km_atual?: number
          km_inicial?: number
          marca?: string
          modelo?: string
          parcela?: number
          parcelas_restantes?: number
          placa?: string
          photo_urls?: string[] | null
          receita_mes?: number
          seguro?: number
          status?: string
          updated_at?: string | null
          user_id?: string | null
          vencimento_parcela?: string
          vencimento_seguro?: string
        }
        Relationships: []
      }
      access_logs: {
        Row: {
          id: string
          user_id: string
          ip_address: string
          latitude: number | null
          longitude: number | null
          city: string | null
          region: string | null
          country: string | null
          country_code: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          ip_address: string
          latitude?: number | null
          longitude?: number | null
          city?: string | null
          region?: string | null
          country?: string | null
          country_code?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          ip_address?: string
          latitude?: number | null
          longitude?: number | null
          city?: string | null
          region?: string | null
          country?: string | null
          country_code?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          id: string
          company_id: string
          user_id: string
          subject: string
          message: string
          status: "open" | "in_progress" | "resolved" | "closed"
          priority: "low" | "medium" | "high" | "urgent"
          image_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          subject: string
          message: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          image_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          subject?: string
          message?: string
          status?: "open" | "in_progress" | "resolved" | "closed"
          priority?: "low" | "medium" | "high" | "urgent"
          image_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "carcontrol_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mkt_plan: "FREE" | "PRO" | "ELITE"
      saas_plan: "BASICO" | "PRO" | "MASTER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

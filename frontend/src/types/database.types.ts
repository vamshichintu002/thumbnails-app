export interface Profile {
  id: string
  credits: number
  referral_code: string | null
  referred_by: string | null
  created_at: string
  updated_at: string
}

export interface GenerationType {
  type_key: string
  display_name: string
  cost_credits: number
}

export interface Generation {
  id: string
  profile_id: string
  generation_type: string
  output_image_url: string
  credit_cost: number
  created_at: string
}

export interface UserImage {
  id: string
  profile_id: string
  image_url: string
  created_at: string
}

export interface Subscription {
  id: string
  profile_id: string
  plan_name: string
  is_active: boolean
  start_date: string
  end_date: string | null
  created_at: string
}

export interface Payment {
  id: string
  profile_id: string
  stripe_payment_id: string | null
  amount: number
  credits_added: number
  created_at: string
}

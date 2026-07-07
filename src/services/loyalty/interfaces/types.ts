export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export interface LoyaltyAccount {
  user_id: string;
  points_balance: number;
  lifetime_points: number;
  tier: LoyaltyTier;
}
export interface PointTransaction {
  id: string;
  transaction_type: 'earned' | 'redeemed' | 'adjusted';
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
}
export interface RedemptionRule {
  id: string;
  name: string;
  points_required: number;
  reward_value: number;
}
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 50000
} as const;
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class LoyaltyRepository {
  static async computeAccountFromOrders(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total, status")
      .eq("user_id", userId);
    
    if (error) throw new Error(`[LoyaltyRepository] computeAccount: ${error.message}`);
    
    // Earn 1 loyalty point per 10 KES spent
    const totalSpent = (data ?? [])
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total), 0);
    
    const points = Math.floor(totalSpent / 10);
    
    let tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze';
    if (points >= 50000) tier = 'diamond';
    else if (points >= 15000) tier = 'platinum';
    else if (points >= 5000) tier = 'gold';
    else if (points >= 1000) tier = 'silver';

    return {
      user_id: userId,
      points_balance: points,
      lifetime_points: points,
      tier
    };
  }

  static async getRedemptionRules() {
    return [
      { id: "rule-1", name: "KES 500 Discount Voucher", points_required: 500, reward_value: 500 },
      { id: "rule-2", name: "KES 1200 Discount Voucher", points_required: 1000, reward_value: 1200 },
      { id: "rule-3", name: "Free Standard Delivery Voucher", points_required: 150, reward_value: 200 }
    ];
  }
}
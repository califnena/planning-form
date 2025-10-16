-- Add VIP plan types to subscription_plan enum
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'vip_annual';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'vip_monthly';
-- Migration: Add Simulated Trades & Weekly Credits

-- 1. Add weekly_credits to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS weekly_credits INTEGER DEFAULT 1;

-- 2. Create simulated_trades table
CREATE TABLE IF NOT EXISTS simulated_trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    
    -- Analysis Data
    asset_symbol TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('BUY', 'SELL', 'WAIT')),
    entry_price NUMERIC,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    
    -- Simulation State
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'OPEN', 'won', 'lost', 'CANCELLED')), 
    -- 'won'/'lost' lowercase to match existing conventions if any, or standardizing. keeping simple.
    
    -- Performance
    entry_date TIMESTAMPTZ,
    close_date TIMESTAMPTZ,
    pnl_percent NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE simulated_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades" 
ON simulated_trades FOR SELECT 
USING (auth.uid() = user_id);

-- (Service role can do everything, no policy needed for cron usually if using service key, 
-- but if using client key then we need insert/update. Cron uses Service Role.)

-- 4. Index for Cron Performance
CREATE INDEX IF NOT EXISTS idx_simulated_trades_active 
ON simulated_trades(status) 
WHERE status IN ('PENDING', 'OPEN');

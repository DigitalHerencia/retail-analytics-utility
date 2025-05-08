CREATE TABLE IF NOT EXISTS business_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesale_price_per_oz DECIMAL(10, 2) NOT NULL DEFAULT 100,
  target_profit_per_month DECIMAL(10, 2) NOT NULL DEFAULT 2000,
  operating_expenses DECIMAL(10, 2) NOT NULL DEFAULT 500,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  wholesale_price DECIMAL(10, 2) NOT NULL,
  retail_price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  time_period VARCHAR(50) NOT NULL,
  expenses DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salespeople (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  sales_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity_g DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_oz DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL,
  cost_per_oz DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  reorder_threshold_g DECIMAL(10, 2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  amount_owed DECIMAL(10, 2) NOT NULL DEFAULT 0,
  due_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  method VARCHAR(50) NOT NULL DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(50) NOT NULL,
  inventory_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  inventory_name VARCHAR(255),
  quantity_grams DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_per_gram DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'asset',
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_delete_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  inactivity_period_days INTEGER NOT NULL DEFAULT 90,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_salespeople_scenario_id ON salespeople(scenario_id);
CREATE INDEX IF NOT EXISTS idx_business_data_last_activity ON business_data(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_auto_delete ON privacy_settings(auto_delete_enabled);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_last_activity ON privacy_settings(last_activity_at);

CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_business_data_last_activity
BEFORE UPDATE ON business_data
FOR EACH ROW
EXECUTE FUNCTION update_last_activity();

CREATE OR REPLACE FUNCTION check_inactive_accounts()
RETURNS void AS $$
DECLARE
  setting RECORD;
BEGIN
  FOR setting IN 
    SELECT * FROM privacy_settings 
    WHERE auto_delete_enabled = TRUE
  LOOP
    DELETE FROM business_data 
    WHERE last_activity_at < NOW() - (setting.inactivity_period_days * INTERVAL '1 day');
    
    DELETE FROM customers 
    WHERE updated_at < NOW() - (setting.inactivity_period_days * INTERVAL '1 day');
    
    DELETE FROM inventory_items 
    WHERE updated_at < NOW() - (setting.inactivity_period_days * INTERVAL '1 day');
    
    DELETE FROM transactions 
    WHERE created_at < NOW() - (setting.inactivity_period_days * INTERVAL '1 day');
    
    DELETE FROM accounts 
    WHERE updated_at < NOW() - (setting.inactivity_period_days * INTERVAL '1 day');
    
    DELETE FROM scenarios 
    WHERE updated_at < NOW() - (setting.inactivity_period_days * INTERVAL '1 day');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

INSERT INTO business_data 
(id, wholesale_price_per_oz, target_profit_per_month, operating_expenses, last_activity_at, created_at, updated_at)
VALUES 
(gen_random_uuid(), 100.00, 2000.00, 500.00, NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO scenarios 
(id, name, description, wholesale_price, retail_price, quantity, time_period, expenses, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Standard Pricing', 'Regular pricing model with 100% markup', 100.00, 200.00, 20.00, 'month', 500.00, NOW(), NOW()),
(gen_random_uuid(), 'Premium Pricing', 'Higher-end pricing with 150% markup', 100.00, 250.00, 15.00, 'month', 500.00, NOW(), NOW()),
(gen_random_uuid(), 'Budget Pricing', 'Lower pricing with 50% markup', 100.00, 150.00, 30.00, 'month', 500.00, NOW(), NOW()),
(gen_random_uuid(), 'Bulk Discount', 'Wholesale pricing for bulk purchases', 100.00, 130.00, 50.00, 'month', 500.00, NOW(), NOW())
ON CONFLICT DO NOTHING;

DO $$
DECLARE
    scenario_id1 UUID;
    scenario_id2 UUID;
    scenario_id3 UUID;
    scenario_id4 UUID;
BEGIN
    SELECT id INTO scenario_id1 FROM scenarios WHERE name = 'Standard Pricing' LIMIT 1;
    SELECT id INTO scenario_id2 FROM scenarios WHERE name = 'Premium Pricing' LIMIT 1;
    SELECT id INTO scenario_id3 FROM scenarios WHERE name = 'Budget Pricing' LIMIT 1;
    SELECT id INTO scenario_id4 FROM scenarios WHERE name = 'Bulk Discount' LIMIT 1;
    
    IF scenario_id1 IS NOT NULL THEN
        INSERT INTO salespeople 
        (id, scenario_id, name, commission_rate, sales_quantity, created_at, updated_at)
        VALUES
        (gen_random_uuid(), scenario_id1, 'John Smith', 10.00, 10.00, NOW(), NOW()),
        (gen_random_uuid(), scenario_id1, 'Jane Doe', 15.00, 8.00, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF scenario_id2 IS NOT NULL THEN
        INSERT INTO salespeople 
        (id, scenario_id, name, commission_rate, sales_quantity, created_at, updated_at)
        VALUES
        (gen_random_uuid(), scenario_id2, 'Mike Johnson', 20.00, 5.00, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF scenario_id3 IS NOT NULL THEN
        INSERT INTO salespeople 
        (id, scenario_id, name, commission_rate, sales_quantity, created_at, updated_at)
        VALUES
        (gen_random_uuid(), scenario_id3, 'Sarah Williams', 8.00, 15.00, NOW(), NOW()),
        (gen_random_uuid(), scenario_id3, 'David Brown', 8.00, 12.00, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF scenario_id4 IS NOT NULL THEN
        INSERT INTO salespeople 
        (id, scenario_id, name, commission_rate, sales_quantity, created_at, updated_at)
        VALUES
        (gen_random_uuid(), scenario_id4, 'Robert Davis', 5.00, 30.00, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

INSERT INTO inventory_items 
(id, name, description, quantity_g, quantity_oz, quantity_kg, purchase_date, cost_per_oz, total_cost, reorder_threshold_g, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Premium', 'Top shelf product', 100.00, 3.53, 0.10, '2024-01-01', 80.00, 282.40, 20.00, NOW(), NOW()),
(gen_random_uuid(), 'Standard', 'Mid-grade product', 200.00, 7.05, 0.20, '2024-01-05', 50.00, 352.50, 50.00, NOW(), NOW()),
(gen_random_uuid(), 'Budget', 'Lower-grade product', 50.00, 1.76, 0.05, '2024-01-10', 30.00, 52.80, 10.00, NOW(), NOW()),
(gen_random_uuid(), 'Exotic', 'Rare imported product', 25.00, 0.88, 0.025, '2024-01-15', 120.00, 105.60, 5.00, NOW(), NOW()),
(gen_random_uuid(), 'Wholesale Bulk', 'Large quantity for resale', 500.00, 17.64, 0.50, '2024-01-20', 40.00, 705.60, 100.00, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO customers 
(id, name, phone, email, address, amount_owed, due_date, status, notes, created_at, updated_at)
VALUES
(gen_random_uuid(), 'John Doe', '555-123-4567', 'john.doe@example.com', '123 Main St', 100.00, '2024-02-15', 'unpaid', 'Regular customer', NOW(), NOW()),
(gen_random_uuid(), 'Jane Smith', '555-987-6543', 'jane.smith@example.com', '456 Elm St', 0.00, '2024-02-20', 'paid', 'New customer', NOW(), NOW()),
(gen_random_uuid(), 'Mike Johnson', '555-456-7890', 'mike.j@example.com', '789 Oak Ave', 50.00, '2024-02-25', 'partial', 'Pays on time', NOW(), NOW()),
(gen_random_uuid(), 'Sarah Williams', '555-789-0123', 'sarah.w@example.com', '321 Pine Rd', 200.00, '2024-02-10', 'unpaid', 'Frequent buyer', NOW(), NOW()),
(gen_random_uuid(), 'David Brown', '555-234-5678', 'david.b@example.com', '654 Maple Dr', 0.00, '2024-02-05', 'paid', 'Cash only', NOW(), NOW())
ON CONFLICT DO NOTHING;

DO $$
DECLARE
    customer_id1 UUID;
    customer_id2 UUID;
    customer_id3 UUID;
BEGIN
    SELECT id INTO customer_id1 FROM customers WHERE name = 'Jane Smith' LIMIT 1;
    SELECT id INTO customer_id2 FROM customers WHERE name = 'Mike Johnson' LIMIT 1;
    SELECT id INTO customer_id3 FROM customers WHERE name = 'David Brown' LIMIT 1;
    
    IF customer_id1 IS NOT NULL THEN
        INSERT INTO payments 
        (id, customer_id, amount, date, method, notes, created_at)
        VALUES
        (gen_random_uuid(), customer_id1, 150.00, '2024-01-15', 'cash', 'Full payment', NOW()),
        (gen_random_uuid(), customer_id1, 75.00, '2024-01-05', 'cash', 'Partial payment', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF customer_id2 IS NOT NULL THEN
        INSERT INTO payments 
        (id, customer_id, amount, date, method, notes, created_at)
        VALUES
        (gen_random_uuid(), customer_id2, 50.00, '2024-01-20', 'venmo', 'Partial payment', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF customer_id3 IS NOT NULL THEN
        INSERT INTO payments 
        (id, customer_id, amount, date, method, notes, created_at)
        VALUES
        (gen_random_uuid(), customer_id3, 100.00, '2024-01-10', 'cash', 'Full payment', NOW()),
        (gen_random_uuid(), customer_id3, 50.00, '2023-12-20', 'cash', 'Previous payment', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

DO $$
DECLARE
    inventory_id1 UUID;
    inventory_id2 UUID;
    inventory_id3 UUID;
    customer_id1 UUID;
    customer_id2 UUID;
    customer_id3 UUID;
BEGIN
    SELECT id INTO inventory_id1 FROM inventory_items WHERE name = 'Premium' LIMIT 1;
    SELECT id INTO inventory_id2 FROM inventory_items WHERE name = 'Standard' LIMIT 1;
    SELECT id INTO inventory_id3 FROM inventory_items WHERE name = 'Budget' LIMIT 1;
    
    SELECT id INTO customer_id1 FROM customers WHERE name = 'John Doe' LIMIT 1;
    SELECT id INTO customer_id2 FROM customers WHERE name = 'Jane Smith' LIMIT 1;
    SELECT id INTO customer_id3 FROM customers WHERE name = 'Mike Johnson' LIMIT 1;
    
    IF inventory_id1 IS NOT NULL AND customer_id1 IS NOT NULL THEN
        INSERT INTO transactions 
        (id, date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price, cost, profit, payment_method, customer_id, customer_name, notes, created_at)
        VALUES
        (gen_random_uuid(), NOW() - INTERVAL '5 days', 'sale', inventory_id1, 'Premium', 3.5, 20.00, 70.00, 35.00, 35.00, 'cash', customer_id1, 'John Doe', 'Regular purchase', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF inventory_id2 IS NOT NULL AND customer_id2 IS NOT NULL THEN
        INSERT INTO transactions 
        (id, date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price, cost, profit, payment_method, customer_id, customer_name, notes, created_at)
        VALUES
        (gen_random_uuid(), NOW() - INTERVAL '3 days', 'sale', inventory_id2, 'Standard', 7.0, 15.00, 105.00, 60.00, 45.00, 'cash', customer_id2, 'Jane Smith', 'New customer discount', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF inventory_id3 IS NOT NULL AND customer_id3 IS NOT NULL THEN
        INSERT INTO transactions 
        (id, date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price, cost, profit, payment_method, customer_id, customer_name, notes, created_at)
        VALUES
        (gen_random_uuid(), NOW() - INTERVAL '1 day', 'sale', inventory_id3, 'Budget', 14.0, 10.00, 140.00, 70.00, 70.00, 'credit', customer_id3, 'Mike Johnson', 'Credit sale', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF inventory_id1 IS NOT NULL THEN
        INSERT INTO transactions 
        (id, date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price, cost, profit, payment_method, customer_id, customer_name, notes, created_at)
        VALUES
        (gen_random_uuid(), NOW() - INTERVAL '10 days', 'purchase', inventory_id1, 'Premium', 28.0, 10.00, 280.00, 280.00, 0.00, 'cash', NULL, NULL, 'Restocking inventory', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

INSERT INTO accounts 
(id, name, type, balance, description, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Cash on Hand', 'asset', 1500.00, 'Physical cash available', NOW(), NOW()),
(gen_random_uuid(), 'Bank Account', 'asset', 3500.00, 'Business checking account', NOW(), NOW()),
(gen_random_uuid(), 'Accounts Receivable', 'asset', 350.00, 'Money owed by customers', NOW(), NOW()),
(gen_random_uuid(), 'Inventory', 'asset', 1500.00, 'Value of current inventory', NOW(), NOW()),
(gen_random_uuid(), 'Expenses', 'expense', 500.00, 'Monthly operating expenses', NOW(), NOW()),
(gen_random_uuid(), 'Sales Revenue', 'revenue', 2800.00, 'Income from sales', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO privacy_settings 
(id, auto_delete_enabled, inactivity_period_days, last_activity_at, created_at, updated_at)
VALUES
(gen_random_uuid(), FALSE, 90, NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

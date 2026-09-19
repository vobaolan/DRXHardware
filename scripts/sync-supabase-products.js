const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrnrveehpyxurmkfgquc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4jDpCA9GMSJaxxWOJv_b4g_LkN1q40E';

const sb = createClient(supabaseUrl, supabaseAnonKey);

async function syncProducts() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  const { data, error } = await sb
    .from('Product')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error || !data) {
    console.error('Fetch error:', error);
    process.exit(1);
  }

  console.log(`Successfully fetched ${data.length} products from Supabase.`);

  // Write backup JSON
  const backupPath = path.resolve('src/data/products-backup-117.json');
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Saved backup to: ${backupPath}`);

  // Construct src/lib/hardware-data.ts
  const hardwareDataPath = path.resolve('src/lib/hardware-data.ts');
  const code = `export interface HardwareProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  category: 'CPU' | 'VGA' | 'MAINBOARD' | 'RAM' | 'STORAGE' | 'PSU' | 'CASE' | 'COOLING' | 'MONITOR' | 'KEYBOARD' | 'HEADSET' | 'GEAR' | 'LAPTOP' | 'LAPTOP_GAMING' | 'PREBUILT_PC';
  brand: string;
  modelCode?: string;
  coverImage: string;
  screenshots: string[];
  socket?: string | null;
  ramType?: string | null;
  wattage?: number | null;
  formFactor?: string | null;
  specs: Record<string, string>;
  warrantyMonths: number;
  stockQuantity: number;
  status?: boolean;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isPrebuilt?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_PRODUCTS: HardwareProduct[] = ${JSON.stringify(data, null, 2)};
`;

  fs.writeFileSync(hardwareDataPath, code, 'utf-8');
  console.log(`Successfully updated: ${hardwareDataPath}`);
}

syncProducts().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});

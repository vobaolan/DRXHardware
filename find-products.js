const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrnrveehpyxurmkfgquc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4jDpCA9GMSJaxxWOJv_b4g_LkN1q40E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findMatchingProducts() {
  console.log('=== SEARCHING SUPABASE PRODUCTS ===');
  const { data: supaProds, error } = await supabase.from('Product').select('*');
  console.log('Total products in Supabase:', supaProds ? supaProds.length : 0);
  if (supaProds) {
    const matches = supaProds.filter(p => 
      (p.coverImage && p.coverImage.includes('527443224154')) || 
      p.price === 8990000 || 
      p.discountPrice === 7990000 || 
      (p.specs && JSON.stringify(p.specs).includes('27 inch 16:9')) ||
      (p.category === 'MONITOR')
    );
    console.log(`Found ${matches.length} monitors / matches in Supabase:`);
    matches.forEach(m => {
      console.log({
        id: m.id,
        name: m.name,
        price: m.price,
        discountPrice: m.discountPrice,
        stockQuantity: m.stockQuantity,
        coverImage: m.coverImage,
        specs: m.specs
      });
    });
  }
}

findMatchingProducts();

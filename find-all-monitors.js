const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrnrveehpyxurmkfgquc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4jDpCA9GMSJaxxWOJv_b4g_LkN1q40E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findMonitor8990() {
  const { data: supaProds, error } = await supabase.from('Product').select('*').eq('category', 'MONITOR');
  if (supaProds) {
    supaProds.forEach(p => {
      console.log('ID:', p.id, '| Name:', p.name, '| Price:', p.price, '| Disc:', p.discountPrice, '| Stock:', p.stockQuantity, '| Cover:', p.coverImage);
    });
  }
}

findMonitor8990();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrnrveehpyxurmkfgquc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4jDpCA9GMSJaxxWOJv_b4g_LkN1q40E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProArt() {
  const { data: supaProds } = await supabase.from('Product').select('id, name, price, discountPrice, stockQuantity, coverImage, specs').ilike('name', '%ASUS%');
  console.log('ASUS Products count:', supaProds ? supaProds.length : 0);
  if (supaProds) {
    supaProds.forEach(p => console.log(JSON.stringify(p)));
  }
}

checkProArt();

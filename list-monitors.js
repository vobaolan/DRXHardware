const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrnrveehpyxurmkfgquc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4jDpCA9GMSJaxxWOJv_b4g_LkN1q40E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAll() {
  const { data } = await supabase.from('Product').select('id, name, price, discountPrice, stockQuantity, coverImage, specs');
  const monitors = data.filter(p => p.specs && JSON.stringify(p.specs).includes('inch') || (p.name && p.name.includes('Màn Hình')));
  console.log('Total monitor items:', monitors.length);
  monitors.forEach(m => {
    console.log(`ID: ${m.id} | Name: ${m.name} | Cover: ${m.coverImage}`);
  });
}

listAll();

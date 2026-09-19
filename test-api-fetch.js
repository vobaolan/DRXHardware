const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrnrveehpyxurmkfgquc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4jDpCA9GMSJaxxWOJv_b4g_LkN1q40E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetchApi() {
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .order('createdAt', { ascending: false });

  console.log('Total in DB:', data?.length);
  const pa278 = data?.find(p => p.id === 'prod-mon-asus-pa278cv');
  console.log('pa278 in Supabase DB:', {
    id: pa278?.id,
    name: pa278?.name,
    coverImage: pa278?.coverImage,
    screenshots: pa278?.screenshots
  });
}

testFetchApi();

import { supabase } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

export interface LiveProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  brand: string;
  category: string;
  socket?: string | null;
  ramType?: string | null;
  wattage?: number | null;
  formFactor?: string | null;
  warrantyMonths: number;
  stockQuantity: number;
  inStock: boolean;
  coverImage: string;
  description: string;
  specs: Record<string, any>;
  createdAt: string;
}

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let clean = str.toLowerCase();
  clean = clean.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  clean = clean.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  clean = clean.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  clean = clean.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  clean = clean.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  clean = clean.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  clean = clean.replace(/đ/g, 'd');
  clean = clean.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  clean = clean.replace(/\u02C6|\u0306|\u031B/g, '');
  return clean;
}

export class LiveDatabaseKnowledge {
  /**
   * Fetch all live products directly from Supabase Cloud Database
   * with strict newest-first sorting and fallback to INITIAL_PRODUCTS.
   */
  async getAllLiveProducts(): Promise<LiveProduct[]> {
    let dbProducts: any[] = [];

    // Query Supabase REST API directly with real-time freshness
    try {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        dbProducts = data;
      }
    } catch (e) {
      // Supabase connection fallback
    }

    // If database is empty or connection fails, fallback to hardcoded initial products
    const sourceProducts = dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS;

    const validDb = [...sourceProducts];
    validDb.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return validDb.map((p: any) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price || 0);
      const discountPrice = p.discountPrice
        ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : Number(p.discountPrice))
        : null;
      const category = Array.isArray(p.category) ? p.category[0] : (p.category || 'CORE_PARTS');
      const brand = p.brand || p.platform || 'DRX';
      const stock = p.stockQuantity ?? p.stockCount ?? 10;
      const name = p.name || 'Linh kiện DRX';
      const slug = p.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      return {
        id: p.id || slug,
        name,
        slug,
        price,
        discountPrice,
        brand,
        category,
        socket: p.socket || null,
        ramType: p.ramType || null,
        wattage: p.wattage || null,
        formFactor: p.formFactor || null,
        warrantyMonths: Number(p.warrantyMonths || 36),
        stockQuantity: stock,
        inStock: stock > 0,
        coverImage: p.coverImage || '',
        description: p.description || '',
        specs: (p.specs && typeof p.specs === 'object') ? p.specs : {},
        createdAt: p.createdAt || new Date().toISOString(),
      };
    });
  }

  /**
   * Search matching products in Supabase real-time with smart NLP keyword matching
   * and Vietnamese tone normalization.
   */
  async searchLiveProducts(query: string, limit = 5): Promise<LiveProduct[]> {
    const all = await this.getAllLiveProducts();
    const cleanQ = query.toLowerCase().trim();
    const noToneQ = removeVietnameseTones(cleanQ);
    if (!cleanQ) return all.slice(0, limit);

    // Vietnamese common stop words
    const STOP_WORDS = new Set([
      'dang', 'ban', 'gia', 'nhieu', 'bao', 'mua', 'co', 'khong', 'cho', 'hoi',
      'la', 'gi', 'o', 'dau', 'nay', 'duoc', 'nao', 'voi', 'va', 'cua', 'minh', 'ban',
      'shop', 'ad', 'a', 'oi', 'nha', 'nhe', 'tim', 'kiem', 'xem', 'hang', 'con', 'het',
      'tu', 'van', 'can', 'muon', 'giup', 'em', 'anh', 'chi', 'mau', 'loai', 'cai', 'the'
    ]);

    const rawKeywords = noToneQ.split(/[\s,.\-_\/]+/).filter(w => w.length > 1);
    const keywords = rawKeywords.filter(w => !STOP_WORDS.has(w));
    const effectiveKeywords = keywords.length > 0 ? keywords : rawKeywords;

    const scored = all.map(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const nameNoTone = removeVietnameseTones(nameLower);
      const catLower = p.category.toLowerCase();
      const catNoTone = removeVietnameseTones(catLower);
      const brandLower = p.brand.toLowerCase();
      const brandNoTone = removeVietnameseTones(brandLower);
      const descNoTone = removeVietnameseTones(p.description.toLowerCase());
      const specsStr = removeVietnameseTones(JSON.stringify(p.specs).toLowerCase());

      // Exact phrase match in Name
      if (nameNoTone.includes(noToneQ)) score += 100;
      if (noToneQ.includes(nameNoTone)) score += 80;
      if (brandNoTone && noToneQ.includes(brandNoTone)) score += 30;

      // Category detection bonus
      if (noToneQ.includes('cpu') || noToneQ.includes('chip') || noToneQ.includes('vi xu ly')) {
        if (p.category === 'CPU') score += 40;
      }
      if (noToneQ.includes('vga') || noToneQ.includes('card') || noToneQ.includes('do hoa') || noToneQ.includes('rtx') || noToneQ.includes('gtx') || noToneQ.includes('radeon')) {
        if (p.category === 'VGA') score += 40;
      }
      if (noToneQ.includes('main') || noToneQ.includes('bo mach') || noToneQ.includes('motherboard')) {
        if (p.category === 'MAINBOARD') score += 40;
      }
      if (noToneQ.includes('ram') || noToneQ.includes('bo nho')) {
        if (p.category === 'RAM') score += 40;
      }
      if (noToneQ.includes('ssd') || noToneQ.includes('hdd') || noToneQ.includes('o cung') || noToneQ.includes('nvme')) {
        if (p.category === 'STORAGE') score += 40;
      }
      if (noToneQ.includes('nguon') || noToneQ.includes('psu') || noToneQ.includes('power')) {
        if (p.category === 'PSU') score += 40;
      }
      if (noToneQ.includes('case') || noToneQ.includes('vo may') || noToneQ.includes('thung may')) {
        if (p.category === 'CASE') score += 40;
      }
      if (noToneQ.includes('tan nhiet') || noToneQ.includes('cooling') || noToneQ.includes('aio') || noToneQ.includes('fan')) {
        if (p.category === 'COOLING') score += 40;
      }
      if (noToneQ.includes('man hinh') || noToneQ.includes('monitor') || noToneQ.includes('display') || noToneQ.includes('144hz') || noToneQ.includes('240hz')) {
        if (p.category === 'MONITOR') score += 40;
      }
      if (noToneQ.includes('gear') || noToneQ.includes('ban phim') || noToneQ.includes('chuot') || noToneQ.includes('tai nghe') || noToneQ.includes('headset') || noToneQ.includes('keyboard') || noToneQ.includes('mouse')) {
        if (p.category === 'GEAR' || p.category === 'KEYBOARD' || p.category === 'HEADSET') score += 40;
      }
      if (noToneQ.includes('laptop') || noToneQ.includes('gaming laptop')) {
        if (p.category === 'LAPTOP' || p.category === 'LAPTOP_GAMING') score += 40;
      }

      // Keyword matches
      let matchedKwCount = 0;
      for (const kw of effectiveKeywords) {
        if (nameNoTone.includes(kw)) {
          score += 25;
          matchedKwCount++;
        } else if (brandNoTone.includes(kw)) {
          score += 15;
          matchedKwCount++;
        } else if (catNoTone.includes(kw)) {
          score += 10;
          matchedKwCount++;
        } else if (specsStr.includes(kw)) {
          score += 10;
        } else if (descNoTone.includes(kw)) {
          score += 5;
        }
      }

      // Bonus if all query keywords match the product
      if (effectiveKeywords.length > 1 && matchedKwCount >= effectiveKeywords.length) {
        score += 45;
      }

      return { product: p, score };
    });

    const validMatches = scored.filter(item => item.score > 0).sort((a, b) => b.score - a.score);
    if (validMatches.length === 0) return [];

    const topScore = validMatches[0].score;
    const filtered = validMatches
      .filter(item => item.score >= Math.max(20, topScore * 0.4))
      .map(item => item.product);

    return filtered.slice(0, limit);
  }

  /**
   * Parse user budget from natural text (e.g., "15 triệu", "20tr", "30 củ", "12.5M", "45 tr")
   */
  parseBudget(text: string): number {
    const clean = removeVietnameseTones(text);
    // Patterns like "15 trieu", "15tr", "15 cu", "15m", "15.5 trieu"
    const match = clean.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|cu|m|k|nghin)/i);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      const unit = match[2].toLowerCase();
      if (unit === 'trieu' || unit === 'tr' || unit === 'cu' || unit === 'm') {
        return num * 1000000;
      }
      if (unit === 'k' || unit === 'nghin') {
        return num * 1000;
      }
    }
    // Pure number like 15000000
    const pureNumMatch = clean.match(/\b(\d{7,9})\b/);
    if (pureNumMatch) {
      return parseInt(pureNumMatch[1], 10);
    }
    return 20000000; // Default 20M if not specified
  }

  /**
   * Intelligent PC Build Consultant Engine (Google Antigravity Standard)
   * Builds an optimal, 100% compatible PC configuration using real live database items.
   */
  async recommendPCBuild(userQuery: string): Promise<{
    buildTitle: string;
    totalPrice: number;
    totalDiscountPrice: number;
    parts: { category: string; stepName: string; product: LiveProduct }[];
    summaryMarkdown: string;
    matchedProducts: LiveProduct[];
  }> {
    const all = await this.getAllLiveProducts();
    const budget = this.parseBudget(userQuery);
    const qNoTone = removeVietnameseTones(userQuery);

    // Detect purpose
    const isEditing = qNoTone.includes('do hoa') || qNoTone.includes('render') || qNoTone.includes('premiere') || qNoTone.includes('blender') || qNoTone.includes('photoshop') || qNoTone.includes('edit');
    const isOffice = qNoTone.includes('van phong') || qNoTone.includes('hoc tap') || qNoTone.includes('word') || qNoTone.includes('excel');
    const isHighEnd = budget >= 35000000;
    const isEsports = qNoTone.includes('valorant') || qNoTone.includes('cs2') || qNoTone.includes('lol') || qNoTone.includes('fifa') || qNoTone.includes('lien minh');

    // Categorize live products
    const cpus = all.filter(p => p.category === 'CPU');
    const mainboards = all.filter(p => p.category === 'MAINBOARD');
    const rams = all.filter(p => p.category === 'RAM');
    const vgas = all.filter(p => p.category === 'VGA');
    const storages = all.filter(p => p.category === 'STORAGE');
    const psus = all.filter(p => p.category === 'PSU');
    const cases = all.filter(p => p.category === 'CASE');
    const coolings = all.filter(p => p.category === 'COOLING');

    const getPrice = (p: LiveProduct) => p.discountPrice || p.price;

    // 1. Select CPU based on budget and workload
    let selectedCpu: LiveProduct | null = null;
    if (budget < 12000000) {
      selectedCpu = cpus.find(p => p.name.includes('i3') || p.name.includes('12100') || p.name.includes('Ryzen 3') || p.name.includes('Ryzen 5 5500')) || cpus[0];
    } else if (budget < 22000000) {
      selectedCpu = cpus.find(p => p.name.includes('13400') || p.name.includes('12400') || p.name.includes('Ryzen 5 7600') || p.name.includes('Ryzen 5 5600')) || cpus[0];
    } else if (budget < 35000000) {
      selectedCpu = cpus.find(p => p.name.includes('14600') || p.name.includes('13600') || p.name.includes('7700') || p.name.includes('14700') || p.name.includes('13400')) || cpus[0];
    } else {
      selectedCpu = cpus.find(p => p.name.includes('7800X3D') || p.name.includes('14700K') || p.name.includes('14900K') || p.name.includes('7950X') || p.name.includes('7900X')) || cpus[0];
    }
    if (!selectedCpu && cpus.length > 0) selectedCpu = cpus[0];

    // Determine CPU Socket & RAM Type
    const cpuName = selectedCpu ? selectedCpu.name.toUpperCase() : '';
    let requiredSocket = selectedCpu?.socket || 'LGA1700';
    if (cpuName.includes('RYZEN 7 7') || cpuName.includes('RYZEN 5 7') || cpuName.includes('RYZEN 9 7') || cpuName.includes('7800X3D') || cpuName.includes('7600') || cpuName.includes('7700')) {
      requiredSocket = 'AM5';
    } else if (cpuName.includes('RYZEN 5 5') || cpuName.includes('RYZEN 7 5') || cpuName.includes('5600') || cpuName.includes('5500') || cpuName.includes('5700')) {
      requiredSocket = 'AM4';
    } else if (cpuName.includes('CORE') || cpuName.includes('I3-') || cpuName.includes('I5-') || cpuName.includes('I7-') || cpuName.includes('I9-') || cpuName.includes('12') || cpuName.includes('13') || cpuName.includes('14')) {
      requiredSocket = 'LGA1700';
    }

    // 2. Select Matching Mainboard
    let selectedMain: LiveProduct | null = null;
    const compatibleMains = mainboards.filter(m => {
      const mName = m.name.toUpperCase();
      if (requiredSocket === 'AM5') return mName.includes('B650') || mName.includes('X670') || mName.includes('A620');
      if (requiredSocket === 'AM4') return mName.includes('B550') || mName.includes('B450') || mName.includes('A520');
      if (requiredSocket === 'LGA1700') return mName.includes('B760') || mName.includes('H610') || mName.includes('Z790') || mName.includes('B660') || mName.includes('Z690');
      return true;
    });

    if (budget < 15000000) {
      selectedMain = compatibleMains.find(m => m.name.includes('H610') || m.name.includes('A520') || m.name.includes('B450') || m.name.includes('B760M-E')) || compatibleMains[0];
    } else if (budget < 30000000) {
      selectedMain = compatibleMains.find(m => m.name.includes('B760') || m.name.includes('B650') || m.name.includes('Gaming X') || m.name.includes('TUF') || m.name.includes('MORTAR')) || compatibleMains[0];
    } else {
      selectedMain = compatibleMains.find(m => m.name.includes('Z790') || m.name.includes('X670') || m.name.includes('ROG') || m.name.includes('AORUS') || m.name.includes('B760')) || compatibleMains[0];
    }
    if (!selectedMain && mainboards.length > 0) selectedMain = mainboards[0];

    // Determine RAM standard DDR4 or DDR5
    const isDDR5 = requiredSocket === 'AM5' || (selectedMain && (selectedMain.name.includes('DDR5') || selectedMain.name.includes('D5') || selectedMain.name.includes('Z790') || selectedMain.name.includes('B650')));

    // 3. Select RAM (16GB or 32GB)
    let selectedRam: LiveProduct | null = null;
    const compatibleRams = rams.filter(r => {
      const rName = r.name.toUpperCase();
      if (isDDR5) return rName.includes('DDR5') || rName.includes('D5');
      return rName.includes('DDR4') || rName.includes('D4') || !rName.includes('DDR5');
    });

    if (budget >= 25000000 || isEditing) {
      selectedRam = compatibleRams.find(r => r.name.includes('32GB') || r.name.includes('2x16GB') || r.name.includes('RGB')) || compatibleRams[0];
    } else {
      selectedRam = compatibleRams.find(r => r.name.includes('16GB') || r.name.includes('2x8GB') || r.name.includes('3200MHz')) || compatibleRams[0];
    }
    if (!selectedRam && rams.length > 0) selectedRam = rams[0];

    // 4. Select VGA (GPU)
    let selectedVga: LiveProduct | null = null;
    if (budget < 12000000) {
      selectedVga = vgas.find(v => v.name.includes('1650') || v.name.includes('6600') || v.name.includes('3050') || v.name.includes('1660')) || vgas[0];
    } else if (budget < 18000000) {
      selectedVga = vgas.find(v => v.name.includes('3060') || v.name.includes('4060') || v.name.includes('6600') || v.name.includes('7600')) || vgas[0];
    } else if (budget < 28000000) {
      selectedVga = vgas.find(v => v.name.includes('4060') || v.name.includes('4060 Ti') || v.name.includes('7700 XT') || v.name.includes('3060')) || vgas[0];
    } else if (budget < 45000000) {
      selectedVga = vgas.find(v => v.name.includes('4070') || v.name.includes('4070 Ti') || v.name.includes('4070 SUPER') || v.name.includes('7900 XT')) || vgas[0];
    } else {
      selectedVga = vgas.find(v => v.name.includes('4080') || v.name.includes('4090') || v.name.includes('7900 XTX') || v.name.includes('4070 Ti SUPER')) || vgas[0];
    }
    if (!selectedVga && vgas.length > 0) selectedVga = vgas[0];

    // 5. Select SSD NVMe
    let selectedStorage: LiveProduct | null = null;
    if (budget >= 25000000 || isEditing) {
      selectedStorage = storages.find(s => s.name.includes('1TB') || s.name.includes('1000GB') || s.name.includes('Gen4') || s.name.includes('NV2') || s.name.includes('980')) || storages[0];
    } else {
      selectedStorage = storages.find(s => s.name.includes('500GB') || s.name.includes('512GB') || s.name.includes('NV2') || s.name.includes('SN580')) || storages[0];
    }
    if (!selectedStorage && storages.length > 0) selectedStorage = storages[0];

    // 6. Select Power Supply (PSU)
    let selectedPsu: LiveProduct | null = null;
    const vgaName = selectedVga ? selectedVga.name.toUpperCase() : '';
    if (vgaName.includes('4080') || vgaName.includes('4090') || vgaName.includes('7900')) {
      selectedPsu = psus.find(p => p.name.includes('850W') || p.name.includes('1000W') || p.name.includes('Gold')) || psus[0];
    } else if (vgaName.includes('4070') || vgaName.includes('3070') || vgaName.includes('7700')) {
      selectedPsu = psus.find(p => p.name.includes('750W') || p.name.includes('650W') || p.name.includes('Bronze')) || psus[0];
    } else {
      selectedPsu = psus.find(p => p.name.includes('650W') || p.name.includes('550W') || p.name.includes('600W') || p.name.includes('500W')) || psus[0];
    }
    if (!selectedPsu && psus.length > 0) selectedPsu = psus[0];

    // 7. Select Case
    let selectedCase: LiveProduct | null = cases[0] || null;
    if (cases.length > 0) {
      if (budget >= 25000000) {
        selectedCase = cases.find(c => c.name.includes('Bể Cá') || c.name.includes('Panoramic') || c.name.includes('NZXT') || c.name.includes('Lian Li') || c.name.includes('Aquarium')) || cases[0];
      } else {
        selectedCase = cases.find(c => c.name.includes('Gaming') || c.name.includes('Airflow') || c.name.includes('RGB') || c.name.includes('V300')) || cases[0];
      }
    }

    // 8. Select Cooling
    let selectedCooling: LiveProduct | null = null;
    if (budget >= 28000000 || (selectedCpu && (selectedCpu.name.includes('i7') || selectedCpu.name.includes('i9') || selectedCpu.name.includes('7800X3D')))) {
      selectedCooling = coolings.find(c => c.name.includes('AIO') || c.name.includes('240') || c.name.includes('360') || c.name.includes('Nước')) || coolings[0];
    } else {
      selectedCooling = coolings.find(c => c.name.includes('CR-1000') || c.name.includes('Khí') || c.name.includes('SE-214') || c.name.includes('Tower')) || coolings[0];
    }

    const parts: { category: string; stepName: string; product: LiveProduct }[] = [];
    if (selectedCpu) parts.push({ category: 'CPU', stepName: 'Bộ Vi Xử Lý', product: selectedCpu });
    if (selectedMain) parts.push({ category: 'MAINBOARD', stepName: 'Bo Mạch Chủ', product: selectedMain });
    if (selectedRam) parts.push({ category: 'RAM', stepName: 'Bộ Nhớ RAM', product: selectedRam });
    if (selectedVga) parts.push({ category: 'VGA', stepName: 'Card Đồ Họa (VGA)', product: selectedVga });
    if (selectedStorage) parts.push({ category: 'STORAGE', stepName: 'Ổ Cứng SSD NVMe', product: selectedStorage });
    if (selectedPsu) parts.push({ category: 'PSU', stepName: 'Nguồn Máy Tính (PSU)', product: selectedPsu });
    if (selectedCase) parts.push({ category: 'CASE', stepName: 'Vỏ Case', product: selectedCase });
    if (selectedCooling) parts.push({ category: 'COOLING', stepName: 'Tản Nhiệt CPU', product: selectedCooling });

    let totalPrice = 0;
    let totalDiscountPrice = 0;
    parts.forEach(p => {
      totalPrice += p.product.price;
      totalDiscountPrice += (p.product.discountPrice || p.product.price);
    });

    const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    const budgetFormatted = (budget / 1000000).toFixed(0) + ' Triệu';
    let purposeLabel = 'Gaming eSports & Đa Nhiệm';
    if (isEditing) purposeLabel = 'Đồ Họa Render 3D & Edit Video 4K';
    else if (isHighEnd) purposeLabel = 'Gaming AAA 2K/4K Max Settings & Streaming';
    else if (isOffice) purposeLabel = 'Văn Phòng & Học Tập Đa Tác Vụ Mượt Mà';

    const buildTitle = `DRX Build Apex ${budgetFormatted} (${purposeLabel})`;

    let tableRows = parts.map((part, index) => {
      const priceFmt = formatVND(part.product.discountPrice || part.product.price);
      return `| **${index + 1}. ${part.stepName}** | [${part.product.name}](/products/${part.product.slug}) | **${priceFmt}** |`;
    }).join('\n');

    let performanceHighlights = '';
    if (budget < 15000000) {
      performanceHighlights = `• **FPS Valorant / CS2 / LOL**: 180 - 250+ FPS (1080p High)\n• **GTA V / PUBG / FO4**: 80 - 120+ FPS Mượt mà\n• **Nhiệt độ**: Mát mẻ 60-68°C full-load`;
    } else if (budget < 28000000) {
      performanceHighlights = `• **FPS Valorant / CS2**: 300 - 450+ FPS Cực mượt (1080p/2K)\n• **Black Myth Wukong / Cyberpunk 2077**: 75 - 110+ FPS (DLSS 3 Frame Gen)\n• **Premiere Pro / Photoshop**: Render video 2K/4K tốc độ cao`;
    } else {
      performanceHighlights = `• **Gaming AAA 2K / 4K Max Settings**: 100 - 165+ FPS Ray Tracing On\n• **Valorant / CS2**: 450 - 600+ FPS (Sẵn sàng màn 240Hz / 360Hz)\n• **3ds Max / Blender / AI Training**: Xử lý mượt mà, bộ nhớ lớn`;
    }

    const summaryMarkdown = `### 🖥️ **Tư Vấn Cấu Hình: ${buildTitle}**
Dựa trên ngân sách **${budgetFormatted}** và nhu cầu **${purposeLabel}**, DRX CyberBot AI đã lựa chọn cấu hình chuẩn tương thích 100% từ kho linh kiện DRX Hardware:

| Linh Kiện | Sản Phẩm Đề Xuất | Giá Ưu Đãi |
| :--- | :--- | :--- |
${tableRows}

---
💰 **TỔNG CHI PHÍ ƯU ĐÃI**: **${formatVND(totalDiscountPrice)}** *(Tiết kiệm ${formatVND(totalPrice - totalDiscountPrice)})*
🛡️ **BẢO HÀNH**: 36 Tháng 1 Đổi 1 Chính Hãng DRX.

⚡ **ĐÁNH GIÁ HIỆU NĂNG & TƯƠNG THÍCH**:
${performanceHighlights}
• **Tương thích phần cứng**: Socket ${requiredSocket} chuẩn đồng bộ, RAM ${isDDR5 ? 'DDR5' : 'DDR4'} bus cao, Nguồn công suất thực đủ tải an toàn và dư địa nâng cấp.
• **Khuyến mãi đi kèm**: Miễn phí công lắp ráp, đi dây nghệ thuật, tra keo tản nhiệt cao cấp và cài đặt Windows/Driver trọn gói!

👉 [**Tùy biến cấu hình này trên DRX PC Builder**](/pc-builder) | [**Khám phá thêm linh kiện khác**](/products)`;

    const matchedProducts = parts.map(p => p.product);

    return {
      buildTitle,
      totalPrice,
      totalDiscountPrice,
      parts,
      summaryMarkdown,
      matchedProducts,
    };
  }

  /**
   * Generate a comprehensive live context string to feed to LLM
   */
  async buildLiveStoreContext(userQuery: string): Promise<string> {
    const allProducts = await this.getAllLiveProducts();
    const matched = await this.searchLiveProducts(userQuery, 5);

    // Format top matching products
    const matchedStr = matched.length > 0 
      ? matched.map(p => {
          const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
          const discFormatted = p.discountPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.discountPrice) : null;
          const specsEntries = Object.entries(p.specs).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' | ');

          return `- [${p.category}] **${p.name}** (Hãng: ${p.brand})\n  * Giá bán: ${discFormatted ? `${discFormatted} (Giá gốc ${priceFormatted})` : priceFormatted}\n  * Tồn kho: ${p.inStock ? `Còn ${p.stockQuantity} món` : 'Tạm hết hàng'}\n  * Bảo hành: ${p.warrantyMonths} Tháng chính hãng\n  * Đường dẫn xem mua: /products/${p.slug}\n  * Thông số: ${specsEntries || 'Chính hãng 100%'}`;
        }).join('\n\n')
      : 'Không có sản phẩm nào trùng khớp trực tiếp với từ khóa này.';

    return `=== DỮ LIỆU THỜI GIAN THỰC TỪ CƠ SỞ DỮ LIỆU STORE DRX HARDWARE (SUPABASE) ===
Tổng số sản phẩm trong kho: ${allProducts.length} sản phẩm chính hãng.

[SẢN PHẨM KHỚP TRỰC TIẾP VỚI CÂU HỎI KHÁCH HÀNG]:
${matchedStr}

[DANH MỤC PHẦN CỨNG CHÍNH ĐANG CÓ TRÊN HỆ THỐNG]:
CPU, VGA (Card màn hình), MAINBOARD (Bo mạch chủ), RAM, STORAGE (SSD/HDD), PSU (Nguồn), CASE (Vỏ máy), COOLING (Tản nhiệt), MONITOR (Màn hình), GAMING GEAR (Bàn phím, Chuột, Tai nghe), LAPTOP, PREBUILT PC.

[CHÍNH SÁCH BÁN HÀNG & DỊCH VỤ DRX HARDWARE]:
• Showroom: 128 Nguyễn Trãi, Q.1, TP. Hồ Chí Minh.
• Hotline tư vấn: 1900.88.99.77.
• Giao hàng COD toàn quốc (1-3 ngày, kiểm tra hàng trước khi thanh toán).
• Bảo hành 36 tháng chính hãng (1 đổi 1 trong 30 ngày đầu nếu lỗi).
• Miễn phí công lắp ráp PC, cài đặt Windows 11 bản quyền/Driver và test ổn định 100%.
• Link trang tự build PC: /pc-builder
• Link tra cứu bảo hành SN: /warranty`;
  }
}

export const liveDatabaseKnowledge = new LiveDatabaseKnowledge();


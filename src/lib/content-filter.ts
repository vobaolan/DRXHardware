/**
 * Bộ lọc kiểm duyệt nội dung, từ ngữ thô tục, chửi thề và phát ngôn sai mục đích cho DRX Hardware
 */

// Danh sách các từ ngữ chửi thề, thô tục, xúc phạm, cờ bạc, lừa đảo
const PROFANITY_LIST = [
  // Tiếng Việt thông dụng & viết tắt (Teencode / viết tắt)
  'đm', 'dm', 'đcm', 'dcm', 'đmm', 'dmm', 'đmm', 'dcmm', 'vcl', 'vkl', 'clm', 'clgt', 'cmm', 'cc', 'ccl', 'vcc',
  'lồn', 'lon', 'loz', 'lồz', 'lìn', 'lin', 'cặc', 'cac', 'cak', 'kac', 'buồi', 'buoi', 'bùi', 'dái', 'chim',
  'đụ', 'du', 'đụ má', 'du ma', 'đụ mẹ', 'du me', 'địt', 'dit', 'địt mẹ', 'dit me', 'địt con mẹ', 'dit con me',
  'đéo', 'deo', 'đéch', 'dech', 'mẹ mày', 'me may', 'bố mày', 'bo may', 'ông nội mày', 'bà già mày',
  'chó đẻ', 'cho de', 'chó má', 'cho ma', 'óc chó', 'oc cho', 'ngu học', 'ngu hoc', 'ngu lol', 'ngu lồn', 'ngu vcl',
  'đĩ', 'di', 'con đĩ', 'con di', 'đĩ mẹ', 'di me', 'cave', 'phò', 'pho', 'gái bao', 'gai bao', 'gái gọi', 'gai goi',
  'súc vật', 'suc vat', 'khốn nạn', 'khon nan', 'thằng chó', 'thang cho', 'bố láo', 'bo lao', 'mất dạy', 'mat day',
  'đồ ngu', 'do ngu', 'thằng điên', 'thang dien', 'con điên', 'con dien', 'biến mẹ', 'bien me', 'cút mẹ', 'cut me',
  'cút đi', 'cut di', 'đụ cụ', 'du cu', 'thằng rác', 'thang rac', 'thất đức', 'that duc',

  // Cờ bạc, lừa đảo, quảng cáo bẩn (Spam / Scam)
  'lừa đảo', 'lua dao', 'scam', 'scammer', 'tài xỉu', 'tai xiu', 'cờ bạc', 'co bac', 'bắn cá', 'ban ca',
  'đánh bạc', 'danh bac', 'cược bóng', 'cuoc bong', 'kèo bóng', 'keo bong', 'nhà cái', 'nha cai', 'kubet',
  'thabet', 'sunwin', 'b52', 'go88', 'rikvip', 'sex', 'phim heo', 'phim sex', 'khiêu dâm', 'khieu dam',
  'cho vay nặng lãi', 'vay tiền', 'bốc bát họ', 'gái massage', 'gai massage', 'tìm sugar', 'sugar baby',

  // Tiếng Anh thô tục
  'fuck', 'fucking', 'fucker', 'motherfucker', 'bitch', 'asshole', 'shit', 'bullshit', 'cunt', 'dick',
  'pussy', 'bastard', 'whore', 'slut', 'nigger', 'nigga', 'retard', 'idiot', 'moron', 'stfu', 'wtf'
];

/**
 * Chuẩn hóa chuỗi văn bản để loại bỏ các ký tự ẩn / bypass lọc từ
 * Ví dụ: "đ.m", "d_m", "c*c", "l.ồ.n", "d u m a" -> "dm", "cc", "lon", "duma"
 */
function normalizeText(input: string): string {
  if (!input) return '';
  
  let normalized = input.toLowerCase();

  // Chuyển đổi các ký tự thay thế phổ biến (@ -> a, 0 -> o, 1 -> i, 3 -> e, 5 -> s, etc.)
  normalized = normalized
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i')
    .replace(/\+/g, 't');

  // Chuyển ký tự có dấu thành không dấu
  normalized = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');

  return normalized;
}

export interface ContentFilterResult {
  isValid: boolean;
  reason?: string;
  matchedWords?: string[];
}

/**
 * Kiểm tra nội dung đánh giá có hợp lệ hay vi phạm
 */
export function validateReviewContent(content: string): ContentFilterResult {
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      reason: 'Nội dung nhận xét không được để trống.',
    };
  }

  const trimmed = content.trim();

  // 1. Kiểm tra độ dài tối thiểu
  if (trimmed.length < 3) {
    return {
      isValid: false,
      reason: 'Nội dung nhận xét quá ngắn. Vui lòng chia sẻ tối thiểu 3 ký tự.',
    };
  }

  // 2. Kiểm tra spam lặp ký tự (ví dụ: "aaaaaaaaaaaaaaaa", "................")
  const repeatedCharPattern = /(.)\1{9,}/;
  if (repeatedCharPattern.test(trimmed)) {
    return {
      isValid: false,
      reason: 'Phát hiện nội dung có dấu hiệu spam ký tự lặp lại. Vui lòng nhập nhận xét có nghĩa!',
    };
  }

  // 3. Chuẩn hóa chuỗi
  const normalized = normalizeText(trimmed);
  const normalizedNoSymbols = normalized.replace(/[^a-z0-9\s]/g, ' ');
  const normalizedCompressed = normalized.replace(/[^a-z0-9]/g, '');

  const words = normalizedNoSymbols.split(/\s+/).filter(Boolean);
  const matchedWords: string[] = [];

  // 4. Kiểm tra từng từ thô tục
  for (const item of PROFANITY_LIST) {
    const cleanItem = normalizeText(item);
    
    // Nếu từ khóa có nhiều từ (như "me may", "du ma")
    if (cleanItem.includes(' ')) {
      if (normalizedNoSymbols.includes(cleanItem) || normalizedCompressed.includes(cleanItem.replace(/\s+/g, ''))) {
        matchedWords.push(item);
      }
    } else {
      // Từ đơn lẻ (như "dm", "vcl", "lon", "fuck")
      // Kiểm tra chính xác từ nguyên vẹn hoặc từ có dấu chấm/ngăn cách
      const isExactWord = words.includes(cleanItem);
      const isSurroundedWord = new RegExp(`\\b${cleanItem}\\b`, 'i').test(normalizedNoSymbols);
      
      if (isExactWord || isSurroundedWord) {
        matchedWords.push(item);
      }
    }
  }

  // 5. Kiểm tra chèn số điện thoại quảng cáo hoặc link cá độ độc hại
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|\.com|\.vn|\.net|\.xyz|\.vip|\.top)/i;
  if (urlPattern.test(trimmed)) {
    return {
      isValid: false,
      reason: 'Nội dung không được phép chứa liên kết web (link) hoặc quảng cáo ngoài DRX Hardware.',
      matchedWords: ['URL / Link quảng cáo'],
    };
  }

  if (matchedWords.length > 0) {
    const uniqueMatched = Array.from(new Set(matchedWords));
    return {
      isValid: false,
      reason: `Nội dung nhận xét chứa từ ngữ không phù hợp hoặc vi phạm chuẩn mực văn hóa DRX (${uniqueMatched.slice(0, 3).join(', ')}). Vui lòng sử dụng ngôn từ lịch sự để chia sẻ trải nghiệm!`,
      matchedWords: uniqueMatched,
    };
  }

  return {
    isValid: true,
  };
}

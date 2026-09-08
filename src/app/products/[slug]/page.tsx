'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { 
  ShoppingCart, Heart, ShieldCheck, ChevronLeft, ChevronRight, 
  Star, Maximize2, X, ArrowLeft, CheckCircle2, Play, Truck,
  MessageSquare, User, Send, Cpu, HardDrive, Laptop, Award, Gamepad2, Monitor, Tag, Clock, Check, Wrench, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  embedUrl?: string | null;
  thumbnailUrl: string;
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { showToast } = useToast();
  const { addToCart, setCartOpen } = useCart();
  const [realProduct, setRealProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  // User Account State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Customer Reviews State
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Computed average rating from real Supabase reviews
  const averageRating = useMemo(() => {
    if (!userReviews || userReviews.length === 0) return '5.0';
    const total = userReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    return (total / userReviews.length).toFixed(1);
  }, [userReviews]);

  // Load Current Logged In User from session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { getStoredSessionUser, verifyCurrentSession } = await import('@/lib/auth-client');
        let user = getStoredSessionUser();
        if (!user) {
          user = await verifyCurrentSession();
        }
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    checkUser();
  }, []);

  // Fetch real product from database API with fallback
  useEffect(() => {
    setIsLoading(true);
    const decodedSlug = decodeURIComponent(params.slug || '').trim().toLowerCase();

    fetch(`/api/products/${encodeURIComponent(decodedSlug)}?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (data && data.product) {
          setRealProduct(data.product);
        } else {
          // Fallback to local hardware data
          const fallback = INITIAL_PRODUCTS.find(p => 
            p.slug.toLowerCase() === decodedSlug || 
            p.id === decodedSlug ||
            decodedSlug.includes(p.slug.toLowerCase()) ||
            p.slug.toLowerCase().includes(decodedSlug)
          );
          if (fallback) setRealProduct(fallback);
        }
      })
      .catch(() => {
        // Direct local fallback on error
        const fallback = INITIAL_PRODUCTS.find(p => 
          p.slug.toLowerCase() === decodedSlug || 
          p.id === decodedSlug ||
          decodedSlug.includes(p.slug.toLowerCase()) ||
          p.slug.toLowerCase().includes(decodedSlug)
        );
        if (fallback) setRealProduct(fallback);
      })
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  const product = realProduct;

  // Save recently viewed product to localStorage
  useEffect(() => {
    if (product && product.id && product.name) {
      try {
        const stored = localStorage.getItem('ods_recently_viewed');
        let list = stored ? JSON.parse(stored) : [];
        list = list.filter((p: any) => p.id !== product.id && p.slug !== product.slug);
        list.unshift({
          id: product.id,
          name: product.name,
          slug: product.slug,
          coverImage: product.coverImage,
          price: product.price,
          discountPrice: product.discountPrice,
          brand: product.brand,
          category: product.category,
        });
        localStorage.setItem('ods_recently_viewed', JSON.stringify(list.slice(0, 10)));
      } catch (e) {
        console.error('Lỗi lưu sản phẩm vừa xem:', e);
      }
    }
  }, [product]);

  // Load real reviews from Supabase API
  useEffect(() => {
    if (product && product.id) {
      setIsLoadingReviews(true);
      fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}&t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.reviews)) {
            setUserReviews(data.reviews);
          } else {
            setUserReviews([]);
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải đánh giá từ Supabase:', err);
          setUserReviews([]);
        })
        .finally(() => setIsLoadingReviews(false));
    }
  }, [product?.id]);

  // Handle Review Submission to Supabase API
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá của bạn!', 'error');
      return;
    }
    if (!product?.id) {
      showToast('Không tìm thấy thông tin sản phẩm!', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const authorName = currentUser?.name || 'Khách Hàng DRX';
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment.trim(),
          userId: currentUser?.id || null,
          authorName: authorName
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi khi gửi đánh giá');
      }

      if (data.review) {
        setUserReviews((prev) => [data.review, ...prev]);
      }

      setNewComment('');
      setNewRating(5);
      showToast('Cảm ơn bạn đã gửi đánh giá thực tế cho sản phẩm!', 'success');
    } catch (err: any) {
      console.error('Lỗi gửi đánh giá:', err);
      showToast(err.message || 'Không thể gửi đánh giá, vui lòng thử lại sau!', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Gallery items formatting
  const mediaItems: MediaItem[] = useMemo(() => {
    if (!product) return [];
    const items: MediaItem[] = [];

    const primaryImg = product.coverImage || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80';
    items.push({
      id: 'media-cover',
      type: 'image',
      url: primaryImg,
      thumbnailUrl: primaryImg,
    });

    if (Array.isArray(product.screenshots)) {
      product.screenshots.forEach((shot: string, idx: number) => {
        if (shot && shot !== primaryImg) {
          items.push({
            id: `media-shot-${idx}`,
            type: 'image',
            url: shot,
            thumbnailUrl: shot,
          });
        }
      });
    }

    return items;
  }, [product]);

  const activeMedia = mediaItems[activeMediaIdx] || mediaItems[0];

  const handleNextMedia = () => {
    setActiveMediaIdx((prev) => (prev + 1) % mediaItems.length);
  };

  const handlePrevMedia = () => {
    setActiveMediaIdx((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const formatCurrency = (value: number) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  };

  const activePrice = product?.discountPrice ?? product?.price ?? 0;
  const originalPrice = product?.price ?? 0;
  const hasDiscount = product?.discountPrice !== null && product?.discountPrice !== undefined && product?.discountPrice < originalPrice;
  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      coverImage: product.coverImage,
      platform: product.brand || 'DRX',
    });
    setCartOpen(true);
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col antialiased">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Đang tải thông số kỹ thuật sản phẩm...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col antialiased">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center mx-auto text-3xl font-black border border-sky-200 dark:border-sky-800 shadow-sm">
            🔍
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900 dark:text-white">
            Không Tìm Thấy Linh Kiện
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Linh kiện này có thể đã được cập nhật tên hoặc thay đổi đường dẫn mã sản phẩm.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/" className="px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all">
              Về Trang Chủ
            </Link>
            <Link href="/products" className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all">
              Xem Tất Cả Linh Kiện
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col antialiased">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* BACK NAVIGATION */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 text-[#0284c7]" /> Quay Lại Cửa Hàng
        </Link>

        {/* MAIN PRODUCT BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* UNIFIED MEDIA GALLERY COMPONENT (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Big Main Media Viewer */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group select-none shadow-sm flex items-center justify-center p-4">
              {activeMedia ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMedia.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative h-full w-full flex items-center justify-center"
                  >
                    <img
                      src={activeMedia.url}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain cursor-pointer hover:scale-[1.03] transition-transform duration-500 drop-shadow-md"
                      onClick={() => setIsFullscreen(true)}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : null}
              
              {/* Discount Badge */}
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md z-30 pointer-events-none">
                  -{discountPercent}% OFF
                </span>
              )}

              {/* Fullscreen Zoom Button */}
              {activeMedia && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-slate-900/70 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900 z-30 cursor-pointer"
                  title="Xem ảnh phóng to"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}

              {/* Left / Right Carousel Controls */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm active:scale-90 z-30 cursor-pointer"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm active:scale-90 z-30 cursor-pointer"
                    title="Ảnh tiếp theo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Media Thumbnails Strip */}
            {mediaItems.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2 px-1">
                {mediaItems.map((item, idx) => {
                  const isActive = activeMediaIdx === idx;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveMediaIdx(idx)}
                      className={`relative aspect-[16/10] w-24 overflow-hidden rounded-xl border bg-white dark:bg-slate-900 p-1.5 transition-all duration-300 shrink-0 cursor-pointer ${
                        isActive
                          ? 'border-[#0284c7] ring-2 ring-[#0284c7]/50 shadow-md opacity-100'
                          : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={item.thumbnailUrl} alt={`media-thumb-${idx}`} className="w-full h-full object-contain" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PRODUCT BUY CONTROLS HERO (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Category & Brand Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/70 text-[#0284c7] dark:text-sky-300 border border-sky-200 dark:border-sky-800 shadow-2xs">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{product.brand || 'CHÍNH HÃNG'}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Tag className="h-2.5 w-2.5 text-slate-400" />
                  <span>{Array.isArray(product.category) ? product.category[0] : (product.category || 'LINH KIỆN')}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-3 w-3" />
                  <span>BH {product.warrantyMonths || 36} THÁNG</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Model Code */}
              {product.modelCode && (
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Mã sản phẩm: <span className="text-slate-700 dark:text-slate-300 font-bold">{product.modelCode}</span>
                </p>
              )}

              {/* RATING SUMMARY */}
              <button
                onClick={() => {
                  document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 mt-3 group cursor-pointer hover:opacity-85 transition-all text-left"
              >
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 fill-current ${i < Math.floor(averageRating) ? '' : 'text-slate-300 fill-none'}`} />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white ml-0.5">{averageRating} / 5.0</span>
                <span className="text-xs text-[#0284c7] font-bold underline underline-offset-4 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  ({userReviews.length} đánh giá khách hàng)
                </span>
              </button>
            </div>

            {/* Delivery & Warranty Policy Card */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3.5 shadow-xs">
              <Truck className="h-5 w-5 text-[#0284c7] shrink-0 mt-0.5" />
              <div>
                <span className="font-heading text-xs font-bold text-slate-900 dark:text-white uppercase block">
                  ĐÓNG GÓI & GIAO HÀNG TẬN NƠI (100% NGUYÊN SEAL)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-relaxed">
                  Cam kết hàng New Seal chính hãng. Bảo hành 36 Tháng (1 Đổi 1 trong 30 ngày). Hỗ trợ tư vấn ráp PC & cân chỉnh miễn phí.
                </p>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(activePrice)}</span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through font-semibold">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-lg">
                    GIẢM {discountPercent}%
                  </span>
                )}
              </div>
              {product.status !== false ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang còn hàng sẵn tại Showroom DRX (Sẵn sàng giao)
                </p>
              ) : (
                <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Tạm hết hàng (Liên hệ đặt trước)
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.status === false}
                className="col-span-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white py-3.5 text-xs font-extrabold uppercase tracking-wider shadow-md shadow-sky-500/25 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>THÊM VÀO GIỎ HÀNG</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => setWishlistAdded(!wishlistAdded)}
                className={`col-span-1 flex items-center justify-center rounded-xl border transition-all active:scale-95 py-3.5 cursor-pointer ${
                  wishlistAdded
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 hover:border-rose-300'
                }`}
                title="Lưu vào danh sách yêu thích"
              >
                <Heart className={`h-5 w-5 ${wishlistAdded ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* LINK TO PC BUILDER IF PREBUILT PC */}
            {(product.isPrebuilt || (Array.isArray(product.category) ? product.category.includes('PREBUILT_PC') : product.category === 'PREBUILT_PC') || product.name?.toLowerCase().includes('pc gaming')) && (
              <Link
                href="/pc-builder?preset=intel"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-100 dark:hover:bg-sky-900/80 text-[#0284c7] dark:text-sky-300 py-3 text-xs font-heading font-black uppercase tracking-wider border border-sky-200 dark:border-sky-800 transition-all cursor-pointer shadow-2xs"
              >
                <Wrench className="h-4 w-4" />
                <span>Tùy Biến Cấu Hình Này Trong DRX PC Builder</span>
              </Link>
            )}

            {/* Commitments */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Cam kết 100% linh kiện chính hãng full box</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Hỗ trợ kỹ thuật và tra cứu bảo hành Serial trực tuyến</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS, HARDWARE SPECS & REVIEWS SECTION */}
        <div className="space-y-10">

          {/* 1. HARDWARE SPECIFICATIONS TABLE */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-heading text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#0284c7]" />
              <span>THÔNG SỐ KỸ THUẬT PHẦN CỨNG</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-bold">Thương hiệu:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{product.brand || 'Chính Hãng'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-bold">Danh mục linh kiện:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{Array.isArray(product.category) ? product.category[0] : (product.category || 'VGA')}</span>
              </div>
              {product.modelCode && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">Model Code:</span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-white">{product.modelCode}</span>
                </div>
              )}
              {product.socket && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">Socket CPU hỗ trợ:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{product.socket}</span>
                </div>
              )}
              {product.ramType && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">Chuẩn RAM / VRAM:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{product.ramType}</span>
                </div>
              )}
              {product.wattage > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">Công suất điện (TDP):</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{product.wattage} W</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-bold">Thời hạn bảo hành:</span>
                <span className="font-extrabold text-emerald-600">{product.warrantyMonths || 36} Tháng (1 Đổi 1)</span>
              </div>
              
              {/* Dynamic Specs */}
              {product.specs && typeof product.specs === 'object' && Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">{key}:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. PRODUCT DESCRIPTION */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="font-heading text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-[#0284c7]" />
              <span>MÔ TẢ CHI TIẾT SẢN PHẨM</span>
            </h2>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-normal pt-1">
              {product.description ? (
                product.description.split('\n\n').map((paragraph: string, idx: number) => {
                  const isSectionBox = paragraph.includes('ĐẶC ĐIỂM NỔI BẬT') || paragraph.includes('THÔNG SỐ TIÊU BIỂU') || paragraph.includes('ĐÁNH GIÁ TỔNG QUAN');
                  if (isSectionBox) {
                    const lines = paragraph.split('\n');
                    const headingText = lines[0];
                    const contentLines = lines.slice(1);
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                        <h4 className="font-heading text-xs font-black text-[#0284c7] dark:text-[#38bdf8] uppercase tracking-wider">
                          {headingText}
                        </h4>
                        <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                          {contentLines.map((line: string, lIdx: number) => (
                            <p key={lIdx} className="leading-relaxed">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="leading-relaxed text-slate-700 dark:text-slate-300 text-sm">
                      {paragraph}
                    </p>
                  );
                })
              ) : (
                <p className="text-slate-400 italic">Đang cập nhật mô tả chi tiết cho sản phẩm này...</p>
              )}
            </div>
          </div>

          {/* 3. REAL CUSTOMER REVIEWS (SYNCHRONIZED WITH SUPABASE) */}
          <div id="reviews-section" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <h2 className="font-heading text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#0284c7]" />
                <span>ĐÁNH GIÁ TỪ KHÁCH HÀNG ({userReviews.length})</span>
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>⭐ {averageRating} / 5.0</span>
                  <span className="text-[10px] text-slate-400 font-normal">({userReviews.length} lượt đánh giá)</span>
                </span>
              </div>
            </div>

            {/* WRITE REVIEW FORM */}
            <form onSubmit={handleAddReview} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-4">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-[#0284c7]" />
                <span>Gửi Nhận Xét Của Bạn (Lưu trực tiếp vào Database Supabase)</span>
              </h4>

              {/* Star Rating Picker */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Chọn Số Sao Đánh Giá:</label>
                <div className="flex items-center gap-1 text-amber-400 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setNewHoverRating(star)}
                      onMouseLeave={() => setNewHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= (newHoverRating || newRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600 fill-none'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Nội Dung Đánh Giá:</label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm, hiệu năng, nhiệt độ, đóng gói..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang Gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Đánh Giá</span>
                  </>
                )}
              </button>
            </form>

            {/* REVIEWS LIST FROM SUPABASE */}
            {isLoadingReviews ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Đang tải đánh giá từ hệ thống...
              </div>
            ) : userReviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên nhận xét!
              </div>
            ) : (
              <div className="space-y-3">
                {userReviews.map((rev) => (
                  <div key={rev.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {rev.author.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.author}</span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Đã mua tại DRX
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 fill-current ${i < rev.rating ? '' : 'text-slate-300 fill-none'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {isFullscreen && activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 text-white hover:text-[#0284c7] font-bold text-xl p-2 cursor-pointer"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={activeMedia.url}
              alt="Fullscreen Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

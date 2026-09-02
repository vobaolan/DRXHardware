'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DepositPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center text-xs font-bold text-slate-500">
      Đang chuyển hướng về Trang Chủ DRX Hardware...
    </div>
  );
}

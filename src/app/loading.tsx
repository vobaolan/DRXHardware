export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-[#070a13]/90 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center animate-pulse">
        <div className="flex items-center gap-4">
          <img 
            src="/logo/symbol-white.png"
            alt="DRX"
            className="w-12 h-12 object-contain hidden dark:inline-block"
          />
          <img 
            src="/logo/symbol-black.png"
            alt="DRX"
            className="w-12 h-12 object-contain inline-block dark:hidden"
          />
          <span className="font-heading font-black italic tracking-tighter text-3xl text-[#102284] dark:text-white">
            DRX
          </span>
          <div className="w-[3px] h-8 bg-[#102284] dark:bg-[#38bdf8] rounded-full self-center" />
        </div>
        <div className="w-20 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[#102284] dark:bg-[#38bdf8] rounded-full animate-[shimmer_1.2s_infinite]" />
        </div>
      </div>
    </div>
  );
}

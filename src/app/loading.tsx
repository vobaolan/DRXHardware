export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-[#070a13]/90 backdrop-blur-md">
      <div className="flex items-center gap-4 animate-pulse">
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
    </div>
  );
}

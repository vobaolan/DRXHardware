export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#070a13]">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-2 border-[#0284c7] border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

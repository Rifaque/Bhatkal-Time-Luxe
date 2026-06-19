export default function Loader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#D1B23E]/15" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D1B23E] animate-spin" />
      </div>
      <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">Loading</p>
    </div>
  );
}

export function Button({ variant = "default", className = "", children, ...props }) {
    const baseStyles =
      "inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1B23E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60";
  
    const variantStyles = {
      default: "bg-[#D1B23E] text-black hover:bg-[#c1a22e]",
      ghost: "bg-transparent text-white hover:bg-white/10",
      secondary: "bg-white/5 text-white border border-white/10 hover:bg-[#D1B23E] hover:text-black hover:border-[#D1B23E]",
      link: "bg-transparent px-0 py-0 text-inherit hover:text-[#D1B23E] rounded-none focus-visible:ring-offset-0",
    };
  
    return (
      <button
        type={props.type || "button"}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

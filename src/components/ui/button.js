export function Button({ variant = "default", className = "", children, ...props }) {
    const baseStyles =
      "inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D1B23E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e] transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

    const variantStyles = {
      default: "bg-[#D1B23E] text-black hover:bg-[#c1a22e] hover:shadow-[0_4px_16px_rgba(209,178,62,0.2)]",
      ghost: "bg-transparent text-white hover:bg-white/8",
      secondary: "bg-white/8 text-white border border-white/20 hover:bg-[#D1B23E] hover:text-black hover:border-[#D1B23E] hover:shadow-[0_4px_12px_rgba(209,178,62,0.15)]",
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

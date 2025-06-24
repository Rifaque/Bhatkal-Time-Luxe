export function Button({ variant = "default", className = "", children, ...props }) {
    const baseStyles =
      "px-4 py-2 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300";
  
    const variantStyles = {
      default: "bg-yellow-500 text-black hover:bg-yellow-600",
      ghost: "bg-transparent text-white hover:bg-gray-700",
    };
  
    return (
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
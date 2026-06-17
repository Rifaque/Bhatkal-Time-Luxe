export function Card({ children, className }) {
    return (
      <div className={`bg-gray-800 rounded-2xl shadow-md p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children }) {
    return <div className="text-white">{children}</div>;
  }
  
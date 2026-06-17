export function Card({ children, className = '' }) {
    return (
      <div className={`rounded-2xl ${className}`}>
        {children}
      </div>
    );
  }

  export function CardContent({ children, className = '' }) {
    return <div className={className}>{children}</div>;
  }
  
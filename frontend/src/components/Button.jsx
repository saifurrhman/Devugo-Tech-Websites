import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Button({
  variant = 'primary',
  href,
  to,
  className = '',
  children,
  showArrow,
  type = 'button',
  onClick,
  disabled = false,
  ...props
}) {
  const isPrimary = variant === 'primary';
  const displayArrow = showArrow !== undefined ? showArrow : isPrimary;

  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[15px] sm:text-base px-7 py-3 transition-all duration-200 ease-out active:scale-[0.98] group focus:outline-none";
  
  const primaryClasses = "bg-[#0B1220] hover:bg-[#4361EE] text-white shadow-[0_4px_14px_rgba(11,18,32,0.15)] hover:shadow-[0_8px_24px_rgba(67,97,238,0.35)] hover:-translate-y-[2px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#0B1220] disabled:cursor-not-allowed cursor-pointer";
  
  const secondaryClasses = "bg-[#F5F7FB] hover:bg-[#DCE5FF] text-[#0B1220] border border-[#E7EBF3] hover:border-[#DCE5FF] shadow-sm hover:shadow-md hover:-translate-y-[2px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#F5F7FB] disabled:cursor-not-allowed cursor-pointer";

  const combinedClasses = `${baseClasses} ${isPrimary ? primaryClasses : secondaryClasses} ${className}`;

  const renderContent = () => (
    <>
      {children}
      {displayArrow && (
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} onClick={onClick} {...props}>
        {renderContent()}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} onClick={onClick} {...props}>
        {renderContent()}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClasses} onClick={onClick} disabled={disabled} {...props}>
      {renderContent()}
    </button>
  );
}

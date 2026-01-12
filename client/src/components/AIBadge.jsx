const AIBadge = ({ text = 'AI Powered', size = 'sm' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`${sizeClasses[size]} bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-full font-semibold flex items-center gap-1 inline-flex`}
    >
      <span>🤖</span>
      <span>{text}</span>
    </span>
  );
};

export default AIBadge;


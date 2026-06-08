// @/app/components/ui/Skeleton.tsx
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-gray-800 rounded-md ${className}`} 
    />
  );
}
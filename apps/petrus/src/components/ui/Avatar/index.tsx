import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/utils';
export type AvatarType = {
  onClick?: () => void;
  className?: string;
  src?: string;
};
export const Avatar = ({ onClick, src, className }: AvatarType) => {
  return (
    <Button
      variant="default"
      size="icon"
      className={cn('rounded-full w-10 h-10', className)}
      aria-label="Toggle theme"
    >
      {src ? (
        <img
          src={src}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <p>A</p>
      )}
    </Button>
  );
};

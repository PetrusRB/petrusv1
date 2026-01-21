import { Button } from '@/components/ui/button/Button';
export type AvatarType = {
  onClick?: () => void;
  src?: string;
};
export const Avatar = ({ onClick, src }: AvatarType) => {
  return (
    <Button
      variant="default"
      size="icon"
      className="rounded-full w-10 h-10"
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

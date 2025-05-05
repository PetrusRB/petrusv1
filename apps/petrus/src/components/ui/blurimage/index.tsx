import Image from "next/image";
import React, { useState } from "react";

// Tipos
type BlurImageProps = {
    uri: string,
    blurhash?: string,
    width?: number | string,
    height?: number | string
    className?: string
}
// Componente de imagem com blur
const BlurImage: React.FC<BlurImageProps> = ({ uri, blurhash, width, height, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="relative" style={{ width, height }}>
      {!isLoaded && blurhash && (
        <Image 
          src={blurhash} 
          alt="Image placeholder" 
          fill
          className={`transition-opacity duration-300 ${className || ''}`}
          style={{ objectFit: 'cover' }}
        />
      )}
      <Image 
        src={uri} 
        alt="Bot image" 
        fill
        className={`transition-opacity duration-300 ${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectFit: 'cover' }}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

export {BlurImage}
"use client";
import Image from 'next/image';

const elements = [
  { id: 1, src: "https://picsum.photos/150/150?random=1", alt: "Abstract 3D shape", dataAiHint: "geometric shape", position: "top-10 left-10", size: "w-20 h-20 md:w-28 md:h-28" },
  { id: 2, src: "https://picsum.photos/120/120?random=2", alt: "Stylized book", dataAiHint: "book illustration", position: "top-1/3 left-1/4", size: "w-24 h-24 md:w-32 md:h-32 rotate-12" },
  { id: 3, src: "https://picsum.photos/100/100?random=3", alt: "Floating pencil", dataAiHint: "pencil drawing", position: "top-3/4 left-1/2", size: "w-16 h-16 md:w-20 md:h-20 -rotate-12" },
  { id: 4, src: "https://picsum.photos/80/80?random=4", alt: "Coffee cup", dataAiHint: "coffee cup", position: "bottom-10 right-10", size: "w-12 h-12 md:w-20 md:h-20" },
  { id: 5, src: "https://picsum.photos/130/130?random=5", alt: "Geometric item", dataAiHint: "geometric item", position: "bottom-1/3 right-1/4", size: "w-16 h-16 md:w-24 md:h-24 rotate-45" },
  { id: 6, src: "https://picsum.photos/90/90?random=6", alt: "Sticky notes", dataAiHint: "sticky notes", position: "top-1/2 right-1/3", size: "w-14 h-14 md:w-18 md:h-18 -rotate-6" },
];

export function DecorativeAuthElements() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-70">
      {elements.map(el => (
        <div key={el.id} className={`absolute transform ${el.position} ${el.size}`}>
          <Image
            src={el.src}
            alt={el.alt}
            width={parseInt(el.size.split('md:w-')[1]) || parseInt(el.size.split('w-')[1]) * 4} // Approx sizes for Image component
            height={parseInt(el.size.split('md:h-')[1]) || parseInt(el.size.split('h-')[1]) * 4}
            className="object-contain opacity-80"
            data-ai-hint={el.dataAiHint}
          />
        </div>
      ))}
    </div>
  );
}

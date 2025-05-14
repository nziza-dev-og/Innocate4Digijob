"use client";
import Image from 'next/image';

const elements = [
  { id: 1, src: "https://i.pinimg.com/736x/64/12/06/641206a289958a7f8db1037a99c6992d.jpg", alt: "Abstract 3D shape", dataAiHint: "geometric shape", position: "top-10 left-10", size: "w-70 h-70 md:w-58 md:h-58" },
  { id: 2, src: "https://i.pinimg.com/736x/0f/9e/3c/0f9e3cdff8517fb81d175127d36c9e36.jpg", alt: "Stylized book", dataAiHint: "book illustration", position: "top-1/3 left-1/4", size: "w-64 h-64 md:w-42 md:h-42 rotate-12" },
  { id: 3, src: "https://i.pinimg.com/736x/ff/d8/27/ffd82764d06f53372ffbe0c6c3747d2a.jpg", alt: "Floating pencil", dataAiHint: "pencil drawing", position: "top-3/4 left-1/2", size: "w-60 h-60 md:w-40 md:h-40 -rotate-12" },
  { id: 4, src: "https://i.pinimg.com/736x/66/82/b3/6682b31b5916ca9b7b7e3d01644722d9.jpg", alt: "Coffee cup", dataAiHint: "coffee cup", position: "bottom-10 right-10", size: "w-82 h-82 md:w-60 md:h-60" },
  { id: 5, src: "https://i.pinimg.com/736x/53/1f/04/531f04b4be56404d771b55e9563e70f2.jpg", alt: "Geometric item", dataAiHint: "geometric item", position: "bottom-1/3 right-1/4", size: "w-70 h-70 md:w-54 md:h-54 rotate-45" },
  { id: 6, src: "https://i.pinimg.com/736x/6e/6d/25/6e6d259d859c01886bc4f1a36f666934.jpg", alt: "Router", dataAiHint: "sticky notes", position: "top-1/2 right-1/3", size: "w-70 h-70 md:w-58 md:h-58 -rotate-6" },
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

import { useState, useRef } from "react";

export default function InvoicelyLogo3D() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const textRef = useRef<HTMLHeadingElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (!textRef.current) return;
    
    const rect = textRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePos({ x, y });
  };

  const getColorAtPosition = (x: number, y: number) => {
    const distance = Math.sqrt(Math.pow(x - mousePos.x, 2) + Math.pow(y - mousePos.y, 2));
    
    if (distance < 20) return '#ff0080'; // Pink
    if (distance < 40) return '#7928ca'; // Purple
    if (distance < 60) return '#0070f3'; // Blue
    if (distance < 80) return '#00dfd8'; // Cyan
    return '#d1d5db'; // Gray
  };

  const strokeColor = getColorAtPosition(50, 50);
  const textShadow = `1px 1px 0 ${strokeColor}, 2px 2px 0 ${strokeColor}, 3px 3px 0 ${strokeColor}, 4px 4px 0 ${strokeColor}, 5px 5px 0 ${strokeColor}, 6px 6px 0 ${strokeColor}, 7px 7px 0 ${strokeColor}, 8px 8px 0 ${strokeColor}, 9px 9px 0 #d1d5db, 10px 10px 0 #d1d5db, 11px 11px 0 #d1d5db, 12px 12px 0 #d1d5db, 13px 13px 0 #d1d5db, 14px 14px 0 #d1d5db, 15px 15px 0 #d1d5db, 16px 16px 20px rgba(0, 0, 0, 0.1)`;

  return (
    <section className="py-20 px-8 overflow-hidden">
      <div className="max-w-[1100px] mx-auto text-center">
        <h2 
          ref={textRef}
          onMouseMove={handleMouseMove}
          className="text-[8rem] md:text-[12rem] font-bold font-dm-sans tracking-wider cursor-pointer select-none transition-all duration-100"
          style={{
            color: 'transparent',
            WebkitTextStroke: `2px ${strokeColor}`,
            textShadow
          }}
        >
          INVOICELY
        </h2>
      </div>
    </section>
  );
}

'use client'
import { memo, useState, useEffect, useRef } from 'react';

interface IridescenceProps {
    color?: [number, number, number];
    speed?: number;
    amplitude?: number;
    mouseReact?: boolean;
    className?: string;
}

const IridescenceCSS = memo(function IridescenceCSS({
    color = [1, 1, 1],
    speed = 1.0,
    amplitude = 0.1,
    mouseReact = true,
    className = '',
    ...rest
}: IridescenceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    
    // Convert color array to CSS-friendly format
    const colorR = Math.round(color[0] * 255);
    const colorG = Math.round(color[1] * 255);
    const colorB = Math.round(color[2] * 255);
    
    // Ensure speed is a valid number and calculate animation duration
    const validSpeed = typeof speed === 'number' && speed > 0 ? speed : 1.0;
    const animationDuration = 20 / validSpeed;
    
    // Handle mouse movement for interactive effect
    useEffect(() => {
        if (!mouseReact || !containerRef.current) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            setMousePosition({ 
                x: Math.max(0, Math.min(1, x)), 
                y: Math.max(0, Math.min(1, y)) 
            });
        };
        
        const container = containerRef.current;
        container.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseReact]);
    
    // Calculate mouse-influenced gradient position
    const mouseInfluence = mouseReact ? amplitude * 100 : 0;
    const gradientX = 50 + (mousePosition.x - 0.5) * mouseInfluence;
    const gradientY = 50 + (mousePosition.y - 0.5) * mouseInfluence;
    
    return (
        <>
            {/* Global styles for keyframes */}
            <style jsx global>{`
                @keyframes iridescent-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes iridescent-pulse {
                    0% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.05); }
                    100% { opacity: 0.2; transform: scale(1); }
                }
                
                @keyframes iridescent-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .iridescent-container {
                    background: linear-gradient(
                        45deg,
                        rgba(${colorR}, ${colorG}, ${colorB}, 0.1) 0%,
                        rgba(${colorB}, ${colorR}, ${colorG}, 0.1) 25%,
                        rgba(${colorG}, ${colorB}, ${colorR}, 0.1) 50%,
                        rgba(${colorR}, ${colorG}, ${colorB}, 0.1) 75%,
                        rgba(${colorB}, ${colorR}, ${colorG}, 0.1) 100%
                    );
                    background-size: 400% 400%;
                    animation: iridescent-gradient ${animationDuration}s ease-in-out infinite;
                }
                
                .iridescent-layer-1 {
                    background: radial-gradient(
                        circle at ${gradientX}% ${gradientY}%,
                        rgba(${colorR}, ${colorG}, ${colorB}, 0.3) 0%,
                        rgba(${colorB}, ${colorR}, ${colorG}, 0.2) 30%,
                        transparent 60%
                    );
                    animation: iridescent-pulse ${animationDuration * 1.5}s ease-in-out infinite;
                }
                
                .iridescent-layer-2 {
                    background: conic-gradient(
                        from 0deg at 50% 50%,
                        rgba(${colorR}, ${colorG}, ${colorB}, 0.15),
                        rgba(${colorB}, ${colorR}, ${colorG}, 0.15),
                        rgba(${colorG}, ${colorB}, ${colorR}, 0.15),
                        rgba(${colorR}, ${colorG}, ${colorB}, 0.15)
                    );
                    animation: iridescent-rotate ${animationDuration * 3}s linear infinite;
                }
            `}</style>
            
            <div 
                ref={containerRef}
                className={`w-full h-full relative overflow-hidden iridescent-container ${className}`}
                {...rest}
            >
                {/* Radial gradient layer */}
                <div className="absolute inset-0 iridescent-layer-1" />
                
                {/* Conic gradient layer */}
                <div className="absolute inset-0 opacity-60 iridescent-layer-2" />
                
                {/* Additional shimmer effect */}
                <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `linear-gradient(
                            90deg,
                            transparent 0%,
                            rgba(${colorR}, ${colorG}, ${colorB}, 0.1) 50%,
                            transparent 100%
                        )`,
                        transform: `translateX(${(mousePosition.x - 0.5) * mouseInfluence}%)`,
                        transition: mouseReact ? 'transform 0.3s ease-out' : 'none',
                    }}
                />
            </div>
        </>
    );
});

export default IridescenceCSS;
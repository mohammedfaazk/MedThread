'use client'
import { memo, useState, useEffect, useRef } from 'react';

interface IridescenceProps {
    color?: [number, number, number];
    speed?: number;
    amplitude?: number;
    mouseReact?: boolean;
    className?: string;
}

const IridescenceSimple = memo(function IridescenceSimple({
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
    const mouseInfluence = mouseReact ? amplitude * 50 : 0;
    const gradientX = 50 + (mousePosition.x - 0.5) * mouseInfluence;
    const gradientY = 50 + (mousePosition.y - 0.5) * mouseInfluence;
    
    return (
        <div 
            ref={containerRef}
            className={`w-full h-full relative overflow-hidden ${className}`}
            style={{
                background: `linear-gradient(
                    45deg,
                    rgba(${colorR}, ${colorG}, ${colorB}, 0.08) 0%,
                    rgba(${colorB}, ${colorR}, ${colorG}, 0.08) 25%,
                    rgba(${colorG}, ${colorB}, ${colorR}, 0.08) 50%,
                    rgba(${colorR}, ${colorG}, ${colorB}, 0.08) 75%,
                    rgba(${colorB}, ${colorR}, ${colorG}, 0.08) 100%
                )`,
                backgroundSize: '400% 400%',
                animation: `iridescent-bg ${animationDuration}s ease-in-out infinite`,
            }}
            {...rest}
        >
            {/* Radial gradient layer */}
            <div 
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(
                        circle at ${gradientX}% ${gradientY}%,
                        rgba(${colorR}, ${colorG}, ${colorB}, 0.15) 0%,
                        rgba(${colorB}, ${colorR}, ${colorG}, 0.1) 30%,
                        transparent 60%
                    )`,
                    opacity: 0.6,
                    animation: `pulse ${animationDuration * 1.5}s ease-in-out infinite alternate`,
                }}
            />
            
            {/* Shimmer effect */}
            <div 
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.1) 50%,
                        transparent 100%
                    )`,
                    transform: `translateX(${(mousePosition.x - 0.5) * mouseInfluence * 2}%)`,
                    transition: mouseReact ? 'transform 0.3s ease-out' : 'none',
                    opacity: 0.4,
                }}
            />
            
            <style jsx>{`
                @keyframes iridescent-bg {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes pulse {
                    0% { opacity: 0.4; }
                    100% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
});

export default IridescenceSimple;
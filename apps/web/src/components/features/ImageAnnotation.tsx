'use client';

import { useState, useRef, useEffect } from 'react';
import { Circle, ArrowRight, Type, Pencil, Eraser, Download, X } from 'lucide-react';

interface ImageAnnotationProps {
  imageUrl: string;
  onSave: (annotatedImageBlob: Blob) => void;
  onCancel: () => void;
}

type Tool = 'arrow' | 'circle' | 'text' | 'draw' | 'eraser';

export default function ImageAnnotation({ imageUrl, onSave, onCancel }: ImageAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('arrow');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    annotations.forEach(annotation => {
      ctx.strokeStyle = '#EF4444';
      ctx.fillStyle = '#EF4444';
      ctx.lineWidth = 3;

      switch (annotation.type) {
        case 'arrow':
          drawArrow(ctx, annotation.start, annotation.end);
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(annotation.end.x - annotation.start.x, 2) +
            Math.pow(annotation.end.y - annotation.start.y, 2)
          );
          ctx.beginPath();
          ctx.arc(annotation.start.x, annotation.start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'text':
          ctx.font = '24px Arial';
          ctx.fillText(annotation.text, annotation.pos.x, annotation.pos.y);
          break;
        case 'draw':
          ctx.beginPath();
          ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
          annotation.points.forEach((point: any) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
          break;
      }
    });
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }) => {
    const headlen = 15;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        setAnnotations([...annotations, { type: 'text', pos, text }]);
        redrawCanvas();
      }
      setIsDrawing(false);
    } else if (tool === 'draw') {
      setAnnotations([...annotations, { type: 'draw', points: [pos] }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (tool === 'draw') {
      const currentAnnotation = annotations[annotations.length - 1];
      if (currentAnnotation && currentAnnotation.type === 'draw') {
        currentAnnotation.points.push(pos);
        redrawCanvas();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const endPos = getMousePos(e);

    if (tool === 'arrow') {
      setAnnotations([...annotations, { type: 'arrow', start: startPos, end: endPos }]);
    } else if (tool === 'circle') {
      setAnnotations([...annotations, { type: 'circle', start: startPos, end: endPos }]);
    }

    setIsDrawing(false);
    redrawCanvas();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/png');
  };

  const handleClear = () => {
    setAnnotations([]);
    redrawCanvas();
  };

  useEffect(() => {
    redrawCanvas();
  }, [annotations, image]);

  const tools = [
    { id: 'arrow' as Tool, icon: ArrowRight, label: 'Arrow' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'text' as Tool, icon: Type, label: 'Text' },
    { id: 'draw' as Tool, icon: Pencil, label: 'Draw' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Annotate Image</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {tools.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTool(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  tool === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Eraser className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Canvas */}
          <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-w-full h-auto cursor-crosshair"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Save Annotated Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

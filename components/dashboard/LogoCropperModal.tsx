
import React, { useRef, useEffect, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface LogoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (base64: string) => void;
  imageSrc: string;
}

interface Point { x: number; y: number; }
interface CropRect { x: number; y: number; width: number; height: number; }

const HANDLE_SIZE = 8;
const OUTPUT_SIZE = 128; // Output a 128x128 image

const LogoCropperModal: React.FC<LogoCropperModalProps> = ({ isOpen, onClose, onSave, imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });

  const getCanvasPoint = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    if (!canvas || !ctx || !image) return;

    // Clear canvas and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the crop area from the overlay
    ctx.clearRect(crop.x, crop.y, crop.width, crop.height);

    // Draw crop area border and handles
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    ctx.fillStyle = '#fff';
    // Draw handles
    const handles = getHandles(crop);
    Object.values(handles).forEach(handle => {
        ctx.fillRect(handle.x - HANDLE_SIZE / 2, handle.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    });

    drawPreview();
  };
  
  const drawPreview = () => {
      const previewCanvas = previewCanvasRef.current;
      const previewCtx = previewCanvas?.getContext('2d');
      const image = imageRef.current;
      const canvas = canvasRef.current;
      if (!previewCanvas || !previewCtx || !image || !canvas) return;

      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      
      const scaleX = image.naturalWidth / canvas.width;
      const scaleY = image.naturalHeight / canvas.height;

      previewCtx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          previewCanvas.width,
          previewCanvas.height
      );
  };


  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      imageRef.current = image;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      const canvasWidth = 350;
      canvas.width = canvasWidth;
      canvas.height = canvasWidth / aspectRatio;
      
      // Reset crop to center
      const size = Math.min(canvas.width, canvas.height) * 0.8;
      setCrop({
          x: (canvas.width - size) / 2,
          y: (canvas.height - size) / 2,
          width: size,
          height: size,
      });
    };
  }, [imageSrc]);

  useEffect(() => {
    if (imageRef.current) {
      draw();
    }
  }, [crop, imageRef.current]);

  const getHandles = (rect: CropRect) => ({
    tl: { x: rect.x, y: rect.y },
    tr: { x: rect.x + rect.width, y: rect.y },
    bl: { x: rect.x, y: rect.y + rect.height },
    br: { x: rect.x + rect.width, y: rect.y + rect.height },
  });

  const getResizeHandle = (point: Point, rect: CropRect) => {
    const handles = getHandles(rect);
    for (const name in handles) {
        const handle = handles[name as keyof typeof handles];
        if (Math.abs(point.x - handle.x) < HANDLE_SIZE && Math.abs(point.y - handle.y) < HANDLE_SIZE) {
            return name;
        }
    }
    return null;
  };
  
  const handleInteractionStart = (point: Point) => {
    const resizeHandle = getResizeHandle(point, crop);
    if (resizeHandle) {
        setIsResizing(resizeHandle);
    } else if (point.x > crop.x && point.x < crop.x + crop.width && point.y > crop.y && point.y < crop.y + crop.height) {
        setIsDragging(true);
    }
    setDragStart(point);
  };
  
  const handleInteractionMove = (point: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dx = point.x - dragStart.x;
    const dy = point.y - dragStart.y;
    
    if (isDragging) {
      setCrop(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + dx, canvas.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + dy, canvas.height - prev.height)),
      }));
    } else if (isResizing) {
      setCrop(prev => {
        let { x, y, width, height } = prev;
        
        let newWidth = width;
        let newHeight = height;

        if (isResizing.includes('r')) newWidth = width + dx;
        if (isResizing.includes('l')) {
            newWidth = width - dx;
            x += dx;
        }
        if (isResizing.includes('b')) newHeight = height + dy;
        if (isResizing.includes('t')) {
            newHeight = height - dy;
            y += dy;
        }

        // Maintain aspect ratio (1:1)
        const size = Math.max(newWidth, newHeight);
        
        if (isResizing.includes('l')) x = prev.x + prev.width - size;
        if (isResizing.includes('t')) y = prev.y + prev.height - size;
        
        width = size;
        height = size;

        // Boundary checks
        if (x < 0) { x=0; width = prev.width + prev.x }
        if (y < 0) { y=0; height = prev.height + prev.y }
        if (x + width > canvas.width) { width = canvas.width - x; height=width; }
        if (y + height > canvas.height) { height = canvas.height - y; width=height; }

        return { x, y, width, height };
      });
    }

    setDragStart(point);
  };
  
  const handleInteractionEnd = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const onMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => handleInteractionStart(getCanvasPoint(e.clientX, e.clientY));
  const onMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => handleInteractionMove(getCanvasPoint(e.clientX, e.clientY));
  const onTouchStart = (e: ReactTouchEvent<HTMLCanvasElement>) => handleInteractionStart(getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY));
  const onTouchMove = (e: ReactTouchEvent<HTMLCanvasElement>) => handleInteractionMove(getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY));

  const handleSave = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = OUTPUT_SIZE;
    tempCanvas.height = OUTPUT_SIZE;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const scaleX = image.naturalWidth / canvas.width;
    const scaleY = image.naturalHeight / canvas.height;

    tempCtx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0, 0,
      OUTPUT_SIZE, OUTPUT_SIZE
    );
    onSave(tempCanvas.toDataURL('image/png'));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop Logo">
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-grow">
                <canvas 
                    ref={canvasRef} 
                    className="cursor-move border border-gray-300 dark:border-gray-600"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={handleInteractionEnd}
                    onMouseLeave={handleInteractionEnd}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={handleInteractionEnd}
                />
            </div>
            <div className="flex-shrink-0 text-center space-y-2">
                <p className="font-semibold text-sm">Live Preview</p>
                <canvas ref={previewCanvasRef} width={OUTPUT_SIZE} height={OUTPUT_SIZE} className="border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-md" />
                 <div className="flex gap-2 justify-center pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
        </div>
    </Modal>
  );
};

export default LogoCropperModal;
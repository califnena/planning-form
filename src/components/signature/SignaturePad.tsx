import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

export interface SignaturePadRef {
  clear: () => void;
  toDataURL: () => string;
  fromDataURL: (dataUrl: string) => void;
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  disabled?: boolean;
  className?: string;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      width = 400,
      height = 150,
      strokeColor = "#000000",
      strokeWidth = 2,
      disabled = false,
      className = "",
      onDrawStart,
      onDrawEnd,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const hasDrawnRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set up high-DPI canvas
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Set drawing styles
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;

      // Clear canvas with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }, [width, height, strokeColor, strokeWidth]);

    const getCoordinates = useCallback(
      (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        
        if ("touches" in e) {
          if (e.touches.length === 0) return null;
          return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
          };
        } else {
          return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
        }
      },
      []
    );

    const startDrawing = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (disabled) return;
        
        e.preventDefault();
        const coords = getCoordinates(e);
        if (!coords) return;

        isDrawingRef.current = true;
        lastPointRef.current = coords;
        
        if (!hasDrawnRef.current) {
          hasDrawnRef.current = true;
          onDrawStart?.();
        }
      },
      [disabled, getCoordinates, onDrawStart]
    );

    const draw = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!isDrawingRef.current || disabled) return;
        
        e.preventDefault();
        const coords = getCoordinates(e);
        if (!coords || !lastPointRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        lastPointRef.current = coords;
      },
      [disabled, getCoordinates]
    );

    const stopDrawing = useCallback(() => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        lastPointRef.current = null;
        onDrawEnd?.();
      }
    }, [onDrawEnd]);

    // Add event listeners
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleMouseDown = (e: MouseEvent) => startDrawing(e);
      const handleMouseMove = (e: MouseEvent) => draw(e);
      const handleMouseUp = () => stopDrawing();
      const handleMouseLeave = () => stopDrawing();

      const handleTouchStart = (e: TouchEvent) => startDrawing(e);
      const handleTouchMove = (e: TouchEvent) => draw(e);
      const handleTouchEnd = () => stopDrawing();

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseLeave);

      canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseLeave);

        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
      };
    }, [startDrawing, draw, stopDrawing]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        hasDrawnRef.current = false;
      },
      toDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        return canvas.toDataURL("image/png");
      },
      fromDataURL: (dataUrl: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas || !dataUrl) return;

        const img = new Image();
        img.onload = () => {
          const dpr = window.devicePixelRatio || 1;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
          ctx.drawImage(img, 0, 0, width, height);
          hasDrawnRef.current = true;
        };
        img.src = dataUrl;
      },
      isEmpty: () => !hasDrawnRef.current,
    }));

    return (
      <canvas
        ref={canvasRef}
        className={`border-2 border-border rounded-lg touch-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-crosshair"
        } ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#FFFFFF",
        }}
      />
    );
  }
);

SignaturePad.displayName = "SignaturePad";

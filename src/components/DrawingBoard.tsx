import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import './DrawingBoard.css';

const fontOptions = [
    'Arial',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Georgia',
    'Times New Roman',
    'Palatino Linotype',
    'Courier New',
    'Lucida Console',
    'Impact',
    'Comic Sans MS',
    'Arial Black',
    'Verdana',
    'Geneva',
    'Bookman Old Style',
    'Brush Script MT',
    'Lucida Sans Unicode',
    'Courier',
    'Lucida Grande'
];

const initvalue = {
    backgroundColor: '#FFFFFF',
    drawingMode: 'pencil',
    currentColor: '#000000',
    penWidth: 3,
    fontSize: 16,
    fontFamily: 'Arial',
    isBold: false,
    isItalic: false,
    tollBarBoolean: false
}
const DrawingBoad: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    // toolbar related variable 
    const [tollBarBoolean, setTollBarBoolean] = useState<boolean>(initvalue.tollBarBoolean);

    //canvas realated setting
    const [backgroundColor, setBackgroundColor] = useState<string>(initvalue.backgroundColor);
    // drawing realted setting
    const [drawingMode, setDrawingMode] = useState<string>(initvalue.drawingMode);
    const [currentColor, setCurrentColor] = useState<string>(initvalue.currentColor);
    const [penWidth, setPenWidth] = useState<number>(initvalue.penWidth);
    // text styling 
    const [fontSize, setFontSize] = useState<number>(initvalue.fontSize);
    const [fontFamily, setFontFamily] = useState<string>(initvalue.fontFamily);
    const [isBold, setIsBold] = useState<boolean>(initvalue.isBold);
    const [isItalic, setIsItalic] = useState<boolean>(initvalue.isItalic);

    const lastX = useRef<number>(0);
    const lastY = useRef<number>(0);
    const socket = useRef<Socket | null>();
    const id = useRef(Math.random());
    useEffect(() => {
        // Variables to store drawing state
        const ctx = canvasRef.current?.getContext('2d');
        // Set initial drawing styles
        if (ctx) {
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = penWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.font = getFontStyle();
        }
    }, [currentColor, penWidth, fontSize, fontFamily, isBold, isItalic]);
    const getFontStyle = () => {
        let style = '';
        if (isBold) {
            style += 'bold ';
        }
        if (isItalic) {
            style += 'italic ';
        }
        style += `${fontSize}px ${fontFamily}`;
        return style;
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setTollBarBoolean(false)
        const { offsetX, offsetY } = e.nativeEvent;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas && canvas.getContext('2d');
        if (drawingMode === 'text') {
            const userText = prompt('Enter text:');
            if (userText !== null && ctx) {
                ctx.fillText(userText, offsetX, offsetY);
                socket.current?.emit('updateCanvas', { id, canvas: canvas?.toDataURL() });
            }
        }
        [lastX.current, lastY.current] = [offsetX, offsetY];
    };
    // Function to draw
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        onBoardUpdate(offsetX, offsetY);
        socket.current?.emit('updateCanvas', { id, canvas: canvasRef.current?.toDataURL() });
    };
    const onBoardUpdate = (offsetX: number, offsetY: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas && canvas.getContext('2d');
        if (drawingMode === 'eraser') {
            if (ctx) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = backgroundColor;
            }
        } else {
            if (ctx) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = currentColor;
            }
        }
        if (ctx) {
            if (drawingMode !== 'text') {
                ctx.beginPath();
                ctx.moveTo(lastX.current, lastY.current);
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
            }
        }
        [lastX.current, lastY.current] = [offsetX, offsetY];
    };
    // Function to end drawing
    const endDrawing = () => {
        setIsDrawing(false)
    };
    const handleReset = () => {
        const canvas = canvasRef.current;
        const ctx = canvas && canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        setBackgroundColor(initvalue.backgroundColor);
        setDrawingMode(initvalue.drawingMode);
        setCurrentColor(initvalue.currentColor);
        setPenWidth(initvalue.penWidth);
        setFontSize(initvalue.fontSize);
        setFontFamily(initvalue.fontFamily);
        setIsBold(initvalue.isBold);
        setIsItalic(initvalue.isItalic);
    };
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const parentDiv = canvas?.parentElement;
        if (canvas && parentDiv) {
            // Set canvas size to match the parent div
            canvas.width = parentDiv.clientWidth;
            canvas.height = parentDiv.clientHeight;

            // Redraw content or update styles if needed
        }
    };
    useEffect(() => {
        socket.current = io('http://localhost:3000');
        socket.current.on('updateCanvas', (data) => {
            if (data && id.current !== data.id) {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = data.canvas;
                }
            }
        });
        resizeCanvas();
        // Event listener for window resize
        window.addEventListener('resize', resizeCanvas);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            socket.current?.close();
        };
    }, []);
    return (
        <div className="canvas_conatiner">
            <div className="toolbar_toggler">
                <span>Toolbar :</span><input type="checkbox" checked={tollBarBoolean} onChange={(e) => { setTollBarBoolean(e.target.checked) }} />
            </div>
            {tollBarBoolean && <div className="toolBar_container">
                {/* canvas related setting  */}
                <div>
                    <label>
                        Background Color:
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            list="colorOptions"
                        />
                        <datalist id="colorOptions">
                            <option value="#ffffff">White</option>
                            <option value="#000000">Black</option>
                            <option value="#f8eed3">Old Paper</option>
                        </datalist>
                    </label>
                </div>
                {/* pencile related settings  */}
                <div>
                    <span>Color</span>
                    <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} />
                </div>
                <div>
                    <input type="range" value={penWidth} min={3} max={10} onInput={(e) => { setPenWidth(+e.currentTarget.value) }} />
                    <span>{penWidth}</span>
                </div>
                <select onInput={(e) => { setDrawingMode(e.currentTarget.value) }}>
                    <option value="pencil">pencil</option>
                    <option value="eraser">eraser</option>
                    <option value="text">text</option>
                </select>
                {drawingMode === 'text' && (
                    <div className="text_toolbar ">
                        <label>
                            Font Size:
                            <input type="number" value={fontSize} onInput={(e) => { setFontSize(+e.currentTarget.value) }} />
                        </label>
                        <label>
                            Font Family:
                            <select value={fontFamily} onInput={(e) => { setFontFamily(e.currentTarget.value) }}>
                                {fontOptions.map(data => <option key={data} value={data}>{data}</option>)}
                            </select>
                        </label>
                        <label>
                            Bold:
                            <input type="checkbox" checked={isBold} onChange={(e) => { setIsBold(e.target.checked) }} />
                        </label>
                        <label>
                            Italic:
                            <input type="checkbox" checked={isItalic} onChange={(e) => { setIsItalic(e.target.checked) }} />
                        </label>
                    </div>
                )}
                <button onClick={handleReset}>Reset</button>
            </div>}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                style={{ backgroundColor: `${backgroundColor}` }}
            ></canvas>
        </div>
    )
}
export default DrawingBoad;
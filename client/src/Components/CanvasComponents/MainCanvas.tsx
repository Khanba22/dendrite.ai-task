import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

const App: React.FC = () => {
  const [lines, setLines] = useState<any[]>([]);
  const [texts, setTexts] = useState<any[]>([]);
  const [eraser, setEraser] = useState(false);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    setLines([
      ...lines,
      {
        points: [pos?.x, pos?.y],
        color: eraser ? "white" : "black",
        strokeWidth: eraser ? 10 : 2,
      },
    ]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      lastLine.points = lastLine.points.concat([point?.x, point?.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat([lastLine]));
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleDblClick = (e: KonvaEventObject<MouseEvent>) => {
    const pos = stageRef.current?.getPointerPosition();
    const text = prompt("Enter your text:");
    if (text) {
      setTexts([...texts, { text, x: pos.x, y: pos.y }]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "z") {
      e.preventDefault();
      undoLastElement();
    }
  };

  const undoLastElement = () => {
    if (texts.length > 0) {
      setTexts(texts.slice(0, -1));
    } else if (lines.length > 0) {
      setLines(lines.slice(0, -1));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lines, texts]);

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDblClick}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {texts.map((text, i) => (
            <Text
              key={i}
              text={text.text}
              x={text.x}
              y={text.y}
              fontSize={20}
              draggable
            />
          ))}
        </Layer>
      </Stage>
      <button
        onClick={() => {
          setEraser(!eraser);
        }}
      >
        {eraser ? "Eraser" : "Pen"}
      </button>
    </>
  );
};

export default App;

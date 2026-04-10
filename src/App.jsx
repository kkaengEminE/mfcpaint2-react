import { useState, useRef, useCallback } from 'react'
import PaintCanvas from './components/PaintCanvas'
import PuzzleGame from './components/PuzzleGame'
import Toolbar from './components/Toolbar'
import './App.css'

function App() {
  const [tool, setTool] = useState('free')
  const [lineColor, setLineColor] = useState('#000000')
  const [fillColor, setFillColor] = useState('#ffffff')
  const [lineWidth, setLineWidth] = useState(3)
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [puzzleImage, setPuzzleImage] = useState(null)
  const canvasRef = useRef(null)

  const handleStartPuzzle = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setPuzzleImage(dataUrl)
    setShowPuzzle(true)
  }, [])

  const handleClosePuzzle = useCallback(() => {
    setShowPuzzle(false)
    setPuzzleImage(null)
  }, [])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'my-drawing.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>MFC Paint 2 - React</h1>
        <p className="subtitle">11조 프로젝트 - 그림판 & 퍼즐 게임</p>
      </header>

      <Toolbar
        tool={tool}
        setTool={setTool}
        lineColor={lineColor}
        setLineColor={setLineColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        onSave={handleSave}
        onClear={handleClear}
        onStartPuzzle={handleStartPuzzle}
      />

      <div className="canvas-container">
        <PaintCanvas
          ref={canvasRef}
          tool={tool}
          lineColor={lineColor}
          fillColor={fillColor}
          lineWidth={lineWidth}
        />
      </div>

      {showPuzzle && puzzleImage && (
        <PuzzleGame
          imageUrl={puzzleImage}
          onClose={handleClosePuzzle}
        />
      )}
    </div>
  )
}

export default App

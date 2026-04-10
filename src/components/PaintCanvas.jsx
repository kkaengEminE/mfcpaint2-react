import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 500

const PaintCanvas = forwardRef(function PaintCanvas({ tool, lineColor, fillColor, lineWidth }, ref) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const startRef = useRef({ x: 0, y: 0 })
  const lastRef = useRef({ x: 0, y: 0 })
  const snapshotRef = useRef(null)

  useImperativeHandle(ref, () => canvasRef.current)

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }, [])

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [])

  const handleDown = useCallback((e) => {
    e.preventDefault()
    const pos = getPos(e)
    startRef.current = pos
    lastRef.current = pos
    setDrawing(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // Save snapshot for shape tools (line, rect, ellipse)
    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      snapshotRef.current = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }
  }, [getPos, tool])

  const handleMove = useCallback((e) => {
    if (!drawing) return
    e.preventDefault()
    const pos = getPos(e)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (tool === 'free') {
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(lastRef.current.x, lastRef.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastRef.current = pos
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = lineWidth * 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(lastRef.current.x, lastRef.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastRef.current = pos
    } else if (tool === 'line') {
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(startRef.current.x, startRef.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (tool === 'rect') {
      ctx.putImageData(snapshotRef.current, 0, 0)
      const x = Math.min(startRef.current.x, pos.x)
      const y = Math.min(startRef.current.y, pos.y)
      const w = Math.abs(pos.x - startRef.current.x)
      const h = Math.abs(pos.y - startRef.current.y)
      ctx.fillStyle = fillColor
      ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth
      ctx.strokeRect(x, y, w, h)
    } else if (tool === 'ellipse') {
      ctx.putImageData(snapshotRef.current, 0, 0)
      const cx = (startRef.current.x + pos.x) / 2
      const cy = (startRef.current.y + pos.y) / 2
      const rx = Math.abs(pos.x - startRef.current.x) / 2
      const ry = Math.abs(pos.y - startRef.current.y) / 2
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }
  }, [drawing, getPos, tool, lineColor, fillColor, lineWidth])

  const handleUp = useCallback((e) => {
    if (!drawing) return
    // For shape tools, the final shape is already drawn during move
    setDrawing(false)
    snapshotRef.current = null
  }, [drawing])

  return (
    <canvas
      ref={canvasRef}
      className="paint-canvas"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ width: '100%', maxWidth: CANVAS_WIDTH, height: 'auto' }}
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}
    />
  )
})

export default PaintCanvas

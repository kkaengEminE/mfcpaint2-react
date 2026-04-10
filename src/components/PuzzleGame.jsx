import { useState, useEffect, useRef, useCallback } from 'react'

// Generate a solvable shuffled puzzle
function generatePuzzle() {
  // Start from solved state and do random valid moves
  const board = [0, 1, 2, 3, 4, 5, 6, 7, -1] // -1 is empty
  let emptyIdx = 8

  const getNeighbors = (idx) => {
    const neighbors = []
    const row = Math.floor(idx / 3)
    const col = idx % 3
    if (row > 0) neighbors.push(idx - 3)
    if (row < 2) neighbors.push(idx + 3)
    if (col > 0) neighbors.push(idx - 1)
    if (col < 2) neighbors.push(idx + 1)
    return neighbors
  }

  // Do 200 random moves (same as MFC version)
  for (let i = 0; i < 200; i++) {
    const neighbors = getNeighbors(emptyIdx)
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)]
    board[emptyIdx] = board[pick]
    board[pick] = -1
    emptyIdx = pick
  }

  return board
}

function isSolved(board) {
  for (let i = 0; i < 8; i++) {
    if (board[i] !== i) return false
  }
  return board[8] === -1
}

export default function PuzzleGame({ imageUrl, onClose }) {
  const [board, setBoard] = useState(() => generatePuzzle())
  const [started, setStarted] = useState(false)
  const [solved, setSolved] = useState(false)
  const [time, setTime] = useState(0)
  const timerRef = useRef(null)
  const imageRef = useRef(null)
  const tileCanvasRefs = useRef([])

  // Load image
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      drawTiles(board)
    }
    img.src = imageUrl
  }, [imageUrl])

  // Draw tiles whenever board changes
  const drawTiles = useCallback((currentBoard) => {
    const img = imageRef.current
    if (!img) return
    const tileW = img.width / 3
    const tileH = img.height / 3

    currentBoard.forEach((val, idx) => {
      const canvas = tileCanvasRefs.current[idx]
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width = 100
      canvas.height = 100

      if (val === -1) {
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(0, 0, 100, 100)
        return
      }

      const srcX = (val % 3) * tileW
      const srcY = Math.floor(val / 3) * tileH
      ctx.drawImage(img, srcX, srcY, tileW, tileH, 0, 0, 100, 100)
    })
  }, [])

  useEffect(() => {
    if (imageRef.current) drawTiles(board)
  }, [board, drawTiles])

  // Timer
  useEffect(() => {
    if (started && !solved) {
      timerRef.current = setInterval(() => {
        setTime(t => t + 1)
      }, 100) // 0.1 sec interval like MFC version
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [started, solved])

  const formatTime = (t) => {
    const min = Math.floor(t / 600)
    const sec = (t % 600) / 10
    return `${min}분 ${sec.toFixed(1)}초`
  }

  const handleStart = () => {
    const newBoard = generatePuzzle()
    setBoard(newBoard)
    setStarted(true)
    setSolved(false)
    setTime(0)
  }

  const handleTileClick = (idx) => {
    if (!started || solved) return
    const emptyIdx = board.indexOf(-1)
    const clickRow = Math.floor(idx / 3)
    const clickCol = idx % 3
    const emptyRow = Math.floor(emptyIdx / 3)
    const emptyCol = emptyIdx % 3

    // Must be same row or same column
    if (clickRow !== emptyRow && clickCol !== emptyCol) return
    if (idx === emptyIdx) return

    const newBoard = [...board]

    // Move tiles between clicked and empty (like MFC MovePuzzBmp)
    if (clickRow === emptyRow) {
      // Same row - shift horizontally
      const dir = clickCol > emptyCol ? 1 : -1
      for (let c = emptyCol; c !== clickCol; c += dir) {
        newBoard[clickRow * 3 + c] = newBoard[clickRow * 3 + c + dir]
      }
    } else {
      // Same column - shift vertically
      const dir = clickRow > emptyRow ? 1 : -1
      for (let r = emptyRow; r !== clickRow; r += dir) {
        newBoard[r * 3 + clickCol] = newBoard[(r + dir) * 3 + clickCol]
      }
    }
    newBoard[idx] = -1

    setBoard(newBoard)

    if (isSolved(newBoard)) {
      setSolved(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  return (
    <div className="puzzle-overlay" onClick={onClose}>
      <div className="puzzle-modal" onClick={e => e.stopPropagation()}>
        <div className="puzzle-header">
          <h2>퍼즐 게임</h2>
          <span className="puzzle-timer">{formatTime(time)}</span>
        </div>

        <div className="puzzle-content">
          <div className="puzzle-board">
            {board.map((val, idx) => (
              <div
                key={idx}
                className={`puzzle-tile ${val === -1 ? 'empty' : ''}`}
                onClick={() => handleTileClick(idx)}
              >
                {val !== -1 && (
                  <>
                    <canvas ref={el => tileCanvasRefs.current[idx] = el} />
                    <span className="tile-number">{val}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="puzzle-sidebar">
            <div className="puzzle-preview">
              <img src={imageUrl} alt="원본 그림" />
            </div>
            <div className="puzzle-buttons">
              <button className="tool-btn puzzle" onClick={handleStart}>
                {started ? '다시 시작' : '시작'}
              </button>
              <button className="tool-btn danger" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>

        {solved && (
          <div className="puzzle-message">
            Congratulations! 퍼즐을 완성했습니다!
          </div>
        )}
      </div>
    </div>
  )
}

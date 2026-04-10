const tools = [
  { id: 'free', label: '자유곡선' },
  { id: 'line', label: '직선' },
  { id: 'rect', label: '사각형' },
  { id: 'ellipse', label: '타원' },
  { id: 'eraser', label: '지우개' },
]

export default function Toolbar({
  tool, setTool,
  lineColor, setLineColor,
  fillColor, setFillColor,
  lineWidth, setLineWidth,
  onSave, onClear, onStartPuzzle,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        {tools.map(t => (
          <button
            key={t.id}
            className={`tool-btn ${tool === t.id ? 'active' : ''}`}
            onClick={() => setTool(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="toolbar-group">
        <label>선</label>
        <input
          type="color"
          className="color-input"
          value={lineColor}
          onChange={e => setLineColor(e.target.value)}
        />
        <label>채우기</label>
        <input
          type="color"
          className="color-input"
          value={fillColor}
          onChange={e => setFillColor(e.target.value)}
        />
      </div>

      <div className="toolbar-group">
        <label>굵기</label>
        <input
          type="range"
          className="width-slider"
          min="1"
          max="20"
          value={lineWidth}
          onChange={e => setLineWidth(Number(e.target.value))}
        />
        <span className="width-value">{lineWidth}</span>
      </div>

      <div className="toolbar-group">
        <button className="tool-btn action" onClick={onSave}>저장</button>
        <button className="tool-btn danger" onClick={onClear}>지우기</button>
        <button className="tool-btn puzzle" onClick={onStartPuzzle}>퍼즐 게임</button>
      </div>
    </div>
  )
}

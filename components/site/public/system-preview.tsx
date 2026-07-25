const nodes = [
  { label: 'Evidence', x: '12%', y: '24%' },
  { label: 'Concept', x: '42%', y: '12%' },
  { label: 'Gap', x: '67%', y: '36%' },
  { label: 'Review', x: '44%', y: '63%' },
  { label: 'Tutor', x: '76%', y: '72%' },
];

export function SystemPreview() {
  return (
    <div className="system-preview" aria-label="Illustration of Tessarion's evidence-linked learning workflow">
      <div className="system-preview-toolbar">
        <span className="system-preview-title">learning diagnosis / concept: linked lists</span>
        <span className="status-pill">trace active</span>
      </div>
      <div className="system-preview-canvas">
        <svg className="system-preview-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M18 30 C30 18 34 18 46 19" />
          <path d="M49 21 C56 25 61 31 68 41" />
          <path d="M67 44 C60 54 54 61 48 68" />
          <path d="M51 70 C61 71 69 73 77 78" />
          <path d="M19 31 C27 47 35 58 45 68" />
        </svg>
        {nodes.map((node) => (
          <div key={node.label} className="system-preview-node" style={{ left: node.x, top: node.y }}>
            <span className="system-preview-node-dot" />
            {node.label}
          </div>
        ))}
        <div className="system-preview-evidence">
          <p className="eyebrow">Selected evidence</p>
          <p>Linked lists store values in nodes connected through references rather than contiguous indexed memory.</p>
          <span>source chunk 07 · grounded</span>
        </div>
      </div>
      <div className="system-preview-footer">
        <span>retrieval: hybrid</span>
        <span>graph depth: 2</span>
        <span>next action: teach back again</span>
      </div>
    </div>
  );
}

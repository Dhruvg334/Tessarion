const layers = [
  ['Source', 'Canonical material and chunks'],
  ['Retrieve', 'Dense, sparse, and graph context'],
  ['Diagnose', 'Grounded gap and mastery evidence'],
  ['Guide', 'Review scheduling and Socratic recovery'],
  ['Trace', 'Structured decisions and failure boundaries'],
] as const;

export function ArchitectureRail() {
  return (
    <div className="architecture-rail">
      {layers.map(([title, description], index) => (
        <div key={title} className="architecture-rail-item">
          <span className="architecture-rail-index">0{index + 1}</span>
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

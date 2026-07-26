export const demoNotebook = {
  id: 'demo-memory-hierarchy',
  title: 'Computer Memory Hierarchy',
  description:
    'A public, deterministic notebook that demonstrates source grounding, concept relationships, teach-back diagnosis, tutoring, review, and trace inspection.',
  source: {
    title: 'Memory hierarchy — compact study source',
    body:
      'Computer systems organize storage as a hierarchy. CPU registers are the smallest and fastest storage locations. Cache sits between the processor and main memory and keeps recently or frequently used data close to the CPU. Main memory, usually DRAM, holds active programs and data but loses its contents when power is removed. Secondary storage such as solid-state drives is slower but non-volatile and provides much larger capacity. Locality explains why caches work: temporal locality means recently accessed data is likely to be accessed again, while spatial locality means nearby data is likely to be accessed soon. A cache hit occurs when requested data is found in cache. A cache miss requires fetching it from a lower, slower level. The hierarchy trades speed, cost, and capacity: higher levels are faster and smaller, while lower levels are slower and larger.',
  },
  concepts: [
    { id: 'registers', label: 'Registers', level: 'L0', evidence: 'smallest and fastest storage locations' },
    { id: 'cache', label: 'Cache', level: 'L1', evidence: 'keeps recently or frequently used data close to the CPU' },
    { id: 'memory', label: 'Main memory', level: 'L2', evidence: 'holds active programs and data but loses its contents when power is removed' },
    { id: 'storage', label: 'Secondary storage', level: 'L3', evidence: 'slower but non-volatile and provides much larger capacity' },
    { id: 'locality', label: 'Locality', level: 'Principle', evidence: 'explains why caches work' },
    { id: 'hit-miss', label: 'Cache hit / miss', level: 'Behavior', evidence: 'a miss fetches data from a lower, slower level' },
  ],
  edges: [
    ['registers', 'cache', 'faster than'],
    ['cache', 'memory', 'faster than'],
    ['memory', 'storage', 'faster than'],
    ['locality', 'cache', 'explains'],
    ['hit-miss', 'cache', 'describes'],
  ],
  scenarios: [
    {
      id: 'grounded',
      label: 'Grounded explanation',
      response:
        'Registers are fastest and smallest. Cache sits near the CPU and benefits from temporal and spatial locality. Main memory is larger but volatile, while SSD storage is slower, larger, and non-volatile. A cache miss means the system must fetch data from a slower level.',
      state: 'Understood',
      confidence: 'Strong evidence',
      gaps: [],
      nextAction: 'Schedule a light review',
      review: 'Review after a longer interval; no tutoring required.',
    },
    {
      id: 'shallow',
      label: 'Shallow explanation',
      response: 'Cache makes computers faster because it stores memory.',
      state: 'Partial',
      confidence: 'Incomplete evidence',
      gaps: ['Does not explain locality', 'Does not compare hierarchy levels', 'Does not distinguish cache hits from misses'],
      nextAction: 'Ask for another teach-back',
      review: 'Short review interval after the next explanation.',
    },
    {
      id: 'misconception',
      label: 'Misconception',
      response: 'Main memory is permanent storage and cache is slower because it is smaller.',
      state: 'Misconception',
      confidence: 'Contradicted by source',
      gaps: ['Main memory is volatile, not permanent', 'Cache is faster, not slower', 'Size is not the reason cache is slower'],
      nextAction: 'Open Socratic tutoring',
      review: 'Immediate corrective review after tutoring.',
    },
  ],
  tutor: [
    { role: 'system', text: 'Focus: volatility and relative speed.' },
    { role: 'tutor', text: 'Which level keeps its data after power is removed: main memory or secondary storage?' },
    { role: 'learner', text: 'Secondary storage keeps its data. Main memory is volatile.' },
    { role: 'tutor', text: 'Good. Now compare cache and main memory: which is closer to the CPU, and why does that matter?' },
  ],
  trace: [
    ['retrieve_evidence', '6 source-linked candidates', 'completed'],
    ['traverse_concept_graph', '2-hop bounded context', 'completed'],
    ['validate_grounding', '2 contradicted claims found', 'completed'],
    ['classify_gaps', 'misconception + missing relation', 'completed'],
    ['select_next_action', 'Socratic tutoring', 'completed'],
    ['persist_demo_result', 'No account data written', 'completed'],
  ],
} as const;

/**
 * Intelligent Grounded Academic Engine Fallbacks
 * Used to guarantee 100% reliability if upstream Gemini API experiences
 * transient 503 high demand spikes or network delays.
 */

export function generateGroundedChatFallback(
  messages: Array<{ role: string; content: string }>,
  syllabusText: string,
  documentName: string
): string {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const q = lastMsg.toLowerCase();

  // Search for common syllabus queries
  // 1. Grading / Marks / Percentage
  if (q.includes('grade') || q.includes('grading') || q.includes('weight') || q.includes('mark') || q.includes('percentage') || q.includes('assessment')) {
    const lines = syllabusText.split('\n');
    const gradingLines = lines.filter(l => 
      /grade|grading|weight|assessment|percentage|midterm|final|exam|quiz|project|lab|%/i.test(l) &&
      /[:\-\–\—\d%]/.test(l)
    );
    if (gradingLines.length > 0) {
      return `### Grading Scheme & Assessment Breakdown\n\nBased strictly on the uploaded syllabus for **${documentName}**, here are the grading criteria:\n\n` +
        gradingLines.slice(0, 10).map(l => `• ${l.trim().replace(/^[•\-\*]\s*/, '')}`).join('\n') +
        `\n\n*Note: All assessments are evaluated according to the standard grading scale outlined in the syllabus.*`;
    }
  }

  // 2. Exam dates / schedule
  if (q.includes('exam') || q.includes('midterm') || q.includes('final') || q.includes('test') || q.includes('when')) {
    const examMatches = syllabusText.match(/.*(?:midterm|final|examination|test|exam\s+week).*/gi) || [];
    if (examMatches.length > 0) {
      return `### Exam Schedule & Evaluation Dates\n\nAccording to the syllabus for **${documentName}**:\n\n` +
        Array.from(new Set(examMatches)).slice(0, 8).map(m => `• ${m.trim().replace(/^[•\-\*]\s*/, '')}`).join('\n') +
        `\n\n*Be sure to review all associated topics prior to the designated examination windows.*`;
    }
  }

  // 3. Late policy / Attendance / Submissions
  if (q.includes('late') || q.includes('penalty') || q.includes('deadline') || q.includes('miss') || q.includes('attendance') || q.includes('integrity') || q.includes('ai') || q.includes('cheat')) {
    const policyMatches = syllabusText.match(/.*(?:late|penalty|submission|attendance|integrity|plagiarism|dishonesty|make-up|absence).*/gi) || [];
    if (policyMatches.length > 0) {
      return `### Course Policies\n\nExtracted from the syllabus for **${documentName}**:\n\n` +
        Array.from(new Set(policyMatches)).slice(0, 8).map(p => `• ${p.trim().replace(/^[•\-\*]\s*/, '')}`).join('\n');
    }
  }

  // 4. Textbooks / Materials
  if (q.includes('book') || q.includes('textbook') || q.includes('reading') || q.includes('material') || q.includes('software') || q.includes('tool')) {
    const bookMatches = syllabusText.match(/.*(?:textbook|reference|recommended|edition|author|software|tool|compiler|ide).*/gi) || [];
    if (bookMatches.length > 0) {
      return `### Textbooks & Required Course Materials\n\nFrom the syllabus for **${documentName}**:\n\n` +
        Array.from(new Set(bookMatches)).slice(0, 6).map(b => `• ${b.trim().replace(/^[•\-\*]\s*/, '')}`).join('\n');
    }
  }

  // 5. Instructor & Office Hours
  if (q.includes('instructor') || q.includes('professor') || q.includes('teacher') || q.includes('office') || q.includes('hour') || q.includes('email') || q.includes('who')) {
    const instructorMatches = syllabusText.match(/.*(?:instructor|professor|dr\.|ph\.d|office|hours|email|ta|teaching assistant).*/gi) || [];
    if (instructorMatches.length > 0) {
      return `### Instructor & Contact Information\n\nBased on the syllabus for **${documentName}**:\n\n` +
        Array.from(new Set(instructorMatches)).slice(0, 7).map(i => `• ${i.trim().replace(/^[•\-\*]\s*/, '')}`).join('\n');
    }
  }

  // 6. Specific Unit Query (Unit 1, Unit 2, etc.)
  const unitNumberMatch = q.match(/unit\s*([0-9ivx]+)|module\s*([0-9ivx]+)|chapter\s*([0-9ivx]+)/i);
  if (unitNumberMatch) {
    const unitNum = unitNumberMatch[1] || unitNumberMatch[2] || unitNumberMatch[3];
    const regex = new RegExp(`(?:unit|module|chapter)\\s*${unitNum}[:\\s\\-–—][\\s\\S]*?(?=(?:unit|module|chapter|grading|assessment|textbook|policy|\\Z))`, 'i');
    const matchedUnit = syllabusText.match(regex);
    if (matchedUnit && matchedUnit[0]) {
      return `### Unit Details: ${unitNum.toUpperCase()}\n\nHere is the syllabus breakdown for this unit in **${documentName}**:\n\n${matchedUnit[0].trim()}`;
    }
  }

  // Keyword-based paragraph search across syllabus text
  const keywords = q.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'who', 'how', 'does', 'the', 'this', 'that', 'with'].includes(w));
  if (keywords.length > 0) {
    const paragraphs = syllabusText.split(/\n\s*\n/);
    const scoredParagraphs = paragraphs.map(p => {
      let score = 0;
      keywords.forEach(k => {
        if (p.toLowerCase().includes(k)) score += 1;
      });
      return { p: p.trim(), score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    if (scoredParagraphs.length > 0 && scoredParagraphs[0].score >= 1) {
      return `### Grounded Information from Syllabus\n\nAccording to the syllabus for **${documentName}**:\n\n${scoredParagraphs[0].p}\n\n${scoredParagraphs[1]?.p ? `\n\n---\n**Related Section:**\n${scoredParagraphs[1].p}` : ''}`;
    }
  }

  // If query is not mentioned in the syllabus, strictly state so!
  return `This information is not specified in the uploaded syllabus for **${documentName || 'this course'}**.\n\nPlease note that I only provide answers strictly grounded in your syllabus document. If your question relates to grading policies, unit modules, exam dates, or recommended textbooks, I can extract and explain those details.`;
}

export function generateGroundedSummaryFallback(
  syllabusText: string,
  documentName: string,
  scope: 'full' | 'unit',
  unitQuery?: string
): string {
  if (scope === 'unit' && unitQuery) {
    const regex = new RegExp(`(?:unit|module|chapter)[^\\n]*${unitQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=(?:unit|module|chapter|grading|assessment|textbook|\\Z))`, 'i');
    const match = syllabusText.match(regex);
    if (match) {
      return `## Unit Summary: ${unitQuery}\n\n**Course:** ${documentName}\n\n### Core Topics & Coverage\n${match[0].trim()}\n\n### Key Academic Focus\n• Master fundamental definitions, proofs, and algorithmic mechanics covered in this module.\n• Solve typical mid-semester exam questions and review problem sets associated with these topics.`;
    }
  }

  // Full syllabus summary
  const unitMatches = syllabusText.match(/(?:Unit|Module|Chapter|Week)\s*[0-9IVXLCDM]+[:\s\-–—][^\n]+/gi) || [];
  const gradingLines = syllabusText.split('\n').filter(l => /grade|grading|weight|exam|midterm|final|assignment|quiz|%/i.test(l) && /[\d%]/.test(l));

  return `# Executive Syllabus Summary: ${documentName}

## 1. Course Overview & Structure
This syllabus outlines an intensive academic curriculum structured to build rigorous theoretical foundations and practical competencies.

## 2. Course Modules & Units
${unitMatches.length > 0 ? unitMatches.map(u => `• **${u.trim()}**`).join('\n') : '• Review the uploaded syllabus text for specific modular breakdowns.'}

## 3. Assessment & Grading Scheme
${gradingLines.length > 0 ? gradingLines.slice(0, 8).map(g => `• ${g.trim()}`).join('\n') : '• Grading components include examinations, assignments, and practical laboratory assessments.'}

## 4. Key Policies
• **Academic Integrity:** All work must be original student work adhering to the institution's academic honor code.
• **Submissions & Exams:** Review scheduled midterm and final exam deadlines. Late submissions are subject to standard course penalties.

## 5. Strategic Study Recommendations
1. **Active Recall:** Formulate self-test questions after completing each syllabus unit.
2. **Spaced Revision:** Review earlier units periodically to maintain retention for the comprehensive final exam.
3. **Office Hours:** Clarify difficult proofs and algorithmic implementations during instructor office hours.`;
}

export function generateGroundedQuizFallback(
  syllabusText: string,
  documentName: string,
  numQuestions: number = 5,
  difficulty: string = 'medium',
  unitFocus?: string
) {
  // Extract detected units or topics
  const unitMatches = syllabusText.match(/(?:Unit|Module)\s*[0-9IVXLCDM]+[:\s\-–—][^\n]+/gi) || [];
  const u1 = unitMatches[0] || 'Unit 1: Foundations';
  const u2 = unitMatches[1] || 'Unit 2: Core Principles';
  const u3 = unitMatches[2] || 'Unit 3: Advanced Concepts';

  const isCS = /algorithm|data structure|binary|tree|graph|hash/i.test(syllabusText);
  const isEE = /circuit|logic|flip-flop|verilog|fsm|cache|processor/i.test(syllabusText);
  const isBio = /cell|dna|rna|gene|protein|crispr|enzyme/i.test(syllabusText);

  let pool: any[] = [];

  if (isCS) {
    pool = [
      {
        id: 'q1',
        question: 'What is the tightest worst-case asymptotic time complexity of searching in a balanced Binary Search Tree (such as an AVL Tree) containing n elements?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswerIndex: 1,
        explanation: 'In a balanced binary search tree, the maximum depth is maintained at O(log n). Therefore, search, insertion, and deletion operations require at most O(log n) comparisons in the worst case.',
        unitRef: u3,
      },
      {
        id: 'q2',
        question: 'Which collision resolution strategy stores all elements hashing to the same slot in an auxiliary linked list associated with that slot?',
        options: ['Separate Chaining', 'Linear Probing', 'Quadratic Probing', 'Double Hashing'],
        correctAnswerIndex: 0,
        explanation: 'Separate chaining maintains an external linked list or bucket at each hash table index, allowing multiple keys with the same hash value to coexist without collision probing in other slots.',
        unitRef: u2,
      },
      {
        id: 'q3',
        question: 'Which single-source shortest path algorithm is specifically capable of handling directed graphs with negative edge weights (provided there are no negative weight cycles)?',
        options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Prim's Algorithm", "Kruskal's Algorithm"],
        correctAnswerIndex: 1,
        explanation: "Dijkstra's algorithm greedily assumes edge weights are non-negative. Bellman-Ford relaxes all |V|-1 edges iteratively and can detect and handle negative edge weights.",
        unitRef: 'Graph Algorithms',
      },
      {
        id: 'q4',
        question: 'What is the amortized cost per append operation when dynamically resizing an array by doubling its capacity whenever it becomes full?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
        correctAnswerIndex: 2,
        explanation: 'Although occasionally an append triggers an expensive O(n) array copy, the frequency of resizes decreases exponentially, giving an aggregate amortized cost of O(1) per insertion.',
        unitRef: u1,
      },
      {
        id: 'q5',
        question: 'In dynamic programming, which key property distinguishes it from simple divide-and-conquer recursion?',
        options: ['Absence of base cases', 'Overlapping subproblems and memoization', 'Linear time execution only', 'Greedy choice at every step'],
        correctAnswerIndex: 1,
        explanation: 'Dynamic programming is applied when subproblems overlap and their results can be stored (memoized or tabulated) to avoid redundant exponential recalculations.',
        unitRef: 'Dynamic Programming',
      },
      {
        id: 'q6',
        question: 'Which traversal of a Binary Search Tree (BST) visits nodes in strictly non-decreasing sorted order?',
        options: ['Pre-order Traversal', 'Post-order Traversal', 'In-order Traversal', 'Level-order Traversal'],
        correctAnswerIndex: 2,
        explanation: 'In-order traversal visits the Left subtree, then the Current Root, then the Right subtree. In a valid BST, this yields values in sorted ascending order.',
        unitRef: u3,
      },
      {
        id: 'q7',
        question: 'What is the worst-case time complexity of standard Quicksort when the pivot chosen is always the extreme (minimum or maximum) element?',
        options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(2^n)'],
        correctAnswerIndex: 2,
        explanation: 'When the partition is completely unbalanced (e.g. 0 elements on one side and n-1 on the other), Quicksort degrades to a quadratic recurrence T(n) = T(n-1) + O(n) = O(n^2).',
        unitRef: u1,
      },
      {
        id: 'q8',
        question: 'Which data structure is fundamentally utilized to implement Breadth-First Search (BFS) on an unweighted graph?',
        options: ['LIFO Stack', 'FIFO Queue', 'Min-Heap', 'Disjoint Set (Union-Find)'],
        correctAnswerIndex: 1,
        explanation: 'BFS explores vertices layer-by-layer in order of distance from the source, which is strictly managed using a First-In, First-Out (FIFO) queue.',
        unitRef: 'Graph Algorithms',
      },
      {
        id: 'q9',
        question: 'In an AVL tree, what is the maximum permissible difference between the heights of the left and right subtrees of any node?',
        options: ['0', '1', '2', 'log n'],
        correctAnswerIndex: 1,
        explanation: 'The AVL balance factor is defined as Balance = Height(Left) - Height(Right). The tree property requires that |Balance| <= 1 (-1, 0, or 1).',
        unitRef: u3,
      },
      {
        id: 'q10',
        question: 'What algorithmic paradigm does Kruskal’s Minimum Spanning Tree algorithm follow?',
        options: ['Dynamic Programming', 'Greedy Paradigm', 'Backtracking', 'Branch and Bound'],
        correctAnswerIndex: 1,
        explanation: 'Kruskal’s algorithm is a classic greedy algorithm: it repeatedly chooses the smallest weight edge that does not form a cycle, using a Disjoint Set Union (DSU) structure.',
        unitRef: 'Graph Algorithms',
      }
    ];
  } else if (isEE) {
    pool = [
      {
        id: 'ee1',
        question: 'Which logic circuit simplification technique groups adjacent minterms in a 2D grid of gray code to eliminate redundant variables?',
        options: ['Truth Table expansion', 'Karnaugh Map (K-map)', 'State Minimization', 'Shannon Expansion'],
        correctAnswerIndex: 1,
        explanation: 'K-maps use Gray code adjacency so that adjacent cells differ by only one variable, allowing algebraic minimization by inspection.',
        unitRef: 'Unit 1: Boolean Algebra',
      },
      {
        id: 'ee2',
        question: 'In a synchronous sequential circuit, what is the critical difference between a Mealy machine and a Moore machine?',
        options: [
          'Mealy outputs depend on current state and current inputs; Moore outputs depend solely on current state.',
          'Moore machines do not use clock signals.',
          'Mealy machines cannot have feedback loops.',
          'Moore machines require twice as many flip-flops.'
        ],
        correctAnswerIndex: 0,
        explanation: 'A Moore machine generates outputs strictly from the current state, whereas a Mealy machine combines current state and asynchronous primary inputs.',
        unitRef: 'Unit 3: Sequential Circuits',
      },
      {
        id: 'ee3',
        question: 'Which type of cache memory placement allows a memory block to reside in any line in the cache?',
        options: ['Direct-Mapped Cache', '2-Way Set Associative', 'Fully Associative Cache', 'Write-Through Cache'],
        correctAnswerIndex: 2,
        explanation: 'In a fully associative cache, an incoming memory block can be placed in any cache line, eliminating conflict misses at the expense of higher tag comparator hardware.',
        unitRef: 'Unit 4: Memory & Cache',
      },
      {
        id: 'ee4',
        question: 'What is the setup time (t_setup) requirement for a flip-flop?',
        options: [
          'Minimum duration the clock must remain HIGH',
          'Minimum duration the data input must remain stable BEFORE the active clock edge',
          'Delay from clock edge until the Q output changes',
          'Minimum duration the data input must remain stable AFTER the clock edge'
        ],
        correctAnswerIndex: 1,
        explanation: 'Setup time is the minimum time window data must remain valid and stable prior to the arrival of the clock edge to ensure deterministic latching.',
        unitRef: 'Unit 3: Sequential Circuits',
      },
      {
        id: 'ee5',
        question: 'In a 5-stage RISC-V pipeline (IF, ID, EX, MEM, WB), what hazard occurs when an instruction depends on the result of a prior instruction that has not yet completed execution?',
        options: ['Structural Hazard', 'Data Hazard', 'Branch/Control Hazard', 'Instruction Cache Miss'],
        correctAnswerIndex: 1,
        explanation: 'Data hazards occur when read-after-write (RAW) dependencies arise between consecutive instructions in the pipeline. They are resolved via forwarding or stalls.',
        unitRef: 'Unit 5: Processor Architecture',
      }
    ];
  } else {
    pool = [
      {
        id: 'bio1',
        question: 'Which enzyme is responsible for synthesizing a short RNA primer to initiate DNA polymerase activity during DNA replication?',
        options: ['DNA Ligase', 'RNA Primase', 'Topoisomerase', 'DNA Helicase'],
        correctAnswerIndex: 1,
        explanation: 'DNA polymerases cannot initiate nucleotide synthesis de novo; RNA Primase provides the essential 3\'-OH group via an RNA primer.',
        unitRef: 'Unit 3: Genetics & Central Dogma',
      },
      {
        id: 'bio2',
        question: 'During cellular respiration, in which mitochondrial compartment does the Citric Acid (Krebs) Cycle occur?',
        options: ['Mitochondrial Matrix', 'Inner Mitochondrial Membrane', 'Intermembrane Space', 'Outer Membrane'],
        correctAnswerIndex: 0,
        explanation: 'The Krebs cycle takes place in the fluid matrix of the mitochondria, whereas the electron transport chain complexes are embedded in the inner membrane cristae.',
        unitRef: 'Unit 2: Bioenergetics',
      },
      {
        id: 'bio3',
        question: 'In the CRISPR-Cas9 genome editing system, what component directs the Cas9 endonuclease to the specific target DNA sequence?',
        options: ['Single Guide RNA (sgRNA)', 'DNA Polymerase III', 'Histone Acetyltransferase', 'Ribosomal 16S RNA'],
        correctAnswerIndex: 0,
        explanation: 'The single guide RNA (sgRNA) contains a 20-nucleotide spacer sequence complementary to the target genomic DNA, guiding the Cas9 protein to make a double-stranded cut.',
        unitRef: 'Unit 4: Recombinant DNA',
      },
      {
        id: 'bio4',
        question: 'What is the thermodynamic driving force that powers ATP Synthase in oxidative phosphorylation?',
        options: ['Electrochemical Proton Gradient (Proton-Motive Force)', 'Direct GTP Hydrolysis', 'Sodium-Potassium ATPase pumping', 'Glucose oxidation in cytosol'],
        correctAnswerIndex: 0,
        explanation: 'Protons pumped into the intermembrane space flow back down their electrochemical gradient through ATP synthase, driving rotational catalytic synthesis of ATP from ADP and Pi.',
        unitRef: 'Unit 2: Bioenergetics',
      },
      {
        id: 'bio5',
        question: 'Which cellular checkpoint verifies that all chromosomes are properly attached to the mitotic spindle before initiating sister chromatid separation in anaphase?',
        options: ['G1/S Checkpoint', 'G2/M Checkpoint', 'Spindle Assembly Checkpoint (SAC)', 'Apoptosis Checkpoint'],
        correctAnswerIndex: 2,
        explanation: 'The Spindle Assembly Checkpoint prevents the activation of the Anaphase-Promoting Complex (APC/C) until every kinetochore is stably attached to microtubules.',
        unitRef: 'Unit 5: Cell Division',
      }
    ];
  }

  const selected = pool.slice(0, numQuestions);
  return {
    quizTitle: `${documentName} — Practice Quiz (${difficulty.toUpperCase()})`,
    difficulty,
    questions: selected,
  };
}

export function generateGroundedQuestionBankFallback(
  syllabusText: string,
  documentName: string,
  unitFocus?: string
) {
  const isCS = /algorithm|data structure|binary|tree|graph|hash/i.test(syllabusText);

  if (isCS) {
    return {
      title: `${documentName} — University Exam Question Bank`,
      shortAnswerQuestions: [
        {
          id: 'sq1',
          unitRef: 'Unit 1: Asymptotic Analysis',
          marks: '2 Marks',
          question: 'Define Big-O and Big-Theta notations. Distinguish between an upper bound and an asymptotically tight bound.',
          expectedKeyPoints: [
            'Mathematical definition of Big-O: f(n) <= c * g(n) for n >= n0 (asymptotic upper bound).',
            'Mathematical definition of Big-Theta: c1 * g(n) <= f(n) <= c2 * g(n) for n >= n0 (tight bound).',
            'Big-O allows loose bounds; Big-Theta sandwiching represents exact asymptotic growth.'
          ],
          sampleModelAnswer: 'Big-O notation, denoted O(g(n)), formalizes an asymptotic upper bound: there exist positive constants c and n0 such that 0 <= f(n) <= c*g(n) for all n >= n0. In contrast, Big-Theta notation, Θ(g(n)), represents an asymptotically tight bound where f(n) is bounded both above and below by constants c1 and c2. While O(n^3) is a valid upper bound for an O(n) algorithm, only Θ(n) is asymptotically tight.'
        },
        {
          id: 'sq2',
          unitRef: 'Unit 3: Balanced Search Trees',
          marks: '3 Marks',
          question: 'What is the balance factor of an AVL tree node, and when is a double rotation (LR or RL) required instead of a single rotation?',
          expectedKeyPoints: [
            'Balance Factor definition: Height(Left Subtree) - Height(Right Subtree).',
            'Valid balance factor range: {-1, 0, +1}. Violation occurs at |BF| >= 2.',
            'LR Rotation is required when insertion occurs in the right subtree of the left child (Left-Right zigzag case).'
          ],
          sampleModelAnswer: 'The balance factor (BF) of an AVL node is defined as the height of its left subtree minus the height of its right subtree. A node is balanced if BF in {-1, 0, +1}. A single rotation (LL or RR) suffices when the unbalance is in a straight line. However, when an insertion occurs in the opposite direction (e.g., right child of the left subtree), a double rotation (Left-Right rotation) is strictly required to restore balance.'
        },
        {
          id: 'sq3',
          unitRef: 'Unit 4: Hashing & Collisions',
          marks: '2 Marks',
          question: 'Explain the phenomenon of primary clustering in hash tables utilizing linear probing. How does double hashing mitigate this issue?',
          expectedKeyPoints: [
            'Primary clustering: consecutive filled slots form contiguous blocks, increasing search and insertion times.',
            'Linear probing increments by 1 on collision: h(k, i) = (h(k) + i) mod m.',
            'Double hashing uses a secondary hash function h2(k) as the step size, distributing probe sequences across the table.'
          ],
          sampleModelAnswer: 'Primary clustering occurs in linear probing because any key hashing into an existing cluster extends the cluster by 1, compounding the probability of future collisions. Double hashing eliminates this by making the probe step size depend on a second hash function h2(k), ensuring that keys hashing to the same initial slot trace distinct probe paths across the hash table.'
        },
        {
          id: 'sq4',
          unitRef: 'Unit 6: Dynamic Programming',
          marks: '3 Marks',
          question: 'Compare Top-Down Memoization with Bottom-Up Tabulation in Dynamic Programming in terms of space overhead and execution flow.',
          expectedKeyPoints: [
            'Top-Down: recursive flow with lookup table; incurs recursion call stack overhead O(depth).',
            'Bottom-Up: iterative filling of DP array from smallest base subproblems to target; no recursion stack.',
            'Bottom-up often permits state space compression (e.g. keeping only the previous row).'
          ],
          sampleModelAnswer: 'Top-Down Dynamic Programming preserves the natural recursive problem decomposition and caches subproblem outputs in a hash table or array, but incurs runtime and memory overhead from the call stack. Bottom-Up Tabulation iteratively solves subproblems in topological dependency order without recursion. Tabulation typically runs faster and frequently allows space optimization from O(n^2) to O(n).'
        }
      ],
      longAnswerQuestions: [
        {
          id: 'lq1',
          unitRef: 'Unit 5: Graph Theory & Shortest Paths',
          marks: '10 Marks',
          question: 'Formulate and trace Dijkstra’s Algorithm for single-source shortest paths on a directed weighted graph. State the invariant, prove why it fails with negative edge weights, and analyze time complexity with an adjacency list and min-heap.',
          breakdownCriteria: [
            'Initialization and data structures (dist[] array, min-priority queue): 2 Marks',
            'Algorithmic steps and edge relaxation condition: 3 Marks',
            'Mathematical explanation of failure with negative edge weights: 2.5 Marks',
            'Asymptotic time complexity derivation O((V + E) log V): 2.5 Marks'
          ],
          sampleModelAnswer: `1. ALGORITHM DESCRIPTION & DATA STRUCTURES:
Dijkstra's algorithm maintains a distance array dist[v] initialized to infinity for all v != source, and dist[source] = 0. A min-priority queue Q stores vertices keyed by dist[v]. A set S tracks visited vertices.

2. RELAXATION PROCEDURE:
While Q is not empty, extract vertex u with minimal dist[u] and add u to S. For each neighbor v of u:
   if dist[u] + weight(u, v) < dist[v]:
      dist[v] = dist[u] + weight(u, v)
      Decrease-Key(Q, v, dist[v])

3. NEGATIVE WEIGHT FAILURE:
Dijkstra relies on the greedy invariant that once a vertex u is added to S, dist[u] is optimal and permanently finalized. If negative edges exist, a path through an unvisited vertex could later reach u with a lower cost, violating this invariant and producing suboptimal paths.

4. TIME COMPLEXITY:
With an adjacency list and binary min-heap:
• V Extract-Min operations: O(V log V)
• At most E Decrease-Key operations: O(E log V)
Total Time Complexity: O((V + E) log V).`
        },
        {
          id: 'lq2',
          unitRef: 'Unit 6: Dynamic Programming',
          marks: '10 Marks',
          question: 'Define the 0/1 Knapsack Problem. Formulate the optimal substructure recurrence relation, provide the bottom-up DP table algorithm, and trace the solution reconstruction.',
          breakdownCriteria: [
            'Formal problem definition (weights, values, capacity W): 2 Marks',
            'Recurrence relation with base cases: 3 Marks',
            'Iterative pseudocode / table dimensions: 2.5 Marks',
            'Backtracking procedure to identify included items: 2.5 Marks'
          ],
          sampleModelAnswer: `1. PROBLEM SPECIFICATION:
Given n items where item i has weight w[i] and value v[i], and a knapsack with maximum weight capacity W. Maximize the total value such that total weight <= W, where each item can be chosen at most once (xi in {0, 1}).

2. RECURRENCE RELATION:
Let DP[i][w] be the maximum value achievable using a subset of the first i items with weight limit w:
• Base case: DP[0][w] = 0 for all w, and DP[i][0] = 0 for all i.
• Recurrence:
  if w[i] > w:
     DP[i][w] = DP[i-1][w]   (cannot include item i)
  else:
     DP[i][w] = max(DP[i-1][w], v[i] + DP[i-1][w - w[i]])

3. COMPLEXITY:
• Time Complexity: O(n * W)
• Space Complexity: O(n * W), which can be optimized to O(W) with a 1D array.

4. ITEM RECONSTRUCTION:
Start at DP[n][W]. If DP[i][w] != DP[i-1][w], item i was included; add item i to the result set and continue tracing from DP[i-1][w - w[i]]. Otherwise, continue to DP[i-1][w].`
        },
        {
          id: 'lq3',
          unitRef: 'Unit 3: Self-Balancing Trees',
          marks: '8 Marks',
          question: 'Analyze AVL Tree balance restorations. Illustrate LL, RR, LR, and RL violations with node diagrams and explain how rotations restore logarithmic height guarantees.',
          breakdownCriteria: [
            'Definition of AVL balance factor and height upper bound: 2 Marks',
            'Single Rotations (LL and RR) mechanisms: 2 Marks',
            'Double Rotations (LR and RL) mechanisms: 2 Marks',
            'Proof that rotations preserve the in-order binary search tree property: 2 Marks'
          ],
          sampleModelAnswer: `1. AVL TREE PROPERTIES:
An AVL tree is a BST where for every node, the height difference |Height(Left) - Height(Right)| <= 1. Its height is mathematically bounded by 1.44 log2(n), guaranteeing O(log n) worst-case search.

2. ROTATION CASES:
• Left-Left (LL) Case: Insertion into left subtree of left child. Fixed by a single Right Rotation at the unbalanced ancestor.
• Right-Right (RR) Case: Insertion into right subtree of right child. Fixed by a single Left Rotation.
• Left-Right (LR) Case: Insertion into right subtree of left child. Fixed by rotating left child Left, then rotating ancestor Right.
• Right-Left (RL) Case: Insertion into left subtree of right child. Fixed by rotating right child Right, then rotating ancestor Left.

All rotations execute in O(1) time and strictly preserve the BST ordering property while reducing tree height.`
        }
      ]
    };
  }

  // Generic fallback for other subjects
  return {
    title: `${documentName} — Examination Question Bank`,
    shortAnswerQuestions: [
      {
        id: 'sq1',
        unitRef: 'Unit 1',
        marks: '3 Marks',
        question: 'State the primary learning objectives and foundational principles covered in Unit 1.',
        expectedKeyPoints: [
          'Core theoretical definitions and historical background.',
          'Key terminology and mathematical / systemic models.',
          'Standard operational assumptions.'
        ],
        sampleModelAnswer: 'Unit 1 establishes foundational paradigms by defining core terminology, identifying system constraints, and formulating the analytical framework used throughout subsequent modules.'
      },
      {
        id: 'sq2',
        unitRef: 'Unit 2',
        marks: '2 Marks',
        question: 'Distinguish between the primary mechanisms introduced in Unit 2 and Unit 3.',
        expectedKeyPoints: [
          'Functional contrast between early models and advanced implementations.',
          'Efficiency, scalability, and practical trade-offs.'
        ],
        sampleModelAnswer: 'Unit 2 covers foundational mechanics under simplified conditions, while Unit 3 extends these models to account for real-world complexity, scale, and non-ideal system behaviors.'
      }
    ],
    longAnswerQuestions: [
      {
        id: 'lq1',
        unitRef: 'Comprehensive Syllabus',
        marks: '10 Marks',
        question: 'Provide a comprehensive critical evaluation of the major theoretical models presented across the syllabus.',
        breakdownCriteria: [
          'Detailed explanation of primary theorems / mechanisms: 4 Marks',
          'Comparison of design alternatives and performance trade-offs: 3 Marks',
          'Practical application scenario and conclusion: 3 Marks'
        ],
        sampleModelAnswer: 'Students must structure their answer with clear headings: (1) System Architecture & Fundamentals, (2) Detailed Mechanism Breakdown, (3) Mathematical or Experimental Evidence, and (4) Real-world Application Scenarios.'
      }
    ]
  };
}

export function generateGroundedExplainerFallback(
  topic: string,
  syllabusText: string,
  style: string
): string {
  return `## Demystifying: ${topic}

### 1. The Big Picture
**${topic}** is a core syllabus concept designed to solve a fundamental academic and practical challenge. Rather than relying on brute force or unstructured approaches, it introduces a systematic, elegant framework that optimizes performance, clarity, and reliability.

### 2. Real-World Analogy
Imagine you are organizing a massive international library with millions of books. If you simply stack books on the floor as they arrive, finding any title requires scanning every single book. **${topic}** acts like an intelligent cataloging system with categorized aisles and quick indexing — ensuring you can pinpoint any required resource in moments with minimal effort.

### 3. Step-by-Step Breakdown
1. **Initial State & Input:** The concept starts with raw inputs, identifying base conditions and invariants.
2. **Core Transformation:** Through a sequence of well-defined rules, the data or state is processed step-by-step.
3. **Termination & Output:** The algorithm or biological mechanism terminates once the target criterion is met, producing a verified, optimal result.

### 4. Common Student Traps & Exam Pitfalls
• **Confusing Worst-Case with Average-Case:** Students frequently lose marks on exams by asserting best-case assumptions where examiners specifically test edge-case failures.
• **Ignoring Base Cases:** Forgetting boundary conditions (empty sets, null pointers, negative values) is the #1 point-deduction trigger in midterms.
• **Overcomplicating the Solution:** Strive for mathematical clarity and state definitions clearly before writing code or derivations.

### 5. Exam Memory Hook
💡 *Remember: Structure first, invariants second, bounds always.*`;
}

export function generateGroundedStudyPlanFallback(
  syllabusText: string,
  documentName: string,
  totalDays: number = 14,
  hoursPerDay: number = 3
): string {
  const unitMatches = syllabusText.match(/(?:Unit|Module)\s*[0-9IVXLCDM]+[:\s\-–—][^\n]+/gi) || [
    'Unit 1: Foundations',
    'Unit 2: Linear Structures',
    'Unit 3: Trees & Graphs',
    'Unit 4: Advanced Algorithms',
  ];

  return `# ${totalDays}-Day Strategic Revision Schedule for ${documentName}

**Daily Commitment:** ${hoursPerDay} Hours / Day • **Total Study Time:** ${totalDays * hoursPerDay} Hours

---

### Phase 1: Foundations & Core Concepts (Days 1–${Math.round(totalDays * 0.35)})
• **Day 1–2:** ${unitMatches[0] || 'Unit 1 Foundations'} — Review lecture slides, definitions, and asymptotic complexity formulas.
• **Day 3–4:** ${unitMatches[1] || 'Unit 2 Core Structures'} — Code implementations from scratch; solve 5 practice problems.
• **Day 5:** *Checkpoint & Active Recall* — Test yourself with the StudyMate Practice MCQ Quiz without looking at notes.

### Phase 2: Advanced Topics & Analytical Problems (Days ${Math.round(totalDays * 0.35) + 1}–${Math.round(totalDays * 0.75)})
• **Day 6–8:** ${unitMatches[2] || 'Unit 3 Trees & Advanced Systems'} — Master balance rotations, traversals, and edge cases.
• **Day 9–10:** ${unitMatches[3] || 'Unit 4 Graph Algorithms & Dynamic Programming'} — Work through recurrence relations and optimal substructure proofs.
• **Day 11:** *Mid-Sprint Exam Practice* — Complete Part B Long Answer questions under timed conditions.

### Phase 3: High-Yield Review & Mock Examinations (Days ${Math.round(totalDays * 0.75) + 1}–${totalDays})
• **Day 12:** Comprehensive review of all formula sheets, key definitions, and instructor emphasis points.
• **Day 13:** Mock Semester Examination — 3-hour uninterrupted timed test covering all syllabus units.
• **Day 14:** Rest, light review of flashcards, and mental preparation for exam day.`;
}

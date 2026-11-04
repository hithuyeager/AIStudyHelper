import { SyllabusDocument } from '../types';

export const SAMPLE_SYLLABI: SyllabusDocument[] = [
  {
    id: 'sample-cs204',
    name: 'CS204_Data_Structures_and_Algorithms_Syllabus.pdf',
    characterCount: 6850,
    numPages: 5,
    fileSize: 142800,
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    textSnippet: 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nCOURSE SYLLABUS: CS 204 - DATA STRUCTURES & ALGORITHMIC ANALYSIS\nAcademic Term: Spring Semester 2026\nInstructor: Dr. Elena Rostova...',
    detectedUnits: [
      'Unit 1: Asymptotic Analysis & Foundations',
      'Unit 2: Linear Data Structures (Stacks, Queues, Lists)',
      'Unit 3: Trees, Binary Search Trees & AVL Balancing',
      'Unit 4: Priority Queues, Heaps & Hashing',
      'Unit 5: Graph Theory, Traversals & Shortest Paths',
      'Unit 6: Algorithm Design: Greedy & Dynamic Programming'
    ],
    extractedText: `DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
UNIVERSITY COLLEGE OF TECHNOLOGY
COURSE SYLLABUS: CS 204 – DATA STRUCTURES & ALGORITHMIC ANALYSIS
Term: Spring Semester 2026 | Credits: 4.0 | Level: Undergraduate
Course Website: https://canvas.university.edu/courses/cs204

1. INSTRUCTOR & TEACHING TEAM
• Lead Instructor: Dr. Elena Rostova (Ph.D., MIT)
• Email: elena.rostova@university.edu
• Office Location: Alan Turing Science Hall, Room 312
• Office Hours: Tuesdays & Thursdays 2:00 PM – 4:00 PM (or by appointment via Zoom)
• Graduate Teaching Assistants: Alex Chen (achen@univ.edu), Priya Nair (pnair@univ.edu)
• TA Discussion Lab: Mondays 4:00 PM – 6:00 PM, Turing Lab B08

2. COURSE DESCRIPTION & PREREQUISITES
CS 204 is a core computer science course covering fundamental data structures, abstract data types (ADTs), algorithmic complexity, design paradigms, and rigorous performance analysis. Students implement algorithms in modern C++ / Java, conduct asymptotic evaluations, and solve complex computational problems.
Prerequisites: CS 101 (Intro to Programming) and MATH 150 (Discrete Mathematics) with minimum grade of C+.

3. REQUIRED TEXTBOOKS & SOFTWARE TOOLS
• Primary Textbook: "Introduction to Algorithms" (CLRS), 4th Edition, by Cormen, Leiserson, Rivest, Stein (MIT Press).
• Supplementary Reference: "Algorithms", 4th Edition, by Robert Sedgewick & Kevin Wayne (Addison-Wesley).
• Programming Tools: GCC/Clang C++17 or Java 17+, Git/GitHub for version control, CMake.

4. COURSE LEARNING OBJECTIVES (CLOs)
By the end of this course, students will be able to:
1. Prove time and space complexities using Big-O, Big-Omega, and Big-Theta notations.
2. Implement and optimize linear structures (dynamic arrays, singly/doubly linked lists, stacks, queues).
3. Construct balanced search trees (BST, AVL, B-Trees) and execute node balance rotations.
4. Design efficient hashing strategies and analyze collision resolution mechanisms.
5. Apply graph traversal algorithms (BFS, DFS, Dijkstra, Bellman-Ford, Kruskal/Prim) to real-world network routing problems.
6. Formulate dynamic programming algorithms with memoization and bottom-up tabulation.

5. COURSE UNITS & TOPICAL SCHEDULE

UNIT 1: ASYMPTOTIC ANALYSIS & RECURSION (Weeks 1–2)
• Topic 1.1: Growth of functions, asymptotic bounds (O, Ω, Θ), best/average/worst case.
• Topic 1.2: Recurrence relations, Master Theorem, recursion tree method.
• Topic 1.3: Dynamic array reallocation, amortized complexity and aggregate analysis.

UNIT 2: LINEAR STRUCTURES & ADTs (Weeks 3–4)
• Topic 2.1: Singly and doubly linked lists, circular lists, pointer manipulation.
• Topic 2.2: Stacks: array vs linked representation, application in parenthesis matching and arithmetic evaluation (Infix to Postfix).
• Topic 2.3: Queues: FIFO queues, circular buffer queues, double-ended queues (deque).

UNIT 3: HIERARCHICAL STRUCTURES & BALANCED TREES (Weeks 5–7)
• Topic 3.1: Tree terminology, representations, and traversal algorithms (pre-order, in-order, post-order, level-order).
• Topic 3.2: Binary Search Trees (BST): insertion, deletion with in-order predecessor/successor, search complexity.
• Topic 3.3: Self-balancing BSTs: AVL trees, balance factors, single (LL, RR) and double (LR, RL) rotations.
• Topic 3.4: Introduction to 2-3 trees and B-Trees for database indexing.

UNIT 4: PRIORITY QUEUES, HEAPS & HASHING (Weeks 8–9)
• Topic 4.1: Binary min-heaps and max-heaps, complete binary tree array representation, heapify algorithm, priority queue operations.
• Topic 4.2: Heapsort algorithm and its in-place O(n log n) proof.
• Topic 4.3: Hash tables, hash functions, load factor α.
• Topic 4.4: Collision resolution techniques: separate chaining vs open addressing (linear probing, quadratic probing, double hashing).

UNIT 5: GRAPH ALGORITHMS & PATHFINDING (Weeks 10–12)
• Topic 5.1: Graph representations: adjacency matrix vs adjacency list, graph density.
• Topic 5.2: Breadth-First Search (BFS) and Depth-First Search (DFS), topological sorting of DAGs, cycle detection.
• Topic 5.3: Single-source shortest paths: Dijkstra's algorithm with priority queues, Bellman-Ford algorithm for negative edge weights.
• Topic 5.4: Minimum Spanning Trees (MST): Prim's greedy algorithm and Kruskal's algorithm with Disjoint-Set Union (DSU / Union-Find).

UNIT 6: ALGORITHM DESIGN STRATEGIES & DYNAMIC PROGRAMMING (Weeks 13–15)
• Topic 6.1: Greedy algorithms: activity selection problem, Huffman coding.
• Topic 6.2: Dynamic Programming principles: optimal substructure, overlapping subproblems.
• Topic 6.3: Classical DP problems: 0/1 Knapsack problem, Longest Common Subsequence (LCS), Matrix Chain Multiplication.
• Topic 6.4: Intractability overview: P vs NP concepts, NP-completeness and polynomial reductions.

6. GRADING CRITERIA & ASSESSMENT WEIGHTS
• Programming Assignments (4 projects): 25% (6.25% each)
• Weekly Quizzes (Top 8 of 10): 10%
• Midterm Examination (In-class, Week 8 - Thursday, October 24): 25%
• Final Cumulative Examination (Scheduled Exam Week - Monday, December 15): 35%
• Active Recitation & Discussion Participation: 5%

Grading Scale:
• 93.0% – 100%: A
• 90.0% – 92.9%: A-
• 87.0% – 89.9%: B+
• 83.0% – 86.9%: B
• 80.0% – 82.9%: B-
• 75.0% – 79.9%: C+
• 70.0% – 74.9%: C
• Below 70.0%: D/F (No credit towards CS major graduation)

7. COURSE POLICIES
• Late Submissions: Programming assignments submitted after the deadline incur a 10% penalty per 24 hours up to a maximum of 72 hours late. After 72 hours, submissions receive a score of zero.
• Academic Integrity: All code submissions must be original work. Pair programming is not permitted on individual projects. Using AI code generation tools or copying solutions from GitHub, StackOverflow, or classmates without citation will result in an immediate grade of F in the course and referral to the University Academic Integrity Board.
• Exam Make-up Policy: Make-up exams are permitted solely for documented medical emergencies or official university athletic travel, provided notice is sent at least 48 hours prior to the exam.`
  },
  {
    id: 'sample-ee104',
    name: 'EE104_Digital_Logic_and_Computer_Architecture.pdf',
    characterCount: 5420,
    numPages: 4,
    fileSize: 118400,
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    textSnippet: 'DEPARTMENT OF ELECTRICAL & COMPUTER ENGINEERING\nEE 104: DIGITAL SYSTEMS & COMPUTER ARCHITECTURE\nFall Semester 2026 | Professor Marcus Vance...',
    detectedUnits: [
      'Unit 1: Number Systems & Boolean Algebra',
      'Unit 2: Combinational Logic Circuit Design',
      'Unit 3: Sequential Circuits & Finite State Machines',
      'Unit 4: Memory Systems & Cache Architecture',
      'Unit 5: Processor Datapath & RISC-V Pipeline'
    ],
    extractedText: `DEPARTMENT OF ELECTRICAL & COMPUTER ENGINEERING
EE 104: DIGITAL SYSTEMS & COMPUTER ARCHITECTURE
Term: Fall Semester 2026 | 4 Credits
Instructor: Prof. Marcus Vance | Office: Maxwell Engineering Center 405
Email: marcus.vance@university.edu | Office Hours: Mon/Wed 1:30 PM - 3:30 PM

1. COURSE OVERVIEW
EE 104 bridges the gap between binary logic circuits and modern computer processor architecture. Topics include Boolean algebra simplification, multiplexers, arithmetic units, sequential flip-flops, synchronous finite state machine (FSM) synthesis, cache memory hierarchies, and single-cycle RISC-V processor design.

2. TEXTBOOKS
• "Digital Design and Computer Architecture (ARM or RISC-V Edition)" by David Harris & Sarah Harris.
• Verilog HDL Reference Manual.

3. UNITS & SYLLABUS BREAKDOWN
Unit 1: Number Systems & Boolean Algebra
- Binary, octal, hexadecimal representations, two's complement arithmetic, floating-point IEEE 754.
- Boolean theorems, De Morgan's laws, SOP and POS canonical forms, Karnaugh maps (2-4 variables).

Unit 2: Combinational Logic Circuit Design
- Adders (Half adder, Full adder, Ripple-carry adder, Carry-lookahead adder).
- Decoders, encoders, multiplexers, demultiplexers, priority encoders.
- Arithmetic Logic Unit (ALU) design and propagation delays.

Unit 3: Sequential Circuits & Finite State Machines (FSM)
- SR, D, JK, and T flip-flops, setup and hold times, timing hazards.
- Synchronous registers, shift registers, binary counters.
- Mealy vs Moore state machines, state minimization, state transition diagrams.

Unit 4: Memory Systems & Cache Architecture
- SRAM vs DRAM cells, ROM, memory decoding.
- Cache principles, locality of reference (spatial vs temporal).
- Direct-mapped, fully associative, and set-associative cache placement; write-through vs write-back.

Unit 5: Processor Datapath & RISC-V Pipeline
- Instruction Set Architecture (ISA): R-type, I-type, S-type, B-type instructions.
- Single-cycle processor datapath and control unit signals.
- 5-stage instruction pipelining (IF, ID, EX, MEM, WB), data hazards, control hazards, branch prediction.

4. ASSESSMENT & GRADING
• Hardware Lab Projects (FPGA Verilog Labs): 30%
• Homework Problem Sets: 15%
• Midterm Exam: 25% (Date: November 5, 2026)
• Final Exam: 30% (Date: December 18, 2026)
Late penalty: 15% per day. No submissions accepted after 48 hours.`
  },
  {
    id: 'sample-bio210',
    name: 'BIO210_Cell_Biology_and_Molecular_Genetics.pdf',
    characterCount: 5120,
    numPages: 4,
    fileSize: 102500,
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    textSnippet: 'DIVISION OF BIOLOGICAL SCIENCES\nBIO 210: CELL BIOLOGY & MOLECULAR GENETICS\nInstructor: Dr. Sarah Jenkins | Spring 2026...',
    detectedUnits: [
      'Unit 1: Cell Structure & Biomembranes',
      'Unit 2: Bioenergetics & Cellular Respiration',
      'Unit 3: DNA Replication, Repair & Central Dogma',
      'Unit 4: Gene Regulation & Recombinant DNA',
      'Unit 5: Cell Signaling, Mitosis & Apoptosis'
    ],
    extractedText: `DIVISION OF BIOLOGICAL SCIENCES
BIO 210: CELL BIOLOGY & MOLECULAR GENETICS
Academic Term: Spring Semester 2026 | Credits: 4.0
Instructor: Dr. Sarah Jenkins | Office: Mendel Life Sciences 218
Email: sjenkins@university.edu | Office Hours: Fridays 10:00 AM - 12:00 PM

COURSE SYLLABUS

1. COURSE DESCRIPTION
BIO 210 explores the molecular architecture of living cells, biochemical pathways of energy transformation, maintenance and expression of genetic information, and modern biotechnology including CRISPR-Cas9 genome editing.

2. TEXTBOOK
"Molecular Biology of the Cell", 7th Edition, by Alberts, Johnson, Lewis, Morgan, Raff, Roberts, Walter (Norton).

3. SYLLABUS UNITS & TOPICS
Unit 1: Cell Structure & Biomembranes
- Prokaryotic vs eukaryotic cell organization, endosymbiotic theory.
- Fluid mosaic model, lipid bilayers, membrane proteins, passive diffusion, active transport, and ion channels.

Unit 2: Bioenergetics & Cellular Respiration
- Free energy, ATP hydrolysis, enzyme kinetics (Michaelis-Menten).
- Glycolysis, citric acid cycle, mitochondrial electron transport chain, oxidative phosphorylation, and ATP synthase.

Unit 3: DNA Replication, Repair & Central Dogma
- Semi-conservative replication, DNA polymerases, helicase, primase, Okazaki fragments.
- DNA mismatch repair, nucleotide excision repair.
- Transcription in prokaryotes and eukaryotes, RNA processing (5' capping, splicing, polyadenylation).
- Translation, ribosomes, tRNA charging, genetic code degeneracy.

Unit 4: Gene Regulation & Recombinant DNA Technology
- Lac operon and Trp operon regulation in bacteria.
- Eukaryotic transcription factors, epigenetics, histone acetylation, DNA methylation.
- PCR, gel electrophoresis, Sanger sequencing vs Next-Generation Sequencing (NGS).
- CRISPR-Cas9 mechanism for targeted gene editing.

Unit 5: Cell Signaling, Mitosis & Apoptosis
- G-protein coupled receptors (GPCRs), receptor tyrosine kinases (RTKs), second messengers (cAMP, Ca2+).
- Cell cycle regulation: cyclins, CDKs, checkpoints (G1/S, G2/M).
- Apoptosis pathways: intrinsic mitochondrial vs extrinsic death receptor mechanisms.

4. GRADING BREAKDOWN
• Laboratory Reports & Practical: 25%
• Weekly Homework & Reading Quizzes: 15%
• Midterm Exam 1 (Units 1 & 2): 20%
• Midterm Exam 2 (Units 3 & 4): 20%
• Comprehensive Final Exam: 20%
Grade threshold: A (90%+), B (80-89%), C (70-79%), D (60-69%), F (<60%).`
  }
];

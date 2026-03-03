// ─── Question Banks by Difficulty ──────────────────────
export const questionBanks = {
    'Data Structures': {
        easy: [
            { q: 'What is the time complexity of accessing an array element by index?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2 },
            { q: 'Which data structure uses FIFO?', opts: ['Stack', 'Queue', 'Tree', 'Graph'], ans: 1 },
            { q: 'A stack uses which principle?', opts: ['FIFO', 'LIFO', 'Random', 'Priority'], ans: 1 },
            { q: 'What is a linked list?', opts: ['Array of pointers', 'Nodes connected by references', 'Hash table variant', 'Tree structure'], ans: 1 },
            { q: 'Which is a linear data structure?', opts: ['Tree', 'Graph', 'Array', 'Heap'], ans: 2 },
        ],
        medium: [
            { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1 },
            { q: 'Which traversal gives sorted order in BST?', opts: ['Preorder', 'Postorder', 'Inorder', 'Level order'], ans: 2 },
            { q: 'Hash table average lookup time?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2 },
            { q: 'A full binary tree with n leaves has how many nodes?', opts: ['2n', '2n-1', '2n+1', 'n+1'], ans: 1 },
            { q: 'What is a deque?', opts: ['Single-ended queue', 'Double-ended queue', 'Priority queue', 'Circular queue'], ans: 1 },
        ],
        hard: [
            { q: 'What is the amortized time complexity of dynamic array insertion?', opts: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], ans: 1 },
            { q: 'Which balancing factor is used in AVL trees?', opts: ['Color', 'Height difference ≤ 1', 'Rank', 'Weight'], ans: 1 },
            { q: 'Worst case of quicksort occurs when?', opts: ['Random pivot', 'Already sorted', 'Reversed', 'Both B and C'], ans: 3 },
            { q: 'B-trees are mainly used in?', opts: ['RAM caching', 'Disk-based storage', 'Network routing', 'AI training'], ans: 1 },
            { q: 'Time complexity of finding shortest path in weighted graph (Dijkstra)?', opts: ['O(V²)', 'O(V+E)', 'O(E log V)', 'O(V³)'], ans: 2 },
        ]
    },
    'JavaScript': {
        easy: [
            { q: 'What does "===" check?', opts: ['Value only', 'Type only', 'Value and type', 'Reference'], ans: 2 },
            { q: 'Which is not a JS data type?', opts: ['undefined', 'null', 'float', 'symbol'], ans: 2 },
            { q: 'How to declare a constant?', opts: ['var', 'let', 'const', 'def'], ans: 2 },
            { q: 'typeof null returns:', opts: ['"null"', '"undefined"', '"object"', '"boolean"'], ans: 2 },
            { q: '"let" vs "var" — let is:', opts: ['Function-scoped', 'Block-scoped', 'Global', 'Same'], ans: 1 },
        ],
        medium: [
            { q: 'What is a closure?', opts: ['A loop', 'Function with access to outer scope', 'A class', 'Object'], ans: 1 },
            { q: 'Promise.all resolves when:', opts: ['Any resolves', 'All resolve', 'First rejects', 'None'], ans: 1 },
            { q: 'What is event delegation?', opts: ['Attaching events to parent', 'Creating events', 'Removing events', 'Event loop'], ans: 0 },
            { q: 'Array.prototype.map returns:', opts: ['undefined', 'Original array', 'New array', 'Boolean'], ans: 2 },
            { q: 'Which method does NOT mutate array?', opts: ['push', 'splice', 'concat', 'sort'], ans: 2 },
        ],
        hard: [
            { q: 'What is hoisting?', opts: ['Moving declarations to top', 'Removing code', 'Compiling', 'Caching'], ans: 0 },
            { q: 'What does Object.freeze() do?', opts: ['Deep freeze', 'Shallow immutability', 'Delete props', 'Copy'], ans: 1 },
            { q: 'WeakMap keys must be:', opts: ['Strings', 'Numbers', 'Objects', 'Any'], ans: 2 },
            { q: 'Event loop processes microtasks:', opts: ['After macrotasks', 'Before macrotasks', 'In parallel', 'Never'], ans: 1 },
            { q: 'Symbol.iterator enables:', opts: ['Hashing', 'Custom iteration', 'Type checking', 'Proxying'], ans: 1 },
        ]
    },
    'Python': {
        easy: [
            { q: 'Which is immutable?', opts: ['List', 'Dict', 'Tuple', 'Set'], ans: 2 },
            { q: 'What does len() return?', opts: ['Type', 'Length', 'Sum', 'Max'], ans: 1 },
            { q: 'Python is:', opts: ['Compiled', 'Interpreted', 'Assembly', 'Machine code'], ans: 1 },
            { q: 'How to create a list?', opts: ['()', '{}', '[]', '<>'], ans: 2 },
            { q: 'print() does what?', opts: ['Returns value', 'Outputs to console', 'Creates variable', 'Imports module'], ans: 1 },
        ],
        medium: [
            { q: 'What is a list comprehension?', opts: ['Loop syntax', 'Concise list creation', 'Class', 'Module'], ans: 1 },
            { q: 'What does __init__ do?', opts: ['Destroys', 'Initializes object', 'Imports', 'Returns'], ans: 1 },
            { q: 'What is a decorator?', opts: ['Loop', 'Function wrapper', 'Variable', 'Class'], ans: 1 },
            { q: 'How to handle exceptions?', opts: ['if/else', 'try/except', 'for/while', 'def/return'], ans: 1 },
            { q: 'What is PEP 8?', opts: ['Library', 'Style guide', 'Database', 'Framework'], ans: 1 },
        ],
        hard: [
            { q: 'GIL stands for?', opts: ['Global Interpreter Lock', 'General Input Lock', 'Global Input Loop', 'General Interpreter Loop'], ans: 0 },
            { q: 'Which keyword creates a generator?', opts: ['return', 'yield', 'generate', 'async'], ans: 1 },
            { q: 'Metaclass is:', opts: ['A type of list', 'Class of a class', 'Module type', 'Variable scope'], ans: 1 },
            { q: '__slots__ is used for:', opts: ['Threading', 'Memory optimization', 'Networking', 'IO'], ans: 1 },
            { q: 'What is a context manager?', opts: ['Thread pool', 'with statement protocol', 'Package', 'Debugger'], ans: 1 },
        ]
    },
    'SQL': {
        easy: [
            { q: 'Which clause filters rows?', opts: ['SELECT', 'WHERE', 'ORDER BY', 'GROUP BY'], ans: 1 },
            { q: 'Which is a DDL command?', opts: ['SELECT', 'INSERT', 'CREATE', 'UPDATE'], ans: 2 },
            { q: 'PRIMARY KEY is:', opts: ['Nullable', 'Unique + Not Null', 'Not unique', 'Optional'], ans: 1 },
            { q: 'SELECT * means:', opts: ['First row', 'All columns', 'Count', 'Distinct'], ans: 1 },
            { q: 'What does INSERT do?', opts: ['Deletes rows', 'Adds rows', 'Updates rows', 'Drops table'], ans: 1 },
        ],
        medium: [
            { q: 'JOIN combines:', opts: ['Rows from one table', 'Rows from two+ tables', 'Columns', 'Databases'], ans: 1 },
            { q: 'HAVING is used with:', opts: ['WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT'], ans: 1 },
            { q: 'What does COUNT(*) return?', opts: ['Sum', 'Average', 'Row count', 'Max'], ans: 2 },
            { q: 'Foreign key enforces:', opts: ['Uniqueness', 'Referential integrity', 'Not null', 'Defaults'], ans: 1 },
            { q: 'Which removes all rows fastest?', opts: ['DELETE', 'TRUNCATE', 'DROP', 'ALTER'], ans: 1 },
        ],
        hard: [
            { q: 'ACID stands for?', opts: ['Atomicity, Consistency, Isolation, Durability', 'Add, Create, Insert, Delete', 'Correct In Database', 'None'], ans: 0 },
            { q: 'Which is fastest for lookups?', opts: ['Full scan', 'Index scan', 'Nested loop', 'Seq scan'], ans: 1 },
            { q: 'Window function differs from GROUP BY because:', opts: ['No aggregation', 'Keeps all rows', 'Drops nulls', 'Faster'], ans: 1 },
            { q: 'CTE stands for:', opts: ['Common Table Expression', 'Create Temp Entity', 'Column Type Enum', 'Cache Table Entry'], ans: 0 },
            { q: 'EXPLAIN ANALYZE shows:', opts: ['Schema', 'Query plan + runtime', 'Indexes', 'Users'], ans: 1 },
        ]
    }
};

export const codingProblems = {
    'Data Structures': {
        easy: { title: 'Find Maximum', description: 'Write a function `findMax(arr)` that returns the largest number in an array.', starterCode: { javascript: 'function findMax(arr) {\n  // Your code here\n}', python: 'def find_max(arr):\n    # Your code here\n    pass', cpp: '#include <vector>\nusing namespace std;\n\nint findMax(vector<int> arr) {\n    // Your code here\n}' }, testCases: [{ input: '[1, 5, 3, 9, 2]', expected: '9' }, { input: '[-1, -5, -3]', expected: '-1' }, { input: '[42]', expected: '42' }] },
        medium: { title: 'Reverse Array In-Place', description: 'Write a function `reverseArray(arr)` that reverses an array in-place.', starterCode: { javascript: 'function reverseArray(arr) {\n  // Your code here\n  return arr;\n}', python: 'def reverse_array(arr):\n    # Your code here\n    return arr', cpp: '#include <vector>\nusing namespace std;\n\nvector<int> reverseArray(vector<int> arr) {\n    // Your code here\n    return arr;\n}' }, testCases: [{ input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' }, { input: '[10,20]', expected: '[20,10]' }] },
        hard: { title: 'Merge Two Sorted Arrays', description: 'Write `mergeSorted(a, b)` that merges two sorted arrays into one sorted array.', starterCode: { javascript: 'function mergeSorted(a, b) {\n  // Your code here\n}', python: 'def merge_sorted(a, b):\n    # Your code here\n    pass', cpp: 'vector<int> mergeSorted(vector<int> a, vector<int> b) {\n    // Your code here\n}' }, testCases: [{ input: '[1,3,5], [2,4,6]', expected: '[1,2,3,4,5,6]' }, { input: '[1], [2]', expected: '[1,2]' }] }
    },
    'JavaScript': {
        easy: { title: 'Count Vowels', description: 'Write `countVowels(str)` that returns the number of vowels.', starterCode: { javascript: 'function countVowels(str) {\n  // Your code here\n}', python: 'def count_vowels(s):\n    pass', cpp: 'int countVowels(string s) {\n    // Your code here\n}' }, testCases: [{ input: '"hello"', expected: '2' }, { input: '"aeiou"', expected: '5' }, { input: '"xyz"', expected: '0' }] },
        medium: { title: 'Flatten Nested Array', description: 'Write `flattenArray(arr)` that flattens a deeply nested array. No Array.flat().', starterCode: { javascript: 'function flattenArray(arr) {\n  // Your code here\n}', python: 'def flatten_array(arr):\n    pass', cpp: '// Not applicable' }, testCases: [{ input: '[[1,2],[3,[4,5]]]', expected: '[1,2,3,4,5]' }, { input: '[1,[2,[3,[4]]]]', expected: '[1,2,3,4]' }] },
        hard: { title: 'Deep Clone Object', description: 'Write `deepClone(obj)` that creates a deep copy without JSON methods.', starterCode: { javascript: 'function deepClone(obj) {\n  // Your code here\n}', python: 'def deep_clone(obj):\n    pass', cpp: '// Not applicable' }, testCases: [{ input: '{"a":1,"b":{"c":2}}', expected: '{"a":1,"b":{"c":2}}' }] }
    },
    'Python': {
        easy: { title: 'Sum of Array', description: 'Write `sumArray(arr)` that returns the sum of all elements.', starterCode: { javascript: 'function sumArray(arr) {\n  // Your code here\n}', python: 'def sum_array(arr):\n    pass', cpp: 'int sumArray(vector<int> arr) {\n    // Your code here\n}' }, testCases: [{ input: '[1,2,3,4,5]', expected: '15' }, { input: '[-1,1]', expected: '0' }] },
        medium: { title: 'Two Sum', description: 'Write `twoSum(nums, target)` returning indices of two numbers adding to target.', starterCode: { javascript: 'function twoSum(nums, target) {\n  // Your code here\n}', python: 'def two_sum(nums, target):\n    pass', cpp: 'vector<int> twoSum(vector<int> nums, int target) {\n    // Your code here\n}' }, testCases: [{ input: '[2,7,11,15], 9', expected: '[0,1]' }, { input: '[3,2,4], 6', expected: '[1,2]' }] },
        hard: { title: 'LRU Cache', description: 'Implement a simple LRU cache with get(key) and put(key, value).', starterCode: { javascript: 'class LRUCache {\n  constructor(capacity) {\n    // Your code\n  }\n  get(key) {}\n  put(key, value) {}\n}', python: 'class LRUCache:\n    def __init__(self, capacity):\n        pass\n    def get(self, key):\n        pass\n    def put(self, key, value):\n        pass', cpp: '// Implement LRU Cache' }, testCases: [{ input: 'capacity=2, put(1,1), put(2,2), get(1)', expected: '1' }] }
    },
    'SQL': {
        easy: { title: 'Parse Column Names', description: 'Write `parseSelect(query)` extracting column names from SELECT query.', starterCode: { javascript: 'function parseSelect(query) {\n  // "SELECT a, b FROM t" => ["a","b"]\n}', python: 'def parse_select(query):\n    pass', cpp: '// Parse SELECT query' }, testCases: [{ input: '"SELECT name, age FROM users"', expected: '["name","age"]' }, { input: '"SELECT id FROM orders"', expected: '["id"]' }] },
        medium: { title: 'Parse Column Names', description: 'Write `parseSelect(query)` extracting column names from SELECT query.', starterCode: { javascript: 'function parseSelect(query) {\n  // "SELECT a, b FROM t" => ["a","b"]\n}', python: 'def parse_select(query):\n    pass', cpp: '// Not applicable' }, testCases: [{ input: '"SELECT name, age FROM users"', expected: '["name","age"]' }] },
        hard: { title: 'SQL Tokenizer', description: 'Write `tokenize(sql)` that splits SQL into keyword tokens.', starterCode: { javascript: 'function tokenize(sql) {\n  // Your code\n}', python: 'def tokenize(sql):\n    pass', cpp: '// Not applicable' }, testCases: [{ input: '"SELECT * FROM users WHERE id = 1"', expected: '["SELECT","*","FROM","users","WHERE","id","=","1"]' }] }
    }
};

export const companyPrepTracks = {
    'TechCorp India': {
        focus: ['Data Structures', 'System Design', 'JavaScript'], modules: [
            { title: 'Arrays & Strings', dur: '2 hrs', icon: 'data_array' },
            { title: 'Trees & Graphs', dur: '3 hrs', icon: 'account_tree' },
            { title: 'System Design Basics', dur: '2 hrs', icon: 'architecture' },
            { title: 'JavaScript Deep Dive', dur: '2 hrs', icon: 'javascript' },
            { title: 'Mock Interview', dur: '1 hr', icon: 'record_voice_over' },
        ]
    },
    'DataVerse AI': {
        focus: ['Python', 'Machine Learning', 'SQL'], modules: [
            { title: 'Python Advanced', dur: '3 hrs', icon: 'code' },
            { title: 'ML Fundamentals', dur: '4 hrs', icon: 'psychology' },
            { title: 'SQL Mastery', dur: '2 hrs', icon: 'storage' },
            { title: 'Data Pipeline Design', dur: '2 hrs', icon: 'hub' },
            { title: 'AI Ethics & Interview', dur: '1 hr', icon: 'record_voice_over' },
        ]
    },
    'CloudNine Systems': {
        focus: ['JavaScript', 'React', 'Node.js'], modules: [
            { title: 'React Advanced Patterns', dur: '3 hrs', icon: 'web' },
            { title: 'Node.js Backend', dur: '3 hrs', icon: 'dns' },
            { title: 'REST & GraphQL', dur: '2 hrs', icon: 'api' },
            { title: 'Testing Strategies', dur: '1.5 hrs', icon: 'bug_report' },
            { title: 'Full Stack Project', dur: '4 hrs', icon: 'rocket_launch' },
        ]
    },
    'Infosys': {
        focus: ['Java', 'SQL', 'Aptitude'], modules: [
            { title: 'Core Java', dur: '3 hrs', icon: 'coffee' },
            { title: 'SQL Foundations', dur: '2 hrs', icon: 'storage' },
            { title: 'Quantitative Aptitude', dur: '2 hrs', icon: 'calculate' },
            { title: 'Verbal Ability', dur: '1 hr', icon: 'menu_book' },
            { title: 'InfyTQ Practice', dur: '2 hrs', icon: 'assignment' },
        ]
    },
    'Wipro': {
        focus: ['Aptitude', 'Communication', 'Coding'], modules: [
            { title: 'Aptitude Prep', dur: '2 hrs', icon: 'calculate' },
            { title: 'Written Communication', dur: '1.5 hrs', icon: 'edit_note' },
            { title: 'Coding Basics', dur: '2 hrs', icon: 'code' },
            { title: 'Technical MCQs', dur: '1.5 hrs', icon: 'quiz' },
            { title: 'Essay Writing', dur: '1 hr', icon: 'description' },
        ]
    }
};

export const leaderboardData = [
    { name: 'You', score: 0, isCurrentUser: true },
    { name: 'Arjun M.', score: 92 },
    { name: 'Priya S.', score: 88 },
    { name: 'Rahul K.', score: 85 },
    { name: 'Sneha T.', score: 82 },
    { name: 'Vikram P.', score: 79 },
    { name: 'Ananya R.', score: 76 },
    { name: 'Karthik L.', score: 73 },
    { name: 'Divya N.', score: 70 },
    { name: 'Rohan G.', score: 65 },
];

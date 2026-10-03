export interface CodeSnippet {
  text: string;
  language: string;
  title: string;
}

export const codeSnippets: CodeSnippet[] = [
  {
    text: `function fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}`,
    language: "javascript",
    title: "Fibonacci"
  },
  {
    text: `const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};`,
    language: "javascript",
    title: "Debounce"
  },
  {
    text: `async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error("HTTP error");\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Fetch failed:", error);\n    throw error;\n  }\n}`,
    language: "javascript",
    title: "Fetch Data"
  },
  {
    text: `interface User {\n  id: string;\n  name: string;\n  email: string;\n  role: "admin" | "user";\n}\n\nfunction getUsers(role?: User["role"]): User[] {\n  const users: User[] = [];\n  return role ? users.filter(u => u.role === role) : users;\n}`,
    language: "typescript",
    title: "TypeScript Interface"
  },
  {
    text: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
    language: "python",
    title: "Binary Search"
  },
  {
    text: `class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, item):\n        self.items.append(item)\n\n    def pop(self):\n        if not self.is_empty():\n            return self.items.pop()\n        return None\n\n    def is_empty(self):\n        return len(self.items) == 0`,
    language: "python",
    title: "Stack Implementation"
  },
  {
    text: `const mergeSort = (arr: number[]): number[] => {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n};\n\nconst merge = (a: number[], b: number[]): number[] => {\n  const result: number[] = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    result.push(a[i] < b[j] ? a[i++] : b[j++]);\n  }\n  return [...result, ...a.slice(i), ...b.slice(j)];\n};`,
    language: "typescript",
    title: "Merge Sort"
  },
  {
    text: `const express = require("express");\nconst app = express();\n\napp.use(express.json());\n\napp.get("/api/health", (req, res) => {\n  res.json({ status: "ok" });\n});\n\napp.post("/api/data", (req, res) => {\n  const { name, value } = req.body;\n  res.status(201).json({ name, value });\n});\n\napp.listen(3000, () => {\n  console.log("Server running on port 3000");\n});`,
    language: "javascript",
    title: "Express Server"
  },
];

export const getRandomSnippet = (): CodeSnippet => {
  return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
};

export default codeSnippets;

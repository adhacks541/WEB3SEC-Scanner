# 🛡️ Web3 Vulnerability Scanner — Project Overview

## What It Is

**0xSENTINEL** is a **browser-based static analysis tool** for Solidity smart contracts. Users paste their Solidity code into a code editor, click "Analyze", and instantly receive a security report highlighting vulnerabilities, severity levels, and fix recommendations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 14** (App Router, `next@^16.1.1`) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** + CSS custom variables |
| Animations | **Framer Motion** |
| Icons | **Lucide React** |
| Solidity Parsing | `@solidity-parser/parser`, `solc` (installed but not yet used) |
| Syntax Highlight | `prismjs` (installed but not yet integrated) |

---

## Project Structure

```
web3-scanner/
└── src/
    ├── app/
    │   ├── page.tsx              ← Main scanner UI (home page)
    │   ├── layout.tsx            ← Root Next.js layout wrapper
    │   ├── globals.css           ← Global styles + cyberpunk CSS variables
    │   ├── actions.ts            ← Next.js Server Action (calls analyzer)
    │   ├── vulnerabilities/
    │   │   └── page.tsx          ← Vulnerability database listing page
    │   └── docs/
    │       └── page.tsx          ← Documentation/how-it-works page
    ├── components/
    │   ├── Layout.tsx            ← Shared shell (header, nav, footer)
    │   ├── CodeEditor.tsx        ← Textarea with line numbers
    │   └── Results.tsx           ← Analysis report UI
    └── lib/
        └── analyzer.ts           ← Core detection engine
```

---

## Core Logic — analyzer.ts

The entire analysis engine lives in one file. It uses **regex pattern matching**, scanning the contract line by line.

**Detects 5 vulnerability types:**

| ID | Name | Severity | Pattern |
|---|---|---|---|
| `reentrancy` | Reentrancy | 🔴 High | `.call{value:...}(` |
| `tx-origin` | Phishing via tx.origin | 🔴 High | `tx.origin` |
| `unchecked-low-level` | Unchecked Low-Level Call | 🟡 Medium | `.call(`, `.delegatecall(`, `.staticcall(` |
| `weak-randomness` | Weak Randomness | 🟡 Medium | `block.timestamp`, `block.difficulty`, `now` |
| `floating-pragma` | Floating Pragma | 🔵 Low | `pragma solidity ^` |

**Security Score formula:**
```
score = max(0, 100 - (high × 20 + medium × 10 + low × 5))
```

**Interfaces exported:**
- `Vulnerability` — id, name, description, severity, line number, remediation
- `AnalysisReport` — vulnerabilities[], timestamp, contractName, mode ('Solc' | 'Regex')

> **Note:** The `mode` field and `solc` / `@solidity-parser/parser` packages are installed but the AST/compiler-based path is **not yet implemented**. `analyzeContract()` just calls `analyzeContractRegex()` directly.

---

## Pages

### `/` — Main Scanner (page.tsx)
- Two-column layout: **Code Editor** (left) | **Analysis Report** (right)
- Pre-loaded with a `VulnerableBank` contract demo showing a classic reentrancy bug
- Calls `analyze()` server action on button click
- Shows a spinner while scanning

### `/vulnerabilities` — Vulnerability Database
- Lists all 5 vulnerability patterns from `VULNERABILITY_PATTERNS`
- Shows name, severity badge, description, remediation

### `/docs` — Documentation
- Explains how the scanner works
- Lists supported checks
- Best practices (Checks-Effects-Interactions, lock pragma version)

---

## UI Design — Cyberpunk / "0xSENTINEL" Theme

- **Background**: `#0a0a0a` with a CSS grid overlay for a "terminal grid" effect
- **Accent color**: Neon green `#00ff9d`
- **Alert colors**: Red `#ff4d4d` (High), Yellow `#ffd700` (Medium), Blue (Low)
- **Glass panels**: `backdrop-filter: blur` + dark translucent background
- **Animations**: Framer Motion slide-in/fade-in on result cards, CSS scan-line animation
- **Header**: Sticky, blur-backdrop, neon brand name

---

## Data Flow

```
User types code
       ↓
[CodeEditor.tsx] → state: code
       ↓ (button click)
[page.tsx] → calls analyze(code) [Next.js Server Action]
       ↓
[actions.ts] → calls analyzeContract(code)
       ↓
[analyzer.ts] → regex scan → returns AnalysisReport
       ↓
[Results.tsx] → renders score card + vulnerability cards
```

---

## Current Limitations / What's Not Yet Built

| Gap | Detail |
|---|---|
| **Regex-only engine** | AST-based analysis using `@solidity-parser/parser` is installed but not wired up |
| **Compiler integration** | `solc` package is installed but never called |
| **False positive rate** | Regex can't understand context — e.g., a `.call(` that IS checked will still flag |
| **Single file only** | No import resolution or multi-file support |
| **No AI suggestions** | "Fix it for me" feature is in roadmap but not built |
| **No export/share** | No way to download or share a report |
| **CodeEditor is plain textarea** | `prismjs` is installed but syntax highlighting is not implemented |
| **No file upload** | Can only paste code, no `.sol` file upload |
| **No persistent history** | No scan history or saved reports |
| **Docs page has no code examples** | Just text descriptions, no interactive demos |

---

## Roadmap (from README)

- [ ] Integration with Slither / Mythril (backend API)
- [ ] AST-based analysis for deeper accuracy
- [ ] "Fix it for me" AI suggestions
- [ ] Support for multiple files / imports

---

## What to Tell ChatGPT

> **"This is a Next.js 14 + TypeScript web app called 0xSENTINEL — a Solidity smart contract vulnerability scanner. It uses a regex-based static analysis engine in `src/lib/analyzer.ts` that scans for 5 vulnerability types (reentrancy, tx.origin, unchecked calls, weak randomness, floating pragma) and outputs a security score. The UI has a cyberpunk theme with Tailwind CSS + Framer Motion. `solc` and `@solidity-parser/parser` are installed but not yet used — the AST path is unimplemented. There's no syntax highlighting (prismjs is installed but unused), no file upload, no multi-file support, and no AI fix suggestions. Three pages exist: main scanner, vulnerability database, and docs."**

---

## Suggested Next Improvements (prioritized)

1. **Syntax highlighting in the editor** — Wire up `prismjs` with Solidity grammar; big UX win since it's already installed
2. **AST-based parsing** — Replace regex with `@solidity-parser/parser` to eliminate false positives and detect more patterns accurately
3. **File upload** — Drag-and-drop `.sol` file support
4. **Export report** — Download analysis as PDF or JSON
5. **More vulnerability checks** — Integer overflow/underflow, selfdestruct, delegatecall to untrusted contracts, access control issues
6. **Scan history** — Store past scans in `localStorage`
7. **Live/real-time scanning** — Debounced auto-scan as user types
8. **AI fix suggestions** — Connect to an LLM API to auto-generate patched code

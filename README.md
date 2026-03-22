# 0xSENTINEL — Web3 Vulnerability Scanner 🛡️

> A high-performance, browser-based static analysis tool for Solidity smart contracts — no setup, no backend, instant results.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)

---

## ✨ What It Does

**0xSENTINEL** lets you paste any Solidity smart contract and receive an **instant security report** — no wallets, no API keys, no Python setup required.

The analysis engine scans your code for common vulnerability patterns and returns a **0–100 Security Score** along with detailed remediation advice for every detected issue. Comments and docstrings are automatically skipped to reduce false positives.

---

## 🔍 Detected Vulnerabilities

| # | Vulnerability | Severity | What It Catches |
|---|---|---|---|
| 1 | **Reentrancy** | 🔴 High | `.call{value:...}(` — unsafe external calls with ETH transfer |
| 2 | **Phishing via tx.origin** | 🔴 High | `tx.origin` used for authorization checks |
| 3 | **Unchecked Low-Level Call** | 🟡 Medium | `.call(`, `.delegatecall(`, `.staticcall(` with unchecked return value |
| 4 | **Weak Randomness** | 🟡 Medium | `block.timestamp`, `block.difficulty`, `now` used as entropy source |
| 5 | **Floating Pragma** | 🔵 Low | `pragma solidity ^x.x.x` — unlocked compiler version |

**Security Score formula:**
```
score = max(0, 100 − (High×20 + Medium×10 + Low×5))
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Runtime | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Custom Variables |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Solidity Parsing | `@solidity-parser/parser`, `solc` *(installed — AST path in roadmap)* |
| Syntax Highlighting | `prismjs` *(installed — integration in roadmap)* |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/web3-scanner.git
cd web3-scanner

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main scanner UI (two-column layout)
│   ├── layout.tsx            # Root layout wrapper
│   ├── globals.css           # Cyberpunk theme + CSS variables
│   ├── actions.ts            # Next.js Server Action — calls analyzer
│   ├── vulnerabilities/
│   │   └── page.tsx          # Full vulnerability database listing
│   └── docs/
│       └── page.tsx          # How-it-works & best practices
├── components/
│   ├── Layout.tsx            # Sticky header, nav, footer shell
│   ├── CodeEditor.tsx        # Code input with line numbers
│   └── Results.tsx           # Score card + vulnerability cards
└── lib/
    └── analyzer.ts           # Core regex-based detection engine
```

---

## 🗺️ App Pages

- **`/`** — Paste your contract, hit **ANALYZE**, view the report side by side. Pre-loaded with a `VulnerableBank` demo contract.
- **`/vulnerabilities`** — Browse all detected vulnerability types with full descriptions and remediation guides.
- **`/docs`** — Learn how the scanner works, supported checks, and Solidity security best practices.

---

## ⚙️ How It Works

```
User pastes Solidity code
        ↓
[CodeEditor.tsx] → React state
        ↓ (button click)
[page.tsx] → calls analyze() [Next.js Server Action]
        ↓
[actions.ts] → calls analyzeContract(code)
        ↓
[analyzer.ts] → regex scan line-by-line → AnalysisReport
        ↓
[Results.tsx] → renders score card + vulnerability cards
```

The core engine in `analyzer.ts` parses the contract line by line using **regex pattern matching**, skipping comment lines to reduce noise. It exports an `AnalysisReport` containing all detected vulnerabilities, a timestamp, the detected contract name, and the analysis mode (`'Regex'` currently; `'Solc'` is reserved for the upcoming AST path).

---

## 🎨 Design

The UI uses a **cyberpunk / terminal aesthetic**:
- Deep black background (`#0a0a0a`) with an animated CSS grid overlay
- Neon green (`#00ff9d`) as the primary accent color
- Glassmorphism panels with `backdrop-filter: blur`
- Framer Motion slide-in animations on all result cards
- Color-coded severity: 🔴 Red (High) / 🟡 Yellow (Medium) / 🔵 Blue (Low)

---

## 🔒 Security Note

- Next.js is kept at the latest patched version (`^16.1.1`) to mitigate [CVE-2025-66478](https://github.com/advisories/GHSA-gp8f-8m3g-qvj9) (middleware authentication bypass).
- **No user data is transmitted externally.** All analysis runs server-side as a Next.js Server Action with zero external API calls.

---

## 🔮 Roadmap

- [ ] AST-based analysis using `@solidity-parser/parser` for higher accuracy & fewer false positives
- [ ] Solidity syntax highlighting in the code editor (`prismjs` already installed)
- [ ] Drag-and-drop `.sol` file upload
- [ ] Export report as PDF / JSON
- [ ] Scan history stored in `localStorage`
- [ ] More vulnerability checks: integer overflow, access control issues, selfdestruct misuse, delegatecall to untrusted contracts
- [ ] Live / debounced auto-scan as you type
- [ ] AI-powered "Fix it for me" suggestions via LLM API
- [ ] Backend integration with [Slither](https://github.com/crytic/slither) / [Mythril](https://github.com/Consensys/mythril)

---

## 🤝 Contributing

Contributions are welcome! Fork the repository, create a feature branch, and open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

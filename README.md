# Web3 Vulnerability Scanner 🛡️

A modern, high-performance static analysis tool for Solidity smart contracts. This tool helps developers identify common security vulnerabilities in their code through an intuitive, cyberpunk-themed interface.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **Instant Static Analysis**: Runs directly in the browser using a custom regex-based engine.
- **Vulnerability Detection**:
  - 🚨 **Reentrancy**: Detects unsafe external calls.
  - 🎣 **Phishing**: Identifies usage of `tx.origin`.
  - 🎲 **Weak Randomness**: Flags usage of `block.timestamp` or `block.difficulty`.
  - ⚠️ **Unchecked Calls**: Warns about low-level calls without return value checks.
  - 🔓 **Floating Pragma**: Checks for unlocked compiler versions.
- **Security Score**: Calculates a 0-100 safety score based on finding severity.
- **Cyberpunk UI**: Premium dark mode design with neon accents and smooth animations.
- **Detailed Remediation**: Provides actionable advice on how to fix each detected issue.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Variables
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/web3-scanner.git
   cd web3-scanner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles & theme variables
│   ├── layout.tsx       # Main app wrapper
│   └── page.tsx         # Main scanner page
├── components/
│   ├── CodeEditor.tsx   # Solidity code input
│   ├── Layout.tsx       # UI Shell
│   └── Results.tsx      # Analysis dashboard
└── lib/
    └── analyzer.ts      # Static analysis logic
```

## 🔮 Future Roadmap

- [ ] Integration with Slither/Mythril (Backend API)
- [ ] AST-based analysis for deeper accuracy
- [ ] "Fix it for me" AI suggestions
- [ ] Support for multiple files / imports

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

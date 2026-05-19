import parser from '@solidity-parser/parser';
import { VULNERABILITY_METADATA } from './vulnerabilities';
import type {
  BaseASTNode,
  BinaryOperation,
  ContractDefinition,
  Expression,
  ExpressionStatement,
  FunctionCall,
  FunctionDefinition,
  Identifier,
  MemberAccess,
  PragmaDirective,
  StateVariableDeclaration,
  UnaryOperation,
} from '@solidity-parser/parser/dist/src/ast-types';

export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  line?: number;
  remediation: string;
  explanation?: string;
  whyDangerous?: string;
  secureAlternative?: string;
  secureExample?: string;
  excerpt?: string;
  confidence?: 'High' | 'Medium';
}

export interface AnalysisReport {
  vulnerabilities: Vulnerability[];
  timestamp: number;
  contractName?: string;
  mode: 'AST' | 'Regex';
  warnings?: string[];
}

type Severity = Vulnerability['severity'];
type Confidence = NonNullable<Vulnerability['confidence']>;

export type VulnerabilityDefinition = {
  id: string;
  name: string;
  severity: Severity;
  description: string;
  remediation: string;
};

type RegexPattern = VulnerabilityDefinition & {
  detect: (line: string) => boolean;
};

const ASSIGNMENT_OPERATORS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '|=', '&=', '^=', '<<=', '>>=']);
const LOW_LEVEL_CALL_NAMES = new Set(['call', 'delegatecall', 'staticcall']);

export const VULNERABILITY_PATTERNS: readonly VulnerabilityDefinition[] = [
  {
    id: 'reentrancy',
    name: 'Reentrancy Pattern',
    severity: 'High',
    description:
      'A value-transferring external call appears before a later state mutation in the same function, which is a common reentrancy risk pattern.',
    remediation:
      'Apply Checks-Effects-Interactions by moving state updates before the external call, or protect the function with a reentrancy guard.',
  },
  {
    id: 'tx-origin',
    name: 'Phishing with tx.origin',
    severity: 'High',
    description:
      'Using tx.origin for authorization is insecure because malicious contracts can trick users into forwarding calls.',
    remediation: 'Use msg.sender instead of tx.origin for authorization checks.',
  },
  {
    id: 'unchecked-low-level',
    name: 'Unchecked Low-Level Call',
    severity: 'Medium',
    description: 'A low-level call executes without an obvious success check.',
    remediation: 'Capture the boolean return value and handle failures explicitly.',
  },
  {
    id: 'floating-pragma',
    name: 'Floating Pragma',
    severity: 'Low',
    description: 'Version ranges can compile under a different compiler than the one originally reviewed.',
    remediation: 'Pin Solidity to an exact compiler version such as pragma solidity 0.8.24;.',
  },
  {
    id: 'weak-randomness',
    name: 'Weak Randomness',
    severity: 'Medium',
    description: 'Block properties are predictable or miner-influenced and should not be used as entropy sources.',
    remediation: 'Use a verifiable randomness source such as Chainlink VRF.',
  },
  {
    id: 'delegatecall-risk',
    name: 'Unsafe delegatecall',
    severity: 'High',
    description: 'delegatecall executes code in the caller context and can corrupt storage or break trust boundaries.',
    remediation: 'Avoid delegatecall to untrusted targets and tightly constrain upgrade or proxy execution paths.',
  },
  {
    id: 'selfdestruct',
    name: 'Selfdestruct Usage',
    severity: 'High',
    description: 'selfdestruct can permanently change contract behavior and is dangerous in most production systems.',
    remediation: 'Remove selfdestruct or gate it behind strong governance and a carefully reviewed shutdown flow.',
  },
] as const;

const VULNERABILITY_DEFINITION_MAP = new Map(VULNERABILITY_PATTERNS.map((pattern) => [pattern.id, pattern]));

const REGEX_PATTERNS: readonly RegexPattern[] = [
  {
    ...getDefinition('reentrancy'),
    detect: (line) => /\.call\s*\{[^}]*\bvalue\s*:/.test(line),
  },
  {
    ...getDefinition('tx-origin'),
    detect: (line) => /\btx\.origin\b/.test(line),
  },
  {
    ...getDefinition('unchecked-low-level'),
    detect: detectUncheckedLowLevelCallRegex,
  },
  {
    ...getDefinition('floating-pragma'),
    detect: (line) => /pragma\s+solidity\s+(?!\d+\.\d+\.\d+\s*;?$).+/.test(line),
  },
  {
    ...getDefinition('weak-randomness'),
    detect: (line) => /\b(block\.timestamp|block\.difficulty|block\.prevrandao|blockhash|now)\b/.test(line),
  },
  {
    ...getDefinition('delegatecall-risk'),
    detect: (line) => /\.delegatecall\s*(\{[^}]*\})?\s*\(/.test(line),
  },
  {
    ...getDefinition('selfdestruct'),
    detect: (line) => /\b(selfdestruct|suicide)\s*\(/.test(line),
  },
] as const;

export function analyzeContract(code: string): AnalysisReport {
  try {
    return analyzeContractAst(code);
  } catch (error) {
    return analyzeContractRegex(
      code,
      error instanceof Error ? ['AST parsing failed, so the scanner fell back to regex heuristics.'] : undefined
    );
  }
}

export function analyzeContractAst(code: string): AnalysisReport {
  const ast = parser.parse(code, { loc: true, range: true });
  const findings = new Map<string, Vulnerability>();
  const contractDefinitions = ast.children.filter(isContractDefinition);
  const contractName = contractDefinitions[0]?.name ?? getContractName(code);

  for (const child of ast.children) {
    if (child.type === 'PragmaDirective') {
      analyzePragmaDirective(child, code, findings);
    }

    if (child.type === 'ContractDefinition') {
      analyzeContractDefinition(child, code, findings);
    }
  }

  return buildReport({
    contractName,
    findings,
    mode: 'AST',
    warnings: [],
  });
}

export function analyzeContractRegex(code: string, warnings: string[] = []): AnalysisReport {
  const sanitizedCode = stripCommentsAndStrings(code);
  const sanitizedLines = sanitizedCode.split('\n');
  const findings = new Map<string, Vulnerability>();
  const contractName = getContractName(sanitizedCode);

  sanitizedLines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return;
    }

    REGEX_PATTERNS.forEach((pattern) => {
      if (!pattern.detect(line)) {
        return;
      }

      addFinding(findings, pattern.id, code, index + 1, 'Medium');
    });
  });

  return buildReport({
    contractName,
    findings,
    mode: 'Regex',
    warnings,
  });
}

export function calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
  const severityWeights: Record<Severity, number> = {
    High: 20,
    Medium: 10,
    Low: 5,
  };

  const penalty = vulnerabilities.reduce((total, vulnerability) => {
    return total + severityWeights[vulnerability.severity];
  }, 0);

  return Math.max(0, 100 - penalty);
}

function analyzePragmaDirective(node: PragmaDirective, code: string, findings: Map<string, Vulnerability>) {
  if (node.name !== 'solidity') {
    return;
  }

  if (!isPinnedSolidityVersion(node.value)) {
    addFinding(findings, 'floating-pragma', code, node.loc?.start.line, 'High');
  }
}

function analyzeContractDefinition(contract: ContractDefinition, code: string, findings: Map<string, Vulnerability>) {
  const stateVariableNames = getStateVariableNames(contract);

  walkNode(contract, (node, parent) => {
    if (node.type === 'MemberAccess') {
      analyzeMemberAccess(node as MemberAccess, code, findings);
    }

    if (node.type === 'Identifier' && (node as Identifier).name === 'now') {
      addFinding(findings, 'weak-randomness', code, node.loc?.start.line, 'High');
    }

    if (node.type === 'FunctionCall') {
      analyzeFunctionCall(node as FunctionCall, code, findings, parent);
    }
  });

  contract.subNodes
    .filter(isFunctionDefinition)
    .forEach((functionDefinition) => analyzeFunctionReentrancy(functionDefinition, stateVariableNames, code, findings));
}

function analyzeMemberAccess(node: MemberAccess, code: string, findings: Map<string, Vulnerability>) {
  if (node.expression.type === 'Identifier' && node.expression.name === 'tx' && node.memberName === 'origin') {
    addFinding(findings, 'tx-origin', code, node.loc?.start.line, 'High');
  }

  if (node.expression.type === 'Identifier' && node.expression.name === 'block') {
    if (['timestamp', 'difficulty', 'prevrandao'].includes(node.memberName)) {
      addFinding(findings, 'weak-randomness', code, node.loc?.start.line, 'High');
    }
  }
}

function analyzeFunctionCall(
  node: FunctionCall,
  code: string,
  findings: Map<string, Vulnerability>,
  parent?: BaseASTNode
) {
  const directCallName = getDirectFunctionName(node);
  const lowLevelCall = getLowLevelCallDetails(node);

  if (directCallName && ['selfdestruct', 'suicide'].includes(directCallName)) {
    addFinding(findings, 'selfdestruct', code, node.loc?.start.line, 'High');
  }

  if (directCallName === 'blockhash') {
    addFinding(findings, 'weak-randomness', code, node.loc?.start.line, 'High');
  }

  if (lowLevelCall?.memberName === 'delegatecall') {
    addFinding(findings, 'delegatecall-risk', code, node.loc?.start.line, 'High');
  }

  if (parent?.type === 'ExpressionStatement' && lowLevelCall) {
    addFinding(findings, 'unchecked-low-level', code, node.loc?.start.line, 'High');
  }
}

function analyzeFunctionReentrancy(
  functionDefinition: FunctionDefinition,
  stateVariableNames: Set<string>,
  code: string,
  findings: Map<string, Vulnerability>
) {
  if (!functionDefinition.body || stateVariableNames.size === 0) {
    return;
  }

  const valueTransferCallLines: number[] = [];
  const stateMutationLines: number[] = [];

  walkNode(functionDefinition.body, (node) => {
    if (node.type === 'ExpressionStatement' && (node as ExpressionStatement).expression) {
      const expressionStatement = node as ExpressionStatement;
      const lowLevelCall = getLowLevelCallDetails(expressionStatement.expression as Expression);
      if (lowLevelCall?.hasValueTransfer && node.loc?.start.line) {
        valueTransferCallLines.push(node.loc.start.line);
      }
    }

    if (isStateMutationNode(node, stateVariableNames) && node.loc?.start.line) {
      stateMutationLines.push(node.loc.start.line);
    }
  });

  for (const callLine of valueTransferCallLines) {
    if (stateMutationLines.some((mutationLine) => mutationLine > callLine)) {
      addFinding(findings, 'reentrancy', code, callLine, 'Medium');
    }
  }
}

function isStateMutationNode(node: BaseASTNode, stateVariableNames: Set<string>): boolean {
  if (node.type === 'BinaryOperation' && ASSIGNMENT_OPERATORS.has((node as BinaryOperation).operator)) {
    return isStateVariableReference((node as BinaryOperation).left, stateVariableNames);
  }

  if (node.type === 'UnaryOperation' && ['++', '--', 'delete'].includes((node as UnaryOperation).operator)) {
    return isStateVariableReference((node as UnaryOperation).subExpression, stateVariableNames);
  }

  return false;
}

function isStateVariableReference(expression: Expression, stateVariableNames: Set<string>): boolean {
  if (expression.type === 'Identifier') {
    return stateVariableNames.has(expression.name);
  }

  if (expression.type === 'IndexAccess' || expression.type === 'IndexRangeAccess') {
    return isStateVariableReference(expression.base, stateVariableNames);
  }

  if (expression.type === 'MemberAccess') {
    return isStateVariableReference(expression.expression, stateVariableNames);
  }

  return false;
}

function getStateVariableNames(contract: ContractDefinition): Set<string> {
  const stateVariables = new Set<string>();

  contract.subNodes.forEach((node) => {
    if (node.type !== 'StateVariableDeclaration') {
      return;
    }

    (node as StateVariableDeclaration).variables.forEach((variable) => {
      if (variable.name) {
        stateVariables.add(variable.name);
      }
    });
  });

  return stateVariables;
}

function getLowLevelCallDetails(expression: Expression): { memberName: string; hasValueTransfer: boolean } | null {
  if (expression.type !== 'FunctionCall') {
    return null;
  }

  if (expression.expression.type === 'MemberAccess') {
    if (!LOW_LEVEL_CALL_NAMES.has(expression.expression.memberName)) {
      return null;
    }

    return {
      memberName: expression.expression.memberName,
      hasValueTransfer: false,
    };
  }

  if (expression.expression.type === 'NameValueExpression' && expression.expression.expression.type === 'MemberAccess') {
    const memberName = expression.expression.expression.memberName;

    if (!LOW_LEVEL_CALL_NAMES.has(memberName)) {
      return null;
    }

    return {
      memberName,
      hasValueTransfer: expression.expression.arguments.names.includes('value'),
    };
  }

  return null;
}

function getDirectFunctionName(functionCall: FunctionCall): string | null {
  if (functionCall.expression.type === 'Identifier') {
    return functionCall.expression.name;
  }

  return null;
}

function isPinnedSolidityVersion(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value.trim());
}

function buildReport({
  contractName,
  findings,
  mode,
  warnings,
}: {
  contractName: string;
  findings: Map<string, Vulnerability>;
  mode: AnalysisReport['mode'];
  warnings: string[];
}): AnalysisReport {
  const vulnerabilities = Array.from(findings.values()).sort((left, right) => {
    const leftLine = left.line ?? 0;
    const rightLine = right.line ?? 0;

    if (leftLine !== rightLine) {
      return leftLine - rightLine;
    }

    return severityWeight(right.severity) - severityWeight(left.severity);
  });

  return {
    vulnerabilities,
    timestamp: Date.now(),
    contractName,
    mode,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

function addFinding(
  findings: Map<string, Vulnerability>,
  id: string,
  code: string,
  line: number | undefined,
  confidence: Confidence
) {
  const definition = getDefinition(id);
  const extended = VULNERABILITY_METADATA[id];
  const findingKey = `${id}:${line ?? 0}`;

  if (findings.has(findingKey)) {
    return;
  }

  findings.set(findingKey, {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    severity: definition.severity,
    line,
    remediation: extended?.remediation || definition.remediation,
    explanation: extended?.explanation,
    whyDangerous: extended?.whyDangerous,
    secureAlternative: extended?.secureAlternative,
    secureExample: extended?.secureExample,
    excerpt: line ? getLineExcerpt(code, line) : undefined,
    confidence,
  });
}

function walkNode(node: unknown, callback: (node: BaseASTNode, parent?: BaseASTNode) => void, parent?: BaseASTNode) {
  if (Array.isArray(node)) {
    node.forEach((child) => walkNode(child, callback, parent));
    return;
  }

  if (!isAstNode(node)) {
    return;
  }

  callback(node, parent);

  Object.values(node).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      walkNode(value, callback, node);
    }
  });
}

function isAstNode(node: unknown): node is BaseASTNode {
  return typeof node === 'object' && node !== null && 'type' in node;
}

function isContractDefinition(node: BaseASTNode): node is ContractDefinition {
  return node.type === 'ContractDefinition';
}

function isFunctionDefinition(node: BaseASTNode): node is FunctionDefinition {
  return node.type === 'FunctionDefinition';
}

function detectUncheckedLowLevelCallRegex(line: string): boolean {
  const lowLevelCallPattern = /\.(call|delegatecall|staticcall)\s*(\{[^}]*\})?\s*\(/;

  if (!lowLevelCallPattern.test(line)) {
    return false;
  }

  if (/(?:^|[;(]\s*)(?:bool\s+)?[\w,\s()]*=\s*.*\.(?:call|delegatecall|staticcall)\s*(\{[^}]*\})?\s*\(/.test(line)) {
    return false;
  }

  if (/\b(require|assert|if)\s*\(.*\.(?:call|delegatecall|staticcall)\s*(\{[^}]*\})?\s*\(/.test(line)) {
    return false;
  }

  return true;
}

function getLineExcerpt(code: string, line: number): string | undefined {
  const lineText = code.split('\n')[line - 1];
  const excerpt = lineText?.trim();
  return excerpt ? excerpt.slice(0, 180) : undefined;
}

function getContractName(code: string): string {
  const contractMatch = code.match(/\b(contract|library|interface)\s+([A-Za-z_]\w*)/);
  return contractMatch?.[2] ?? 'Unknown Contract';
}

function getDefinition(id: string): VulnerabilityDefinition {
  const definition = VULNERABILITY_DEFINITION_MAP.get(id);

  if (!definition) {
    throw new Error(`Unknown vulnerability definition: ${id}`);
  }

  return definition;
}

function severityWeight(severity: Severity): number {
  if (severity === 'High') {
    return 3;
  }

  if (severity === 'Medium') {
    return 2;
  }

  return 1;
}

function stripCommentsAndStrings(code: string): string {
  let result = '';
  let index = 0;
  let inBlockComment = false;
  let inLineComment = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  while (index < code.length) {
    const current = code[index];
    const next = code[index + 1];

    if (inLineComment) {
      if (current === '\n') {
        inLineComment = false;
        result += '\n';
      } else {
        result += ' ';
      }
      index += 1;
      continue;
    }

    if (inBlockComment) {
      if (current === '*' && next === '/') {
        inBlockComment = false;
        result += '  ';
        index += 2;
      } else {
        result += current === '\n' ? '\n' : ' ';
        index += 1;
      }
      continue;
    }

    if (inSingleQuote) {
      if (current === '\\' && next) {
        result += '  ';
        index += 2;
        continue;
      }

      result += current === '\n' ? '\n' : ' ';
      if (current === '\'') {
        inSingleQuote = false;
      }
      index += 1;
      continue;
    }

    if (inDoubleQuote) {
      if (current === '\\' && next) {
        result += '  ';
        index += 2;
        continue;
      }

      result += current === '\n' ? '\n' : ' ';
      if (current === '"') {
        inDoubleQuote = false;
      }
      index += 1;
      continue;
    }

    if (current === '/' && next === '/') {
      inLineComment = true;
      result += '  ';
      index += 2;
      continue;
    }

    if (current === '/' && next === '*') {
      inBlockComment = true;
      result += '  ';
      index += 2;
      continue;
    }

    if (current === '\'') {
      inSingleQuote = true;
      result += ' ';
      index += 1;
      continue;
    }

    if (current === '"') {
      inDoubleQuote = true;
      result += ' ';
      index += 1;
      continue;
    }

    result += current;
    index += 1;
  }

  return result;
}

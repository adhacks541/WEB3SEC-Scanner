export interface ExtendedVulnerabilityDefinition {
  id: string;
  name: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  explanation: string;
  whyDangerous: string;
  remediation: string;
  secureAlternative: string;
  secureExample?: string;
}

export const VULNERABILITY_METADATA: Readonly<Record<string, ExtendedVulnerabilityDefinition>> = {
  'reentrancy': {
    id: 'reentrancy',
    name: 'Reentrancy Pattern',
    severity: 'High',
    description: 'A value-transferring external call appears before a later state mutation in the same function, which is a common reentrancy risk pattern.',
    explanation: 'The contract calls an external address, transferring value or yielding execution control, and subsequently updates its internal state. This violates the Checks-Effects-Interactions pattern.',
    whyDangerous: 'An attacker can create a malicious fallback function that calls back into the vulnerable contract before the original execution finishes, potentially draining funds by bypassing balance checks.',
    remediation: 'Apply Checks-Effects-Interactions by moving all state updates before any external calls. Alternatively, use a reentrancy guard (like OpenZeppelin\'s ReentrancyGuard).',
    secureAlternative: 'Update state variables (e.g., balances) before sending Ether.',
    secureExample: `// Secure: Checks-Effects-Interactions
function withdraw(uint amount) public {
    require(balances[msg.sender] >= amount, "Insufficient funds");
    
    // Effect
    balances[msg.sender] -= amount;
    
    // Interaction
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}`
  },
  'tx-origin': {
    id: 'tx-origin',
    name: 'Phishing with tx.origin',
    severity: 'High',
    description: 'Using tx.origin for authorization is insecure because malicious contracts can trick users into forwarding calls.',
    explanation: 'The contract uses `tx.origin` instead of `msg.sender` to check the authorization of a caller. `tx.origin` returns the original EOA (Externally Owned Account) that started the transaction, not the immediate caller.',
    whyDangerous: 'An attacker can trick an authorized user into calling a malicious contract. The malicious contract then calls the vulnerable contract. Since `tx.origin` is the authorized user, the vulnerable contract allows the malicious action.',
    remediation: 'Use `msg.sender` instead of `tx.origin` for all authorization and access control checks.',
    secureAlternative: 'Check `msg.sender == owner` rather than `tx.origin == owner`.',
    secureExample: `// Secure: using msg.sender
function transferOwnership(address newOwner) public {
    require(msg.sender == owner, "Not the owner");
    owner = newOwner;
}`
  },
  'unchecked-low-level': {
    id: 'unchecked-low-level',
    name: 'Unchecked Low-Level Call',
    severity: 'Medium',
    description: 'A low-level call executes without an obvious success check.',
    explanation: 'A low-level call (like `.call`, `.delegatecall`, or `.staticcall`) is executed, but its boolean return value indicating success or failure is not captured or checked.',
    whyDangerous: 'If the call fails (e.g., out of gas, revert in target), the current execution continues without reverting. This can lead to inconsistent state where the caller assumes the call succeeded when it didn\'t.',
    remediation: 'Capture the boolean return value of low-level calls and revert or handle the failure explicitly if it is false.',
    secureAlternative: 'Require the return value to be true.',
    secureExample: `// Secure: Checking return value
function execute() public {
    (bool success, ) = target.call(data);
    require(success, "Low-level call failed");
}`
  },
  'floating-pragma': {
    id: 'floating-pragma',
    name: 'Floating Pragma',
    severity: 'Low',
    description: 'Version ranges can compile under a different compiler than the one originally reviewed.',
    explanation: 'The contract uses a floating pragma (e.g., `pragma solidity ^0.8.0;`), which allows compilation with a range of compiler versions rather than a specific one.',
    whyDangerous: 'Contracts should be deployed with the exact same compiler version and flags that they have been tested with. Locking the pragma prevents accidental deployment using an outdated or newly released compiler version that might introduce bugs or changes in behavior.',
    remediation: 'Pin the Solidity compiler to an exact version.',
    secureAlternative: 'Use a fixed version like `pragma solidity 0.8.24;` instead of `^0.8.24;`.',
    secureExample: `// Secure: Locked pragma
pragma solidity 0.8.24;

contract Example {
    // ...
}`
  },
  'weak-randomness': {
    id: 'weak-randomness',
    name: 'Weak Randomness',
    severity: 'Medium',
    description: 'Block properties are predictable or miner-influenced and should not be used as entropy sources.',
    explanation: 'The contract uses environment variables like `block.timestamp`, `blockhash`, or `block.prevrandao` as a source of randomness.',
    whyDangerous: 'Validators/miners have some influence over block properties (like timestamps) and can potentially manipulate them to their advantage, especially if the value at stake is high.',
    remediation: 'Do not use block properties for randomness. Use a robust oracle solution like Chainlink VRF (Verifiable Random Function) for secure, on-chain randomness.',
    secureAlternative: 'Request randomness from an oracle.',
    secureExample: `// Secure: Chainlink VRF (Conceptual)
function requestRandomWords() external {
    COORDINATOR.requestRandomWords(
        keyHash,
        subscriptionId,
        requestConfirmations,
        callbackGasLimit,
        numWords
    );
}`
  },
  'delegatecall-risk': {
    id: 'delegatecall-risk',
    name: 'Unsafe delegatecall',
    severity: 'High',
    description: 'delegatecall executes code in the caller context and can corrupt storage or break trust boundaries.',
    explanation: 'The contract makes a `delegatecall` to an external, potentially untrusted address.',
    whyDangerous: '`delegatecall` runs the code of the target contract in the context of the calling contract (same storage, same `msg.sender`, same `msg.value`). If the target is malicious or corrupted, it can completely ruin the calling contract\'s storage or drain its funds.',
    remediation: 'Avoid using `delegatecall` unless absolutely necessary (e.g., in well-audited proxy patterns). Never use `delegatecall` with a user-supplied address.',
    secureAlternative: 'Use regular `.call` if context preservation is not needed, or strictly whitelist delegatecall targets.',
    secureExample: `// Secure: Hardcoded proxy implementation
address public immutable implementation;

fallback() external payable {
    address _impl = implementation;
    require(_impl != address(0));

    assembly {
        calldatacopy(0, 0, calldatasize())
        let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)
        returndatacopy(0, 0, returndatasize())
        switch result
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
    }
}`
  },
  'selfdestruct': {
    id: 'selfdestruct',
    name: 'Selfdestruct Usage',
    severity: 'High',
    description: 'selfdestruct can permanently change contract behavior and is dangerous in most production systems.',
    explanation: 'The contract contains a `selfdestruct` (or `suicide`) instruction.',
    whyDangerous: '`selfdestruct` destroys the contract and sends its remaining Ether to a specified address. If unprotected, attackers can destroy the contract. Moreover, `selfdestruct` is deprecated in newer EVM versions (EIP-6780) and its behavior is changing.',
    remediation: 'Remove `selfdestruct`. If a contract must be upgradeable or stoppable, use a pausable pattern or proxy architecture instead.',
    secureAlternative: 'Use a boolean flag to pause contract functionality.',
    secureExample: `// Secure: Pausable pattern
bool public isPaused = false;

modifier whenNotPaused() {
    require(!isPaused, "Contract is paused");
    _;
}

function pause() external onlyOwner {
    isPaused = true;
}`
  }
};

import { ethers, Contract } from 'ethers';

const contractABI: any[] = [
    {"inputs":[{"internalType":"uint256","name":"_initialSecretNumber","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"betAmount","type":"uint256"}],"name":"GameStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"GameWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"guess","type":"uint256"},{"indexed":false,"internalType":"bool","name":"correct","type":"bool"}],"name":"NumberGuessed","type":"event"},{"inputs":[],"name":"betAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"gameActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_guess","type":"uint256"}],"name":"guess","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newSecretNumber","type":"uint256"}],"name":"restartGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"secretNumber","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_secretNumber","type":"uint256"}],"name":"startGame","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}
  // Add your contract ABI here
  // You can find this in the "Contract ABI" section of your verified contract on Etherscan
];

const contractAddress: string = "0xD1aa4E1B88087896B9E33DEEf73980a6f017C864";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const getContract = async (needSigner = false): Promise<Contract | null> => {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, needSigner ? signer : provider);
    return contract;
  }
  return null;
};

export const startGame = async (secretNumber: number, betAmount: string) => {
    if (!secretNumber || !betAmount) {
        throw new Error("Secret number and bet amount are required");
    }
    try {
        console.log("Getting contract...");
        const contract = await getContract(true);
        if (!contract) {
            console.log("Contract not found");
            return;
        }
        console.log("Contract obtained, starting game...");
      
        // Convert betAmount to wei
        const betAmountWei = ethers.utils.parseEther(betAmount);
        console.log(`Bet amount in wei: ${betAmountWei.toString()}`);
  
        // Estimate gas
        const estimatedGas = await contract.estimateGas.startGame(secretNumber, { value: betAmountWei });
        console.log(`Estimated gas: ${estimatedGas.toString()}`);
  
        // Send transaction
        console.log("Sending transaction...");
        const tx = await contract.startGame(secretNumber, { 
            value: betAmountWei,
            gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer to estimated gas
        });
      
        console.log("Transaction sent:", tx.hash);
        console.log("Waiting for confirmation...");
      
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
      
        return receipt;
    } catch (error) {
        console.error("Error in startGame:", error);
        throw error;
    }
};

export const makeGuess = async (guess: number, betAmount: string): Promise<boolean> => {
  const contract = await getContract(true);
  if (contract) {
    const tx = await contract.guess(guess, { value: ethers.utils.parseEther(betAmount) });
    const receipt = await tx.wait();
    const event = receipt.events.find((e: { event: string }) => e.event === 'NumberGuessed');
    return event.args.correct;
  }
  return false;
};

export const getBetAmount = async (): Promise<string> => {
  const contract = await getContract();
  if (contract) {
    const betAmount = await contract.betAmount();
    return ethers.utils.formatEther(betAmount);
  }
  return '0';
};

export const isGameActive = async (): Promise<boolean> => {
  const contract = await getContract();
  if (contract) {
    return await contract.gameActive();
  }
  return false;
};
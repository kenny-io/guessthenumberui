'use client'
import React, { useState, useEffect } from 'react';
import { startGame, makeGuess, getBetAmount, isGameActive } from './utils/contract';

export default function Home() {
  const [secretNumber, setSecretNumber] = useState('');
  const [guess, setGuess] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const active = await isGameActive();
        setGameActive(active);
        if (active) {
          const bet = await getBetAmount();
          setBetAmount(bet);
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
        setMessage("Error fetching game state. Please make sure you're connected to the correct network.");
      }
    };
    fetchGameState();
  }, []);

  const handleStartGame = async () => {
    try {
      setMessage("Initiating transaction...");
      console.log("Starting game with:", { secretNumber, betAmount });
      const receipt = await startGame(Number(secretNumber), betAmount);
      setTransactionHash(receipt.transactionHash);
      setMessage(`Game started successfully! Transaction hash: ${receipt.transactionHash}`);
      setGameActive(true);
    } catch (error : any) {
      console.error("Error starting game:", error);
      setMessage('Error starting game: ' + (error.message || "Unknown error"));
    }
  };

  const handleMakeGuess = async () => {
    try {
      setMessage("Submitting guess...");
      console.log("Making guess:", guess);
      const correct = await makeGuess(Number(guess), betAmount);
      setMessage(correct ? 'Congratulations! You guessed correctly!' : 'Sorry, wrong guess. Try again!');
      if (correct) setGameActive(false);
    } catch (error: any) {
      console.error("Error making guess:", error);
      setMessage('Error making guess: ' + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-gray-900">Guess the Number Game</h2>
                {!gameActive ? (
                  <div className="space-y-4">
                    <input
                      type="number"
                      placeholder="Secret Number"
                      value={secretNumber}
                      onChange={(e) => setSecretNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Bet Amount (ETH)"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleStartGame}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start Game
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>Current bet amount: {betAmount} ETH</p>
                    <input
                      type="number"
                      placeholder="Your Guess"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleMakeGuess}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Make Guess
                    </button>
                  </div>
                )}
                {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
                {transactionHash && (
                  <p className="mt-2 text-xs text-blue-500">
                    Transaction Hash: {transactionHash}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
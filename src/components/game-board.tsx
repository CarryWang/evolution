"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createCloseAccountInstruction } from '@solana/spl-token';
import { Transaction, PublicKey } from '@solana/web3.js';
import FoodItem from "./food-item";
import { generateTokenFoods, generateRandomFoods } from "@/lib/game-utils";
import { fetchTokenAccounts, TokenAccount } from "@/lib/token-utils";
import type { Food, TokenFood } from "@/lib/types";
import { NeonGradientCard } from "./magicui/neon-gradient-card";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';
import { cn } from "@/lib/utils";

export default function GameBoard() {
  const [foods, setFoods] = useState<(Food | TokenFood)[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{message: string, type: 'success' | 'error' | 'loading' | 'info'} | null>(null);
  const { connected, publicKey, disconnect, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);
  const { setVisible } = useWalletModal();
  const [isEating, setIsEating] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<'token' | 'random' | null>(null);

  // 格式化钱包地址显示
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // 处理钱包断开连接
  const handleDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  // 确认断开连接
  const confirmDisconnect = () => {
    if (isGameStarted) {
      setIsGameStarted(false);
    }
    
    // 清除游戏状态
    setFoods([]);
    setTokenAccounts([]);
    
    // 强制忘记连接（关键的钱包方法）
    try {
      // 钱包扩展特定方法 - Phantom
      if (window.phantom?.solana) {
        // 使用类型断言绕过 TypeScript 类型检查
        const phantomWallet = window.phantom.solana as any;
        // 尝试使用 forgetConnect 方法，这是强制忘记连接的关键
        if (typeof phantomWallet.forgetConnect === 'function') {
          phantomWallet.forgetConnect();
          console.log('调用了 Phantom forgetConnect()');
        }
        // 标准断开方法
        window.phantom.solana.disconnect();
      }
      
      // 通用 Web3 接口
      if (window.solana) {
        // 同样使用类型断言
        const solanaWallet = window.solana as any;
        if (typeof solanaWallet.forgetConnect === 'function') {
          solanaWallet.forgetConnect();
          console.log('调用了通用 forgetConnect()');
        }
        window.solana.disconnect();
      }
      
      // 清除任何本地存储的会话
      if (window.localStorage) {
        // 更全面的清除方式
        const keysToCheck = ['walletName', 'wallet', 'solana', 'phantom', 'connect', 'session', 'publicKey', 'autoconnect', 'authorization'];
        const keysToRemove = [];
        
        // 查找所有可能与钱包相关的项
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const lowerKey = key.toLowerCase();
            if (keysToCheck.some(check => lowerKey.includes(check))) {
              keysToRemove.push(key);
            }
          }
        }
        
        // 删除找到的所有项
        keysToRemove.forEach(key => {
          console.log('清除localStorage项:', key);
          localStorage.removeItem(key);
        });
        
        // 直接清除已知的特定项
        localStorage.removeItem('walletName');
        localStorage.removeItem('phantom.walletName');
        localStorage.removeItem('solana.walletName');
      }
      
      // 会话存储也需要清除
      if (window.sessionStorage) {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.toLowerCase().includes('wallet')) {
            sessionStorage.removeItem(key);
          }
        }
      }
      
      // 最后调用标准断开方法
      disconnect();
      
      console.log('已完全断开钱包连接');
    } catch (e) {
      console.error('清除钱包状态时出错:', e);
    }
    
    setShowDisconnectConfirm(false);
  };

  // 取消断开连接
  const cancelDisconnect = () => {
    setShowDisconnectConfirm(false);
  };

  // 获取用户钱包中的代币
  const fetchUserTokens = async () => {
    if (!publicKey || !connection) return false;
    
    setIsLoading(true);
    try {
      console.log('开始获取代币账户...');
      const accounts = await fetchTokenAccounts(connection, publicKey);
      console.log('获取到代币账户:', accounts.length, '个');
      setTokenAccounts(accounts);
      return true;
    } catch (error) {
      console.error('获取用户代币失败:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 开始游戏，使用代币作为食物
  const startTokenGame = async () => {
    if (!connected) return; // 确保钱包已连接
    
    setGameMode('token'); // 设置游戏模式为代币模式
    setIsLoading(true);
    
    try {
      // 获取用户代币
      await fetchUserTokens();
      
      // 使用所有代币生成食物，不限制数量
      if (tokenAccounts.length > 0) {
        // 传递 tokenAccounts.length 作为参数，确保使用所有代币
        const gameFoods = generateTokenFoods(tokenAccounts, tokenAccounts.length);
        setFoods(gameFoods);
        setIsGameStarted(true);
      } else {
        // 如果用户没有代币，显示提示信息
        setTransactionStatus({
          message: 'No tokens in your wallet. Please add tokens or choose random mode.',
          type: 'info'
        });
        
        // 5秒后清除提示
        setTimeout(() => {
          setTransactionStatus(null);
        }, 5000);
        
        // 创建一个空的食物数组
        setFoods([]);
        setIsGameStarted(true);
      }
    } catch (error) {
      console.error('启动游戏失败:', error);
      setTransactionStatus({
        message: 'Failed to get token information',
        type: 'error'
      });
      
      // 3秒后清除错误提示
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 开始游戏，使用随机食物
  const startRandomGame = () => {
    setGameMode('random'); // 设置游戏模式为随机模式
    setIsLoading(true);
    
    try {
      // 生成10个随机食物
      const randomFoods = generateRandomFoods(10);
      setFoods(randomFoods);
      setIsGameStarted(true);
    } catch (error) {
      console.error('生成随机食物失败:', error);
      setTransactionStatus({
        message: '生成随机食物失败',
        type: 'error'
      });
      
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 当钱包连接状态变化时及时刷新代币信息
  useEffect(() => {
    // 每次连接状态变化时记录日志
    console.log('钱包连接状态变化:', connected);
    
    if (connected) {
      // 钱包已连接，立即查询代币信息
      console.log('钱包已连接，正在获取代币...');
      fetchUserTokens().then((success) => {
        if (success) {
          console.log(`成功获取到 ${tokenAccounts.length} 个代币账户`);
          // 如果之前已经开始游戏，使用新的代币信息更新游戏
          if (isGameStarted && gameMode === 'token') {
            if (tokenAccounts.length > 0) {
              const gameFoods = generateTokenFoods(tokenAccounts, tokenAccounts.length);
              setFoods(gameFoods);
            } else {
              setFoods([]);
              setTransactionStatus({
                message: 'No tokens in your wallet. Please add some tokens.',
                type: 'info'
              });
              setTimeout(() => {
                setTransactionStatus(null);
              }, 5000);
            }
          }
        }
      });
      
      // 隐藏重连提示界面
      setShowReconnectPrompt(false);
    } else {
      // 断开连接时重置状态
      setIsGameStarted(false);
      setGameMode(null);
      setFoods([]);
      setTokenAccounts([]);
    }
  }, [connected, isGameStarted, gameMode]); // 依赖 connected, isGameStarted 和 gameMode

  // 关闭代币账户
  const closeTokenAccount = async (tokenAddress: string) => {
    if (!publicKey || !connection || !sendTransaction) {
      setTransactionStatus({
        message: 'Wallet not connected',
        type: 'error'
      });
      return false;
    }

    setTransactionStatus({
      message: 'Closing token account...',
      type: 'loading'
    });
    
    try {
      // 解析代币账户地址
      const tokenAccountPubkey = new PublicKey(tokenAddress);
      
      // 创建关闭账户指令
      const closeInstruction = createCloseAccountInstruction(
        tokenAccountPubkey,
        publicKey, // 代币接收人
        publicKey, // 授权者
      );
      
      // 创建交易
      const transaction = new Transaction().add(closeInstruction);
      
      // 设置最近的区块哈希
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // 发送交易
      const signature = await sendTransaction(transaction, connection);
      
      // 等待交易确认
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('交易确认失败');
      }
      
      console.log('代币账户关闭成功:', signature);
      setTransactionStatus({
        message: 'Token account closed!',
        type: 'success'
      });
      
      // 成功关闭代币账户后刷新代币列表
      await fetchUserTokens();
      
      // 3秒后清除状态
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('关闭代币账户失败:', error);
      
      // 根据错误类型显示不同的消息
      let errorMessage = 'Failed to close token account';
      
      if (error instanceof Error) {
        if (error.message.includes('insufficient')) {
          errorMessage = 'Insufficient balance for transaction fee';
        } else if (error.message.includes('not empty')) {
          errorMessage = 'Token account has balance, cannot close';
        } else if (error.message.includes('rejected')) {
          errorMessage = 'Transaction rejected by user';
        }
      }
      
      setTransactionStatus({
        message: errorMessage,
        type: 'error'
      });
      
      // 3秒后清除状态
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
      
      return false;
    }
  };

  // 处理食物点击 - 将类型从 string 改为 number
  const handleFoodClick = useCallback(async (foodId: number) => {
    // 找到被点击的食物
    const clickedFood = foods.find(food => food.id === foodId);
    if (!clickedFood) return;
    
    // 设置吃东西状态，隐藏蟑螂（因为它正在移动到食物位置）
    setIsEating(true);
    
    // 将食物设为被吃状态
    setFoods(prev => 
      prev.map(food => 
        food.id === foodId 
          ? { ...food, isBeingEaten: true } 
          : food
      )
    );
    
    // 如果是代币食物，关闭代币账户
    if ('mint' in clickedFood && gameMode === 'token') {
      const success = await closeTokenAccount(clickedFood.address);
      
      if (success) {
        // 关闭成功后，根据最新的tokenAccounts重新生成食物
        if (tokenAccounts.length > 0) {
          const updatedFoods = generateTokenFoods(tokenAccounts, tokenAccounts.length);
          setTimeout(() => {
            setFoods(updatedFoods);
            setIsEating(false); // 显示蟑螂
          }, 1500);
        } else {
          // 如果没有代币了，显示空列表
          setTimeout(() => {
            setFoods([]);
            setIsEating(false); // 显示蟑螂
          }, 1500);
        }
      } else {
        // 如果关闭失败，重置状态
        setFoods(prev => 
          prev.map(food => 
            food.id === foodId 
              ? { ...food, isBeingEaten: false } 
              : food
          )
        );
        setIsEating(false); // 显示蟑螂
      }
    } else {
      // 如果不是代币食物或处于随机模式，只是吃掉它
      setTimeout(() => {
        setFoods(prevFoods => {
          const remainingFoods = prevFoods.filter(foodItem => foodItem.id !== foodId);
          
          // 如果是随机模式且所有食物都被吃光了，重新生成食物
          if (gameMode === 'random' && remainingFoods.length === 0) {
            const newRandomFoods = generateRandomFoods(10);
            return newRandomFoods;
          }
          
          return remainingFoods;
        });
        setIsEating(false); // 显示蟑螂
      }, 1500);
    }
  }, [foods, tokenAccounts, gameMode]);

  return (
    <NeonGradientCard className="max-w-6xl" borderSize={10}>
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
        {/* 餐桌背景 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-[url(/bg.jpg)]"
        >
          {/* 加载中状态 */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
              <div className="text-white text-xl font-mono">LOADING...</div>
            </div>
          )}
          
          {/* 交易状态显示 */}
          {transactionStatus && (
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full z-40 
              ${transactionStatus.type === 'success' ? 'bg-green-600' :
                transactionStatus.type === 'error' ? 'bg-red-600' : 
                transactionStatus.type === 'loading' ? 'bg-blue-600' : 'bg-gray-600'} 
              text-white font-mono`}>
              {transactionStatus.message}
            </div>
          )}
          
          {/* 钱包地址显示（右上角） */}
          {connected && publicKey && (
            <button
              onClick={handleDisconnect}
              className="absolute top-4 right-4 z-10 bg-black/70 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-black/90 transition-colors font-mono"
              title="Click to disconnect"
            >
              {formatAddress(publicKey.toBase58())}
            </button>
          )}

          {/* 断开连接确认对话框 */}
          {showDisconnectConfirm && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="bg-black border-2 border-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                <h3 className="text-xl font-bold mb-4 text-white font-mono tracking-wide">DISCONNECT WALLET?</h3>
                <p className="mb-6 text-gray-300 font-mono">Are you sure you want to disconnect your wallet? The game will pause.</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={confirmDisconnect}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-mono border-2 border-white tracking-wider"
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={cancelDisconnect}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors font-mono border-2 border-white tracking-wider"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 重新连接钱包提示 */}
          {showReconnectPrompt && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="bg-black border-2 border-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="flex flex-col items-center gap-4">
                  <WalletMultiButton />
                  {connected && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={startTokenGame}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-mono border-2 border-white uppercase tracking-widest"
                      >
                        PLAY WITH TOKENS
                      </button>
                      <button
                        onClick={startRandomGame}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-mono border-2 border-white uppercase tracking-widest"
                      >
                        PLAY WITH FOOD
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 游戏开始前的界面 */}
          {!isGameStarted && !showReconnectPrompt && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-4">
                <WalletMultiButton />
                {connected && (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={startTokenGame}
                      className="px-6 py-3 text-lg font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors font-mono border-2 border-white uppercase tracking-widest"
                    >
                      PLAY WITH TOKENS
                    </button>
                    <button
                      onClick={startRandomGame}
                      className="px-6 py-3 text-lg font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors font-mono border-2 border-white uppercase tracking-widest"
                    >
                      PLAY WITH FOOD
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 食物项目 */}
          {foods.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onClick={() => handleFoodClick(food.id)}
            />
          ))}

          {/* 回到模式选择按钮 */}
          {isGameStarted && (
            <button
              onClick={() => {
                setIsGameStarted(false);
                setGameMode(null);
                setFoods([]);
              }}
              className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors font-mono border-2 border-white uppercase tracking-widest"
            >
              SWITCH MODE
            </button>
          )}

          <Image
            src="/zl.png"
            alt="Cockroach"
            width={100}
            height={100}
            className={cn(
              "absolute top-24 right-4 animate-bounce",
              isGameStarted ? "block" : "hidden",
              isEating && "hidden"
            )}
          />
        </div>
      </div>
    </NeonGradientCard>
  );
}

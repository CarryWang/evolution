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
  const startGame = async () => {
    if (!connected) return; // 确保钱包已连接
    
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
          message: '您的钱包中没有代币，请先添加一些代币',
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
        message: '获取代币信息失败',
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
          if (isGameStarted) {
            if (tokenAccounts.length > 0) {
              const gameFoods = generateTokenFoods(tokenAccounts, tokenAccounts.length);
              setFoods(gameFoods);
            } else {
              setFoods([]);
              setTransactionStatus({
                message: '您的钱包中没有代币，请先添加一些代币',
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
      setFoods([]);
      setTokenAccounts([]);
    }
  }, [connected, isGameStarted]); // 依赖 connected 和 isGameStarted

  // 关闭代币账户
  const closeTokenAccount = async (tokenAddress: string) => {
    if (!publicKey || !connection || !sendTransaction) {
      setTransactionStatus({
        message: '钱包未连接',
        type: 'error'
      });
      return false;
    }

    setTransactionStatus({
      message: '正在关闭代币账户...',
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
        message: '代币账户已关闭!',
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
      let errorMessage = '关闭代币账户失败';
      
      if (error instanceof Error) {
        if (error.message.includes('insufficient')) {
          errorMessage = '余额不足以支付交易费用';
        } else if (error.message.includes('not empty')) {
          errorMessage = '代币账户还有余额，无法关闭';
        } else if (error.message.includes('rejected')) {
          errorMessage = '用户拒绝了交易';
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
    
    // 将食物设为被吃状态
    setFoods(prev => 
      prev.map(food => 
        food.id === foodId 
          ? { ...food, isBeingEaten: true } 
          : food
      )
    );
    
    // 如果是代币食物，关闭代币账户
    if ('mint' in clickedFood) {
      const success = await closeTokenAccount(clickedFood.address);
      
      if (success) {
        // 关闭成功后，根据最新的tokenAccounts重新生成食物
        // 注意这里不需要额外调用fetchUserTokens，因为closeTokenAccount内部已经调用了
        if (tokenAccounts.length > 0) {
          const updatedFoods = generateTokenFoods(tokenAccounts, tokenAccounts.length);
          setTimeout(() => {
            setFoods(updatedFoods);
          }, 1500);
        } else {
          // 如果没有代币了，显示空列表
          setTimeout(() => {
            setFoods([]);
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
      }
    } else {
      // 如果不是代币食物，只是吃掉它
      setTimeout(() => {
        setFoods(prev => prev.filter(food => food.id !== foodId));
      }, 1500);
    }
  }, [foods, tokenAccounts]);

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
              <div className="text-white text-xl">加载中...</div>
            </div>
          )}
          
          {/* 交易状态显示 */}
          {transactionStatus && (
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full z-40 
              ${transactionStatus.type === 'success' ? 'bg-green-600' :
                transactionStatus.type === 'error' ? 'bg-red-600' : 
                transactionStatus.type === 'loading' ? 'bg-blue-600' : 'bg-gray-600'} 
              text-white`}>
              {transactionStatus.message}
            </div>
          )}
          
          {/* 钱包地址显示（右上角） */}
          {connected && publicKey && (
            <button
              onClick={handleDisconnect}
              className="absolute top-4 right-4 z-10 bg-black/70 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-black/90 transition-colors"
              title="点击断开连接"
            >
              {formatAddress(publicKey.toBase58())}
            </button>
          )}

          {/* 断开连接确认对话框 */}
          {showDisconnectConfirm && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                <h3 className="text-xl font-bold mb-4">断开钱包连接？</h3>
                <p className="mb-6 text-gray-700">您确定要断开钱包连接吗？断开后游戏将会暂停。</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={confirmDisconnect}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    确认断开
                  </button>
                  <button
                    onClick={cancelDisconnect}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 重新连接钱包提示 */}
          {showReconnectPrompt && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="flex flex-col items-center gap-4">
                  <WalletMultiButton />
                  {connected && (
                    <button
                      onClick={startGame}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      开始游戏
                    </button>
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
                  <button
                    onClick={startGame}
                    className="px-6 py-3 text-lg font-bold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  >
                    开始游戏
                  </button>
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

          {/* 游戏说明 */}
          {isGameStarted && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              点击你的代币让蟑螂吃掉它们！每吃掉一个代币将关闭其代币账户。
            </div>
          )}
        </div>
      </div>
    </NeonGradientCard>
  );
}

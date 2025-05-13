import type { Food, TokenFood } from "./types";
import { TokenAccount } from "./token-utils";

// 从代币生成食物项目
export function generateTokenFoods(tokenAccounts: TokenAccount[], count: number): TokenFood[] {
  // 过滤掉余额为0的代币
  const validTokens = tokenAccounts.filter(token => token.uiAmount > 0);
  
  // 如果没有有效代币，返回空数组
  if (validTokens.length === 0) return [];
  
  // 限制数量
  const tokensToUse = validTokens.slice(0, count);
  
  return tokensToUse.map((token, index) => {
    // 随机位置 (避免太靠近边缘)
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    
    // 随机大小 (50-80)
    const size = 50 + Math.floor(Math.random() * 30);
    
    // 随机旋转角度
    const rotation = Math.random() * 360;
    
    return {
      id: index,
      name: token.tokenInfo?.name || `未知代币 (${token.mint.slice(0, 4)}...${token.mint.slice(-4)})`,
      image: token.tokenInfo?.image || '',
      mint: token.mint,
      address: token.address,
      tokenName: token.tokenInfo?.name || '未知代币',
      tokenImage: token.tokenInfo?.image || '',
      x,
      y,
      size,
      rotation,
      isBeingEaten: false
    };
  });
}

// 保留原有的生成随机食物函数以便在没有代币时使用
export function generateRandomFoods(count: number): Food[] {
  const foodTypes = [
    { name: "汉堡", image: "/burger.png", minSize: 60, maxSize: 80 },
    { name: "披萨", image: "/pizza.png", minSize: 70, maxSize: 90 },
    { name: "薯条", image: "/fries.png", minSize: 50, maxSize: 70 },
    { name: "寿司", image: "/sushi.png", minSize: 40, maxSize: 60 },
    { name: "蛋糕", image: "/cake.png", minSize: 60, maxSize: 80 },
    { name: "冰淇淋", image: "/ice-cream.png", minSize: 50, maxSize: 70 },
  ];

  const foods: Food[] = [];

  for (let i = 0; i < count; i++) {
    // 随机选择食物类型
    const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];

    // 随机位置 (避免太靠近边缘)
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;

    // 随机大小
    const size = Math.floor(
      foodType.minSize + Math.random() * (foodType.maxSize - foodType.minSize)
    );

    // 随机旋转角度
    const rotation = Math.random() * 360;

    foods.push({
      id: i,
      name: foodType.name,
      image: foodType.image,
      x,
      y,
      size,
      rotation,
      isBeingEaten: false,
    });
  }

  return foods;
}

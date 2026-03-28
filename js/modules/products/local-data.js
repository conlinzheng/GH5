// 本地产品数据，作为 GitHub API 访问失败的备选
export const localProductsData = [
  {
    id: '中文 (1).png',
    seriesId: '1-PU系列',
    name: 'PU系列产品1',
    description: '这是一款高品质的PU系列产品，具有良好的耐磨性和舒适度。',
    price: '¥199',
    materials: {
      upper: 'PU超纤',
      lining: '网布',
      sole: '橡胶'
    },
    upperMaterial: 'PU超纤',
    innerMaterial: '网布',
    soleMaterial: '橡胶',
    image: '中文 (1).png',
    tags: ['PU', '舒适', '耐磨']
  },
  {
    id: '产品1 (1).jpg',
    seriesId: '1-PU系列',
    name: 'PU系列产品2',
    description: '这款PU系列产品设计时尚，适合日常穿着。',
    price: '¥299',
    materials: {
      upper: 'PU超纤',
      lining: '皮革',
      sole: 'EVA'
    },
    upperMaterial: 'PU超纤',
    innerMaterial: '皮革',
    soleMaterial: 'EVA',
    image: '产品1 (1).jpg',
    tags: ['PU', '时尚', '轻便']
  },
  {
    id: '中文数字123 (1).png',
    seriesId: '2-真皮系列',
    name: '真皮系列产品1',
    description: '采用优质真皮制作，手感柔软，透气性好。',
    price: '¥399',
    materials: {
      upper: '头层牛皮',
      lining: '羊皮',
      sole: '橡胶'
    },
    upperMaterial: '头层牛皮',
    innerMaterial: '羊皮',
    soleMaterial: '橡胶',
    image: '中文数字123 (1).png',
    tags: ['真皮', '高端', '舒适']
  },
  {
    id: '勃肯1 (1).jpg',
    seriesId: '2-真皮系列',
    name: '真皮系列产品2',
    description: '经典真皮款式，适合正式场合穿着。',
    price: '¥499',
    materials: {
      upper: '头层牛皮',
      lining: '真皮',
      sole: '真皮'
    },
    upperMaterial: '头层牛皮',
    innerMaterial: '真皮',
    soleMaterial: '真皮',
    image: '勃肯1 (1).jpg',
    tags: ['真皮', '经典', '正式']
  },
  {
    id: '中文+ (1).png',
    seriesId: '3-短靴系列',
    name: '短靴系列产品1',
    description: '时尚短靴，保暖舒适，适合秋冬季节。',
    price: '¥599',
    materials: {
      upper: 'PU超纤',
      lining: '毛绒',
      sole: '橡胶'
    },
    upperMaterial: 'PU超纤',
    innerMaterial: '毛绒',
    soleMaterial: '橡胶',
    image: '中文+ (1).png',
    tags: ['短靴', '保暖', '时尚']
  },
  {
    id: '00A (1).jpg',
    seriesId: '3-短靴系列',
    name: '短靴系列产品2',
    description: '高品质短靴，防水防滑，适合户外穿着。',
    price: '¥699',
    materials: {
      upper: '真皮',
      lining: '保暖棉',
      sole: '防滑橡胶'
    },
    upperMaterial: '真皮',
    innerMaterial: '保暖棉',
    soleMaterial: '防滑橡胶',
    image: '00A (1).jpg',
    tags: ['短靴', '防水', '户外']
  }
];

export default localProductsData;
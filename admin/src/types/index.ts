// 产品类型定义
export interface Product {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  price: string;
  materials: {
    upper?: string;
    lining?: string;
    sole?: string;
  };
  upperMaterial: string;
  innerMaterial: string;
  soleMaterial: string;
  image: string;
  isMainImage: boolean;
  tags?: string[];
  customizable?: boolean;
  minOrder?: string;
}

// 系列类型定义
export interface Series {
  name: string;
  path: string;
  type: string;
}

// 系列名称映射类型
export interface SeriesNameMap {
  [key: string]: string;
}

// 产品顺序类型
export interface ProductOrders {
  [seriesId: string]: string[];
}

// 系列顺序类型
export type SeriesOrder = string[];

// 状态消息类型
export type StatusType = 'info' | 'success' | 'error' | 'warning';

// 状态消息接口
export interface StatusMessage {
  message: string;
  type: StatusType;
}

// 产品文件接口
export interface ProductFile {
  products: {
    [imageName: string]: {
      name: string;
      description: string;
      price: string;
      materials: {
        upper?: string;
        lining?: string;
        sole?: string;
      };
    };
  };
  order?: string[];
  displayName?: {
    zh: string;
  };
}

// 扫描结果接口
export interface ScanResult {
  products: Product[];
  series: Series[];
  seriesNameMap: SeriesNameMap;
  seriesOrder: SeriesOrder;
  productOrders: ProductOrders;
}

// 新增产品结果接口
export interface NewProductsResult {
  count: number;
  series: string[];
}

// JSON生成结果接口
export interface JsonGenerationResult {
  count: number;
  series: string[];
}
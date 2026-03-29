// 配置文件管理模块

// 页面文字配置
const texts = {
  zh: {
    title: 'GH5 - 产品展示',
    description: 'GH5 产品展示网站',
    keywords: '产品展示,产品对比,多语言',
    search: '搜索产品名称、标签...',
    loading: '加载中...',
    refresh: '刷新数据',
    history: '浏览历史',
    language: '切换语言',
    contact: '联系我们',
    noProducts: '暂无产品',
    productDetail: '产品详情',
    series: '系列',
    name: '名称',
    description: '描述',
    price: '价格',
    materials: '材质',
    upper: '鞋面',
    inner: '内里',
    sole: '鞋底',
    customizable: '可定制',
    minOrder: '最小起订量'
  },
  en: {
    title: 'GH5 - Product Display',
    description: 'GH5 Product Display Website',
    keywords: 'product display, product comparison, multi-language',
    search: 'Search product name, tags...',
    loading: 'Loading...',
    refresh: 'Refresh Data',
    history: 'Browse History',
    language: 'Switch Language',
    contact: 'Contact Us',
    noProducts: 'No products',
    productDetail: 'Product Detail',
    series: 'Series',
    name: 'Name',
    description: 'Description',
    price: 'Price',
    materials: 'Materials',
    upper: 'Upper',
    inner: 'Inner',
    sole: 'Sole',
    customizable: 'Customizable',
    minOrder: 'Minimum Order'
  },
  ko: {
    title: 'GH5 - 제품展示',
    description: 'GH5 제품展示 웹사이트',
    keywords: '제품展示, 제품 비교, 다국어',
    search: '제품 이름, 태그 검색...',
    loading: '로딩 중...',
    refresh: '데이터 새로고침',
    history: '검색 기록',
    language: '언어 전환',
    contact: '연락처',
    noProducts: '제품이 없습니다',
    productDetail: '제품 상세',
    series: '시리즈',
    name: '이름',
    description: '설명',
    price: '가격',
    materials: '재료',
    upper: '상단',
    inner: '내부',
    sole: '밑창',
    customizable: '맞춤 가능',
    minOrder: '최소 주문량'
  }
}

// 轮播图配置
const carousel = {
  slides: [
    {
      title: {
        zh: '欢迎来到 GH5',
        en: 'Welcome to GH5',
        ko: 'GH5에 오신 것을 환영합니다'
      },
      description: {
        zh: '探索我们的优质产品',
        en: 'Explore our high-quality products',
        ko: '고품질 제품을 탐색하세요'
      }
    },
    {
      title: {
        zh: '品质保证',
        en: 'Quality Assurance',
        ko: '품질 보증'
      },
      description: {
        zh: '我们致力于提供最优质的产品',
        en: 'We are committed to providing the highest quality products',
        ko: '우리는 최고 품질의 제품을 제공하기 위해 노력합니다'
      }
    },
    {
      title: {
        zh: '专业服务',
        en: 'Professional Service',
        ko: '전문 서비스'
      },
      description: {
        zh: '为您提供专业的产品咨询和服务',
        en: 'Provide you with professional product consultation and services',
        ko: '전문적인 제품 상담 및 서비스를 제공합니다'
      }
    }
  ]
}

// 导出配置
export default {
  texts,
  carousel
}

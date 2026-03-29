// 产品数据加载工具

// 模拟从产品图文件夹中加载产品数据
const loadProductsFromFileSystem = async () => {
  try {
    // 模拟从文件系统读取产品数据
    // 实际项目中，这里应该使用 fetch 或其他方式读取本地文件
    
    // 产品系列列表
    const seriesList = [
      '1-PU系列',
      '2-真皮系列',
      '3-短靴系列',
      '4-乐福系列',
      '5-春季',
      '6-夏季',
      '7-秋季'
    ]
    
    // 模拟产品数据
    const products = []
    let id = 1
    
    // 遍历系列列表，生成产品数据
    for (const series of seriesList) {
      // 模拟从每个系列的 products.json 文件中读取数据
      // 实际项目中，这里应该使用 fetch 读取 /产品图/{series}/products.json
      
      // 模拟产品数据
      if (series === '1-PU系列') {
        // PU系列产品
        products.push({
          id: id++,
          name: '产品1',
          series: 'PU系列',
          description: '产品1 - 高品质产品',
          images: [
            `/产品图/${series}/产品1 (1).jpg`,
            `/产品图/${series}/产品1 (2).jpg`
          ],
          specs: {
            upper: '皮',
            inner: '皮',
            sole: '发泡',
            customizable: 'true',
            minOrder: '111',
            price: '¥222/双'
          }
        })
        
        products.push({
          id: id++,
          name: '中文',
          series: 'PU系列',
          description: '中文 - 高品质产品',
          images: [
            `/产品图/${series}/中文 (1).png`,
            `/产品图/${series}/中文 (2).png`,
            `/产品图/${series}/中文 (3).png`,
            `/产品图/${series}/中文 (4).png`,
            `/产品图/${series}/中文 (5).png`
          ],
          specs: {
            upper: '',
            inner: '',
            sole: '',
            customizable: 'false',
            minOrder: '1',
            price: ''
          }
        })
      } else if (series === '2-真皮系列') {
        // 真皮系列产品
        products.push({
          id: id++,
          name: '勃肯1',
          series: '真皮系列',
          description: '勃肯1 - 高品质产品',
          images: [
            `/产品图/${series}/勃肯1 (1).jpg`
          ],
          specs: {
            upper: '',
            inner: '',
            sole: '',
            customizable: 'false',
            minOrder: '1',
            price: ''
          }
        })
      } else if (series === '3-短靴系列') {
        // 短靴系列产品
        products.push({
          id: id++,
          name: '00A',
          series: '短靴系列',
          description: '00A - 高品质产品',
          images: [
            `/产品图/${series}/00A (1).jpg`
          ],
          specs: {
            upper: '',
            inner: '',
            sole: '',
            customizable: 'false',
            minOrder: '1',
            price: ''
          }
        })
      } else if (series === '4-乐福系列') {
        // 乐福系列产品
        products.push({
          id: id++,
          name: 'B5',
          series: '乐福系列',
          description: 'B5 - 高品质产品',
          images: [
            `/产品图/${series}/B5 (1).jpg`
          ],
          specs: {
            upper: '',
            inner: '',
            sole: '',
            customizable: 'false',
            minOrder: '1',
            price: ''
          }
        })
      } else if (series === '5-春季') {
        // 春季系列产品
        products.push({
          id: id++,
          name: '新款1',
          series: '春季系列',
          description: '新款1 - 高品质产品',
          images: [
            `/产品图/${series}/新款1 (1).jpg`,
            `/产品图/${series}/新款1 (2).jpg`
          ],
          specs: {
            upper: '',
            inner: '',
            sole: '',
            customizable: 'false',
            minOrder: '1',
            price: ''
          }
        })
      } else if (series === '6-夏季') {
        // 夏季系列产品
        products.push({
          id: id++,
          name: '41',
          series: '夏季系列',
          description: '41 - 高品质产品',
          images: [
            `/产品图/${series}/41.png`,
            `/产品图/${series}/42.png`,
            `/产品图/${series}/43.png`,
            `/产品图/${series}/44.png`,
            `/产品图/${series}/45.png`
          ],
          specs: {
            upper: '',
            inner: '',
            sole: '',
            customizable: 'false',
            minOrder: '1',
            price: ''
          }
        })
      } else if (series === '7-秋季') {
        // 秋季系列产品
        products.push({
          id: id++,
          name: '@@@',
          series: '秋季系列',
          description: '@@@ - 高品质产品',
          images: [
            `/产品图/${series}/@@@ (1).png`,
            `/产品图/${series}/@@@ (2).png`,
            `/产品图/${series}/@@@ (3).png`,
            `/产品图/${series}/@@@ (4).png`,
            `/产品图/${series}/@@@ (5).png`
          ],
          specs: {
            upper: '',
            inner: '',
            sole: '',
            customizable: 'false',
            minOrder: '1',
            price: ''
          }
        })
      }
    }
    
    return products
  } catch (error) {
    console.error('Failed to load products from file system:', error)
    return []
  }
}

// 导出工具函数
export default {
  loadProductsFromFileSystem
}

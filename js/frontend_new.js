  async loadSeriesNameMap() {
    try {
      // 初始化系列名称映射 - 现在存储多语言对象
      let seriesNameMap = {};
      
      // 从各个系列的 products.json 文件中加载 seriesName 字段
      try {
        const seriesList = await githubAPI.fetchDirectory('产品图');
        const allSeries = seriesList.filter(item => item.type === 'dir');
        
        for (const series of allSeries) {
          try {
            const data = await githubAPI.fetchFile(`${series.path}/products.json`);
            if (data && data.seriesName) {
              // 存储完整的 seriesName 对象（包含 zh, en, ko）
              seriesNameMap[series.name] = data.seriesName;
            }
          } catch (err) {
            console.warn(`Failed to load ${series.name}/products.json:`, err);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch series list:', error);
      }
      
      // 如果没有任何映射，使用默认映射
      if (Object.keys(seriesNameMap).length === 0) {
        const defaultMap = this._getDefaultSeriesNameMap();
        // 将默认映射转换为多语言格式
        Object.entries(defaultMap).forEach(([key, value]) => {
          seriesNameMap[key] = {
            zh: value,
            en: value,
            ko: value
          };
        });
      }
      
      this.state.seriesNameMap = seriesNameMap;
      console.log('Series name map loaded:', seriesNameMap);
    } catch (error) {
      console.error('Load series name map error:', error);
      // 使用默认映射
      const defaultMap = this._getDefaultSeriesNameMap();
      this.state.seriesNameMap = {};
      Object.entries(defaultMap).forEach(([key, value]) => {
        this.state.seriesNameMap[key] = {
          zh: value,
          en: value,
          ko: value
        };
      });
    }
  }
  
  // 获取系列显示名称（支持多语言）
  getSeriesDisplayName(seriesId) {
    const seriesNameObj = this.state.seriesNameMap[seriesId];
    if (seriesNameObj) {
      const currentLang = typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : 'zh';
      // 优先返回当前语言的名称，如果不存在则返回中文
      return seriesNameObj[currentLang] || seriesNameObj.zh || seriesId;
    }
    return seriesId;
  }

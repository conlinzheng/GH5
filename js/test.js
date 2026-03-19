class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('=== 开始测试 ===');
    
    for (const test of this.tests) {
      try {
        console.log(`测试: ${test.name}`);
        await test.testFn();
        this.results.push({ name: test.name, status: 'pass' });
        console.log(`✅ ${test.name} - 通过`);
      } catch (error) {
        this.results.push({ name: test.name, status: 'fail', error: error.message });
        console.error(`❌ ${test.name} - 失败: ${error.message}`);
      }
      console.log('---');
    }

    this.printResults();
  }

  printResults() {
    console.log('=== 测试结果 ===');
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    console.log(`通过: ${passed}`);
    console.log(`失败: ${failed}`);
    console.log(`总测试数: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('失败的测试:');
      this.results.filter(r => r.status === 'fail').forEach(r => {
        console.log(`- ${r.name}: ${r.error}`);
      });
    }
  }
}

// 测试配置管理
function testConfig() {
  console.log('测试配置管理模块');
  
  // 测试配置对象存在
  if (typeof config === 'undefined') {
    throw new Error('配置对象未定义');
  }
  
  // 测试获取配置
  const projectName = config.get('project.name');
  if (!projectName) {
    throw new Error('无法获取项目名称');
  }
  console.log(`项目名称: ${projectName}`);
  
  // 测试默认值
  const testValue = config.get('test.key', 'default');
  if (testValue !== 'default') {
    throw new Error('默认值测试失败');
  }
  console.log(`默认值测试: ${testValue}`);
  
  // 测试设置配置
  config.set('test.key', 'test value');
  const setValue = config.get('test.key');
  if (setValue !== 'test value') {
    throw new Error('设置配置测试失败');
  }
  console.log(`设置配置测试: ${setValue}`);
}

// 测试错误处理
function testErrorHandler() {
  console.log('测试错误处理模块');
  
  if (typeof errorHandler === 'undefined') {
    throw new Error('错误处理对象未定义');
  }
  
  // 测试错误消息
  const errorMessage = errorHandler.getErrorMessage('network');
  if (!errorMessage) {
    throw new Error('错误消息测试失败');
  }
  console.log(`错误消息测试: ${errorMessage}`);
  
  // 测试成功消息
  errorHandler.showSuccess('测试成功消息');
  console.log('成功消息测试: 已显示');
  
  // 测试错误消息
  errorHandler.showError('测试错误消息');
  console.log('错误消息测试: 已显示');
}

// 测试缓存管理
function testCacheManager() {
  console.log('测试缓存管理模块');
  
  if (typeof cacheManager === 'undefined') {
    throw new Error('缓存管理对象未定义');
  }
  
  // 测试设置缓存
  const testData = { key: 'value', number: 123 };
  cacheManager.set('test_cache', testData, 60000);
  console.log('缓存设置测试: 已设置');
  
  // 测试获取缓存
  const cachedData = cacheManager.get('test_cache');
  if (!cachedData || cachedData.key !== 'value') {
    throw new Error('缓存获取测试失败');
  }
  console.log('缓存获取测试: 成功');
  
  // 测试删除缓存
  cacheManager.remove('test_cache');
  const removedData = cacheManager.get('test_cache');
  if (removedData) {
    throw new Error('缓存删除测试失败');
  }
  console.log('缓存删除测试: 成功');
}

// 测试国际化
function testI18n() {
  console.log('测试国际化模块');
  
  if (typeof i18n === 'undefined') {
    throw new Error('国际化对象未定义');
  }
  
  // 测试获取翻译
  const title = i18n.t('site.title');
  if (!title) {
    throw new Error('翻译测试失败');
  }
  console.log(`翻译测试: ${title}`);
  
  // 测试语言切换
  const initialLang = i18n.getCurrentLanguage();
  const switchResult = i18n.switchLanguage('en');
  if (!switchResult) {
    throw new Error('语言切换测试失败');
  }
  console.log(`语言切换测试: 从 ${initialLang} 切换到 en`);
  
  // 切换回原语言
  i18n.switchLanguage(initialLang);
  console.log(`语言切换测试: 切换回 ${initialLang}`);
}

// 测试GitHub API
async function testGitHubAPI() {
  console.log('测试GitHub API模块');
  
  if (typeof githubAPI === 'undefined') {
    throw new Error('GitHub API对象未定义');
  }
  
  try {
    // 测试获取目录
    console.log('测试获取目录...');
    const series = await githubAPI.fetchDirectory('产品图');
    if (Array.isArray(series)) {
      console.log(`目录测试: 成功获取 ${series.length} 个系列`);
    } else {
      throw new Error('目录测试失败');
    }
  } catch (error) {
    console.warn('GitHub API测试失败（可能是API限流）:', error.message);
    console.log('继续测试其他功能...');
  }
}

// 测试前端核心功能
async function testFrontend() {
  console.log('测试前端核心功能');
  
  if (typeof frontend === 'undefined') {
    throw new Error('前端对象未定义');
  }
  
  // 测试功能设置
  const featureEnabled = frontend.isFeatureEnabled('toggle-backtotop');
  console.log(`功能设置测试: backtotop 功能 ${featureEnabled ? '已启用' : '已禁用'}`);
  
  // 测试语言处理
  frontend._updateLanguageDisplay();
  console.log('语言显示更新测试: 已执行');
}

// 运行所有测试
async function runAllTests() {
  const testRunner = new TestRunner();
  
  testRunner.addTest('配置管理测试', testConfig);
  testRunner.addTest('错误处理测试', testErrorHandler);
  testRunner.addTest('缓存管理测试', testCacheManager);
  testRunner.addTest('国际化测试', testI18n);
  testRunner.addTest('GitHub API测试', testGitHubAPI);
  testRunner.addTest('前端核心测试', testFrontend);
  
  await testRunner.run();
}

// 当DOM加载完成后运行测试
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', runAllTests);
} else {
  // 在Node.js环境中直接运行
  runAllTests();
}

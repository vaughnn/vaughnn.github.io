// 确保只在说说页面执行
if (document.getElementById('shuo-app')) {
  const { createApp, ref, onMounted } = Vue;

  const App = {
    setup() {
      // 状态管理
      const loading = ref(true);
      const shuoList = ref([]); // 直接存储当前页的说说列表
      const currentPage = ref(1);
      const pageSize = ref(10); // 初始化每页数量为 10
      const totalItems = ref(0); // 总条数由后端返回

      /**
       * 根据页码和每页数量从API获取数据 (使用 POST 请求)
       * @param {number} page - 要获取的页码
       * @param {number} size - 每页的数据量
       */
      const fetchShuoData = async (page, size) => {
        loading.value = true;
        try {
          const response = await fetch('http://47.109.158.56:9001/prod-api/userMessage/page', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              page: page,       // 后端需要的页码参数
              pageSize: size    // 后端需要的每页数量参数
            })
          });
          // 解析后端返回的 JSON 数据
          const res = await response.json();

          // 检查业务状态码，确保请求成功
          if (res.code === 0 && res.data) {
            // **关键：适配后端返回的数据结构**
            // 1. 从 res.data.records 获取列表
            // 2. 使用 .map 转换字段，将 imageList 映射到 images
            shuoList.value = res.data.records.map(item => {
              return {
                ...item, // 保留后端返回的所有其他字段
                images: item.imageList // 新增一个 images 字段，值为 imageList 的值
              };
            });
            // 从 res.data.total 获取总条目数
            totalItems.value = res.data.total || 0;
          } else {
            // 如果业务码不为0，抛出错误
            throw new Error(res.msg || '后端返回错误');
          }

        } catch (error) {
          console.error("获取说说数据失败:", error);
          // 可以在此清空列表或显示错误提示
          shuoList.value = [];
          totalItems.value = 0;
        } finally {
          loading.value = false;
        }
      };


       // --- 新增代码在这里 ---
      /**
       * 1. 定义首字母大写的方法
       * @param {string} str - 需要格式化的字符串
       * @returns {string} 格式化后的字符串
       */
      const capitalizeFirstLetter = (str) => {
        // 先判断输入是否有效，防止 undefined 或 null 报错
        if (!str || typeof str !== 'string') {
          return '';
        }
        // 返回 首字母大写 + 剩余部分小写 的组合
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };
      /**
       * 处理分页变化的函数
       * @param {number} newPage - 用户点击的目标页码
       */
      const handlePageChange = (newPage) => {
        currentPage.value = newPage;
        fetchShuoData(newPage, pageSize.value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };


      // 组件挂载后，加载初始数据（第1页，每页10条）
      onMounted(() => {
        fetchShuoData(currentPage.value, pageSize.value);
      });

      return {
        loading,
        shuoList, // 模板中直接使用 shuoList
        totalItems,
        pageSize,
        currentPage,
        handlePageChange,
        capitalizeFirstLetter
      };
    }
  };

  const app = createApp(App);
  app.use(ElementPlus);
  app.mount('#shuo-app');
}

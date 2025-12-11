// 默认新闻数据，用于新用户首次访问时立即显示
export const fallbackNews = [
  {
    id: 'fallback-1',
    title: '人工智能初创公司完成新一轮融资',
    company: 'AI科技',
    industry: '人工智能',
    category: 'tech',
    amount: '数千万美元',
    investors: '知名投资机构',
    publishDate: new Date().toISOString().split('T')[0],
    content: '近期，多家人工智能领域的初创公司相继完成新一轮融资，反映出资本市场对AI技术的持续看好。',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop'
  },
  {
    id: 'fallback-2',
    title: '新能源企业获得战略投资',
    company: '绿能科技',
    industry: '新能源',
    category: 'energy',
    amount: '亿元级别',
    investors: '产业资本',
    publishDate: new Date().toISOString().split('T')[0],
    content: '随着碳中和目标的推进，新能源领域持续受到资本关注，多家企业获得重要融资。',
    thumbnail: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
  },
  {
    id: 'fallback-3',
    title: '医疗健康赛道融资活跃',
    company: '生物医药',
    industry: '医疗健康',
    category: 'healthcare',
    amount: '数亿元',
    investors: '医疗产业基金',
    publishDate: new Date().toISOString().split('T')[0],
    content: '医疗健康领域的创新企业持续获得资本青睐，生物医药、医疗器械等细分赛道表现活跃。',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop'
  },
  {
    id: 'fallback-4',
    title: '消费科技公司完成B轮融资',
    company: '智能消费',
    industry: '消费科技',
    category: 'consumer',
    amount: '千万美元',
    investors: '消费领域投资人',
    publishDate: new Date().toISOString().split('T')[0],
    content: '消费科技领域的创新企业受到市场关注，智能硬件、消费电子等方向持续获得投资。',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
  },
  {
    id: 'fallback-5',
    title: '企业服务SaaS获得融资',
    company: '云服务商',
    industry: '企业服务',
    category: 'enterprise',
    amount: '数千万元',
    investors: 'SaaS投资机构',
    publishDate: new Date().toISOString().split('T')[0],
    content: '企业数字化转型加速，SaaS服务商持续获得资本支持，云计算、协同办公等领域表现突出。',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  }
];

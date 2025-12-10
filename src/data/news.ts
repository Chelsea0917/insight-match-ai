export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  source: string;
  publishDate: string;
  category: string;
  content: string;
  relatedKeywords: string[];
}

export const newsData: NewsItem[] = [
  {
    id: "news_001",
    title: "2024年AI医疗赛道融资超200亿，头部企业加速商业化落地",
    summary: "据统计，2024年上半年AI医疗领域完成融资超过200亿元人民币，多家头部企业已进入商业化阶段，三甲医院覆盖率显著提升。",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=150&fit=crop",
    source: "投资界",
    publishDate: "2024-12-09",
    category: "AI医疗",
    content: "2024年上半年，AI医疗领域呈现出强劲的发展态势。据投资界统计，该领域完成融资超过200亿元人民币，较去年同期增长45%。其中，AI辅助诊断、医疗影像分析、药物研发等细分领域最受资本青睐。\n\n多家头部企业已进入商业化阶段，与超过500家三甲医院建立合作关系。业内专家表示，AI医疗正从概念验证阶段进入规模化应用阶段，预计2025年市场规模将突破500亿元。",
    relatedKeywords: ["AI", "医疗健康", "融资", "商业化"]
  },
  {
    id: "news_002",
    title: "长三角智能制造产业园区招商火热，机器人企业成香饽饽",
    summary: "上海、苏州、杭州等地产业园区竞相引进智能制造企业，工业机器人和协作机器人企业最受欢迎，多个园区入驻率已超90%。",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=150&fit=crop",
    source: "经济观察报",
    publishDate: "2024-12-08",
    category: "智能制造",
    content: "长三角地区智能制造产业园区招商持续火热。据了解，上海、苏州、杭州等地多个产业园区正积极引进智能制造企业，其中工业机器人和协作机器人企业最受欢迎。\n\n苏州工业园区招商负责人表示，园区对于拥有核心技术、已完成B轮以上融资的智能制造企业给予重点关注，提供租金减免、人才补贴等优惠政策。目前，多个重点园区入驻率已超过90%。",
    relatedKeywords: ["智能制造", "机器人", "长三角", "产业园"]
  },
  {
    id: "news_003",
    title: "企业服务SaaS迎来整合期，头部企业估值回归理性",
    summary: "经历了前两年的高速增长后，企业服务SaaS赛道进入整合期，投资人更关注盈利能力和续费率，估值体系趋于理性。",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop",
    source: "36氪",
    publishDate: "2024-12-07",
    category: "企业服务",
    content: "企业服务SaaS赛道正经历深刻变革。经历了前两年的高速增长后，该领域进入整合期，资本市场对SaaS企业的估值逻辑发生转变。\n\n多位投资人表示，现在更关注企业的盈利能力、客户续费率和NDR（净收入留存率）等核心指标，而非单纯的收入增速。头部SaaS企业估值普遍回调30%-50%，行业正在回归理性发展轨道。",
    relatedKeywords: ["SaaS", "企业服务", "投资", "估值"]
  },
  {
    id: "news_004",
    title: "深圳出台新能源汽车产业扶持政策，供应链企业迎来发展机遇",
    summary: "深圳市发布新能源汽车产业高质量发展行动计划，重点扶持动力电池、智能驾驶等核心零部件企业，计划五年内培育10家独角兽。",
    thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200&h=150&fit=crop",
    source: "南方都市报",
    publishDate: "2024-12-06",
    category: "新能源",
    content: "深圳市政府近日发布《新能源汽车产业高质量发展行动计划（2024-2028年）》，明确提出将重点扶持动力电池、智能驾驶、车规级芯片等核心零部件企业。\n\n根据计划，深圳将在五年内培育10家新能源汽车领域的独角兽企业，打造3-5个百亿级产业集群。对于符合条件的企业，政府将提供最高5000万元的研发补贴和低息贷款支持。",
    relatedKeywords: ["新能源", "汽车", "深圳", "政策"]
  },
  {
    id: "news_005",
    title: "跨境电商持续增长，品牌出海成新趋势",
    summary: "2024年中国跨境电商出口额预计突破2万亿，从铺货模式向品牌化转型，东南亚和中东市场增速最快。",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=150&fit=crop",
    source: "亿邦动力",
    publishDate: "2024-12-05",
    category: "跨境电商",
    content: "中国跨境电商行业持续保持高速增长态势。据海关总署数据，2024年跨境电商出口额预计将突破2万亿元人民币，同比增长超过20%。\n\n值得关注的是，行业正在从传统的铺货模式向品牌化方向转型，越来越多的中国品牌选择自建站和独立站模式出海。从区域来看，东南亚和中东市场增速最快，年增长率均超过40%。",
    relatedKeywords: ["跨境电商", "出海", "品牌", "东南亚"]
  },
  {
    id: "news_006",
    title: "生物医药CXO行业回暖，订单量环比增长30%",
    summary: "经历了2023年的行业调整后，生物医药CXO企业订单量明显回升，海外客户占比提升，行业景气度逐步恢复。",
    thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=200&h=150&fit=crop",
    source: "医药经济报",
    publishDate: "2024-12-04",
    category: "生物医药",
    content: "生物医药CXO（医药外包）行业正在逐步回暖。经历了2023年的行业调整后，多家头部CXO企业反馈订单量明显回升，环比增长约30%。\n\n业内人士分析，行业回暖主要受益于全球创新药研发管线的恢复以及海外客户订单的增加。同时，国内创新药企业在经历资本寒冬后，研发投入开始趋于稳定，为CXO行业带来新的增长动力。",
    relatedKeywords: ["生物医药", "CXO", "医药", "研发"]
  },
  {
    id: "news_007",
    title: "碳中和目标推动绿色科技投资，清洁能源赛道受追捧",
    summary: "在双碳目标驱动下，绿色科技领域投资持续升温，储能、氢能、碳捕捉技术成为热门赛道，多家企业获得大额融资。",
    thumbnail: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&h=150&fit=crop",
    source: "中国环境报",
    publishDate: "2024-12-03",
    category: "清洁能源",
    content: "在碳中和目标的推动下，绿色科技领域投资持续升温。据清科研究中心统计，2024年上半年绿色科技领域投资金额同比增长65%，储能、氢能、碳捕捉技术成为最热门的投资赛道。\n\n多家清洁能源企业获得大额融资，其中某氢能源企业完成10亿元C轮融资，创下该领域单轮融资纪录。投资人表示，绿色科技将是未来十年最确定的投资主题之一。",
    relatedKeywords: ["碳中和", "清洁能源", "储能", "绿色科技"]
  }
];

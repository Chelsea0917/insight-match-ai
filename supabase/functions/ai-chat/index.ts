import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TUZI_API_KEY = Deno.env.get('TUZI_API_KEY');
    if (!TUZI_API_KEY) {
      console.error('TUZI_API_KEY is not configured');
      throw new Error('TUZI_API_KEY is not configured');
    }

    const { messages, type } = await req.json();
    console.log('Received request:', { type, messagesCount: messages?.length });

    // 获取当前日期用于提示词
    const currentDate = new Date().toISOString().split('T')[0];

    // 为搜索类请求注入当前日期上下文
    const enhancedMessages = messages.map((msg: { role: string; content: string }, index: number) => {
      if (type === 'search_companies' && msg.role === 'system') {
        return {
          ...msg,
          content: `当前日期：${currentDate}。${msg.content}请确保返回的公司融资信息是最新的、真实存在的数据，融资日期应尽量接近当前日期或用户指定的时间范围。`
        };
      }
      return msg;
    });

    // Build the request body based on type
    const body: Record<string, unknown> = {
      model: 'deepseek-chat',  // 兔子API - DeepSeek模型
      messages: enhancedMessages,
    };

    // For structured output (requirement parsing, company matching), use tool calling
    if (type === 'parse_requirement') {
      body.tools = [
        {
          type: 'function',
          function: {
            name: 'parse_requirement',
            description: '从用户需求文本中提取结构化的招商需求信息',
            parameters: {
              type: 'object',
              properties: {
                region_preference: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '地区偏好，如北京、上海、长三角等'
                },
                industry_preference: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '行业偏好，如人工智能、新能源、半导体等'
                },
                stage_preference: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '融资阶段偏好，如A轮、B轮、C轮等'
                },
                time_window: {
                  type: 'string',
                  description: '时间窗口要求'
                },
                extra_preferences: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '其他偏好，如头部投资机构背书、团队扩张等'
                },
                scenario: {
                  type: 'string',
                  description: '适用场景'
                }
              },
              required: ['region_preference', 'industry_preference', 'stage_preference']
            }
          }
        }
      ];
      body.tool_choice = { type: 'function', function: { name: 'parse_requirement' } };
    } else if (type === 'search_companies') {
      // 实时搜索/生成公司，不依赖本地数据
      body.tools = [
        {
          type: 'function',
          function: {
            name: 'search_companies',
            description: '根据用户需求实时搜索/生成符合条件的公司列表，包含完整公司信息和匹配分数',
            parameters: {
              type: 'object',
              properties: {
                companies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: '公司唯一ID，如comp_001' },
                      name: { type: 'string', description: '公司名称' },
                      city: { type: 'string', description: '所在城市' },
                      province: { type: 'string', description: '所在省份' },
                      industry: { type: 'array', items: { type: 'string' }, description: '所属行业' },
                      track: { type: 'string', description: '细分赛道' },
                      register_year: { type: 'number', description: '成立年份' },
                      last_round: { type: 'string', description: '最近融资轮次' },
                      last_round_date: { type: 'string', description: '最近融资日期，格式YYYY-MM-DD' },
                      last_round_amount: { type: 'string', description: '融资金额' },
                      investors: { type: 'array', items: { type: 'string' }, description: '投资方列表' },
                      headline: { type: 'string', description: '公司一句话简介' },
                      business_summary: { type: 'string', description: '业务概述' },
                      news_snippet: { type: 'string', description: '最新动态' },
                      growth_stage: { type: 'string', description: '增长阶段：早期/快速增长/成熟期' },
                      tags: { type: 'array', items: { type: 'string' }, description: '标签' },
                      match_score: { type: 'number', description: '匹配分数0-100' },
                      match_reason: { type: 'string', description: '匹配原因' }
                    },
                    required: ['id', 'name', 'city', 'province', 'industry', 'track', 'last_round', 'business_summary', 'match_score', 'match_reason']
                  }
                }
              },
              required: ['companies']
            }
          }
        }
      ];
      body.tool_choice = { type: 'function', function: { name: 'search_companies' } };
    } else if (type === 'analyze_company') {
      // 政府招商评估报告 - 详细结构化输出
      body.tools = [
        {
          type: 'function',
          function: {
            name: 'government_assessment',
            description: '生成政府招商评估报告，用于辅助政府做出是否引入企业的理性决策',
            parameters: {
              type: 'object',
              properties: {
                // 模块一：企业综合画像
                companyProfile: {
                  type: 'object',
                  properties: {
                    industryStage: { type: 'string', description: '企业所处行业阶段（如：成熟期、快速成长期、导入期等）' },
                    coreTechnology: { type: 'string', description: '技术/产品核心竞争点' },
                    developmentStage: { type: 'string', description: '企业当前发展阶段（成长期/扩张期/转型期）' },
                    summary: { type: 'string', description: '从政府视角总结，不超过300字' }
                  },
                  required: ['industryStage', 'coreTechnology', 'developmentStage', 'summary']
                },
                // 模块二：项目真实性与落地判断
                landingAssessment: {
                  type: 'object',
                  properties: {
                    credibilityLevel: { type: 'string', enum: ['高可信', '中等可信', '存疑'], description: '可信度判断' },
                    strategicAlignment: { type: 'string', description: '本次落地是否与企业战略高度一致' },
                    irreplaceability: { type: 'string', description: '落地内容是否具有不可替代性（是否只是挂名总部）' },
                    inputOutputLogic: { type: 'string', description: '投入产出逻辑是否清晰' },
                    keyEvidence: { type: 'array', items: { type: 'string' }, description: '关键判断依据' }
                  },
                  required: ['credibilityLevel', 'strategicAlignment', 'irreplaceability', 'inputOutputLogic', 'keyEvidence']
                },
                // 模块三：与地方产业匹配度评估
                industryMatch: {
                  type: 'object',
                  properties: {
                    matchLevel: { type: 'string', enum: ['高度匹配', '匹配', '一般', '不匹配'], description: '总体匹配度' },
                    dominantIndustryFit: { type: 'string', description: '与区域主导产业的契合度分析' },
                    chainEffect: { type: 'string', description: '对本地产业链的补链/强链/延链作用' },
                    clusterPotential: { type: 'string', description: '是否具备形成产业集聚或示范效应的潜力' }
                  },
                  required: ['matchLevel', 'dominantIndustryFit', 'chainEffect', 'clusterPotential']
                },
                // 模块四：可为地方带来的核心价值
                coreValue: {
                  type: 'object',
                  properties: {
                    industryValue: { type: 'string', description: '产业价值（技术、品牌、链主效应）' },
                    economicValue: { type: 'string', description: '经济价值（税收、产值、就业）' },
                    strategicValue: { type: 'string', description: '战略价值（示范、对外合作、区域能级）' }
                  },
                  required: ['industryValue', 'economicValue', 'strategicValue']
                },
                // 模块五：主要风险识别
                riskAssessment: {
                  type: 'object',
                  properties: {
                    financialRisk: {
                      type: 'object',
                      properties: {
                        source: { type: 'string', description: '风险来源' },
                        localImpact: { type: 'string', description: '对地方的潜在影响' }
                      },
                      required: ['source', 'localImpact']
                    },
                    businessRisk: {
                      type: 'object',
                      properties: {
                        source: { type: 'string', description: '业务结构或增长可持续性风险来源' },
                        localImpact: { type: 'string', description: '对地方的潜在影响' }
                      },
                      required: ['source', 'localImpact']
                    },
                    competitionRisk: {
                      type: 'object',
                      properties: {
                        source: { type: 'string', description: '行业竞争与技术替代风险来源' },
                        localImpact: { type: 'string', description: '对地方的潜在影响' }
                      },
                      required: ['source', 'localImpact']
                    },
                    policyRisk: {
                      type: 'object',
                      properties: {
                        source: { type: 'string', description: '海外/政策/合规风险来源' },
                        localImpact: { type: 'string', description: '对地方的潜在影响' }
                      },
                      required: ['source', 'localImpact']
                    }
                  },
                  required: ['financialRisk', 'businessRisk', 'competitionRisk', 'policyRisk']
                },
                // 模块六：政府引入策略建议
                introductionStrategy: {
                  type: 'object',
                  properties: {
                    recommendIntroduce: { type: 'string', enum: ['是', '谨慎', '不建议'], description: '是否建议引入' },
                    recommendedForm: { type: 'string', description: '建议引入形式（总部、区域中心、项目公司等）' },
                    policyPriority: { type: 'array', items: { type: 'string' }, description: '政策支持优先级排序（资金/空间/场景/人才/基金）' },
                    notRecommendedPolicy: { type: 'array', items: { type: 'string' }, description: '明确不建议给予的政策类型' }
                  },
                  required: ['recommendIntroduce', 'recommendedForm', 'policyPriority', 'notRecommendedPolicy']
                },
                // 模块七：招商谈判关键条款建议
                negotiationTerms: { type: 'array', items: { type: 'string' }, description: '政府在谈判中必须锁定的5条核心条款' },
                // 模块八：综合结论
                conclusion: {
                  type: 'object',
                  properties: {
                    projectType: { type: 'string', description: '项目类型' },
                    overallRating: { type: 'number', description: '综合判断1-5星' },
                    recommendedAction: { type: 'string', description: '推荐动作' },
                    biggestOpportunity: { type: 'string', description: '最大机会点' },
                    biggestRisk: { type: 'string', description: '最大风险点' }
                  },
                  required: ['projectType', 'overallRating', 'recommendedAction', 'biggestOpportunity', 'biggestRisk']
                },
                // 信息不足标注
                insufficientInfo: { type: 'array', items: { type: 'string' }, description: '需补充信息的字段列表，如信息充足则为空数组' }
              },
              required: ['companyProfile', 'landingAssessment', 'industryMatch', 'coreValue', 'riskAssessment', 'introductionStrategy', 'negotiationTerms', 'conclusion', 'insufficientInfo']
            }
          }
        }
      ];
      body.tool_choice = { type: 'function', function: { name: 'government_assessment' } };
    } else if (type === 'search_news') {
      // 使用tool calling获取结构化新闻数据 - 最近一周的完整新闻
      body.tools = [
        {
          type: 'function',
          function: {
            name: 'return_news',
            description: '返回最近一周内的10条投资融资或行业重要新闻，按发布时间从最近到最远排序，要求内容完整详实',
            parameters: {
              type: 'object',
              properties: {
                news: {
                  type: 'array',
                  maxItems: 10,
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: '新闻唯一ID' },
                      title: { type: 'string', description: '新闻标题，必须包含具体公司名或行业关键词' },
                      summary: { type: 'string', description: '50字以内的核心摘要' },
                      source: { type: 'string', description: '来源媒体：36氪/投资界/钛媒体/界面新闻/澎湃科技等' },
                      publishDate: { type: 'string', description: '发布日期，格式YYYY-MM-DD，必须是最近7天内' },
                      category: { type: 'string', description: '分类：融资/并购/IPO/政策/行业动态' },
                      content: { type: 'string', description: '150-200字完整新闻内容，包含具体数据、投资方、业务详情等' },
                      relatedKeywords: { type: 'array', items: { type: 'string' }, maxItems: 4, description: '相关关键词' },
                      companyName: { type: 'string', description: '涉及的主要公司名称' },
                      industry: { type: 'string', description: '所属行业' },
                      fundingAmount: { type: 'string', description: '融资金额（如有）' },
                      investors: { type: 'array', items: { type: 'string' }, description: '投资方列表（如有）' }
                    },
                    required: ['id', 'title', 'summary', 'source', 'publishDate', 'category', 'content', 'relatedKeywords']
                  }
                }
              },
              required: ['news']
            }
          }
        }
      ];
      body.tool_choice = { type: 'function', function: { name: 'return_news' } };
    }

    console.log('Calling Tuzi API...');
    
    // 调用兔子API (OpenAI兼容)
    const response = await fetch('https://api.tu-zi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TUZI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tuzi API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '请求过于频繁，请稍后再试' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '额度已用完，请充值' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Tuzi API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Tuzi API response received');

    // Extract tool call result if applicable
    let result;
    const messageContent = data.choices?.[0]?.message?.content || '';
    
    if (data.choices?.[0]?.message?.tool_calls?.length > 0) {
      const toolCall = data.choices[0].message.tool_calls[0];
      const rawArgs = toolCall.function.arguments || '';
      
      try {
        result = JSON.parse(rawArgs);
      } catch (parseError) {
        console.error('Failed to parse tool call arguments:', String(parseError));
        console.log('Raw arguments:', rawArgs.slice(0, 500));
        throw new Error('AI返回的数据格式异常，请重试');
      }
    } else if (messageContent) {
      // 处理普通文本返回
      console.log('Processing text response');
      try {
        // 尝试从返回的文本中提取JSON
        const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = { content: messageContent };
        }
      } catch (parseError) {
        console.error('Failed to parse content JSON:', String(parseError));
        result = { content: messageContent };
      }
    } else {
      result = { content: '' };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

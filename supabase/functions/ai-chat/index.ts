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
    const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY');
    if (!KIMI_API_KEY) {
      console.error('KIMI_API_KEY is not configured');
      throw new Error('KIMI_API_KEY is not configured');
    }

    const { messages, type } = await req.json();
    console.log('Received request:', { type, messagesCount: messages?.length });

    // Build the request body based on type
    const body: Record<string, unknown> = {
      model: 'moonshot-v1-8k',
      messages,
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
      body.tools = [
        {
          type: 'function',
          function: {
            name: 'analyze_company',
            description: '分析公司与用户需求的匹配度，提供投资建议',
            parameters: {
              type: 'object',
              properties: {
                alignment_rationale: { type: 'string', description: '匹配度分析' },
                risks: { type: 'array', items: { type: 'string' }, description: '潜在风险' },
                venue_recommendation: { type: 'string', description: '适用场景建议' },
                recommendation: {
                  type: 'string',
                  enum: ['推荐', '谨慎推荐', '不推荐'],
                  description: '最终建议'
                },
                recommendation_rationale: { type: 'string', description: '建议理由' }
              },
              required: ['alignment_rationale', 'risks', 'venue_recommendation', 'recommendation', 'recommendation_rationale']
            }
          }
        }
      ];
      body.tool_choice = { type: 'function', function: { name: 'analyze_company' } };
    } else if (type === 'search_news') {
      // 使用Kimi联网搜索真实新闻
      // 切换到支持联网搜索的模型
      body.model = 'moonshot-v1-128k-latest';
      // 启用Kimi内置联网搜索工具
      body.tools = [
        {
          type: 'builtin_function',
          function: {
            name: '$web_search'
          }
        }
      ];
    }

    console.log('Calling Kimi API...');
    
    // 调用 Kimi API (月之暗面)
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kimi API error:', response.status, errorText);
      
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
      
      throw new Error(`Kimi API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Kimi API response received');

    // Extract tool call result if applicable
    let result;
    const messageContent = data.choices?.[0]?.message?.content || '';
    
    if (data.choices?.[0]?.message?.tool_calls?.length > 0) {
      const toolCall = data.choices[0].message.tool_calls[0];
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error('Failed to parse tool call arguments:', String(parseError));
        throw new Error('AI返回的数据格式异常，请重试');
      }
    } else if (type === 'search_news' && messageContent) {
      // 处理联网搜索返回的文本内容，提取JSON
      console.log('Processing web search response for news');
      try {
        // 尝试从返回的文本中提取JSON
        const jsonMatch = messageContent.match(/\{[\s\S]*"news"[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // 如果没有JSON格式，尝试解析整个内容
          result = JSON.parse(messageContent);
        }
      } catch (parseError) {
        console.error('Failed to parse news JSON from content:', String(parseError));
        console.log('Raw content:', messageContent.slice(0, 1000));
        
        // 尝试从markdown代码块中提取JSON
        const codeBlockMatch = messageContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          try {
            result = JSON.parse(codeBlockMatch[1].trim());
          } catch {
            throw new Error('无法解析新闻数据，请重试');
          }
        } else {
          throw new Error('无法解析新闻数据，请重试');
        }
      }
    } else {
      result = {
        content: messageContent
      };
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

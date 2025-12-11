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
    } else if (type === 'match_companies') {
      body.tools = [
        {
          type: 'function',
          function: {
            name: 'match_companies',
            description: '根据用户需求匹配公司并返回匹配分数和原因',
            parameters: {
              type: 'object',
              properties: {
                matches: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      company_id: { type: 'string' },
                      score: { type: 'number', description: '匹配分数 0-100' },
                      reason: { type: 'string', description: '匹配原因' }
                    },
                    required: ['company_id', 'score', 'reason']
                  }
                }
              },
              required: ['matches']
            }
          }
        }
      ];
      body.tool_choice = { type: 'function', function: { name: 'match_companies' } };
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
    if (data.choices?.[0]?.message?.tool_calls?.length > 0) {
      const toolCall = data.choices[0].message.tool_calls[0];
      result = JSON.parse(toolCall.function.arguments);
    } else {
      result = {
        content: data.choices?.[0]?.message?.content || ''
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

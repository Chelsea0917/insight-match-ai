import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TUZI_API_KEY = Deno.env.get('TUZI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// 动态生成带当前日期的prompt
function getNewsPrompt(): string {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  return `你是投资资讯推荐引擎，专注于中国创投市场的最新动态。

当前日期是：${currentDate}（${year}年${month}月）

你的任务是推荐${year}年${month}月最近一周内真实发生的投资融资或行业重要新闻。

要求：
1. 新闻必须是${year}年${month}月真实发生的事件，日期必须在${currentDate}之前的7天内
2. 新闻必须真实可信，来源于权威媒体（36氪、投资界、钛媒体、界面新闻、澎湃科技等）
3. 标题必须包含具体公司名称或具体行业事件
4. 内容要完整详实（60-80字），包含融资金额、投资方、公司业务简介
5. 类型可包括：融资、并购、IPO、政策、行业动态
6. 返回10条不同的新闻，按发布时间从最近到最远排序

重要：所有新闻的publishDate必须是${year}年${month}月的日期，不要返回2023年或2024年的旧闻！`;
}

interface NewsItem {
  title: string;
  company: string;
  industry: string;
  category: string;
  amount: string;
  investors: string;
  publishDate: string;
  content: string;
}

// 从可能被截断的JSON中提取完整的新闻项
function extractCompleteNewsItems(text: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  // 尝试匹配每个完整的新闻对象
  const regex = /\{[^{}]*"title"\s*:\s*"[^"]*"[^{}]*"company"\s*:\s*"[^"]*"[^{}]*"industry"\s*:\s*"[^"]*"[^{}]*"category"\s*:\s*"[^"]*"[^{}]*"amount"\s*:\s*"[^"]*"[^{}]*"investors"\s*:\s*"[^"]*"[^{}]*"publishDate"\s*:\s*"[^"]*"[^{}]*"content"\s*:\s*"[^"]*"[^{}]*\}/g;
  
  const matches = text.match(regex);
  if (matches) {
    for (const match of matches) {
      try {
        const item = JSON.parse(match);
        if (item.title && item.company && item.content) {
          items.push(item);
        }
      } catch (e) {
        console.log('Failed to parse news item:', e);
      }
    }
  }
  
  return items;
}

async function fetchNewsFromAI(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  
  // 获取两批新闻，每批10条
  for (let batch = 0; batch < 2; batch++) {
    console.log(`Fetching batch ${batch + 1}...`);
    
    const response = await fetch('https://api.tu-zi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TUZI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: getNewsPrompt() },
          { role: 'user', content: batch === 0 
            ? '请推荐最近一周的10条投资融资新闻。' 
            : '请推荐另外10条不同的投资融资新闻，不要与之前的重复。' 
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_news",
            description: "返回新闻列表",
            parameters: {
              type: "object",
              properties: {
                news: {
                  type: "array",
                  maxItems: 10,
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "新闻标题" },
                      company: { type: "string", description: "公司名称" },
                      industry: { type: "string", description: "行业" },
                      category: { type: "string", description: "分类：tech/healthcare/energy/consumer/enterprise" },
                      amount: { type: "string", description: "融资金额" },
                      investors: { type: "string", description: "投资方" },
                      publishDate: { type: "string", description: "发布日期 YYYY-MM-DD" },
                      content: { type: "string", description: "新闻内容，60-80字" }
                    },
                    required: ["title", "company", "industry", "category", "amount", "investors", "publishDate", "content"]
                  }
                }
              },
              required: ["news"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_news" } }
      }),
    });

    if (!response.ok) {
      console.error(`API error for batch ${batch + 1}:`, response.status);
      continue;
    }

    const data = await response.json();
    console.log(`Batch ${batch + 1} response received`);

    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const args = toolCall.function.arguments;
        
        try {
          const parsed = JSON.parse(args);
          if (parsed.news && Array.isArray(parsed.news)) {
            allNews.push(...parsed.news);
            console.log(`Batch ${batch + 1}: Got ${parsed.news.length} news items`);
          }
        } catch (parseError) {
          // JSON被截断，尝试提取完整的项
          console.log(`Batch ${batch + 1}: JSON truncated, extracting items...`);
          const extracted = extractCompleteNewsItems(args);
          allNews.push(...extracted);
          console.log(`Batch ${batch + 1}: Extracted ${extracted.length} items`);
        }
      }
    } catch (e) {
      console.error(`Error processing batch ${batch + 1}:`, e);
    }
    
    // 批次间延迟
    if (batch < 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return allNews;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily news fetch...');
    
    if (!TUZI_API_KEY) {
      throw new Error('TUZI_API_KEY not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // 创建Supabase客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0];
    
    // 检查今天是否已经获取过新闻
    const { data: existingNews, error: checkError } = await supabase
      .from('daily_news')
      .select('id')
      .eq('news_date', today)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing news:', checkError);
      throw checkError;
    }
    
    if (existingNews && existingNews.length > 0) {
      console.log('News already fetched for today');
      return new Response(
        JSON.stringify({ success: true, message: 'News already exists for today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 从AI获取新闻
    const news = await fetchNewsFromAI();
    console.log(`Total news fetched: ${news.length}`);

    if (news.length === 0) {
      throw new Error('No news fetched from AI');
    }

    // 删除旧新闻（保留最近3天）
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const oldDate = threeDaysAgo.toISOString().split('T')[0];
    
    const { error: deleteError } = await supabase
      .from('daily_news')
      .delete()
      .lt('news_date', oldDate);
    
    if (deleteError) {
      console.error('Error deleting old news:', deleteError);
    }

    // 插入新新闻
    const newsToInsert = news.map(item => ({
      news_date: today,
      title: item.title,
      company: item.company,
      industry: item.industry,
      category: item.category,
      amount: item.amount,
      investors: item.investors,
      publish_date: item.publishDate,
      content: item.content,
      thumbnail: null // 不使用AI生成的图片URL
    }));

    const { error: insertError } = await supabase
      .from('daily_news')
      .insert(newsToInsert);

    if (insertError) {
      console.error('Error inserting news:', insertError);
      throw insertError;
    }

    console.log(`Successfully inserted ${newsToInsert.length} news items for ${today}`);

    return new Response(
      JSON.stringify({ success: true, count: newsToInsert.length, date: today }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-daily-news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { useState, useEffect } from 'react';
import { NewsListItem } from './NewsListItem';
import { Newspaper, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fallbackNews } from '@/data/fallbackNews';
import { supabase } from '@/integrations/supabase/client';

// Map database news to display format
interface DisplayNewsItem {
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

// 获取今天的日期字符串
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 将fallback数据转换为显示格式
function convertFallbackToDisplay(): DisplayNewsItem[] {
  return fallbackNews.map(item => ({
    id: item.id,
    title: item.title,
    summary: `${item.company} · ${item.industry} · ${item.amount}`,
    thumbnail: item.thumbnail,
    source: item.investors,
    publishDate: item.publishDate,
    category: item.category,
    content: item.content,
    relatedKeywords: [item.industry, item.category]
  }));
}

// 根据分类和行业生成图片
function getCategoryThumbnail(category: string, industry?: string): string {
  const thumbnails: Record<string, string> = {
    'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=150&fit=crop',
    '人工智能': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=150&fit=crop',
    '新能源': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200&h=150&fit=crop',
    '生物医药': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=200&h=150&fit=crop',
    '医疗健康': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=150&fit=crop',
    '半导体': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=150&fit=crop',
    '芯片': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=150&fit=crop',
    '智能制造': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=150&fit=crop',
    '机器人': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=150&fit=crop',
    '企业服务': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop',
    'SaaS': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop',
    '清洁能源': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&h=150&fit=crop',
    '跨境电商': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=150&fit=crop',
    '融资': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop',
    '并购': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop',
    'IPO': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200&h=150&fit=crop',
    '政策': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&h=150&fit=crop',
    '行业动态': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=200&h=150&fit=crop',
    '自动驾驶': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=150&fit=crop',
    '新能源汽车': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200&h=150&fit=crop',
  };
  
  if (industry && thumbnails[industry]) {
    return thumbnails[industry];
  }
  return thumbnails[category] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop';
}

// 将数据库记录转换为显示格式
function convertDbToDisplay(dbNews: Array<{
  id: string;
  title: string;
  company: string | null;
  industry: string | null;
  category: string | null;
  amount: string | null;
  investors: string | null;
  publish_date: string | null;
  content: string | null;
  thumbnail: string | null;
}>): DisplayNewsItem[] {
  return dbNews.map(item => ({
    id: item.id,
    title: item.title,
    summary: `${item.company || ''} · ${item.industry || ''} · ${item.amount || ''}`,
    thumbnail: getCategoryThumbnail(item.category || '', item.industry || ''),
    source: item.investors || '',
    publishDate: item.publish_date || getTodayString(),
    category: item.category || '融资',
    content: item.content || '',
    relatedKeywords: [item.industry || '', item.category || ''].filter(Boolean)
  }));
}

export const NewsList = () => {
  const [news, setNews] = useState<DisplayNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async () => {
    const today = getTodayString();
    
    try {
      // 1. 先从数据库获取今天的新闻
      const { data: dbNews, error } = await supabase
        .from('daily_news')
        .select('*')
        .eq('news_date', today)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch news from database:', error);
        throw error;
      }

      // 2. 如果数据库有今天的新闻，直接显示
      if (dbNews && dbNews.length > 0) {
        console.log(`Found ${dbNews.length} news items from database for today`);
        setNews(convertDbToDisplay(dbNews));
        setIsLoading(false);
        return;
      }

      // 3. 数据库没有今天的新闻，先显示fallback，然后触发edge function获取
      console.log('No news in database for today, showing fallback and triggering fetch...');
      setNews(convertFallbackToDisplay());
      setIsLoading(false);

      // 4. 触发fetch-daily-news edge function
      const { error: fetchError } = await supabase.functions.invoke('fetch-daily-news');
      
      if (fetchError) {
        console.error('Failed to trigger fetch-daily-news:', fetchError);
        toast.error('获取最新资讯失败');
        return;
      }

      // 5. 等待一小段时间后重新从数据库获取
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const { data: newDbNews, error: refetchError } = await supabase
        .from('daily_news')
        .select('*')
        .eq('news_date', today)
        .order('created_at', { ascending: false });

      if (!refetchError && newDbNews && newDbNews.length > 0) {
        console.log(`Fetched ${newDbNews.length} new news items from database`);
        setNews(convertDbToDisplay(newDbNews));
        toast.success('资讯已更新');
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setNews(convertFallbackToDisplay());
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">推荐资讯</h2>
          <span className="text-xs text-muted-foreground ml-2">每日更新 · {news.length} 条</span>
        </div>
      </div>

      {/* News list */}
      <div className="px-4 divide-y divide-border">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p>正在获取最新资讯...</p>
          </div>
        ) : news.length > 0 ? (
          news.map((item) => (
            <NewsListItem key={item.id} news={item} />
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            暂无最新资讯
          </div>
        )}
      </div>
    </div>
  );
};

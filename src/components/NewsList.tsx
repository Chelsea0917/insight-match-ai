import { useState, useEffect } from 'react';
import { NewsListItem } from './NewsListItem';
import { Newspaper, Loader2 } from 'lucide-react';
import { searchNewsWithAI, AINewsItem } from '@/utils/ai';
import { toast } from 'sonner';

// Map AI news to display format
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

// 缓存相关常量
const NEWS_CACHE_KEY = 'daily_news_cache';
const NEWS_CACHE_DATE_KEY = 'daily_news_date';

// 获取今天的日期字符串（用于缓存判断）
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 从localStorage读取缓存的新闻（不管日期，先返回数据）
function getCachedNews(): { news: DisplayNewsItem[] | null; isStale: boolean } {
  try {
    const cached = localStorage.getItem(NEWS_CACHE_KEY);
    const cachedDate = localStorage.getItem(NEWS_CACHE_DATE_KEY);
    const news = cached ? JSON.parse(cached) : null;
    const isStale = cachedDate !== getTodayString();
    return { news, isStale };
  } catch {
    return { news: null, isStale: true };
  }
}

// 保存新闻到localStorage
function setCachedNews(news: DisplayNewsItem[]): void {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(news));
    localStorage.setItem(NEWS_CACHE_DATE_KEY, getTodayString());
  } catch (error) {
    console.error('Failed to cache news:', error);
  }
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
  
  // 优先匹配行业，再匹配分类
  if (industry && thumbnails[industry]) {
    return thumbnails[industry];
  }
  return thumbnails[category] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop';
}

export const NewsList = () => {
  const [news, setNews] = useState<DisplayNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async (forceRefresh = false) => {
    // 先立即显示缓存的新闻（即使是旧的）
    const { news: cachedNews, isStale } = getCachedNews();
    
    if (cachedNews && cachedNews.length > 0) {
      setNews(cachedNews);
      setIsLoading(false);
      
      // 如果不强制刷新且缓存是今天的，直接返回
      if (!forceRefresh && !isStale) {
        console.log('Using fresh cached news from today');
        return;
      }
      
      // 缓存是旧的，后台静默更新
      console.log('Showing stale cache, fetching fresh news in background');
    }

    // 没有缓存或缓存过期，需要加载
    if (!cachedNews || cachedNews.length === 0) {
      setIsLoading(true);
    }

    try {
      const aiNews = await searchNewsWithAI();
      
      // 转换为显示格式，直接使用分类默认图片（AI返回的图片URL不可用）
      const displayNews: DisplayNewsItem[] = aiNews.map((item: AINewsItem) => ({
        ...item,
        thumbnail: getCategoryThumbnail(item.category, item.industry)
      }));
      
      // 按时间排序：从最近到最远
      displayNews.sort((a, b) => {
        const dateA = new Date(a.publishDate).getTime();
        const dateB = new Date(b.publishDate).getTime();
        return dateB - dateA;
      });
      
      // 保存到缓存
      setCachedNews(displayNews);
      setNews(displayNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      // 如果获取失败但有缓存，保持显示缓存内容
      if (!cachedNews || cachedNews.length === 0) {
        toast.error('获取资讯失败，请稍后重试');
      }
    } finally {
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

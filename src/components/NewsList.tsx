import { useState, useEffect } from 'react';
import { NewsListItem } from './NewsListItem';
import { Newspaper, RefreshCw, Loader2 } from 'lucide-react';
import { searchNewsWithAI, AINewsItem } from '@/utils/ai';
import { Button } from '@/components/ui/button';
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

// Generate placeholder thumbnail based on category
function getCategoryThumbnail(category: string): string {
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
  };
  
  return thumbnails[category] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop';
}

export const NewsList = () => {
  const [news, setNews] = useState<DisplayNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const aiNews = await searchNewsWithAI();
      
      const displayNews: DisplayNewsItem[] = aiNews.map((item: AINewsItem) => ({
        ...item,
        thumbnail: getCategoryThumbnail(item.category)
      }));
      
      setNews(displayNews);
      
      if (showRefreshToast) {
        toast.success('资讯已更新');
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      toast.error('获取资讯失败，请稍后重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    fetchNews(true);
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">推荐资讯</h2>
          <span className="text-xs text-muted-foreground ml-2">AI 实时搜索 · 每日更新</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
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
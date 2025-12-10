import { newsData, NewsItem } from '@/data/news';
import { NewsListItem } from './NewsListItem';
import { Newspaper } from 'lucide-react';

export const NewsList = () => {
  // Display all news (in production, would filter by date and user preferences)
  const recentNews = newsData;

  return (
    <div className="bg-card rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Newspaper className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">推荐资讯</h2>
        <span className="text-xs text-muted-foreground ml-2">每日更新</span>
      </div>

      {/* News list */}
      <div className="px-4 divide-y divide-border">
        {recentNews.length > 0 ? (
          recentNews.map((news) => (
            <NewsListItem key={news.id} news={news} />
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

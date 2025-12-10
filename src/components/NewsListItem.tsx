import { NewsItem } from '@/data/news';
import { useNavigate } from 'react-router-dom';

interface NewsListItemProps {
  news: NewsItem;
}

export const NewsListItem = ({ news }: NewsListItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/news/${news.id}`, { state: { news } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return dateString;
  };

  return (
    <article 
      onClick={handleClick}
      className="flex gap-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors -mx-4 px-4"
    >
      {/* Text content - left side */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-foreground line-clamp-2 mb-2 leading-snug hover:text-primary transition-colors">
          {news.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {news.summary}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-primary/80">{news.category}</span>
          <span>·</span>
          <span>{news.source}</span>
          <span>·</span>
          <span>{formatDate(news.publishDate)}</span>
        </div>
      </div>

      {/* Thumbnail - right side */}
      <div className="flex-shrink-0">
        <img 
          src={news.thumbnail} 
          alt={news.title}
          className="w-[120px] h-[80px] object-cover rounded-md"
        />
      </div>
    </article>
  );
};

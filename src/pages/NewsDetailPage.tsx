import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsItem } from '@/data/news';

const NewsDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { news } = (location.state as { news: NewsItem }) || {};

  if (!news) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">新闻不存在</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">招商智能匹配 Agent</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Category badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <Tag className="h-3 w-3" />
            {news.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
          {news.title}
        </h1>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          <span>{news.source}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(news.publishDate)}
          </span>
        </div>

        {/* Featured image */}
        <div className="mb-8">
          <img 
            src={news.thumbnail.replace('w=200&h=150', 'w=800&h=400')} 
            alt={news.title}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>

        {/* Article content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {news.summary}
          </p>
          {news.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-foreground leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Related keywords */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">相关标签</h3>
          <div className="flex flex-wrap gap-2">
            {news.relatedKeywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsDetailPage;

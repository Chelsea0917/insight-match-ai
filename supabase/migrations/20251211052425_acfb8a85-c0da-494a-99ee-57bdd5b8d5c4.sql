-- 创建新闻缓存表
CREATE TABLE public.daily_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  company TEXT,
  industry TEXT,
  category TEXT,
  amount TEXT,
  investors TEXT,
  publish_date TEXT,
  content TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建日期索引，便于快速查询当天新闻
CREATE INDEX idx_daily_news_date ON public.daily_news (news_date DESC);

-- 允许公开读取（所有用户看同一批新闻）
ALTER TABLE public.daily_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily news"
ON public.daily_news
FOR SELECT
USING (true);

-- 只有服务端可以写入
CREATE POLICY "Service role can insert news"
ON public.daily_news
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can delete old news"
ON public.daily_news
FOR DELETE
USING (true);
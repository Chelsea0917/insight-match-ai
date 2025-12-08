import { MatchedCompany } from '@/types/company';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  matchedCompany: MatchedCompany;
  isSelected: boolean;
  onClick: () => void;
}

export function CompanyCard({ matchedCompany, isSelected, onClick }: CompanyCardProps) {
  const { company, match_score, match_reason } = matchedCompany;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-muted-foreground';
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected 
          ? "ring-2 ring-primary border-primary bg-primary/5" 
          : "hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{company.name}</h3>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {company.last_round}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{company.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{company.last_round_date.slice(0, 7)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{company.growth_stage}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {company.industry.map((ind, index) => (
                <Badge key={index} variant="outline" className="text-xs font-normal">
                  {ind}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs font-normal text-primary border-primary/30">
                {company.track}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {match_reason}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={cn("text-2xl font-bold", getScoreColor(match_score))}>
              {match_score}
            </div>
            <div className="w-16">
              <Progress 
                value={match_score} 
                className="h-1.5"
              />
            </div>
            <span className="text-xs text-muted-foreground">匹配度</span>
            <ChevronRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              isSelected && "text-primary rotate-90"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

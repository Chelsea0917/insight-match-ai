import { RequirementProfile } from '@/types/company';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Briefcase, TrendingUp, Clock, Star, Building } from 'lucide-react';

interface ParsedRequirementsProps {
  profile: RequirementProfile;
}

export function ParsedRequirements({ profile }: ParsedRequirementsProps) {
  const hasContent = 
    profile.region_preference.length > 0 ||
    profile.industry_preference.length > 0 ||
    profile.stage_preference.length > 0 ||
    profile.extra_preferences.length > 0 ||
    profile.time_window ||
    profile.scenario;

  if (!hasContent) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          AI 解析的筛选条件
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.region_preference.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[80px]">
              <MapPin className="h-4 w-4" />
              <span>目标地域</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.region_preference.map((region, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {region}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.industry_preference.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[80px]">
              <Briefcase className="h-4 w-4" />
              <span>行业/赛道</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.industry_preference.map((industry, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.stage_preference.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[80px]">
              <TrendingUp className="h-4 w-4" />
              <span>关注阶段</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.stage_preference.map((stage, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.time_window && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[80px]">
              <Clock className="h-4 w-4" />
              <span>时间范围</span>
            </div>
            <Badge variant="outline" className="font-normal">
              {profile.time_window}
            </Badge>
          </div>
        )}

        {profile.extra_preferences.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[80px]">
              <Star className="h-4 w-4" />
              <span>优先条件</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.extra_preferences.map((pref, index) => (
                <Badge key={index} variant="outline" className="font-normal text-primary border-primary/30">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.scenario && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-[80px]">
              <Building className="h-4 w-4" />
              <span>适配场景</span>
            </div>
            <Badge variant="outline" className="font-normal">
              {profile.scenario}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

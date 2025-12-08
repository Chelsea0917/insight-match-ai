import { useLocation, useNavigate } from 'react-router-dom';
import { Company, MatchedCompany } from '@/types/company';
import { CompanyDetail } from '@/components/CompanyDetail';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CompanyDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { company, matchInfo, requirementText } = location.state as {
    company: Company;
    matchInfo: MatchedCompany;
    requirementText: string;
  } || {};

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">未找到企业信息</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{company.name}</h1>
              <p className="text-sm text-muted-foreground">
                {company.city} · {company.track}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Match Score Badge */}
        {matchInfo && (
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <span className="text-sm font-medium text-primary">
                匹配度 {matchInfo.match_score}%
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{matchInfo.match_reason}</span>
          </div>
        )}

        {/* Company Detail */}
        <CompanyDetail
          company={company}
          requirementText={requirementText}
          onClose={() => navigate(-1)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            招商智能匹配 Agent Demo · 基于本地 Mock 数据演示
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CompanyDetailPage;

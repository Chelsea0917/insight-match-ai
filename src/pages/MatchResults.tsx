import { useLocation, useNavigate } from 'react-router-dom';
import { MatchedCompany, RequirementProfile } from '@/types/company';
import { CompanyList } from '@/components/CompanyList';
import { ParsedRequirements } from '@/components/ParsedRequirements';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MatchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { matchedCompanies, requirementProfile, requirementText } = location.state as {
    matchedCompanies: MatchedCompany[];
    requirementProfile: RequirementProfile;
    requirementText: string;
  } || { matchedCompanies: [], requirementProfile: null, requirementText: '' };

  const handleSelectCompany = (companyId: string) => {
    const matched = matchedCompanies.find(mc => mc.company_id === companyId);
    if (matched) {
      navigate(`/company/${companyId}`, {
        state: { 
          company: matched.company, 
          matchInfo: matched,
          requirementText 
        }
      });
    }
  };

  if (!requirementProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">请先输入招商需求</p>
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
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">匹配结果</h1>
              <p className="text-sm text-muted-foreground">
                共找到 {matchedCompanies.length} 家符合条件的企业
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Parsed Requirements Summary */}
        <div className="mb-6">
          <ParsedRequirements profile={requirementProfile} />
        </div>

        {/* Company List */}
        <div className="bg-card rounded-xl border border-border p-6">
          <CompanyList
            companies={matchedCompanies}
            selectedCompanyId={null}
            onSelectCompany={handleSelectCompany}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            招商智能匹配 Agent · AI 实时搜索
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MatchResults;

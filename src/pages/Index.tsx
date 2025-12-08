import { useState } from 'react';
import { RequirementProfile, MatchedCompany } from '@/types/company';
import { companies as companyData } from '@/data/companies';
import { analyzeRequirementWithAI, matchCompaniesWithAI } from '@/utils/ai';
import { RequirementInput } from '@/components/RequirementInput';
import { ParsedRequirements } from '@/components/ParsedRequirements';
import { CompanyList } from '@/components/CompanyList';
import { CompanyDetail } from '@/components/CompanyDetail';
import { Sparkles, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [requirementText, setRequirementText] = useState('');
  const [requirementProfile, setRequirementProfile] = useState<RequirementProfile | null>(null);
  const [matchedCompanies, setMatchedCompanies] = useState<MatchedCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitRequirement = async (requirement: string) => {
    setRequirementText(requirement);
    setIsLoading(true);
    setSelectedCompanyId(null);
    setMatchedCompanies([]);
    setRequirementProfile(null);

    try {
      // Step 1: Analyze requirement
      const profile = await analyzeRequirementWithAI(requirement);
      setRequirementProfile(profile);

      // Step 2: Match companies
      const matched = await matchCompaniesWithAI(profile, companyData);
      setMatchedCompanies(matched.slice(0, 10)); // Show top 10

      toast({
        title: "匹配完成",
        description: `找到 ${matched.length} 家符合条件的企业`,
      });
    } catch (error) {
      console.error('Matching failed:', error);
      toast({
        title: "匹配失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCompany = matchedCompanies.find(
    mc => mc.company_id === selectedCompanyId
  )?.company;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">招商智能匹配 Agent</h1>
              <p className="text-sm text-muted-foreground">AI 驱动的企业智能匹配系统</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Input & Parsed Requirements */}
          <div className="lg:col-span-5 space-y-6">
            {/* Input Section */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">输入招商需求</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                用自然语言描述您的招商需求，AI 将自动理解并匹配最合适的企业
              </p>
              <RequirementInput 
                onSubmit={handleSubmitRequirement}
                isLoading={isLoading}
              />
            </div>

            {/* Parsed Requirements */}
            {requirementProfile && (
              <ParsedRequirements profile={requirementProfile} />
            )}
          </div>

          {/* Right Panel - Company List */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="bg-card rounded-xl border border-border p-8">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                  <p className="text-muted-foreground">正在智能匹配企业...</p>
                  <p className="text-sm text-muted-foreground mt-1">AI 正在分析您的需求</p>
                </div>
              </div>
            ) : matchedCompanies.length > 0 ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <CompanyList
                  companies={matchedCompanies}
                  selectedCompanyId={selectedCompanyId}
                  onSelectCompany={setSelectedCompanyId}
                />
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    开始智能匹配
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    在左侧输入您的招商需求，AI 将自动分析并为您匹配最合适的企业
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Detail Panel */}
        {selectedCompany && (
          <div className="mt-6">
            <CompanyDetail
              company={selectedCompany}
              requirementText={requirementText}
              onClose={() => setSelectedCompanyId(null)}
            />
          </div>
        )}
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

export default Index;

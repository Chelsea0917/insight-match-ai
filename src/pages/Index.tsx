import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequirementProfile, MatchedCompany } from '@/types/company';
import { analyzeRequirementWithAI, searchCompaniesWithAI } from '@/utils/ai';
import { RequirementInput } from '@/components/RequirementInput';
import { NewsList } from '@/components/NewsList';
import { Sparkles, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmitRequirement = async (requirement: string) => {
    setIsLoading(true);

    try {
      // Step 1: Analyze requirement
      const profile = await analyzeRequirementWithAI(requirement);

      // Step 2: Search companies with AI (real-time generation)
      const matched = await searchCompaniesWithAI(profile);
      const topMatches = matched.slice(0, 10);

      toast({
        title: "匹配完成",
        description: `找到 ${topMatches.length} 家符合条件的企业`,
      });

      // Navigate to results page
      navigate('/results', {
        state: {
          matchedCompanies: topMatches,
          requirementProfile: profile,
          requirementText: requirement
        }
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Search Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              智能匹配目标企业
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              用自然语言描述您的招商需求，AI 将自动理解并匹配最合适的企业
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 md:p-6">
            <RequirementInput 
              onSubmit={handleSubmitRequirement}
              isLoading={isLoading}
            />
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 mt-4">
                <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">正在智能匹配企业...</p>
              </div>
            )}
          </div>

          {/* News Section */}
          <div className="mt-8">
            <NewsList />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            招商智能匹配 Agent · AI 实时搜索
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

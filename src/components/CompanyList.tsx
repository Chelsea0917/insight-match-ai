import { MatchedCompany } from '@/types/company';
import { CompanyCard } from './CompanyCard';

interface CompanyListProps {
  companies: MatchedCompany[];
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
}

export function CompanyList({ companies, selectedCompanyId, onSelectCompany }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无匹配结果</p>
        <p className="text-sm mt-1">请尝试调整您的需求描述</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">
          匹配到 <span className="text-primary">{companies.length}</span> 家企业
        </h3>
        <span className="text-sm text-muted-foreground">按匹配度排序</span>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {companies.map((matchedCompany) => (
          <CompanyCard
            key={matchedCompany.company_id}
            matchedCompany={matchedCompany}
            isSelected={selectedCompanyId === matchedCompany.company_id}
            onClick={() => onSelectCompany(matchedCompany.company_id)}
          />
        ))}
      </div>
    </div>
  );
}

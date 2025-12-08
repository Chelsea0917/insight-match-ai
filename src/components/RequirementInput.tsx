import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, Sparkles } from 'lucide-react';

interface RequirementInputProps {
  onSubmit: (requirement: string) => void;
  isLoading: boolean;
}

export function RequirementInput({ onSubmit, isLoading }: RequirementInputProps) {
  const [requirement, setRequirement] = useState('');

  const handleSubmit = () => {
    if (requirement.trim()) {
      onSubmit(requirement.trim());
    }
  };

  const examplePrompts = [
    "找2023年以后在长三角做AI医疗，完成A/B轮融资的公司",
    "适合深圳智能制造产业园的机器人企业，最好有头部基金投资",
    "华东地区新能源相关企业，处于快速增长期"
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="例：找过去一年在上海/苏州融资的 AI 医疗公司，最好有A/B轮，有头部基金投资，适合入驻创新园区。"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="min-h-[120px] resize-none text-base bg-background border-border focus:border-primary"
        />
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={!requirement.trim() || isLoading}
        className="w-full sm:w-auto gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            智能匹配中...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            智能匹配企业
          </>
        )}
      </Button>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground mb-2">试试这些示例：</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setRequirement(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-left"
            >
              {prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

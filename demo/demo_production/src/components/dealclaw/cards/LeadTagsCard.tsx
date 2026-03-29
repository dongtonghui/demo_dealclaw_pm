import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Tag, Loader2 } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  color: string;
}

interface Lead {
  id: string;
  company: string;
  tags: string[];
}

interface LeadTagsCardProps {
  data: {
    lead: Lead;
    availableTags: TagItem[];
  };
  onAction: (actionId: string, data?: any) => void;
}

const DEFAULT_COLORS = [
  'bg-red-100 text-red-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-orange-100 text-orange-800',
];

export function LeadTagsCard({ data, onAction }: LeadTagsCardProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(data.lead.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tagName));
  };

  const handleAddCustomTag = () => {
    if (!newTag.trim()) return;
    if (selectedTags.includes(newTag.trim())) return;
    
    setSelectedTags(prev => [...prev, newTag.trim()]);
    setNewTag('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    
    onAction('save-tags', {
      leadId: data.lead.id,
      tags: selectedTags,
    });
  };

  const getTagColor = (tagName: string): string => {
    const predefinedTag = data.availableTags.find(t => t.name === tagName);
    if (predefinedTag) return predefinedTag.color;
    
    // Generate consistent color for custom tags
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return DEFAULT_COLORS[hash % DEFAULT_COLORS.length];
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-500" />
          管理标签
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lead Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">{data.lead.company}</p>
        </div>

        {/* Current Tags */}
        <div>
          <h4 className="text-sm font-medium mb-2">当前标签</h4>
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-lg">
            {selectedTags.length === 0 ? (
              <span className="text-gray-400 text-sm">暂无标签</span>
            ) : (
              selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  className={`${getTagColor(tag)} cursor-pointer hover:opacity-80`}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                    aria-label="移除标签"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Available Tags */}
        <div>
          <h4 className="text-sm font-medium mb-2">可选标签</h4>
          <div className="flex flex-wrap gap-2">
            {data.availableTags
              .filter(tag => !selectedTags.includes(tag.name))
              .map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTags.includes(tag.name)
                      ? tag.color
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  {tag.name}
                </button>
              ))}
          </div>
        </div>

        {/* Add Custom Tag */}
        <div>
          <h4 className="text-sm font-medium mb-2">添加自定义标签</h4>
          <div className="flex gap-2">
            <Input
              placeholder="输入新标签"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
            />
            <Button onClick={handleAddCustomTag} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onAction('cancel-tags')}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              '保存标签'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

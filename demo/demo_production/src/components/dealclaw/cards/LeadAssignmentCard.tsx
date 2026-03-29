import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserPlus, Users, Briefcase, Loader2, User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  currentLeads: number;
  avatar?: string;
}

interface Lead {
  id: string;
  company: string;
  score: number;
  industry?: string;
  location?: string;
}

interface LeadAssignmentCardProps {
  data: {
    lead: Lead;
    teamMembers: TeamMember[];
  };
  onAction: (actionId: string, data?: any) => void;
}

export function LeadAssignmentCard({ data, onAction }: LeadAssignmentCardProps) {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedMember) return;
    
    setIsAssigning(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsAssigning(false);
    
    onAction('assign-lead', {
      leadId: data.lead.id,
      assignTo: selectedMember,
    });
  };

  const selectedMemberData = data.teamMembers.find(m => m.id === selectedMember);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-500" />
          分配线索
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lead Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{data.lead.company}</h4>
              <p className="text-sm text-gray-500">
                {data.lead.industry} {data.lead.location ? `· ${data.lead.location}` : ''}
              </p>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              评分: {data.lead.score}
            </Badge>
          </div>
        </div>

        {/* Team Member Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            选择团队成员
          </h4>
          
          <RadioGroup value={selectedMember} onValueChange={setSelectedMember}>
            <div className="space-y-3">
              {data.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMember === member.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMember(member.id)}
                >
                  <RadioGroupItem value={member.id} id={member.id} className="mr-3" />
                  
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={member.id} className="font-medium cursor-pointer">
                        {member.name}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{member.currentLeads} 个线索</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Selected Member Preview */}
        {selectedMemberData && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              将把 <strong>{data.lead.company}</strong> 分配给{' '}
              <strong>{selectedMemberData.name}</strong>，
              分配后该成员将负责跟进此线索。
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onAction('cancel-assignment')}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedMember || isAssigning}
            className="flex-1"
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分配中...
              </>
            ) : (
              '确认分配'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

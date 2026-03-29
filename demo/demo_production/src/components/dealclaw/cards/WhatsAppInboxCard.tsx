import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Search, 
  User, 
  Bot,
  Hand,
  Star,
  Clock,
  Phone
} from 'lucide-react';

interface WhatsAppConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'pending' | 'resolved' | 'handover';
  leadScore: number;
  avatar?: string;
}

interface WhatsAppInboxCardProps {
  data: {
    conversations: WhatsAppConversation[];
  };
  onAction: (actionId: string, data?: any) => void;
}

export function WhatsAppInboxCard({ data, onAction }: WhatsAppInboxCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-intent'>('all');

  const filteredConversations = useMemo(() => {
    let result = data.conversations || [];
    
    if (searchTerm) {
      result = result.filter(
        conv => 
          conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.customerPhone.includes(searchTerm) ||
          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter === 'unread') {
      result = result.filter(conv => conv.unreadCount > 0);
    } else if (filter === 'high-intent') {
      result = result.filter(conv => conv.leadScore >= 80);
    }
    
    return result.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [data.conversations, searchTerm, filter]);

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'handover': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return '进行中';
      case 'handover': return '人工处理';
      case 'pending': return '待回复';
      case 'resolved': return '已解决';
      default: return status;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            WhatsApp 统一收件箱
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {data.conversations?.length || 0} 个对话
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索对话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'unread', 'high-intent'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? '全部' : f === 'unread' ? '未读' : '高意向'}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedConversation === conversation.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{conversation.customerName}</span>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Phone className="w-3 h-3" />
                      {conversation.customerPhone}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(conversation.status)}>
                          {getStatusLabel(conversation.status)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={conversation.leadScore >= 80 ? 'bg-orange-100 text-orange-800' : ''}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {conversation.leadScore}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        {conversation.status !== 'handover' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction('whatsapp-handover', { conversationId: conversation.id });
                            }}
                          >
                            <Hand className="w-4 h-4 mr-1" />
                            人工接管
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction('view-conversation', { conversationId: conversation.id });
                          }}
                        >
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无对话</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

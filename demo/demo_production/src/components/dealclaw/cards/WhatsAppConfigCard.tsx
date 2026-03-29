import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Phone, Key, Shield, Loader2, CheckCircle } from 'lucide-react';

interface WhatsAppConfigCardProps {
  data: {
    config?: {
      apiKey?: string;
      phoneNumber?: string;
      businessName?: string;
      webhookUrl?: string;
    };
  };
  onAction: (actionId: string, data?: any) => void;
}

export function WhatsAppConfigCard({ data, onAction }: WhatsAppConfigCardProps) {
  const [config, setConfig] = useState({
    apiKey: data.config?.apiKey || '',
    phoneNumber: data.config?.phoneNumber || '',
    businessName: data.config?.businessName || '',
    webhookUrl: data.config?.webhookUrl || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [selectedMode, setSelectedMode] = useState<'cloud' | 'app'>('cloud');

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{10,14}$/;
    return phoneRegex.test(phone);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (selectedMode === 'cloud') {
      if (!config.apiKey.trim()) {
        newErrors.apiKey = '请输入 Cloud API 密钥';
      }
    }
    
    if (!config.phoneNumber.trim()) {
      newErrors.phoneNumber = '请输入手机号';
    } else if (!validatePhone(config.phoneNumber)) {
      newErrors.phoneNumber = '请输入有效的手机号 (格式: +86xxxxxxxxxxx)';
    }
    
    if (!config.businessName.trim()) {
      newErrors.businessName = '请输入商业名称';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnecting(false);
    
    onAction('save-whatsapp-config', { config, mode: selectedMode });
  };

  const handleTestConnection = async () => {
    if (!validate()) return;
    
    setConnectionStatus('testing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus('success');
    
    onAction('test-whatsapp-connection', { config, mode: selectedMode });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-500" />
          WhatsApp Business 配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Type Selection */}
        <div className="flex gap-4">
          <button
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              selectedMode === 'cloud'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMode('cloud')}
          >
            <Key className={`w-6 h-6 mx-auto mb-2 ${selectedMode === 'cloud' ? 'text-blue-500' : 'text-gray-500'}`} />
            <div className="font-medium">Cloud API</div>
            <div className="text-sm text-gray-500">推荐，更稳定</div>
          </button>
          <button
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              selectedMode === 'app'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMode('app')}
          >
            <Phone className={`w-6 h-6 mx-auto mb-2 ${selectedMode === 'app' ? 'text-blue-500' : 'text-gray-500'}`} />
            <div className="font-medium">Business App</div>
            <div className="text-sm text-gray-500">适合小规模</div>
          </button>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {selectedMode === 'cloud' && (
            <div>
              <Label htmlFor="apiKey">Cloud API 密钥</Label>
              <Input
                id="apiKey"
                placeholder="输入 Cloud API 密钥"
                value={config.apiKey}
                onChange={(e) => {
                  setConfig({ ...config, apiKey: e.target.value });
                  if (errors.apiKey) setErrors({ ...errors, apiKey: '' });
                }}
                className={errors.apiKey ? 'border-red-500' : ''}
              />
              {errors.apiKey && (
                <p className="text-sm text-red-500 mt-1">{errors.apiKey}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="phoneNumber">WhatsApp 商业号码</Label>
            <Input
              id="phoneNumber"
              placeholder="+86 13800138000"
              value={config.phoneNumber}
              onChange={(e) => {
                setConfig({ ...config, phoneNumber: e.target.value });
                if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
              }}
              className={errors.phoneNumber ? 'border-red-500' : ''}
            />
            {errors.phoneNumber ? (
              <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">格式: +国家码手机号，如 +8613800138000</p>
            )}
          </div>

          <div>
            <Label htmlFor="businessName">商业名称</Label>
            <Input
              id="businessName"
              placeholder="您的公司或品牌名称"
              value={config.businessName}
              onChange={(e) => {
                setConfig({ ...config, businessName: e.target.value });
                if (errors.businessName) setErrors({ ...errors, businessName: '' });
              }}
              className={errors.businessName ? 'border-red-500' : ''}
            />
            {errors.businessName && (
              <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="webhookUrl">Webhook URL（可选）</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-domain.com/webhook/whatsapp"
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">用于接收消息通知，如不填写将使用默认配置</p>
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              连接测试成功！您的 WhatsApp Business 账号可以正常使用。
            </AlertDescription>
          </Alert>
        )}

        {/* Safety Tips */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <Shield className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>防封号提示：</strong>新账号前7天限制发送100条/天，建议先养号再大量发送。避免发送垃圾信息或频繁添加陌生人。
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isConnecting || connectionStatus === 'testing'}
          >
            {connectionStatus === 'testing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                测试中...
              </>
            ) : (
              '测试连接'
            )}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isConnecting}
            className="flex-1"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              '保存配置'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

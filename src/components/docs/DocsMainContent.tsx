
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Play } from 'lucide-react';
import { toast } from 'sonner';

interface DocsMainContentProps {
  activeSection: string;
}

const codeExamples = {
  curl: (endpoint: string, method: string = 'GET', data?: string) => `curl --request ${method} \\
  --url https://api.hblackpix.com/${endpoint} \\
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN'${data ? ` \\
  --header 'Content-Type: application/json' \\
  --data '${data}'` : ''}`,
  
  python: (endpoint: string, method: string = 'GET', data?: string) => `import requests

url = "https://api.hblackpix.com/${endpoint}"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN"${data ? ',\n    "Content-Type": "application/json"' : ''}
}
${data ? `\ndata = ${data}` : ''}

response = requests.${method.toLowerCase()}(url, headers=headers${data ? ', json=data' : ''})
print(response.json())`,

  javascript: (endpoint: string, method: string = 'GET', data?: string) => `const response = await fetch('https://api.hblackpix.com/${endpoint}', {
  method: '${method}',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'${data ? ',\n    \'Content-Type\': \'application/json\'' : ''}
  }${data ? `,\n  body: JSON.stringify(${data})` : ''}
});

const data = await response.json();
console.log(data);`
};

export function DocsMainContent({ activeSection }: DocsMainContentProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'javascript'>('curl');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado para a área de transferência!');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Bem-vindo à API HBLACKPIX</h1>
              <p className="text-xl text-gray-400 mb-6">
                Uma API completa para gerenciamento de faturas, clientes e pagamentos integrada com WhatsApp Business API.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Autenticação</h3>
                <p className="text-gray-400 text-sm">
                  Use Bearer tokens para autenticar suas requisições à API.
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Rate Limiting</h3>
                <p className="text-gray-400 text-sm">
                  Limite de 1000 requisições por minuto por token.
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Webhooks</h3>
                <p className="text-gray-400 text-sm">
                  Receba notificações em tempo real sobre eventos importantes.
                </p>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">URL Base</h3>
              <div className="bg-gray-900 rounded-md p-4 font-mono text-green-400">
                https://api.hblackpix.com/v1
              </div>
            </div>
          </div>
        );

      case 'get-information':
        return (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-green-600 text-white">GET</Badge>
                <h1 className="text-3xl font-bold text-white">Get Information</h1>
              </div>
              <p className="text-gray-400">
                Recupera informações básicas sobre o status da API e configurações da instância.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Parâmetros de Path</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-blue-400">instance</code>
                        <Badge variant="outline" className="text-xs">string</Badge>
                        <Badge variant="destructive" className="text-xs">required</Badge>
                      </div>
                      <p className="text-gray-400 text-sm">ID da instância para conectar</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Response</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">200</Badge>
                      <span className="text-gray-400">application/json</span>
                    </div>
                    <div className="text-gray-400 text-sm">OK</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <code className="text-blue-400">status</code>
                    <span className="text-gray-400 ml-2">integer</span>
                    <p className="text-gray-400 text-sm mt-1">O status HTTP da resposta</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <code className="text-blue-400">message</code>
                    <span className="text-gray-400 ml-2">string</span>
                    <p className="text-gray-400 text-sm mt-1">Mensagem descritiva sobre o estado atual da API</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <code className="text-blue-400">version</code>
                    <span className="text-gray-400 ml-2">string</span>
                    <p className="text-gray-400 text-sm mt-1">A versão atual da API</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Exemplo de Requisição</h3>
                    <div className="flex gap-2">
                      {(['curl', 'python', 'javascript'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            selectedLanguage === lang
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'JavaScript'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{codeExamples[selectedLanguage]('info/YOUR_INSTANCE_ID', 'GET')}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples[selectedLanguage]('info/YOUR_INSTANCE_ID', 'GET'))}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Exemplo de Resposta</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-green-600">200</Badge>
                      <Button size="sm" variant="outline">
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-300">
{`{
  "status": 200,
  "message": "Welcome to the HBLACKPIX API. It is working!",
  "version": "1.7.4",
  "swagger": "https://api.hblackpix.com/docs",
  "manager": "https://api.hblackpix.com/manager",
  "documentation": "https://docs.hblackpix.com"
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Play size={14} className="mr-1" />
                      Try it
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink size={14} className="mr-1" />
                      Open in new tab
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'create-client':
        return (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-blue-600 text-white">POST</Badge>
                <h1 className="text-3xl font-bold text-white">Create Client</h1>
              </div>
              <p className="text-gray-400">
                Cria um novo cliente no sistema com todas as informações necessárias.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Parâmetros do Body</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-blue-400">nome</code>
                        <Badge variant="outline" className="text-xs">string</Badge>
                        <Badge variant="destructive" className="text-xs">required</Badge>
                      </div>
                      <p className="text-gray-400 text-sm">Nome completo do cliente</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-blue-400">email</code>
                        <Badge variant="outline" className="text-xs">string</Badge>
                        <Badge variant="destructive" className="text-xs">required</Badge>
                      </div>
                      <p className="text-gray-400 text-sm">Email válido do cliente</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-blue-400">telefone</code>
                        <Badge variant="outline" className="text-xs">string</Badge>
                        <Badge variant="secondary" className="text-xs">optional</Badge>
                      </div>
                      <p className="text-gray-400 text-sm">Número de telefone com código do país</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-blue-400">documento</code>
                        <Badge variant="outline" className="text-xs">string</Badge>
                        <Badge variant="secondary" className="text-xs">optional</Badge>
                      </div>
                      <p className="text-gray-400 text-sm">CPF ou CNPJ do cliente</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Exemplo de Requisição</h3>
                    <div className="flex gap-2">
                      {(['curl', 'python', 'javascript'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            selectedLanguage === lang
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'JavaScript'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{codeExamples[selectedLanguage]('clients', 'POST', `{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "telefone": "+5511999999999",
  "documento": "123.456.789-00"
}`)}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples[selectedLanguage]('clients', 'POST'))}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Exemplo de Resposta</h3>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-300">
{`{
  "success": true,
  "client": {
    "id": "client_123456",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "+5511999999999",
    "documento": "123.456.789-00",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Seção em Desenvolvimento</h1>
              <p className="text-gray-400">
                Esta seção da documentação está sendo desenvolvida. Em breve teremos mais informações disponíveis.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto p-8">
        {renderContent()}
      </div>
    </div>
  );
}

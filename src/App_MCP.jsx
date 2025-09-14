import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, RefreshCw, Users, FileText, Download, Upload, Search, Database, Brain, AlertCircle, CheckCircle, Clock, Trash2, Eye } from 'lucide-react';
import './App.css';

const BACKEND_URL = window.location.origin;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [aiStatus, setAiStatus] = useState('unknown');
  const [generatedDocuments, setGeneratedDocuments] = useState([]);
  
  // Estados MCP
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [indexStats, setIndexStats] = useState({});
  const [ragHealth, setRagHealth] = useState({});
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchClients();
    fetchDocuments();
    fetchIndexStats();
    checkRagHealth();
  }, []);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/clientes`);
      if (response.data.success) {
        setClients(response.data.clientes);
        setClientsCount(response.data.total);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/mcp/documents`);
      if (response.data.success) {
        setUploadedDocuments(response.data.documentos);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  const fetchIndexStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/search/index-stats`);
      if (response.data.success) {
        setIndexStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do índice:', error);
    }
  };

  const checkRagHealth = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rag/rag-health`);
      if (response.data.success) {
        setRagHealth(response.data.health);
      }
    } catch (error) {
      console.error('Erro ao verificar saúde do RAG:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setAiStatus('thinking');

    try {
      // Usar endpoint RAG se disponível
      const endpoint = ragHealth.overall_status ? '/api/rag/chat-with-rag' : '/api/generate-document';
      
      const response = await axios.post(`${BACKEND_URL}${endpoint}`, {
        prompt: inputMessage,
        user_id: 1,
        document_type: 'chat'
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response || 'Desculpe, não consegui gerar uma resposta.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        hasContext: response.data.has_context || false,
        contextLength: response.data.context_length || 0
      };

      setMessages(prev => [...prev, aiMessage]);
      setAiStatus('ready');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setAiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', '1');
        formData.append('categoria', 'upload');

        const response = await axios.post(`${BACKEND_URL}/api/mcp/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          console.log(`Arquivo ${file.name} enviado com sucesso`);
        }
      } catch (error) {
        console.error(`Erro ao enviar arquivo ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    fetchDocuments();
    fetchIndexStats();
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const searchDocuments = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/search/search`, {
        query: searchQuery,
        top_k: 10,
        threshold: 0.1,
        include_context: true
      });

      if (response.data.success) {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const indexDocuments = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/search/index-documents`, {
        rebuild: false
      });

      if (response.data.success) {
        console.log('Documentos indexados com sucesso');
        fetchIndexStats();
      }
    } catch (error) {
      console.error('Erro ao indexar documentos:', error);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/mcp/documents/${documentId}`);
      if (response.data.success) {
        fetchDocuments();
        fetchIndexStats();
      }
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PROCESSANDO':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'CONCLUIDO':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ERRO':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">POLARIS</h1>
              <span className="ml-2 text-sm text-gray-500">Wealth Planning AI + MCP</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status RAG */}
              <div className="flex items-center space-x-2">
                <Brain className={`w-4 h-4 ${ragHealth.overall_status ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm text-gray-600">
                  RAG: {ragHealth.overall_status ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              {/* Clientes */}
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">{clientsCount} clientes</span>
                <button
                  onClick={fetchClients}
                  disabled={isLoadingClients}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoadingClients ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* Documentos */}
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">
                  {indexStats.index_stats?.total_documents || 0} docs indexados
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat com IA
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Documentos MCP
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Busca Inteligente
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            
            {/* Tab: Chat */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Chat com IA</h2>
                  {ragHealth.overall_status && (
                    <p className="text-sm text-green-600">✓ RAG ativo - Respostas enriquecidas com documentos</p>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Olá! Sou o POLARIS, seu assistente especializado em wealth planning.</p>
                      <p className="text-sm mt-2">Como posso ajudá-lo hoje?</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.isError
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs opacity-70">{message.timestamp}</p>
                          {message.hasContext && (
                            <span className="text-xs bg-green-200 text-green-800 px-1 rounded">
                              RAG ({message.contextLength} chars)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                        <p className="text-sm">POLARIS está pensando...</p>
                        <div className="flex space-x-1 mt-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Documentos MCP */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Documentos MCP</h2>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4 inline mr-1" />
                        Upload
                      </button>
                      <button
                        onClick={indexDocuments}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        <Database className="w-4 h-4 inline mr-1" />
                        Indexar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {isUploading && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800 text-sm">Enviando arquivos...</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{doc.titulo}</h3>
                            <p className="text-sm text-gray-500">
                              {doc.tipo_arquivo} • {doc.tamanho_arquivo} bytes
                            </p>
                            <p className="text-xs text-gray-400">
                              Enviado em {new Date(doc.data_upload).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(doc.status_processamento)}
                            <span className="text-xs text-gray-500">{doc.status_processamento}</span>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {doc.indexado && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Indexado
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {uploadedDocuments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum documento enviado ainda</p>
                        <p className="text-sm">Faça upload de PDFs, DOCs ou TXTs para enriquecer o contexto da IA</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Busca Inteligente */}
            {activeTab === 'search' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Busca Inteligente</h2>
                  <p className="text-sm text-gray-500">Busque por similaridade semântica nos documentos</p>
                </div>
                
                <div className="p-4">
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchDocuments()}
                      placeholder="Digite sua busca..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={searchDocuments}
                      disabled={isSearching || !searchQuery.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {isSearching && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {searchResults.map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{result.titulo}</h3>
                          <span className="text-sm text-blue-600 font-medium">
                            {(result.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{result.fonte}</p>
                        {result.texto_preview && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {result.texto_preview}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-400">
                            Tipo: {result.tipo} • Rank: #{result.rank}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {searchResults.length === 0 && searchQuery && !isSearching && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum resultado encontrado</p>
                        <p className="text-sm">Tente termos diferentes ou mais específicos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Clientes */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clientes</h3>
              <div className="space-y-2">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.nome_completo}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>
                    <p className="text-xs text-green-600 font-medium">
                      ${client.patrimonio_total?.toLocaleString() || '0'}
                    </p>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum cliente encontrado</p>
                )}
              </div>
            </div>

            {/* Estatísticas MCP */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas MCP</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Documentos Indexados</span>
                  <span className="text-sm font-medium">{indexStats.index_stats?.total_documents || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Documentos Processados</span>
                  <span className="text-sm font-medium">{indexStats.database_stats?.documentos_processados || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fontes Tributárias</span>
                  <span className="text-sm font-medium">{indexStats.database_stats?.fontes_processadas || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vocabulário</span>
                  <span className="text-sm font-medium">{indexStats.index_stats?.vectorizer_vocabulary_size || 0}</span>
                </div>
              </div>
            </div>

            {/* Status RAG */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Status RAG</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Claude Service</span>
                  <div className={`w-3 h-3 rounded-full ${ragHealth.claude_service ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Key</span>
                  <div className={`w-3 h-3 rounded-full ${ragHealth.api_key_configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Embedding Service</span>
                  <div className={`w-3 h-3 rounded-full ${ragHealth.embedding_service ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Search Index</span>
                  <div className={`w-3 h-3 rounded-full ${ragHealth.search_index ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className={`text-sm font-medium ${ragHealth.overall_status ? 'text-green-600' : 'text-red-600'}`}>
                  Status Geral: {ragHealth.overall_status ? 'Operacional' : 'Indisponível'}
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documento
                </button>
                <button 
                  onClick={indexDocuments}
                  className="w-full bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 flex items-center justify-center"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Indexar Documentos
                </button>
                <button 
                  onClick={checkRagHealth}
                  className="w-full bg-purple-500 text-white py-2 px-3 rounded text-sm hover:bg-purple-600 flex items-center justify-center"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Verificar RAG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


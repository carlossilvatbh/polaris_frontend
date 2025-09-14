import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Send, FileText, Users, Brain } from 'lucide-react'
import axios from 'axios'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m POLARIS, your AI assistant for wealth planning and legal document generation. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Simulated responses for demo
  const simulatedResponses = [
    "I understand you need assistance with wealth planning. Let me analyze your requirements and suggest the best structure for your client.",
    "Based on the information provided, I recommend considering a Delaware LLC structure with a Cayman feeder for international tax optimization.",
    "For estate planning purposes, we should explore setting up an Irrevocable Life Insurance Trust (ILIT) to minimize estate taxes.",
    "I can help you generate the necessary legal documents. Would you like me to create a trust agreement or corporate structure documents?",
    "Let me review the latest tax regulations and treaty benefits that might apply to your client's situation."
  ]

  // Fetch clients from backend
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      // Using user_id = 1 for demo purposes
      const response = await axios.get('http://localhost:5000/api/clientes?user_id=1&per_page=5')
      setClients(response.data.clientes || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      // Add a demo client if backend is not available
      setClients([
        { id: 1, nome_completo: 'Demo Client', email: 'demo@example.com', patrimonio_total: 5000000 }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Simulate AI response after a delay
    setTimeout(() => {
      const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)]
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">POLARIS</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Wealth Planning Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">{clients.length}</span> Clients Connected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Chat Column */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>AI Legal Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about wealth planning, tax structures, or legal documents..."
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Clients Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Recent Clients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading clients...</p>
                  </div>
                ) : clients.length > 0 ? (
                  <div className="space-y-3">
                    {clients.map((client) => (
                      <div key={client.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {client.nome_completo}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                        {client.patrimonio_total && (
                          <p className="text-xs text-green-600 font-medium">
                            ${client.patrimonio_total.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full" onClick={fetchClients}>
                      Refresh Clients
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No clients found</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={fetchClients}>
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Viewer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>Document Viewer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">No document selected</p>
                  <p className="text-xs text-gray-400">
                    Generated documents will appear here for review and download
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  New Trust Document
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Tax Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App


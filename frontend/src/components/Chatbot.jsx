import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Bot, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api, getApiErrorMessage } from "@/lib/api"

export function Chatbot({ isOpen, onClose, context }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: "bot", text: "Hello! How can I help you with your schedule today?" }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const currentInput = inputValue
    setMessages((prev) => [...prev, { sender: "user", text: currentInput }])
    setInputValue("")
    setIsLoading(true)

    try {
      const res = await api.post("/api/ai/chat", {
        message: currentInput,
        context,
      })

      setMessages((prev) => [...prev, { sender: "bot", text: res.data.response }])
    } catch (error) {
      console.error("Chatbot API error:", error)
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: getApiErrorMessage(error, "Sorry, I'm having trouble connecting. Please try again later.") },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Card className="fixed inset-x-3 bottom-20 z-50 flex h-[70vh] max-h-[640px] flex-col rounded-2xl border border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-8 sm:bottom-24 sm:w-96">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/80 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-900 p-2">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900">Scheduler Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-600">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`prose prose-sm max-w-[80%] rounded-xl p-3 ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white prose-invert"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <ReactMarkdown components={{ p: (props) => <p className="my-0" {...props} /> }}>
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end justify-start gap-2">
            <div className="max-w-[80%] rounded-xl bg-slate-100 p-3 text-slate-800">
              <p className="text-sm animate-pulse">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="border-t border-slate-200/80 bg-slate-50 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about schedules..."
            autoComplete="off"
            disabled={isLoading}
            className="h-10 rounded-full border-slate-300 bg-white focus-visible:ring-slate-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  )
}



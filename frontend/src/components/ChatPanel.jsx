
import { useEffect, useState } from 'react'
import { initialChatMessages } from '../data/mockData'

const API_URL = 'http://localhost:8000'
const THREAD_STORAGE_KEY = 'bess-ai-current-thread'
const CONVERSATIONS_STORAGE_KEY = 'bess-ai-conversations'

function createThreadId() {
  return crypto.randomUUID()
}

function loadWorkspace() {
  const savedThreadId = localStorage.getItem(THREAD_STORAGE_KEY)

  let conversations = []

  try {
    const saved = JSON.parse(
      localStorage.getItem(CONVERSATIONS_STORAGE_KEY) || '[]',
    )

    if (Array.isArray(saved)) {
      conversations = saved.filter(
        (conversation) =>
          typeof conversation.id === 'string' &&
          Array.isArray(conversation.messages),
      )
    }
  } catch {
    conversations = []
  }

  if (conversations.length === 0) {
    const id = savedThreadId || createThreadId()

    conversations = [
      {
        id,
        title: 'Current conversation',
        messages: initialChatMessages,
        updatedAt: new Date().toISOString(),
      },
    ]

    return { conversations, activeThreadId: id }
  }

  const activeExists = conversations.some(
    (conversation) => conversation.id === savedThreadId,
  )

  return {
    conversations,
    activeThreadId: activeExists
      ? savedThreadId
      : conversations[0].id,
  }
}

export default function ChatPanel() {
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { conversations, activeThreadId } = workspace

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeThreadId,
  )

  const messages = activeConversation?.messages ?? []

  useEffect(() => {
    localStorage.setItem(
      CONVERSATIONS_STORAGE_KEY,
      JSON.stringify(workspace.conversations),
    )
    localStorage.setItem(THREAD_STORAGE_KEY, workspace.activeThreadId)
  }, [workspace])

  function handleNewConversation() {
    if (loading) return

    const id = createThreadId()

    setWorkspace((current) => ({
      conversations: [
        {
          id,
          title: 'New conversation',
          messages: [],
          updatedAt: new Date().toISOString(),
        },
        ...current.conversations,
      ],
      activeThreadId: id,
    }))

    setQuestion('')
    setError('')
  }

  function handleSelectConversation(id) {
    if (loading) return

    setWorkspace((current) => ({
      ...current,
      activeThreadId: id,
    }))

    setQuestion('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || loading) return

    const threadId = activeThreadId

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setWorkspace((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === threadId
          ? {
              ...conversation,
              title:
                conversation.title === 'New conversation' ||
                conversation.title === 'Current conversation'
                  ? trimmedQuestion.slice(0, 36)
                  : conversation.title,
              messages: [...conversation.messages, userMessage],
              updatedAt: new Date().toISOString(),
            }
          : conversation,
      ),
    }))

    setQuestion('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          thread_id: threadId,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`)
      }

      const data = await response.json()

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      setWorkspace((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === threadId
            ? {
                ...conversation,
                messages: [...conversation.messages, assistantMessage],
                updatedAt: new Date().toISOString(),
              }
            : conversation,
        ),
      }))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to reach the BESS API.',
      )
    } finally {
      setLoading(false)
    }
  }

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  )

  return (
    <aside className="chat-panel" aria-labelledby="chat-panel-title">
      <div className="chat-panel-header">
        <h2 id="chat-panel-title" className="panel-title">
          AI Sidekick
        </h2>
        <p className="panel-subtitle">
          Ask about rack health, trends, and alerts
        </p>

        <button
          type="button"
          className="btn-send"
          onClick={handleNewConversation}
          disabled={loading}
        >
          + New Conversation
        </button>

        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
            Conversation History
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '150px',
              overflowY: 'auto',
            }}
          >
            {sortedConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className="btn-send"
                onClick={() => handleSelectConversation(conversation.id)}
                disabled={loading}
                aria-current={
                  conversation.id === activeThreadId ? 'true' : undefined
                }
                style={{
                  textAlign: 'left',
                  opacity:
                    conversation.id === activeThreadId ? 1 : 0.75,
                  fontWeight:
                    conversation.id === activeThreadId ? 700 : 400,
                }}
              >
                {conversation.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-messages" role="log" aria-label="Chat message history">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message chat-message--${message.role}`}
          >
            <div className="chat-message-meta">
              <span className="chat-message-role">
                {message.role === 'user' ? 'Operator' : 'Assistant'}
              </span>
              <time className="chat-message-time">{message.timestamp}</time>
            </div>
            <p className="chat-message-body">{message.content}</p>
          </div>
        ))}

        {loading && (
          <p role="status" className="chat-composer-hint">
            AI Sidekick is thinking…
          </p>
        )}
      </div>

      <form
        className="chat-composer"
        onSubmit={handleSubmit}
        aria-label="Send a message to the AI sidekick"
      >
        <label className="visually-hidden" htmlFor="chat-input">
          Message
        </label>
        <textarea
          id="chat-input"
          className="chat-input"
          rows={3}
          placeholder="Ask about telemetry, anomalies, or recommended checks…"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={loading}
          aria-describedby="chat-composer-hint"
        />

        <div className="chat-composer-actions">
          <p id="chat-composer-hint" className="chat-composer-hint">
            {error || 'Connected to the local BESS AI API'}
          </p>
          <button
            type="submit"
            className="btn-send"
            disabled={loading || !question.trim()}
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </aside>
  )
}

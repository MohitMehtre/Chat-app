import { useEffect, useRef, useState } from "react"

function App() {

  const [messages, setMessages] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null);
  const messRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8080`)
    ws.onmessage = (event) => {
      setMessages(m => [...m,  event.data])
    }
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        payload: {
          roomId: "red"
        }
      }))
    }
    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="h-screen bg-black flex flex-col justify-between">
      <div className="text-black">
        {messages.map(message => <div className="mt-8"><span className="bg-white text-black rounded-4xl p-3">{message}</span></div>)}
      </div>
      <div className="w-full bg-white flex rounded-2xl">
        <input type="text" ref={messRef} className="flex-1 p-4"/>
        <button onClick={() => {
          if(!messRef.current || !wsRef.current) return
          const message = messRef.current.value
          wsRef.current.send(JSON.stringify({
            type: "chat",
            payload: {
              message: message
            }
          }))
        }} className="h-full bg-blue-700 text-white p-4 cursor-pointer hover:bg-blue-500 rounded-2xl"> Send Message</button>
      </div>

    </div>
  )
}

export default App

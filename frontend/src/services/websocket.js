//src/services/WebSocket.js
class WebSocketService {
    constructor() {
        this.socket = null
        this.listeners = new Map()
    }

    connect(url) {
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
            console.log('WebSocket connected')
            this.notifyListeners('connect', { connected: true })
        }

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                this.notifyListeners('message', data)
            } catch (error) {
                console.error('Error parsing WebSocket message:', error)
            }
        }

        this.socket.onclose = () => {
            console.log('WebSocket disconnected')
            this.notifyListeners('disconnect', { connected: false })
        }

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error)
            this.notifyListeners('error', error)
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event).add(callback)
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback)
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data)
                } catch (error) {
                    console.error('Error in WebSocket listener:', error)
                }
            })
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data))
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close()
        }
    }
}

export const websocketService = new WebSocketService()
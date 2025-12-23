// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from '../contexts/AuthContext'

export const useWebSocket = (onMessage) => {
    const [isConnected, setIsConnected] = useState(false)
    const clientRef = useRef(null)
    const { user } = useAuth()

    // ✅ onMessage ko stable rakhne ke liye ref
    const onMessageRef = useRef(onMessage)
    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        if (!user) {
            console.log('❌ No user found for WebSocket connection')
            return
        }

        // Agar already active client hai to dobara mat banao
        if (clientRef.current && clientRef.current.active) {
            console.log('ℹ️ WebSocket client already active, skipping new connection')
            return
        }

        const websocketUrl = 'http://localhost:8083/ws'
        console.log('🔄 Connecting to WebSocket:', websocketUrl)

        const client = new Client({
            webSocketFactory: () => new SockJS(websocketUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            debug: (msg) => {
                console.log('[STOMP DEBUG]', msg)
            },

            // Agar token chahiye to yahan set karo
            connectHeaders: (() => {
                const token = user?.token || user?.accessToken || user?.jwt || null
                if (token) {
                    console.log('🔐 Adding Authorization header to STOMP CONNECT')
                    return { Authorization: `Bearer ${token}` }
                }
                return {}
            })(),

            onConnect: (frame) => {
                console.log('✅ WebSocket & STOMP connected for user:', user.userId, frame)
                setIsConnected(true)

                const userTopic = '/user/queue/progress'
                console.log('🎯 Subscribing to user topic:', userTopic)

                const userSub = client.subscribe(userTopic, (message) => {
                    try {
                        const data = JSON.parse(message.body)
                        if (onMessageRef.current) {
                            onMessageRef.current(data)
                        }
                    } catch (error) {
                        console.error('❌ Error parsing WebSocket message:', error)
                        console.log('Raw message:', message.body)
                    }
                })

                const globalSub = client.subscribe('/topic/migration-progress', (message) => {
                    try {
                        const data = JSON.parse(message.body)
                        if (onMessageRef.current) {
                            onMessageRef.current(data)
                        }
                    } catch (error) {
                        console.error('❌ Error parsing global WebSocket message:', error)
                    }
                })

                client.userSubscription = userSub
                client.globalSubscription = globalSub
            },

            onDisconnect: (frame) => {
                console.log('❌ STOMP disconnected', frame)
                setIsConnected(false)
            },

            onStompError: (frame) => {
                console.error('❌ WebSocket STOMP error:', frame)
                setIsConnected(false)
            },

            onWebSocketOpen: (evt) => {
                console.log('🟢 underlying WebSocket opened', evt)
            },

            onWebSocketClose: (evt) => {
                console.warn('🟠 underlying WebSocket closed', evt)
                setIsConnected(false)
            },

            onWebSocketError: (evt) => {
                console.error('🔴 underlying WebSocket error', evt)
                setIsConnected(false)
            }
        })

        clientRef.current = client
        client.activate()

        // ✅ Cleanup sirf yahan se
        return () => {
            console.log('🧹 Cleaning up websocket client (effect cleanup)')
            try {
                if (client.userSubscription) client.userSubscription.unsubscribe()
                if (client.globalSubscription) client.globalSubscription.unsubscribe()
                client.deactivate()
            } catch (err) {
                console.warn('⚠️ Error while cleaning websocket client', err)
            } finally {
                clientRef.current = null
                setIsConnected(false)
            }
        }
    }, [user?.userId]) // ✅ sirf user change pe reconnect

    const sendMessage = useCallback((destination, message) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(message)
            })
            console.log('📤 Sent WebSocket message to:', destination, message)
            return true
        } else {
            console.log('❌ WebSocket not connected, cannot send message')
            return false
        }
    }, [])

    const reconnect = useCallback(() => {
        console.log('🔁 Manual reconnect called')
        if (clientRef.current) {
            try {
                clientRef.current.deactivate()
            } catch (e) {
                console.warn('⚠️ Error during manual deactivate', e)
            } finally {
                clientRef.current = null
            }
        }
        // Next render pe effect fir se client banayega (user same rahega to bhi ok)
    }, [])

    return {
        isConnected,
        sendMessage,
        reconnect
    }
}



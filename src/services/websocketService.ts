import { EventEmitter } from 'events';

interface ChatMessage {
    username: string;
    displayName: string;
    timestamp: number;
    text: string;
    avatar: string;
    eventTypeId: number;
}

type LLMCallback = (message: string, username?: string, isFromStream?: boolean) => Promise<{
    processed: boolean;
    error?: string;
}>;

export class WebSocketService extends EventEmitter {
    private ws: WebSocket | null = null;
    private currentToken: string | null = null;
    private llmCallback: LLMCallback | null = null;
    private reconnectionPromise: Promise<void> | null = null;
    private isReconnecting: boolean = false;
    
    private messageQueue: ChatMessage[] = [];
    private isProcessing: boolean = false;
    private batchTimeout: NodeJS.Timeout | null = null;
    private readonly BATCH_DELAY = 1000;
    
    constructor() {
        super();
    }

    setLLMCallback(callback: LLMCallback) {
        this.llmCallback = callback;
    }

    connect(accessToken: string) {
        this.currentToken = accessToken;
        const url = `wss://chat.api.restream.io/ws?accessToken=${accessToken}`;
        this.ws = new WebSocket(url);
        this.setupEventHandlers();
    }

    private handleWebSocketMessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            this.emit('rawMessage', data);
            
            if (data.action === 'event' && 
                (data.payload.eventTypeId === 24 || data.payload.eventTypeId === 4)) {
                this.handleChatMessage(data);
            }
        } catch (err) {
            console.error('Error parsing message:', err);
        }
    };

    private handleWebSocketClose = () => {
        if (!this.isReconnecting) {
            this.emit('connectionChange', false);
        }
    };

    private handleWebSocketError = (error: Event) => {
        console.error('WebSocket error:', error);
        this.emit('connectionChange', false);
    };

    private handleWebSocketOpen = () => {
        console.log('WebSocket connection established');
        this.emit('connectionChange', true);
    };

    private setupEventHandlers() {
        if (!this.ws) return;

        this.ws.onmessage = this.handleWebSocketMessage;
        this.ws.onclose = this.handleWebSocketClose;
        this.ws.onerror = this.handleWebSocketError;
        this.ws.onopen = this.handleWebSocketOpen;
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.batchTimeout) {
            clearInterval(this.batchTimeout);
            this.batchTimeout = null;
        }
    }

    isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    public handleChatMessage(data: any) {
        const payload = data.payload;
        const messageData = payload.eventPayload;
        
        const chatMessage: ChatMessage = {
            username: messageData.author.username,
            displayName: messageData.author.displayName,
            timestamp: data.timestamp,
            text: messageData.text,
            avatar: messageData.author.avatar,
            eventTypeId: payload.eventTypeId
        };
        
        this.emit('chatMessage', chatMessage);
        this.queueMessage(chatMessage);
    }

    private queueMessage(message: ChatMessage) {
        this.messageQueue.push(message);
        
        if (!this.batchTimeout) {
            this.batchTimeout = setInterval(() => {
                this.processMessageQueue();
            }, this.BATCH_DELAY);
        }
    }

    private async processMessageQueue() {
        if (this.isProcessing || this.messageQueue.length === 0 || !this.llmCallback) {
            return;
        }

        this.isProcessing = true;
        
        const messagesToProcess = [...this.messageQueue];
        this.messageQueue = this.messageQueue.slice(messagesToProcess.length);

        try {
            const formattedMessages = messagesToProcess
                .map(msg => `${msg.displayName}: ${msg.text}`)
                .join('\n');

            console.log(`Processing ${messagesToProcess.length} messages in batch`);
            
            const prompt = `Received these messages from your livestream, please respond:\n${formattedMessages}`;
            
            // Pass username and flag indicating this is from stream
            const result = await this.llmCallback(prompt, messagesToProcess[0].displayName, true);
            if (!result.processed) {
                console.log(`Message processing skipped: ${result.error}`);
                this.messageQueue = [...messagesToProcess, ...this.messageQueue];
            }
        } catch (error) {
            console.error('Error processing message queue:', error);
            this.messageQueue = [...messagesToProcess, ...this.messageQueue];
        } finally {
            this.isProcessing = false;
        }
    }

    async reconnectWithNewToken(newToken: string) {
        if (this.reconnectionPromise) {
            await this.reconnectionPromise;
            if (this.currentToken === newToken) {
                return;
            }
        }

        this.reconnectionPromise = (async () => {
            console.log('Reconnecting with new token');
            this.isReconnecting = true;
            
            try {
                const url = `wss://chat.api.restream.io/ws?accessToken=${newToken}`;
                const newWs = new WebSocket(url);
                
                await new Promise((resolve, reject) => {
                    newWs.onopen = () => {
                        console.log('WebSocket connection established with new token');
                        resolve(true);
                    };
                    newWs.onerror = (error) => reject(error);
                });

                this.currentToken = newToken;

                if (this.ws) {
                    console.log('Closing old connection');
                    this.ws.onclose = null;
                    this.ws.close();
                }

                this.ws = newWs;
                this.setupEventHandlers();
                this.emit('connectionChange', true);

                console.log('Finished reconnecting with new token');
            } finally {
                this.isReconnecting = false;
                this.reconnectionPromise = null;
            }
        })();

        await this.reconnectionPromise;
    }
}

export const websocketService = new WebSocketService();

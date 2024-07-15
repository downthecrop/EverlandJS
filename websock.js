const WebSocket = require('ws');
const protobuf = require('protobufjs');
const Long = require('long');
const MessageOpcode = require('./opcodes');

const server = new WebSocket.Server({ port: 8080 });


const players = new Map();
const chatHistory = [];
let playerCounter = 0;
let messageCounter = 0;

function createMessageWithHeader(opcode, messageBuffer) {
    const header = Buffer.alloc(8);
    header.writeUInt32LE(opcode, 0);
    header.writeUInt32LE(messageBuffer.length, 4);
    return Buffer.concat([header, messageBuffer]);
}

function sendMessage(ws, opcode, message) {
    const messageBuffer = message.constructor.encode(message).finish();
    const responseWithHeader = createMessageWithHeader(opcode, messageBuffer);
    ws.send(responseWithHeader, { binary: true });
    console.log("Sent:", message.constructor.name, message);
    console.log("Sent Raw: Opcode", opcode, responseWithHeader.toString('hex'));
}

function broadcastMessage(opcode, message, excludeWs = null) {
    const messageBuffer = message.constructor.encode(message).finish();
    const responseWithHeader = createMessageWithHeader(opcode, messageBuffer);
    players.forEach(player => {
        if (player.ws.readyState === WebSocket.OPEN && player.ws !== excludeWs) {
            player.ws.send(responseWithHeader, { binary: true });
        }
    });
    console.log("Broadcasted:", message.constructor.name, message);
}

protobuf.load("messages.proto", (err, root) => {
    if (err) throw err;

    const PingMessage = root.lookupType("myPackage.PingMessage");
    const PongMessage = root.lookupType("myPackage.PongMessage");
    const EstablishSessionRequest = root.lookupType("myPackage.EstablishSessionRequest");
    const EstablishSessionResponse = root.lookupType("myPackage.EstablishSessionResponse");
    const AccountInfo = root.lookupType("myPackage.AccountInfo");
    const CharacterInfo = root.lookupType("myPackage.CharacterInfo");
    const CharacterAppearance = root.lookupType("myPackage.CharacterAppearance");
    const PlayerState = root.lookupType("myPackage.PlayerState");
    const Vector2 = root.lookupType("myPackage.Vector2");
    const PlayerMoveCommand = root.lookupType("myPackage.PlayerMoveCommand");
    const EntityJoinedEvent = root.lookupType("myPackage.EntityJoinedEvent");
    const WrappedEntityState = root.lookupType("myPackage.WrappedEntityState");
    const GetChannelsResponse = root.lookupType("myPackage.GetChannelsResponse");
    const SendMessageToChannelRequest = root.lookupType("myPackage.SendMessageToChannelRequest");
    const UpdateChannelRequest = root.lookupType("myPackage.UpdateChannelRequest");
    const ChannelMessageEvent = root.lookupType("myPackage.ChannelMessageEvent");
    const AcknowledgeChannelMessageRequest = root.lookupType("myPackage.AcknowledgeChannelMessageRequest");
    const SubscribedToChannelEvent = root.lookupType("myPackage.SubscribedToChannelEvent");
    const ChannelMessageAcknowledgedEvent = root.lookupType("myPackage.ChannelMessageAcknowledgedEvent");
    const ChannelSubscriber = root.lookupType("myPackage.ChannelSubscriber");
    const ChannelMessage = root.lookupType("myPackage.ChannelMessage");
    const UpdateChannelResponse = root.lookupType("myPackage.UpdateChannelResponse");
    const ChannelInfo = root.lookupType("myPackage.ChannelInfo");
    const GameSessionOpenedEvent = root.lookupType("myPackage.GameSessionOpenedEvent");
    const MobileMovedEvent = root.lookupType("myPackage.MobileMovedEvent");
    const CharacterLoadoutUpdatedEvent = root.lookupType("myPackage.CharacterLoadoutUpdatedEvent");
    const FacingDirection = root.lookupEnum("myPackage.FacingDirection");

    server.on('connection', (ws) => {
        const playerId = ++playerCounter;
        const playerName = `Crop${playerId}`;

        // Initialize player object
        const player = {
            id: playerId,
            name: playerName,
            position: { x: 0, y: 0 },
            ws: ws
        };
        players.set(playerId, player);

        ws.on('message', (data) => {
            console.log('Received raw data:', data.toString('hex'));

            if (data.length === 0) {
                console.log('Received an empty message, ignoring.');
                return;
            }

            let header = Buffer.alloc(0);
            let opcode = 0;

            if (data.length > 8) {
                header = data.slice(0, 8);
                data = data.slice(8);
                opcode = header.readUInt32LE(0);
                console.log('Received opcode:', opcode);
            }

            switch (opcode) {
                case MessageOpcode.PingMessage: {
                    try {
                        const message = PingMessage.decode(data);
                        console.log('Received PingMessage:', message);

                        const pongMessage = PongMessage.create({
                            clientTimestamp: message.clientTimestamp,
                            serverTimestamp: Long.fromString(Date.now().toString()),
                            isMasterClock: true
                        });

                        sendMessage(ws, MessageOpcode.PongMessage, pongMessage);
                        return;
                    } catch (err) {
                        console.error("Error processing PingMessage:", err);
                    }
                    break;
                }
                case MessageOpcode.EstablishSessionRequest: {
                    try {
                        const message = EstablishSessionRequest.decode(data);
                        console.log('Received EstablishSessionRequest:', message);

                        let appearance = [CharacterAppearance.create({
                            part: 1,
                            value: Long.fromString("76773426565103630")
                        }), CharacterAppearance.create({
                            part: 2,
                            value: Long.fromString("76773426451857435")
                        }), CharacterAppearance.create({
                            part: 3,
                            value: Long.fromString("76773426334416913")
                        }), CharacterAppearance.create({
                            part: 5,
                            value: Long.fromString("76773425881432070")
                        }), CharacterAppearance.create({
                            part: 7,
                            value: Long.fromString("76773426363777052")
                        }), CharacterAppearance.create({
                            part: 8,
                            value: Long.fromString("76773426460246021")
                        })]

                        const mockAccount = AccountInfo.create({
                            accountId: playerId,
                            email: `${playerName}@test`
                        });

                        const mockCharacter = CharacterInfo.create({
                            characterId: playerId,
                            name: playerName,
                            createdTimestamp: Long.fromString(Date.now().toString()),
                            appearance: appearance
                        });

                        const payload = EstablishSessionResponse.create({
                            success: true,
                            clientTimestamp: message.clientTimestamp,
                            masterTimestamp: Long.fromString(Date.now().toString()),
                            account: mockAccount,
                            character: mockCharacter
                        });

                        sendMessage(ws, MessageOpcode.EstablishSessionResponse, payload);

                        const playerState = PlayerState.create({
                            position: Vector2.create({ x: player.position.x, y: player.position.y }),
                            facingDirection: FacingDirection.FACING_DIRECTION_EAST,
                            gameSessionId: playerId,
                            accountId: playerId,
                            characterId: playerId,
                            displayName: playerName,
                            appearance: appearance
                        });

                        const wrappedEntityState = WrappedEntityState.create({
                            type: 5,
                            data: PlayerState.encode(playerState).finish()
                        });

                        const gameSessionOpenedEvent = GameSessionOpenedEvent.create({
                            accountId: playerId,
                            characterId: playerId,
                            entityId: playerId,
                            wrappedEntityState: wrappedEntityState,
                            channelId: 1,
                            mapId: 1
                        });

                        sendMessage(ws, MessageOpcode.GameSessionOpenedEvent, gameSessionOpenedEvent);

                        const entityJoinedEvent = EntityJoinedEvent.create({
                            entityId: playerId,
                            wrappedEntityState: wrappedEntityState,
                        });

                        broadcastMessage(MessageOpcode.EntityJoinedEvent, entityJoinedEvent, ws);

                        // Send existing players to the new player
                        players.forEach(existingPlayer => {
                            if (existingPlayer.id !== playerId) {
                                const existingPlayerState = PlayerState.create({
                                    position: Vector2.create({ x: existingPlayer.position.x, y: existingPlayer.position.y }),
                                    facingDirection: FacingDirection.FACING_DIRECTION_EAST,
                                    gameSessionId: existingPlayer.id,
                                    accountId: existingPlayer.id,
                                    characterId: existingPlayer.id,
                                    displayName: existingPlayer.name,
                                    appearance: appearance
                                });

                                const wrappedExistingPlayerState = WrappedEntityState.create({
                                    type: 5,
                                    data: PlayerState.encode(existingPlayerState).finish()
                                });

                                const existingEntityJoinedEvent = EntityJoinedEvent.create({
                                    entityId: existingPlayer.id,
                                    wrappedEntityState: wrappedExistingPlayerState,
                                });

                                sendMessage(ws, MessageOpcode.EntityJoinedEvent, existingEntityJoinedEvent);
                            }
                        });

                        return;
                    } catch (err) {
                        console.error('Error processing EstablishSessionRequest:', err);
                    }
                    break;
                }
                case MessageOpcode.GetChannelsRequest: {
                    const channelInfo = ChannelInfo.create({
                        channelId: 1,
                        population: 1
                    });
                    const getChannelsResponse = GetChannelsResponse.create({
                        channelInfo: channelInfo
                    });
                    sendMessage(ws, MessageOpcode.GetChannelsResponse, getChannelsResponse);
                    break;
                }
                case MessageOpcode.UpdateChannelRequest: {
                    const updateChannelResponse = UpdateChannelResponse.create({
                        success: true,
                        error: 0
                    });
                    sendMessage(ws, MessageOpcode.UpdateChannelResponse, updateChannelResponse);

                    const subscriber = ChannelSubscriber.create({
                        subscriberId: playerId,
                        name: playerName
                    });

                    const fakesub = ChannelSubscriber.create({
                        subscriberId: 6969,
                        name: "CropServer"
                    });



                    const subscribedToChannelEvent = SubscribedToChannelEvent.create({
                        channelId: 1,
                        name: "Zone Chat",
                        type: 1,
                        createdAt: Long.fromString(Date.now().toString()),
                        channelFlags: 32767,
                        subscriptionFlags: 3,
                        subscribers: [subscriber, fakesub],
                        history: chatHistory,
                        unacknowledged: chatHistory
                    });

                    sendMessage(ws, MessageOpcode.SubscribedToChannelEvent, subscribedToChannelEvent);

                    break;
                }
                case MessageOpcode.SendMessageToChannelRequest: {
                    const message = SendMessageToChannelRequest.decode(data);
                    console.log("Got Message: ", message);
                    const channelMessage = ChannelMessage.create({
                        messageId: Long.fromNumber(++messageCounter),
                        sentAt: Long.fromString(Date.now().toString()), 
                        sender: ChannelSubscriber.create({
                            subscriberId: playerId,
                            name: playerName
                        }),
                        body: message.body,
                        action: false
                    });

                    chatHistory.push(channelMessage);
                    const msg = ChannelMessageEvent.create({
                        channelId: 1,
                        message: channelMessage
                    });
                    broadcastMessage(MessageOpcode.ChannelMessageEvent, msg);
                    break;
                }
                case MessageOpcode.AcknowledgeChannelMessageRequest: {
                    const message = AcknowledgeChannelMessageRequest.decode(data);
                    const ack = ChannelMessageAcknowledgedEvent.create({
                        messageId: message.messageId
                    });
                    sendMessage(ws, MessageOpcode.ChannelMessageAcknowledgedEvent, ack);

                    break;
                }
                case MessageOpcode.PlayerMoveCommand: {
                    const message = PlayerMoveCommand.decode(data);
                    console.log("PlayerMoveCommand:", message);

                    // Update player's position
                    player.position.x = message.position.x;
                    player.position.y = message.position.y;

                    const mobileMovedEvent = MobileMovedEvent.create({
                        entityId: player.id,
                        position: Vector2.create({ x: player.position.x, y: player.position.y }),
                    });

                    broadcastMessage(MessageOpcode.MobileMovedEvent, mobileMovedEvent, ws);
                    // No need to broadcast the updated position here
                    break;
                }
                default: {
                    console.error('Unknown message type received');
                    break;
                }
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            players.delete(playerId);
        });
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

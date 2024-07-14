const WebSocket = require('ws');
const protobuf = require('protobufjs');
const Long = require('long');

const server = new WebSocket.Server({ port: 8080 });

const MessageOpcode = {
    EstablishSessionResponse: 1000,
    PongMessage: 1001,
    SessionClosedEvent: 1002,
    ReestablishSessionEvent: 1003,
    EstablishSessionRequest: 1100,
    PingMessage: 1101,
    GetChannelsRequest: 100100,
    GetChannelsResponse: 100004,
    UpdateChannelRequest: 100101,
    UpdateChannelResponse: 100005,
    SubscribedToChannelEvent: 5002,
    GameSessionClosedEvent: 100001,
    GameSessionOpenedEvent: 100000,
    CharacterAppearanceUpdatedEvent: 3002,
    SendMessageToChannelRequest: 5102,
    ChannelMessageAcknowledgedEvent: 5010,
    AcknowledgeChannelMessageRequest: 5103,
    ChannelMessageEvent: 5007,
    ChannelMessageSentEvent: 5008,
    ChannelMessageSendFailedEvent: 5009,
    // Add the rest of your opcodes here...
};


// These packets will get you into the game {EstablishSessionResponse, GameSession, Test Inventory, Test Character }
// credit Cerulean
const testPacket0 = 'E80300003D000000080118BEDAFCC18A3220BEDAFCC18A322A0D087B1209746573744074657374321C0801120A506F674368616D70363918C1DAFCC18A322205080310AA05';
const testPacket1 = 'A08601003A000000087B10011801222E0805122A0A0A0D0000803F15000000401003200228B936307B3801420A506F674368616D7036394A05080310AA052801300110AA05';
const testPacket2 = '898A01002F0000000802122B080512270A0A0D0000803F15000000401003200228BA36307C380242074269674D656D654A05080310AA054A05080310AA052801300110AA05';
const testPacket3 = 'A00F0000220000000A0F0801100118012207080110AA0518010A0F0802100118022207080210AA05180169674D656D654A05080310AA054A05080310AA052801300110AA05';
const testPacket4 = 'BA0B00000900000008011205080310AA0507080110AA0518010A0F0802100118022207080210AA05180169674D656D654A05080310AA054A05080310AA052801300110AA05';

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
    const CharacterLoadoutUpdatedEvent = root.lookupType("myPackage.CharacterLoadoutUpdatedEvent");
    const FacingDirection = root.lookupEnum("myPackage.FacingDirection");





    server.on('connection', (ws) => {
        console.log("New Connection");

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
                            accountId: 123,
                            email: "test@test"
                        });

                        const mockCharacter = CharacterInfo.create({
                            characterId: 1,
                            name: "Crop",
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
                            position: Vector2.create({ x: 1.0, y: 2.0 }),
                            facingDirection: FacingDirection.FACING_DIRECTION_EAST,
                            gameSessionId: 6969,
                            accountId: 123,
                            characterId: 1,
                            displayName: "Crop",
                            appearance: appearance
                        });

                        const wrappedEntityState = WrappedEntityState.create({
                            type: 5,
                            data: PlayerState.encode(playerState).finish()
                        });

                        const gameSessionOpenedEvent = GameSessionOpenedEvent.create({
                            accountId: 123,
                            characterId: 1,
                            entityId: 1,
                            wrappedEntityState: wrappedEntityState,
                            channelId: 1,
                            mapId: 1
                        });

                        sendMessage(ws, MessageOpcode.GameSessionOpenedEvent, gameSessionOpenedEvent);

                        const characterLoadout = CharacterLoadoutUpdatedEvent.create({
                            characterLoadoutId: 1,
                            items: [720, 673, 1456, 1062, 1312, 1528]
                        });

                        // Uncomment if needed
                        // sendMessage(ws, 3006, characterLoadout);

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

                    const subscribers = ChannelSubscriber.create({
                        subscriberId: 1,
                        name: "Crop"
                    });
                    const subscriberServer = ChannelSubscriber.create({
                        subscriberId: 2,
                        name: "CropServer"
                    });

                    const fakeHistory = ChannelMessage.create({
                        messageId: 1,
                        sentAt: Long.fromString(Date.now().toString()), 
                        sender: subscriberServer,
                        body: "test",
                        action: false
                    });

                    const subscribedToChannelEvent = SubscribedToChannelEvent.create({
                        channelId: 1,
                        name: "Zone Chat",
                        type: 1,
                        createdAt: Long.fromString(Date.now().toString()),
                        channelFlags: 32767,
                        subscriptionFlags: 3,
                        subscribers: [subscribers, subscriberServer],
                        history: [fakeHistory],
                        unacknowledged: [fakeHistory]
                    });

                    sendMessage(ws, MessageOpcode.SubscribedToChannelEvent, subscribedToChannelEvent);

                    break;
                }
                case MessageOpcode.SendMessageToChannelRequest: {
                    const message = SendMessageToChannelRequest.decode(data);
                    console.log("Got Message: ", message)
                    const msg = ChannelMessageEvent.create({
                        channelId: 1,
                        message: ChannelMessage.create({
                            messageId: message.requestId,
                            sentAt: Long.fromString(Date.now().toString()), 
                            sender: ChannelSubscriber.create({
                                subscriberId: 1,
                                name: "Crop"
                            }),
                            body: message.body,
                            action: false
                        })});
                        sendMessage(ws, MessageOpcode.ChannelMessageEvent, msg);
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
                default: {
                    console.error('Unknown message type received');
                    break;
                }
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

const WebSocket = require('ws');
const Long = require('long');
const messages = require('./messages_pb'); // Adjust the path if needed

const server = new WebSocket.Server({ port: 8080 });

const MessageOpcode = {
    EstablishSessionResponse: 1000,
    PongMessage: 1001,
    SessionClosedEvent: 1002,
    ReestablishSessionEvent: 1003,
    EstablishSessionRequest: 1100,
    PingMessage: 1101,
    GameSessionClosedEvent: 100001,
    GameSessionOpenedEvent: 100000,
    // Add the rest of your opcodes here...
};

// These packets will get you into the game
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

function hexToBuffer(hex) {
    return Buffer.from(hex.replace(/\s/g, ''), 'hex');
}

function sendMessage(ws, opcode, message) {
    const messageBuffer = message.serializeBinary();
    const responseWithHeader = createMessageWithHeader(opcode, messageBuffer);
    ws.send(responseWithHeader, { binary: true });
    console.log("Sent:", message.constructor.name, message.toObject());
    console.log("Sent Raw: ", responseWithHeader.toString('hex'))
}

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
                    const message = messages.PingMessage.deserializeBinary(data);
                    console.log('Received PingMessage:', message.toObject());

                    const pongMessage = new messages.PongMessage();
                    pongMessage.setClienttimestamp(message.getClienttimestamp());
                    pongMessage.setServertimestamp(Date.now());
                    pongMessage.setIsmasterclock(true);

                    sendMessage(ws, MessageOpcode.PongMessage, pongMessage);
                    return;
                } catch (err) {
                    console.error("Error processing PingMessage:", err);
                }
                break;
            }
            case MessageOpcode.EstablishSessionRequest: {
                try {
                    const message = messages.EstablishSessionRequest.deserializeBinary(data);
                    console.log('Received EstablishSessionRequest:', message.toObject());

                    const mockAccount = new messages.AccountInfo();
                    console.log(mockAccount);
                    // Method 2: Using Object.getOwnPropertyNames
                    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(mockAccount)));

                    // Method 3: Using Reflect.ownKeys
                    console.log(Reflect.ownKeys(Object.getPrototypeOf(mockAccount)));
                    mockAccount.setAccountid(123);
                    mockAccount.setEmail("test@test");

                    const mockCharacter = new messages.CharacterInfo();
                    mockCharacter.setCharacterid(1);
                    mockCharacter.setName("PogChamp69");
                    mockCharacter.setCreatedtimestamp(Date.now());
                    const appearance = new messages.CharacterAppearance();
                    appearance.setPart(3);
                    appearance.setValue(682);
                    mockCharacter.addAppearance(appearance);

                    const payload = new messages.EstablishSessionResponse();
                    payload.setSuccess(true);
                    payload.setClienttimestamp(message.getClienttimestamp());
                    payload.setMastertimestamp(Date.now());
                    payload.setAccount(mockAccount);
                    payload.setCharacter(mockCharacter);

                    sendMessage(ws, MessageOpcode.EstablishSessionResponse, payload);


                    // Create and send GameSessionOpenedEvent message
                    const playerState = new messages.PlayerState();
                    playerState.setPosition(new messages.Vector2());
                    playerState.getPosition().setX(1.0);
                    playerState.getPosition().setY(2.0);
                    playerState.setFacingdirection(messages.FacingDirection.FACING_DIRECTION_EAST);
                    playerState.setGamesessionid(6969);
                    playerState.setAccountid(123);
                    playerState.setCharacterid(1);
                    playerState.setDisplayname("PogChamp69");
                    playerState.addAppearance(appearance);

                    const wrappedEntityState = new messages.WrappedEntityState();
                    wrappedEntityState.setType(5);
                    wrappedEntityState.setData(playerState.serializeBinary());

                    const gameSessionOpenedEvent = new messages.GameSessionOpenedEvent();
                    gameSessionOpenedEvent.setAccountid(123);
                    gameSessionOpenedEvent.setCharacterid(1);
                    gameSessionOpenedEvent.setEntityid(1);  // Example entity ID
                    gameSessionOpenedEvent.setWrappedentitystate(wrappedEntityState);
                    gameSessionOpenedEvent.setChannelid(1);  // Example channel ID
                    gameSessionOpenedEvent.setMapid(1);  // Example map ID

                    //sendMessage(ws, MessageOpcode.GameSessionOpenedEvent, gameSessionOpenedEvent);


                    //ws.send(hexToBuffer(testPacket0), { binary: true });
                    //console.log('Sent test packet 0');

                    ws.send(hexToBuffer(testPacket1), { binary: true });
                    console.log('Sent test packet 1');

                    //ws.send(hexToBuffer(testPacket2), { binary: true });
                    //console.log('Sent test packet 2');

                    //ws.send(hexToBuffer(testPacket3), { binary: true });
                    //console.log('Sent test packet 3');

                    //ws.send(hexToBuffer(testPacket4), { binary: true });
                    //console.log('Sent test packet 4');

                    return;
                } catch (err) {
                    console.error('Error processing EstablishSessionRequest:', err);
                }
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

function hexToBuffer(hex) {
    return Buffer.from(hex.replace(/\s/g, ''), 'hex');
}

console.log('WebSocket server is running on ws://localhost:8080');

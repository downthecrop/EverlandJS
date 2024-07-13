const http = require('http');
const https = require('https');
const fs = require('fs');

// SSL options
const options = {
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('selfsigned.crt')
};

// Define error codes to match the client's expectations
const AuthorizeErrorCode = {
    None: 0,
    DatabaseError: 1,
    InvalidCredentials: 2,
    EmailNotVerified: 3,
    ServiceError: 4
};

const AccountErrorCode = {
    None: 0,
    DatabaseError: 1,
    NotFound: 2,
    ServiceError: 3
};

const CharacterErrorCode = {
    None: 0,
    DatabaseError: 1,
    InvalidCharacterId: 2,
    ServiceError: 3
};

// Define a mock AccountModel
const mockAccount = {
    AccountId: 12345,
    Email: "mocked_email@example.com",
    IsAdmin: false,
    CreatedAt: "2023-01-01T00:00:00Z",
    LastLogin: "2023-01-15T00:00:00Z",
    DisabledAt: null,
    BannedUntil: null
};

// Define a mock GetAccountCharactersResponse
const mockGetAccountCharactersResponse = {
    Error: CharacterErrorCode.None,
    Characters: [{"Name":"test","ItemIds":[790,673,1390,1047,1318,1528], "CharacterId" : 1, "DisplayName" : "Crop", "MapId": 0, "ChannelId":1}],
};

// Request handler
const requestHandler = (req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);

    if (req.method === 'POST' && req.url === '/auth/account/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log(`Received body: ${body}`);
            const { username, password } = JSON.parse(body);
            // Spoofing a success response
            let response = {
                Error: AuthorizeErrorCode.None,
                AccessToken: "mocked_access_token",
                RefreshToken: "mocked_refresh_token"
            };

            console.log(`Sending response: ${JSON.stringify(response)}`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response));
        });
    } else if (req.method === 'GET' && (req.url === '/account' || req.url === '/account/')) {
        // Spoofing a GetAccountResponse
        let response = {
            Error: AccountErrorCode.None,
            Account: mockAccount
        };

        console.log(`Sending response: ${JSON.stringify(response)}`);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(response));
    } else if (req.method === 'GET' && (req.url === '/character' || req.url === '/character/')) {
        // Spoofing a GetAccountCharactersResponse
        let response = mockGetAccountCharactersResponse;

        console.log(`Sending response: ${JSON.stringify(response)}`);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(response));
    } else if (req.method === 'POST' && (req.url === '/character' || req.url === '/character/')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log(`Received body for character creation: ${body}`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: "Character creation received" }));
        });
    } else if (req.method === 'POST' && req.url === '/auth/character/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log(`Received body for character login: ${body}`);
            const { characterId } = JSON.parse(body);
            // Spoofing a success response
            let character = mockGetAccountCharactersResponse.Characters[0];

            if (character) {
                let response = {
                    Error: CharacterErrorCode.None,
                    AccessToken: "mocked_access_token_for_character",
                    RefreshToken: "mocked_refresh_token_for_character",
                    CharacterId: character.CharacterId,
                    DisplayName: character.DisplayName,
                    Name: character.Name,
                    AccountId: 1,
                    MapId: 0,
                    ChannelId: 0,
                    ItemIds: character.ItemIds
                };

                console.log(`Sending response: ${JSON.stringify(response)}`);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(response));
            } else {
                let response = {
                    Error: CharacterErrorCode.InvalidCharacterId,
                    AccessToken: null,
                    RefreshToken: null
                };

                console.log(`Sending response: ${JSON.stringify(response)}`);
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(response));
            }
        });
    } else if (req.method === 'GET' && req.url === '/gateway/endpoint') {
        // Responding with a string array
        let response = ["ws://localhost:8080/"];
        //let response = ["ws://localhost:81"];

        console.log(`Sending response: ${JSON.stringify(response)}`);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(response));
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not Found\n');
    }
};

// Create separate server instances
const httpServer80 = http.createServer(requestHandler);
const httpServer8080 = http.createServer(requestHandler);
const httpsServer443 = https.createServer(options, requestHandler);
const httpsServer8443 = https.createServer(options, requestHandler);

// Ports to listen on
const PORTS = [
    { server: httpServer80, port: 80, protocol: 'HTTP' },
    { server: httpsServer443, port: 443, protocol: 'HTTPS' },
    { server: httpsServer8443, port: 8443, protocol: 'HTTPS' }
];

// Start servers
PORTS.forEach(({ server, port, protocol }) => {
    server.listen(port, () => {
        console.log(`${protocol} Server running at ${protocol.toLowerCase()}://localhost:${port}/`);
    });
});

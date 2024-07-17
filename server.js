const https = require('https');
const fs = require('fs');

// SSL options
const options = {
    key: fs.readFileSync('./Certificates/private.key'),
    cert: fs.readFileSync('./Certificates/selfsigned.crt')
};

// Error codes
const AuthorizeErrorCode = { None: 0, DatabaseError: 1, InvalidCredentials: 2, EmailNotVerified: 3, ServiceError: 4 };
const AccountErrorCode = { None: 0, DatabaseError: 1, NotFound: 2, ServiceError: 3 };
const CharacterErrorCode = { None: 0, DatabaseError: 1, InvalidCharacterId: 2, ServiceError: 3 };


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
    Characters: [{"Name":"Crop","ItemIds":[720,673,1456,1062,1312,1528]}],
};

// format is LoadFromNetwork(int hat, int hair, int eyes, int jacket, int shirt, int back, int pants, int shoes, int skinColor)

// Request handler
const requestHandler = (req, res) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', () => {
        console.log(`Received body: ${body}`);
        let response = {};
        let statusCode = 200;
        const url = req.url;
        const method = req.method;

        if (method === 'POST' && url === '/auth/account/login') {
            const { username, password } = JSON.parse(body);
            response = { Error: AuthorizeErrorCode.None, AccessToken: "mocked_access_token", RefreshToken: "mocked_refresh_token" };
        } else if (method === 'GET' && url.startsWith('/account')) {
            response = { Error: AccountErrorCode.None, Account: mockAccount };
        } else if (method === 'GET' && url.startsWith('/character')) {
            response = mockGetAccountCharactersResponse;
        } else if (method === 'POST' && url.startsWith('/character')) {
            response = { message: "Character creation received" };
        } else if (method === 'POST' && url === '/auth/character/login') {
            const { characterId } = JSON.parse(body);
            const character = mockGetAccountCharactersResponse.Characters[0];
            if (character) {
                response = {
                    Error: CharacterErrorCode.None, AccessToken: "mocked_access_token_for_character",
                    RefreshToken: "mocked_refresh_token_for_character", CharacterId: character.CharacterId,
                    DisplayName: character.DisplayName, Name: character.Name, AccountId: 1, MapId: 1, ChannelId: 0,
                    ItemIds: character.ItemIds
                };
            } else {
                statusCode = 400;
                response = { Error: CharacterErrorCode.InvalidCharacterId, AccessToken: null, RefreshToken: null };
            }
        } else if (method === 'GET' && url === '/gateway/endpoint') {
            response = ["ws://localhost:8080/"];
        } else {
            statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Not Found\n');
            return;
        }

        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(response));
    });
};

// Start servers
https.createServer(options, requestHandler).listen(443, () => {
    console.log(`HTTPS Server running at https://localhost:443/`);
});
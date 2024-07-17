![](./Banner.png)

# EverlandJS

EverlandJS is an open-source Node.js server emulator for Everland, preserving the legacy of the social MMO created by Reckful in 2020.

## Introduction

Everland was a social MMO launched in 2020 by streamer Byron "Reckful" Bernstein. This emulator aims to recreate the Everland experience, honoring Reckful's vision and allowing fans to revisit this unique virtual world.

## Features

- Basic login and character creation
- Player movement and position updates
- Simple chat system
- Character appearance customization

## Getting Started

### Prerequisites

- Node.js (version 12 or higher)
- npm

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies: `npm install`

### Configuration

1. Add the following line to your hosts file (`/etc/hosts` on Unix-like systems, `C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1 api.live.playeverland.com
```


2. Install the included self-signed certificate (`selfsigned.crt`) in your system's trust store or your browser.

### Running the Servers

1. Start the HTTP/HTTPS server:

```
node server.js
```

This server handles initial authentication and runs on ports 443

2. Start the WebSocket server:

```
node websock.js
```

This server manages real-time game interactions and runs on port 8080.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This project is not affiliated with or endorsed by the original Everland developers. It is a fan-made emulator for preservation and educational purposes only.

## License

[MIT License](LICENSE)

## Acknowledgments

- Reckful and the original Everland team
- The Everland community

# Pong Game - Modular JavaScript Structure

This directory contains the modularized JavaScript code for the Pong game client, organized into separate files for better maintainability and code organization.

## File Structure

### Core Files

- **`main.js`** - Entry point that initializes the game when the page loads
- **`game-client.js`** - Main PongClient class that orchestrates all game components

### Module Files

- **`constants.js`** - Game constants, configuration, and color definitions
- **`websocket-manager.js`** - Handles WebSocket communication with the game server
- **`input-handler.js`** - Manages keyboard and button input events
- **`interpolation.js`** - Handles smooth animation interpolation and client-side prediction
- **`renderer.js`** - Responsible for all canvas drawing and visual rendering

## Module Responsibilities

### Constants (`constants.js`)

- Game dimensions and physics constants
- Color scheme definitions
- Control key mappings
- WebSocket configuration

### WebSocket Manager (`websocket-manager.js`)

- Establishes and maintains WebSocket connection
- Handles message sending and receiving
- Implements reconnection logic
- Notifies game client of state updates

### Input Handler (`input-handler.js`)

- Captures keyboard input with throttling
- Handles button click events
- Manages input state tracking
- Delegates input processing to game client

### Interpolation Manager (`interpolation.js`)

- Smooth state interpolation between server updates
- Client-side ball movement prediction
- Paddle position prediction for immediate response
- Linear interpolation utilities

### Renderer (`renderer.js`)

- Canvas drawing operations
- Game object rendering (paddles, ball, court)
- Visual effects (ball trail, highlights)
- UI updates (score, mode button)

### Game Client (`game-client.js`)

- Main game logic coordination
- Component integration
- Game loop management
- State management

## Benefits of Modular Structure

1. **Separation of Concerns** - Each module has a single, well-defined responsibility
2. **Maintainability** - Easier to locate and modify specific functionality
3. **Reusability** - Modules can be reused or replaced independently
4. **Testing** - Individual modules can be unit tested in isolation
5. **Code Organization** - Related functionality is grouped together
6. **Scalability** - Easy to add new features or modify existing ones

## Usage

The modular structure is automatically loaded through ES6 modules. The main entry point (`main.js`) imports and initializes the `PongClient`, which then coordinates all other modules.

```html
<script type="module" src="js/main.js"></script>
```

All modules use ES6 import/export syntax for clean dependency management.

# HTMX Conway's Game of Life

A simple implementation of Conway's Game of Life using HTMX, Express, and Handlebars. This project demonstrates how to build an interactive web application with minimal JavaScript, letting the server drive the UI updates.

## Key Features

- Pure HTMX implementation - minimal JavaScript
- Server-side simulation control
- Adjustable simulation speed
- Random initial state generation
- Edge detection for grid boundaries

## Technical Implementation

### Core Components

1. **Cell Component** (`views/partials/cell.hbs`)
   - Uses HTMX triggers to handle state updates
   - Manages neighbor cell updates through event triggering
   - Handles edge cases for grid boundaries

2. **Board Layout** (`views/board.hbs`)
   - Renders the game grid
   - Contains simulation speed controls
   - Uses partials for modularity

3. **Server Logic** (`server.js`)
   - Implements Conway's Game of Life rules
   - Controls simulation timing
   - Handles cell state updates

### Key Design Decisions

1. **HTML as the Source of Truth**
   - Cell states stored in data-attributes
   - UI updates driven by server responses
   - Clean separation of concerns

2. **Server-Side Timing Control**
   - Uses async/await sleep function
   - Prevents server flooding
   - Adjustable simulation speed

3. **HTMX Patterns**
   - HTML responses instead of JSON
   - Uses built-in HTMX features for state management
   - Minimal custom JavaScript

## Implementation Details

### Cell State Management

Each cell maintains its state through a data-attribute:

```html
<div data-state="1" class="alive">
```

### Neighbor Updates

Cells trigger updates to their neighbors using HTMX:

```html
hx-trigger="click, update-cell-{x}-{y} from:body delay:js:document.getElementById('speed').value+'ms'"
```

### Simulation Speed Control

Server-side throttling using async/await:

```javascript
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post("/cell/:x/:y", async (req, res) => {
  await sleep(SIMULATION_SPEED);
});
```

## Lessons Learned

1. **HTMX Simplicity**
   - HTMX's "HTML in, HTML out" pattern keeps code simple and maintainable
   - Server-side rendering reduces client-side complexity

2. **State Management**
   - Using HTML attributes for state works well with HTMX
   - Reduces need for complex client-side state management

3. **Performance Considerations**
   - Server-side throttling helps manage update cascades
   - HTMX handles race conditions gracefully

## Future Enhancements

Potential improvements could include:

- Save/load functionality for patterns
- Play/pause controls
- Step-by-step mode
- Configurable grid size
- Common pattern templates
- Toroidal grid option (wrapping edges)

## Running the Project

1. Install dependencies:

```bash
npm install
```

1. Start the server:

```bash
npm start # npm run dev
```

1. Visit <http://localhost:3000> in your browser

## Dependencies

- [Express](https://expressjs.com/)
- [HTMX](https://htmx.org/)
- [Handlebars](https://handlebarsjs.com/)
- [Express-Handlebars](https://github.com/express-handlebars/express-handlebars)

## License

MIT

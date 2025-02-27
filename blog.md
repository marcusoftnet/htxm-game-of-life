---
layout: post
title: "Conways Game of life using HATEOAS and HTMX"
author: "Marcus Hammarberg"
date: 2025-02-27 04:00:00
tags:
 - Express
 - HTMX
---

I've been playing around more with HTMX and one of the really cool features that I think we need to talk more about is the ability to trigger client side events from the server. This is accomplished by using the `hx-trigger` header and elements on the page can listen for events using `hx-trigger: myEvent from body`.

This means that it's easy to inform the client that something has happened and then let the client take appropriate actions. For example, imagine that we put an item in the shopping cart. The server responds with the event `SHOPPING_CART_UPDATED`. A lot of elements on the page can now update based on this event; counter in the shopping cart, list of "other people also bought", a banner with discounts etc.

Event driven client side architecture. Just imagine what this could do for micro frontend, where each component might be built by different teams. The business events is published and the components can take appropriate actions.

To demo this I was thinking that Conway Game of Life could be a fun example. It's a zero player game, i.e. a simulation that just keeps running after you have started it. Each step is generated as a consequence of the previous change and hence perfect for this kind of event driven architecture.

<!-- excerpt-end -->

You can find all of the code here: [https://github.com/marcusoftnet/htxm-game-of-life](https://github.com/marcusoftnet/htxm-game-of-life), but we are going to build it up step by step in the article.

## Disclaimer

What we are about to build will be VERY network intensive. I would not recommend building a real application like this, but it serves well to explain the concepts of HATEOAS, and HTMX events.

Don't try this at home, in other words.

## Conway Game of Life

[Conway Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) is a zero player game that is played on a grid of cells. Each cell can be either alive or dead. The game is played as follows:

Any live cell with fewer than two live neighbors dies, as if by under-population.
Any live cell with two or three live neighbors lives on to the next generation.
Any live cell with more than three live neighbors dies, as if by overpopulation.
Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

The rules are applied to each cell in the grid and the grid is updated as a consequence of the previous state.

In other words, you need to know about your neighbors to calculate the next state. I have implemented a function to do that here - for one cell:

```javascript
const computeNextState = (state, neighbors) => {
  const aliveNeighbors = neighbors.reduce((sum, n) => sum + parseInt(n), 0);
  if (state === "1")
    return aliveNeighbors === 2 || aliveNeighbors === 3 ? "1" : "0";
  return aliveNeighbors === 3 ? "1" : "0";
};

module.exports = { computeNextState };
```

And [here are some tests that shows how this function works](https://github.com/marcusoftnet/htxm-game-of-life/blob/main/tests/computeNextState.test.js). I will not use the tests in the walkthrough, but they are part of the repo.

## The plan and HATEOAS

Just about all implementations of Conways Game of Life is works with the whole grid, looping through the rows and cells, but I wanted to try to drive the game from changes that happens to each cell. Cell by cell instead.

Which led to to think about HATEOAS (I have no idea how to pronounce that...), which Dr Roy Fielding, talked about in his PhD thesis on REST and among other places. HATEOAS stands for Hypermedia as the Engine of Application State and can easily be understood as the hypermedia describes the current state of an application. Not only the state, by the way, but also links to the next actions you can take etc.

Imagine creating a new blog post using a HTTP call to POST /blog. The response is an HTML representation of the blog post. The response includes links to the next actions you can take, e.g. `edit` and `delete`.

In my case, I will generate a grid of cells, randomizing the alive/dead state of each cell. Then I will update this grid to have it listen to event from all its neighbors. When any of the neighbors change, the cell should also calculate its new state.

Told you - there will be A LOT of network calls. But it will be a very declarative and clear approach.

## Starting point - creating the grid

I'm going to use Express, HTMX and Handlebars to build this, let's set it up like this:

```bash
mkdir htmx-game-of-life
cd htmx-game-of-life

touch server.js

npm init -y
npm pkg set scripts.start="node server.js"
npm pkg set scripts.dev="node --watch server.js"
npm pkg delete scripts.test

mkdir public views views/partials
touch public/styles.css
touch views/board.hbs
touch views/partials/cell.hbs
touch views/partials/controls.hbs

npx -y gitignore node

npm i express express-handlebars

code .
```

I'm not going to talk about styling - get the [CSS here](https://github.com/marcusoftnet/htxm-game-of-life/blob/main/public/styles.css)

The initial `server.js` looks like this, and generates the initial board:

```javascript
const express = require("express");
const path = require("path");
const configureHandlebars = require("./config/handlebars");

const app = express();
const PORT = 3000;
const GRID_SIZE = 20;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Setup Handlebars
configureHandlebars(app);

app.get("/", (req, res) => {
  res.render("board", { GRID_SIZE });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
```

There are, for reasons that will soon become clear, quite a lot of Handlebars configuration. I've broken it out to a `config/handlebars.js` file. You can get it here: [https://github.com/marcusoftnet/htxm-game-of-life/blob/main/config/handlebars.js](https://github.com/marcusoftnet/htxm-game-of-life/blob/main/config/handlebars.js). It is basically telling handlebars that the views are in the `views` folder, with the `.hbs` extension and then create a few helper functions that will be used in the views.

Let's now fill out the views. First the `views/board.hbs`, which also is the main page:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTMX Conway's Game of Life</title>
  <script src="https://unpkg.com/htmx.org"></script>
  <link rel="stylesheet" href="/styles.css">
</head>

<body>

  <h1>HTMX Conway's Game of Life</h1>

  <table>
    {{#each (range GRID_SIZE) as |row|}}
    <tr>
      {{#each (range ../GRID_SIZE) as |col|}}
      <td>
        {{> cell x=col y=row}}
      </td>
      {{/each}}
    </tr>
    {{/each}}
  </table>

</body>

</html>
```

I'm including HTMX on the page, and then use the Handlebars `#each` loop to create a grid of cells. Each cell is rendered using the `views/partials/cell.hbs` partial, and get the `x` and `y` coordinates as parameters.

```html
<div
  id="cell-{{x}}-{{y}}"
  {{#if (randomAlive)}}
    data-state="1"
    class="alive"
  {{else}}
    data-state="0"
    class="dead"
  {{/if}}
>
</div>
```

`randomAlive` is a helper function that returns a random boolean to set the cell to dead (`0`) or alive (`1`). This is one of the functions in the `config/handlebars.js` file.

If you run that (`npm run dev`) you will see a grid of cells, some alive, some dead. Reloading the page it should look different.

## Listening for events

## Calculate new state for a cell

## Change speed of the simulation

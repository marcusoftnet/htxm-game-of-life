---
layout: post
title: "HTMX events and Game of Life"
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
´``

And here are some tests that shows how it works:

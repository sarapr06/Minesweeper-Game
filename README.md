# Minesweeper

A Minesweeper game built with vanilla HTML, CSS, and JavaScript.

 **Live at:** [[https://sarapr06.github.io/minesweeper/](http://www.saraparvareshrizi.com/Minesweeper-Game/)](https://sarapr06.github.io/minesweeper/)

## Features

**Three Difficultes**
  - Easy: 9×9 grid with 10 mines
  - Medium: 16×16 grid with 40 mines
  - Hard: 16×30 grid with 99 mines

**Theme**
  - Toggle between light and dark modes, preference saved in localStorage

**High Score Tracking**
  - Best time recorded for each difficulty level
  - Persist across sessions using localStorage

**Responsive Design**
  - Adaptive container sizing based on difficulty level

**Minesweeper Gameplay**
  - Left-click to reveal cells
  - Right-click to flag potential mines
  - Auto-reveal adjacent empty cells
  - First click is always safe (mines placed after first click)

## How to Play

1. Select a difficulty level (Easy, Medium, or Hard)
2. Left-click on a cell to reveal it
3. Right-click on a cell to flag it as a potential mine
4. Reveal all cells without mines to win!
5. Avoid clicking on mines - that ends the game

## Technologies Used

- **HTML5** - Structure and markup
- **CSS3** - Styling with CSS variables for theming
- **JavaScript (ES6+)** - Game logic and interactivity
- **localStorage** - Persistent high scores and theme preference

## Game Rules

- Numbers indicate how many mines are adjacent to that cell
- Use the numbers to deduce where mines are located
- Flag all mines correctly to win
- The timer starts when you make your first click
- Your best time for each difficulty is automatically saved

## Installation

To run locally:

1. Clone the repository:
```bash
git clone https://github.com/sarapr06/minesweeper.github.io.git
```

2. Navigate to the project directory:
```bash
cd minesweeper.github.io
```

3. Open `index.html` in your web browser

No build process or dependencies required!

## Browser Support

Works on all modern browsers that support:
- ES6+ JavaScript
- CSS Grid
- localStorage API

---

Enjoy playing! 

# Lantern Night Market — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/diablosan19/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/diablosan19/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

A spot-the-difference game set in a lantern-lit night market. Two panels show
the same bustling street scene — same stalls, same lanterns, same moon — except
for 7 sneaky differences. Find them all before the 3-minute timer runs out.

## Run

Serve `game/` from any static HTTP server and open `index.html`:

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

No build step, no network requests, no dependencies. Play with mouse/touch or
keyboard: arrow keys move the crosshair, Enter marks a difference, H asks for
a hint, R restarts.

## How to play

- Click (or tap) a spot where the two pictures differ. A gold ring marks a
  correct find on both panels; a wrong click costs 5 seconds.
- The counter at the top shows how many differences remain.
- Stuck? Press H (or the Hint button) for a pulsing clue — you get 3 hints.
- Find all 7 before the timer hits zero to win.

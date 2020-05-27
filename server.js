const Server = require('boardgame.io/server').Server;
const x = 16;
const y = 9;

const createRandomMinedArray = () => {
    const arr = Array(x * y).fill(null);
    return arr;
}

const createArroundMineValueArray = (mine) => {
    const arr = Array(x * y).fill(null);
    for (let i = 0; i < mine.length; i++) {
        for (let j = 0; j < mine[i]; j++) {
            var id = 0
            do {
                id = Math.floor(Math.random() * x * y);
            } while (arr[id] != null)
            arr[id] = i + 1;
        }
    }
    return arr;
}

const calculateMinesAround = (cells, mineValue, id) => {
    let mines = 0;
    if (mineValue[id - 1] && mineValue[id - 1] > 0 && (id % x != 0)) {
        mines = mines + mineValue[id - 1];
    }
    if (mineValue[id + 1] && mineValue[id + 1] > 0 && (id % x != x - 1)) {
        mines = mines + mineValue[id + 1];
    }
    if (mineValue[id + x - 1] && mineValue[id + x - 1] > 0 && (id % x != 0)) {
        mines = mines + mineValue[id + x - 1];
    }
    if (mineValue[id + x] && mineValue[id + x] > 0) {
        mines = mines + mineValue[id + x];
    }
    if (mineValue[id + x + 1] && mineValue[id + x + 1] > 0 && (id % x != x - 1)) {
        mines = mines + mineValue[id + x + 1];
    }
    if (mineValue[id - x - 1] && mineValue[id - x - 1] > 0 && (id % x != 0)) {
        mines = mines + mineValue[id - x - 1];
    }
    if (mineValue[id - x] && mineValue[id - x] > 0) {
        mines = mines + mineValue[id - x];
    }
    if (mineValue[id - x + 1] && mineValue[id - x + 1] > 0 && (id % x != x - 1)) {
        mines = mines + mineValue[id - x + 1];
    }
    return mines;
}
const perSweep = (mineValue, id, cells, hp, cPlayer, currentValue) => {
    if (cells[id] || cells[id] == 0) {

    } else if (mineValue[id] > 0) {
        cells[id] = calculateMinesAround(cells, mineValue, id);
        console.log('mine' + '+' + cells[id] + '+' + mineValue[id]);
        hp[cPlayer] = hp[cPlayer] - mineValue[id];
        if (hp[cPlayer] < 0) {
            hp[cPlayer] = 0;
        }
        currentValue[id] = 1;
    } else {
        cells[id] = calculateMinesAround(cells, mineValue, id);
    }
}
const end = (hp, cells) => {
    let full = true
    for (let i = 0; i < x * y; i++) {
        if (cells[i] == null) {
            full = false
            break;
        }
    }
    if (hp[0] <= 0)
        return { winner: 1 };
    else if (hp[1] <= 0)
        return { winner: 0 };
    else if (full) {
        if (hp[0] < hp[1])
            return { winner: 1 };
        else if (hp[1] < hp[0])
            return { winner: 0 };
        else
            return { winner: 1 };
    }
    return false;
}

const Minesweeper = {
    name: 'minesweeper',
    setup: () => ({
        cells: createRandomMinedArray(),
        mineValue: createArroundMineValueArray([6, 4, 2]),
        randomMine: [6, 4, 2],
        presetPlayersMine: [1, 1, 1, 1, 1],
        playersMine: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        currentValue: Array(x * y).fill(null),
        currentMine: null,
        numPlayers: 2,
        hp: Array(2).fill(10),
        boardx: x,
        boardy: y,
        gameover: null
    }),
    moves: {
        sweep(G, ctx, id) {
            let cells = [...G.cells];
            let mineValue = [...G.mineValue];
            let currentValue = [...G.currentValue];
            let cPlayer = ctx.currentPlayer;
            let hp = [...G.hp];
            currentValue[id] = 0;
            perSweep(mineValue, id, cells, hp, cPlayer, currentValue);
            if (id % x != x - 1) {
                perSweep(mineValue, id + 1, cells, hp, cPlayer, currentValue);
                //perSweep(mineValue, id+x+1, cells, hp, cPlayer, currentValue);
                //perSweep(mineValue, id-x+1, cells, hp, cPlayer, currentValue);
            }
            if (id % x != 0) {
                perSweep(mineValue, id - 1, cells, hp, cPlayer, currentValue);
                //perSweep(mineValue, id+x-1, cells, hp, cPlayer, currentValue);
                //perSweep(mineValue, id-x-1, cells, hp, cPlayer, currentValue);
            }
            perSweep(mineValue, id + x, cells, hp, cPlayer, currentValue);
            perSweep(mineValue, id - x, cells, hp, cPlayer, currentValue);
            return { ...G, cells, mineValue, hp, currentValue };
        },
        selectMine(G, ctx, value) {
            let currentMine = G.currentMine;
            console.log('select');
            if (currentMine == value) {
                currentMine = null;
            } else {
                currentMine = value;
            }
            return { ...G, currentMine };
        },

        placeMine(G, ctx, id, value) {
            let mineValue = [...G.mineValue];
            let cPlayer = ctx.currentPlayer;
            let playersMine = [...G.playersMine];
            let currentMine = value || G.currentMine;
            mineValue[id] = mineValue[id] + currentMine;
            playersMine[cPlayer * 5 + currentMine - 1]--;
            currentMine = null;
            return { ...G, mineValue, currentMine, playersMine };
        },
        changeBoardShowing(G, ctx, id) {
            let currentValue = [...G.currentValue];
            let a = currentValue[id];
            a = a ^ 1;
            currentValue[id] = a;
            return { ...G, currentValue };
        }
    },
    turn: {
        onEnd: (G, ctx) => {
            G.gameover = end(G.hp, G.cells);
            if (G.gameover) {
                for (let i = 0; i < x * y; i++) {
                    G.cells[i] = calculateMinesAround(G.cells, G.mineValue, i);
                    G.currentValue[i] = 0;
                    if (G.mineValue[i])
                        G.currentValue[i] = 1;
                }
            }
        },
    },
    endIf: (G, ctx) => {
    },
};

const server = Server({
  games: [Minesweeper],
});

server.run(3001 || process.env.PORT, () => console.log("server running..."));
const Server = require('boardgame.io/server').Server;

const x = 16;
const y = 9;
const createRandomMinedArray = () => {
    const arr = Array(x * y).fill(null);
    return arr;
}

const createArroundMineValueArray = () => {
    const arr = Array(x * y).fill(null);
    for(let i = 0 ; i < 15 ; i++){
        const randomInt = Math.floor(Math.random() * (x*y));
        arr[randomInt] = Math.floor(Math.random() * 5)+1;
    }
    return arr;
}

const calculateMinesAround = (cells,mineValue,id) => {
    let mines = 0;
    
    if(mineValue[id-1] && mineValue[id-1] > 0 && (id % x != 0)) {
        mines = mines + mineValue[id-1];
    }
    if(mineValue[id+1] && mineValue[id+1] > 0 && (id % x != x - 1)) {
        mines = mines + mineValue[id+1];
    }
    if(mineValue[id+x-1] && mineValue[id+x-1] > 0 && (id % x != 0)) {
        mines = mines + mineValue[id+x-1];
    }
    if(mineValue[id+x] && mineValue[id+x] > 0) {
        mines = mines + mineValue[id+x];
    }
    if(mineValue[id+x+1] && mineValue[id+x+1] > 0 && (id % x != x - 1)) {
        mines = mines + mineValue[id+x+1];
    }
    if(mineValue[id-x-1] && mineValue[id-x-1] > 0 && (id % x != 0)) {
        mines = mines + mineValue[id-x-1];
    }
    if(mineValue[id-x] && mineValue[id-x] > 0) {
        mines = mines + mineValue[id-x];
    }
    if(mineValue[id-x+1] && mineValue[id-x+1] > 0 && (id % x != x - 1)) {
        mines = mines + mineValue[id-x+1];
    }
    return mines;
}

const end = (hp) => {
    if (hp[0] <= 0)
        return {winner : 1};
    else if (hp[1] <= 0)
        return {winner : 0};
    else
        return false;
}

const Minesweeper = {
    name: 'minesweeper',
    setup: () => ({
        cells: createRandomMinedArray(),
        mineValue: createArroundMineValueArray(),
        playersMine: [5,4,3,2,1,5,4,3,2,1],
        currentValue: Array(x*y).fill(null),
        currentMine: null,
        numPlayers : 2,
        hp: Array(2).fill(10),
        boardx: x,
        boardy: y,
        gameover: null
    }),
    moves: {
        sweep(G, ctx, id) {
            console.log(id);
            let cells = [...G.cells];
            let mineValue = [...G.mineValue];
            let currentValue = [...G.currentValue];
            let cPlayer = ctx.currentPlayer;
            let hp = [...G.hp];
            let a = 0;
            console.log(cPlayer);
            console.log(hp[cPlayer]);
            currentValue[id] = 0;
            if(mineValue[id] > 0) {
                cells[id] = calculateMinesAround(G.cells,mineValue, id);
                console.log('mine'+'+'+cells[id]+'+'+ mineValue[id]);
                hp[cPlayer] = hp[cPlayer] - mineValue[id];
                if (hp[cPlayer] < 0){
                    hp[cPlayer] = 0;
                }
                currentValue[id] = 1; 
                console.log(cPlayer+':'+hp[cPlayer]+'*'+a);
            }else{
                cells[id] = calculateMinesAround(G.cells,mineValue, id);
                console.log('empty'+'+'+cells[id]+'+'+mineValue[id]);
                console.log(cPlayer+':'+hp[cPlayer]);
            }
            return {...G, cells,mineValue,hp,currentValue};
        },
        selectMine(G, ctx, value){
            let currentMine = G.currentMine;
            console.log('select');
            if (currentMine == value){
                currentMine = null;
            }else{
                currentMine = value; 
            }
            return {...G, currentMine};
        },

        placeMine(G, ctx, id){
            let mineValue = [...G.mineValue];
            let cPlayer = ctx.currentPlayer;
            let playersMine = [...G.playersMine];
            let currentMine = G.currentMine;
            console.log('place');
            mineValue[id] = mineValue[id] + currentMine;
            playersMine[cPlayer*5+currentMine-1]--;
            currentMine = null;
            return {...G, mineValue,currentMine,playersMine}; 
        },
        changeBoardShowing(G, ctx, id){
            let currentValue = [...G.currentValue];
            let a = currentValue[id];
            a = a ^ 1;
            currentValue[id] = a;
            return {...G, currentValue};
        }
    },
    turn:{
        onEnd:  (G,ctx)=>{
            G.gameover = end(G.hp);
            if (G.gameover){
                for (let i = 0; i < x*y; i++){
                    G.cells[i] = calculateMinesAround(G.cells,G.mineValue, i);
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

server.run(8080, () => console.log("server running..."));
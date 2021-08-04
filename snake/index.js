let c = document.getElementById("c");
let ctx = c.getContext("2d");

let grid = new Array(20).fill(null).map(() => (new Array(40)).fill(0));

let player = {
    xys: [[0, 0]],
    x: 0,
    y: 0,
    xVel: 1,
    yVel: 0,
    velocity: 0.005
};

let draw = grid => {
    ctx.beginPath();
    for (let i = 0; i < grid.length; i++)
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 0)
                ctx.clearRect((j * 10), (i * 10), (j * 10) + 10, (i * 10) + 10);
            else
                ctx.fillRect((j * 10), (i * 10), (j * 10) + 10, (i * 10) + 10);
        }
    ctx.stroke();
};

let randPoint = max => {
    return Math.floor(Math.random() * max);
};

let zeroGrid = g => {
    for (let i = 0; i < g.length; i++)
        for (let j = 0; j < g[0].length; j++)
            g[i][j] = 0;
}

let lastTime = 0;
let pelletSpawned = false;

let gameEngine = timestamp => {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    if (!pelletSpawned) {
        grid[randPoint(grid.length)][randPoint(grid[0].length)] = 1;
        pelletSpawned = true;
    }

    player.x += player.velocity * player.xVel * delta;
    player.y += player.velocity * player.yVel * delta;
    if (player.x >= grid[0].length)
        player.x -= grid[0].length;
    else if (player.x < 0)
        player.x = grid[0].length - 1;
    if (player.y >= grid.length)
        player.y -= grid.length;
    else if (player.y < 0)
        player.y = grid.length - 1;
    let x = Math.floor(player.x);
    let y = Math.floor(player.y);

    if (x != player.xys[0][0] || y != player.xys[0][1])
    for (let i = 0; i < player.xys.length; i++) {
        let tmp;
        tmp = player.xys[i][0];
        player.xys[i][0] = x;
        x = tmp;
        tmp = player.xys[i][1];
        player.xys[i][1] = y;
        y = tmp;
        grid[y][x] = 0;
        let val = grid[player.xys[i][1]][player.xys[i][0]];
        console.log(val);
        if (val == 1) {
            player.xys.push([0, 0]);
            if (player.xys.length % 4 == 0)
                player.velocity += 0.005;
            pelletSpawned = false;
        } else if (val == 2) {
            console.log(player, grid);
            zeroGrid(grid);
            pelletSpawned = false;
            player = {
                xys: [[0, 0]],
                x: 0,
                y: 0,
                xVel: 1,
                yVel: 0,
                velocity: 0.005
            };
        } else
            grid[player.xys[i][1]][player.xys[i][0]] = 2;
    }
    
    draw(grid);

    window.requestAnimationFrame(gameEngine);
};

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowDown":
            player.xVel = 0;
            player.yVel = 1;
            break;
        case "ArrowUp":
            player.xVel = 0;
            player.yVel = -1;
            break;
        case "ArrowLeft":
            player.xVel = -1;
            player.yVel = 0;
            break;
        case "ArrowRight":
            player.xVel = 1;
            player.yVel = 0;
            break;
        default:
            return;
    }
}, true);

window.requestAnimationFrame(gameEngine);
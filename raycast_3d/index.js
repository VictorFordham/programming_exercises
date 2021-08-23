let c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
let ctx = c.getContext("2d");

let width = c.width;
let height = c.height;

const playerSpeed = 0.002;
const playerRotSpeed = 0.002;
const playerFOV = 0.6;
const raycastIncrement = 0.001;

let input = {
    up: 0,
    dn: 0,
    left: 0,
    right: 0,
    fire: 0,
    d: 0,
};

let player = {
    x: 4,
    y: 4,
    rot: 0,
};

let world = {
    world: [
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
    ],
    worldWidth: 8,
};

let rotate = (x, y, angle) => {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    let new_x = x * c - y * s;
    let new_y = x * s + y * c;

    return [new_x, new_y];
};

let draw = blocks => {
    ctx.clearRect(0, 0, width, height);
    for (block of blocks) {
        ctx.beginPath();
        ctx.moveTo(block[0], block[1]);
        ctx.lineTo(block[2], block[3]);
        ctx.lineTo(block[4], block[5]);
        ctx.lineTo(block[6], block[7]);
        ctx.fill();
    }
    ctx.stroke();
};

let renderWorld = () => {
    let blocks = [];

    let angle = player.rot - playerFOV;

    let widthUnits = Math.floor(((player.rot + playerFOV) - angle) / raycastIncrement);
    let stripeWidth = width / widthUnits;

    for (let i = 0; i < widthUnits; i++) {
        let xRay = player.x;
        let yRay = player.y;
        let x = Math.floor(xRay);
        let y = Math.floor(yRay);
        let vec = rotate(0, 1, angle);

        while (world.world[world.worldWidth * x + y] == 0) {
            xRay += vec[0] * 0.01;
            yRay += vec[1] * 0.01;
            x = Math.floor(xRay);
            y = Math.floor(yRay);
        }

        let distance = Math.sqrt(Math.pow(player.x - xRay, 2) + Math.pow(player.y - yRay, 2));

        let mid = height / 2;
        let wallHeight = 200;

        let xPosition = i * stripeWidth;

        blocks.push([
            xPosition,
            mid - wallHeight / distance,
            xPosition + stripeWidth,
            mid - wallHeight / distance,
            xPosition + stripeWidth,
            mid + wallHeight / distance,
            xPosition,
            mid + wallHeight / distance,
        ]);

        angle += raycastIncrement;
    }

    // draw a world map

    draw(blocks);
};

let lastTime = 0;

let gameEngine = timestamp => {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    if (input.up) {
        let vec = rotate(0, 1, player.rot);
        player.x += delta * vec[0] * playerSpeed;
        player.y += delta * vec[1] * playerSpeed;
    }

    if (input.dn) {
        let vec = rotate(0, 1, player.rot);
        player.x -= delta * vec[0] * playerSpeed;
        player.y -= delta * vec[1] * playerSpeed;
    }

    if (input.a) {
        let vec = rotate(0, 1, player.rot - Math.PI / 2);
        player.x += delta * vec[0] * playerSpeed;
        player.y += delta * vec[1] * playerSpeed;
    }

    if (input.d) {
        let vec = rotate(0, 1, player.rot + Math.PI / 2);
        player.x += delta * vec[0] * playerSpeed;
        player.y += delta * vec[1] * playerSpeed;
    }

    player.rot += (delta * input.left * -playerRotSpeed) + (delta * input.right * playerRotSpeed);

    renderWorld();

    window.requestAnimationFrame(gameEngine);
};

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp":
            input.up = 1;
            break;
        case "ArrowDown":
            input.dn = 1;
            break;
        case "ArrowLeft":
            input.left = 1;
            break;
        case "ArrowRight":
            input.right = 1;
            break;
        case "a":
            input.a = 1;
            break;
        case "f":
            input.fire = 1;
            break;
        case "d":
            input.d = 1;
            break;
        default:
            return;
    }
}, true);

window.addEventListener("keyup", e => {
    switch (e.key) {
        case "ArrowUp":
            input.up = 0;
            break;
        case "ArrowDown":
            input.dn = 0;
            break;
        case "ArrowLeft":
            input.left = 0;
            break;
        case "ArrowRight":
            input.right = 0;
            break;
        case "a":
            input.a = 0;
            break;
        case "f":
            input.fire = 0;
            break;
        case "d":
            input.d = 0;
            break;
        default:
            return;
    }
}, true);

window.addEventListener("resize", e => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    width = c.width;
    height = c.height;
});

window.requestAnimationFrame(gameEngine);
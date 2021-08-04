let c = document.getElementById("c");
let ctx = c.getContext("2d");

let player = {
    x: 150,
    y: 50,
    rot: 0,
    xVel: 0,
    yVel: 0,
    obj: [
        [-5, -15, 5, -15, 5, 5, -5, -5],
        [-8, -5, 8, -5, 12, 5, -12, 5]
    ]
};

let input = {
    up: 0,
    dn: 0,
    left: 0,
    right: 0,
};

let rotationSpeed = 0.005;
let accelSpeed = 0.0005;

let draw = blocks => {
    ctx.clearRect(0, 0, 400, 200);
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

let rotate = (x, y, angle) => {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    let new_x = x * c - y * s;
    let new_y = x * s + y * c;

    return [new_x, new_y];
};

let lastTime = 0;

let gameEngine = timestamp => {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    let i = rotate(1, 0, player.rot);
    let j = rotate(0, 1, player.rot);

    if (input.dn) {
        player.xVel = 0;
        player.yVel = 0;
    }

    player.xVel += input.up * -j[0] * delta * accelSpeed;
    player.yVel += input.up * -j[1] * delta * accelSpeed;

    player.rot += (input.left * -rotationSpeed * delta) + (input.right * rotationSpeed * delta);
    player.x += player.xVel * delta;
    player.y += player.yVel * delta;
    if (player.x < 0)
        player.x += 399;
    else if (player.x > 399)
        player.x -= 399;
    if (player.y < 0)
        player.y += 199;
    else if (player.y > 199)
        player.y -= 199;

    let renderBlocks = player.obj.map(arr => {
        let [x1, y1] = rotate(arr[0], arr[1], player.rot);
        let [x2, y2] = rotate(arr[2], arr[3], player.rot);
        let [x3, y3] = rotate(arr[4], arr[5], player.rot);
        let [x4, y4] = rotate(arr[6], arr[7], player.rot);
        // let x1 = arr[0] * i[0] * j[0];
        // let y1 = arr[1] * i[1] * j[1];
        // let x2 = arr[2] * i[0] * j[0];
        // let y2 = arr[3] * i[1] * j[1];
        // let x3 = arr[4] * i[0] * j[0];
        // let y3 = arr[5] * i[1] * j[1];
        // let x4 = arr[6] * i[0] * j[0];
        // let y4 = arr[7] * i[1] * j[1];
        x1 += player.x;
        y1 += player.y;
        x2 += player.x;
        y2 += player.y;
        x3 += player.x;
        y3 += player.y;
        x4 += player.x;
        y4 += player.y;
        return [x1, y1, x2, y2, x3, y3, x4, y4];
    });

    draw(renderBlocks);

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
        default:
            return;
    }
}, true);

window.requestAnimationFrame(gameEngine);
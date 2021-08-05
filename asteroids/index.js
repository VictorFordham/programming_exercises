let c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
let ctx = c.getContext("2d");

let width = c.width;
let height = c.height;

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
    fire: 0,
    debug: 0
};

let asteroids = [];
let bullets = [];
/* bullet object
{
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0,
    obj: [
        [-3, -3, 3, -3, 3, 3, -3, 3]
    ],
    sine: 0,
    cosine: 0,
}
*/
let particles = [];
/* particle object
{
    x: 0,
    y: 0,
    xVel: 0,
    yVel: 0,
    obj: [
        [-1, -1, 1, -1, 1, 1, -1, 1]
    ],
    cosine: 0,
    sine: 0
}
*/

let rotationSpeed = 0.005;
let accelSpeed = 0.0005;
let bulletSpeed = 0.1;
let particleSpeed = 0.05;

let outerThrustParticleOffset = 0.2;

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

let rotate = (x, y, angle) => {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    let new_x = x * c - y * s;
    let new_y = x * s + y * c;

    return [new_x, new_y];
};

let applyRotation = (x, y, cosine, sine) => {
    return [x * cosine - y * sine, x * sine + y * cosine];
}

let generateRenderBlock = (arr, xOffset, yOffset, cosine, sine) => {
        let [x1, y1] = applyRotation(arr[0], arr[1], cosine, sine);
        let [x2, y2] = applyRotation(arr[2], arr[3], cosine, sine);
        let [x3, y3] = applyRotation(arr[4], arr[5], cosine, sine);
        let [x4, y4] = applyRotation(arr[6], arr[7], cosine, sine);
        x1 += xOffset;
        y1 += yOffset;
        x2 += xOffset;
        y2 += yOffset;
        x3 += xOffset;
        y3 += yOffset;
        x4 += xOffset;
        y4 += yOffset;
        return [x1, y1, x2, y2, x3, y3, x4, y4];
};

let lastTime = 0;

let gameEngine = timestamp => {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    let sine = Math.sin(player.rot);
    let cosine = Math.cos(player.rot);

    // let i = applyRotation(1, 0, cosine, sine);
    let j = applyRotation(0, 1, cosine, sine);

    bullets = bullets.filter(obj => (obj.x >= 0 && obj.x < width) && (obj.y >= 0 && obj.y < height));
    particles = particles.filter(obj => (obj.x >= 0 && obj.x < width) && (obj.y >= 0 && obj.y < height));

    if (input.fire) {
        let [xBullet, yBullet] = applyRotation(0, -20, cosine, sine);
        bullets.push({
            x: player.x + xBullet,
            y: player.y + yBullet,
            xVel: -j[0] * bulletSpeed,
            yVel: -j[1] * bulletSpeed,
            obj: [
                [-3, -3, 3, -3, 3, 3, -3, 3]
            ],
            cosine: cosine,
            sine: sine
        });
    }

    if (input.dn) {
        player.xVel = 0;
        player.yVel = 0;
    }

    if (input.up) {
        // spawn exhaust particles
        let cosineLeft = Math.cos(player.rot - outerThrustParticleOffset);
        let sineLeft = Math.sin(player.rot - outerThrustParticleOffset);
        let cosineRight = Math.cos(player.rot + outerThrustParticleOffset);
        let sineRight = Math.sin(player.rot + outerThrustParticleOffset);

        let [xCenter, yCenter] = applyRotation(0, 4, cosine, sine);
        // let [xLeft, yLeft] = applyRotation(0, 4, cosineLeft, sineLeft);
        // let [xRight, yRight] = applyRotation(0, 4, cosineRight, sineRight);
        let jLeft = applyRotation(0, 1, cosineLeft, sineLeft);
        let jRight = applyRotation(0, 1, cosineRight, sineRight);
        particles.push({
            x: player.x + xCenter,
            y: player.y + yCenter,
            xVel: jLeft[0] * particleSpeed,
            yVel: jLeft[1] * particleSpeed,
            obj: [
                [-1, -1, 1, -1, 1, 1, -1, 1]
            ],
            cosine: cosineLeft,
            sine: sineLeft,
        },
        {
            x: player.x + xCenter,
            y: player.y + yCenter,
            xVel: j[0] * particleSpeed,
            yVel: j[1] * particleSpeed,
            obj: [
                [-1, -1, 1, -1, 1, 1, -1, 1]
            ],
            cosine: cosine,
            sine: sine,
        },
        {
            x: player.x + xCenter,
            y: player.y + yCenter,
            xVel: jRight[0] * particleSpeed,
            yVel: jRight[1] * particleSpeed,
            obj: [
                [-1, -1, 1, -1, 1, 1, -1, 1]
            ],
            cosine: cosineRight,
            sine: sineRight,
        });
    }

    player.xVel += input.up * -j[0] * delta * accelSpeed;
    player.yVel += input.up * -j[1] * delta * accelSpeed;

    player.rot += (input.left * -rotationSpeed * delta) + (input.right * rotationSpeed * delta);
    player.x += player.xVel * delta;
    player.y += player.yVel * delta;
    if (player.x < 0)
        player.x += width - 1;
    else if (player.x > width - 1)
        player.x -= width - 1;
    if (player.y < 0)
        player.y += height - 1;
    else if (player.y > height - 1)
        player.y -= height - 1;

    let renderBlocks = player.obj.map(arr => generateRenderBlock(arr, player.x, player.y, cosine, sine));
    bullets.forEach(obj => {
        obj.x += obj.xVel * delta;
        obj.y += obj.yVel * delta;
        renderBlocks.push(...obj.obj.map(arr => generateRenderBlock(arr, obj.x, obj.y, obj.cosine, obj.sine)));
    });
    particles.forEach(obj => {
        obj.x += obj.xVel * delta;
        obj.y += obj.yVel * delta;
        renderBlocks.push(...obj.obj.map(arr => generateRenderBlock(arr, obj.x, obj.y, obj.cosine, obj.sine)));
    });
    if (input.debug)
        console.log(renderBlocks);
    
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
        case "f":
            input.fire = 1;
            break;
        case "d":
            input.debug = 1;
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
        case "f":
            input.fire = 0;
            break;
        case "d":
            input.debug = 0;
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
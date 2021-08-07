let c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
let ctx = c.getContext("2d");

let width = c.width;
let height = c.height;

let player = {
    despawnable: false,
    x: 150,
    y: 50,
    rot: 0,
    xVel: 0,
    yVel: 0,
    obj: [
        [-5, -15, 5, -15, 5, -5, -5, -5],
        [-8, -5, 8, -5, 12, 5, -12, 5]
    ],
    mass: 10,
};

let planet = {
    despawnable: false,
    x: 400,
    y: 400,
    rot: 0,
    xVel: 0,
    yVel: 0,
    obj: [
        [-5, -5, 5, -5, 5, 5, -5, 5]
    ],
    cosine: 1,
    sine: 0,
    mass: 2000,
};

let generateBlackHole = (x, y) => {
    let blackHole = {
        x: x,
        y: y,
        obj: [
            [-5, 0, -2, -5, 2, -5, 5, 0],
            [-5, 0, -2, 5, 2, 5, 5, 0]
        ],
        mass: 10000,
    }
};

let gravityObjects = [player, planet];

let input = {
    up: 0,
    dn: 0,
    left: 0,
    right: 0,
    fire: 0,
    debug: 0
};

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

let environment = [player, planet];

let rotationSpeed = 0.005;
let accelSpeed = 0.0005;
let bulletSpeed = 0.1;
let particleSpeed = 0.05;

let gravityPower = 0.0005;

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

let applyGravity = (arr, delta) => {
    for (let i = 0; i < arr.length - 1; i++)
        for (let j = i + 1; j < arr.length; j++) {
            let rSquared = Math.pow(arr[i].x - arr[j].x, 2) + Math.pow(arr[i].y - arr[j].y, 2);
            let angle = Math.atan2(arr[j].y - arr[i].y, arr[j].x - arr[i].x);
            let vec = rotate(1, 0, angle);
            let scale = 0;
            if (rSquared != 0) scale = (gravityPower * arr[j].mass) / rSquared;
            arr[i].xVel += vec[0] * scale * delta;
            arr[i].yVel += vec[1] * scale * delta;

            angle = Math.atan2(arr[i].y - arr[j].y, arr[i].x - arr[j].x);
            vec = rotate(1, 0, angle);
            scale = 0;
            if (rSquared != 0) scale = (gravityPower * arr[i].mass) / rSquared;
            arr[j].xVel += vec[0] * scale * delta;
            arr[j].yVel += vec[1] * scale * delta;
        }
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
    player.sine = sine;
    player.cosine = cosine;

    // let i = applyRotation(1, 0, cosine, sine);
    let j = applyRotation(0, 1, cosine, sine);

    environment = environment.filter(obj => (obj.x >= 0 && obj.x <= width) && (obj.y >= 0 && obj.y <= height) || !obj.despawnable);

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
        environment.push({
            despawnable: true,
            x: player.x + xCenter,
            y: player.y + yCenter,
            xVel: jLeft[0] * particleSpeed,
            yVel: jLeft[1] * particleSpeed,
            obj: [
                [-1, -1, 1, -1, 1, 1, -1, 1]
            ],
            cosine: cosineLeft,
            sine: sineLeft,
            mass: 0.001,
        },
        {
            despawnable: true,
            x: player.x + xCenter,
            y: player.y + yCenter,
            xVel: j[0] * particleSpeed,
            yVel: j[1] * particleSpeed,
            obj: [
                [-1, -1, 1, -1, 1, 1, -1, 1]
            ],
            cosine: cosine,
            sine: sine,
            mass: 0.001,
        },
        {
            despawnable: true,
            x: player.x + xCenter,
            y: player.y + yCenter,
            xVel: jRight[0] * particleSpeed,
            yVel: jRight[1] * particleSpeed,
            obj: [
                [-1, -1, 1, -1, 1, 1, -1, 1]
            ],
            cosine: cosineRight,
            sine: sineRight,
            mass: 0.001,
        });
    }

    player.xVel += input.up * -j[0] * delta * accelSpeed;
    player.yVel += input.up * -j[1] * delta * accelSpeed;

    player.rot += (input.left * -rotationSpeed * delta) + (input.right * rotationSpeed * delta);

    if (player.x < 0)
        player.x += width - 1;
    else if (player.x > width - 1)
        player.x -= width - 1;
    if (player.y < 0)
        player.y += height - 1;
    else if (player.y > height - 1)
        player.y -= height - 1;

    applyGravity(environment.filter(obj => obj.mass != undefined), delta);

    let renderBlocks = [];
    environment.forEach(obj => {
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
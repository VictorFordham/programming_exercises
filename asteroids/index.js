let c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
let ctx = c.getContext("2d");

let width = c.width;
let height = c.height;

let player = {
    despawnable: false,
    fillStyle: "#ffffff",
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
    fillStyle: "#e33977",
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

let sun = {
    despawnable: false,
    fillStyle: "#F5D22A",
    x: 1200,
    y: 250,
    rot: 0,
    xVel: 0,
    yVel: 0,
    obj: [
        [-20, 0, -14, -14, 0, -20, 0, 0],
        [0, 0, 0, -20, 14, -14, 20, 0],
        [0, 20, 0, 0, 20, 0, 14, 14],
        [-14, 14, -20, 0, 0, 0, 0, 20]
    ],
    cosine: 1,
    sine: 0,
    mass: 10000,
}

let spectacle = {
    x: 0,
    y: 0,
    xStart: 776,
    yStart: 350,
    // xStart: 1000,
    // yStart: 250,
    orbitRotation: 0,
    particleRotation: 0,
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

let createParticle = (x, y, xVel, yVel, color, cosine, sine) => {
    return {
        despawnable: true,
        fillStyle: color,
        x: x,
        y: y,
        xVel: xVel,
        yVel: yVel,
        obj: [
            [-2, -2, 2, -2, 2, 2, -2, 2]
        ],
        cosine: cosine,
        sine: sine,
        mass: 0.001,
    };
};

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

let environment = {
    background: "#000000",
    gravitySources: [sun, planet],
    scene: [sun, player, planet],
}

let rotationSpeed = 0.005;
let accelSpeed = 0.0005;
let bulletSpeed = 0.1;
let particleSpeed = 0.05;
let spectacleOrbitSpeed = 0; //0.0001;
let spectacleParticleRotSpeed = 0.005;
let gravityPower = 0.0005;

let outerThrustParticleOffset = 0.2;

let draw = (blocks, background) => {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    for (block of blocks) {
        ctx.beginPath();
        ctx.fillStyle = block[8];
        ctx.moveTo(block[0], block[1]);
        ctx.lineTo(block[2], block[3]);
        ctx.lineTo(block[4], block[5]);
        ctx.lineTo(block[6], block[7]);
        ctx.fill();
    }
    ctx.stroke();
};

let applyGravity = (sources, objects, delta) => {
    for (let i = 0; i < sources.length; i++)
        for (let j = 0; j < objects.length; j++) {
            if (sources[i] == objects[j]) continue;
            let rSquared = Math.pow(sources[i].x - objects[j].x, 2) + Math.pow(sources[i].y - objects[j].y, 2);
            let angle = Math.atan2(sources[i].y - objects[j].y, sources[i].x - objects[j].x);
            let vec = rotate(1, 0, angle);
            let scale = 0;
            if (rSquared != 0) scale = (gravityPower * sources[i].mass) / rSquared;
            objects[j].xVel += vec[0] * scale * delta;
            objects[j].yVel += vec[1] * scale * delta;
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
};

let generateRenderBlock = (arr, color, xOffset, yOffset, cosine, sine) => {
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
        return [x1, y1, x2, y2, x3, y3, x4, y4, color];
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

    environment.scene = environment.scene.filter(obj => ((obj.x >= 0 && obj.x <= width) && (obj.y >= 0 && obj.y <= height) || !obj.despawnable) && (Math.pow(obj.x - sun.x, 2) + Math.pow(obj.y - sun.y, 2) > 900 || obj == sun));

    if (input.fire) {
        let [xBullet, yBullet] = applyRotation(0, -20, cosine, sine);
        environment.scene.push({
            despawnable: true,
            fillStyle: "#000000",
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
        environment.scene.push(
            createParticle(player.x + xCenter, player.y + yCenter, jLeft[0] * particleSpeed, jLeft[1] * particleSpeed, "#F55BD5", cosineLeft, sineLeft),
            createParticle(player.x + xCenter, player.y + yCenter, j[0] * particleSpeed, j[1] * particleSpeed, "#4EA2F5", cosine, sine),
            createParticle(player.x + xCenter, player.y + yCenter, jRight[0] * particleSpeed, jRight[1] * particleSpeed, "#42F5EF", cosineRight, sineRight)
        );
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

    spectacle.orbitRotation += spectacleOrbitSpeed * delta;
    spectacle.particleRotation += spectacleParticleRotSpeed * delta;

    [spectacle.x, spectacle.y] = rotate(spectacle.xStart - sun.x, spectacle.yStart - sun.y, spectacle.orbitRotation);
    spectacle.x += sun.x;
    spectacle.y += sun.y;

    let spectacleCosine = Math.cos(spectacle.particleRotation);
    let spectacleSine = Math.sin(spectacle.particleRotation);
    let spectacleCosineLeft = Math.cos(spectacle.particleRotation - outerThrustParticleOffset);
    let spectacleSineLeft = Math.sin(spectacle.particleRotation - outerThrustParticleOffset);
    let spectacleCosineRight = Math.cos(spectacle.particleRotation + outerThrustParticleOffset);
    let spectacleSineRight = Math.sin(spectacle.particleRotation + outerThrustParticleOffset);

    let spectacleJ = applyRotation(0, 1, spectacleCosine, spectacleSine);
    let spectacleJLeft = applyRotation(0, 1, spectacleCosineLeft,spectacleSineLeft);
    let spectacleJRight = applyRotation(0, 1, spectacleCosineRight, spectacleSineRight);
    environment.scene.push(
        createParticle(spectacle.x + spectacleJ[0], spectacle.y + spectacleJ[1], spectacleJLeft[0] * particleSpeed, spectacleJLeft[1] * particleSpeed, "#F55BD5", spectacleCosineLeft, spectacleSineLeft),
        createParticle(spectacle.x + spectacleJ[0], spectacle.y + spectacleJ[1], spectacleJ[0] * particleSpeed, spectacleJ[1] * particleSpeed, "#4EA2F5", spectacleCosine, spectacleSine),
        createParticle(spectacle.x + spectacleJ[0], spectacle.y + spectacleJ[1], spectacleJRight[0] * particleSpeed, spectacleJRight[1] * particleSpeed, "#42F5EF", spectacleCosineRight, spectacleSineRight),
        createParticle(spectacle.x + spectacleJ[0], spectacle.y + spectacleJ[1], -spectacleJLeft[0] * particleSpeed, -spectacleJLeft[1] * particleSpeed, "#F55BD5", spectacleCosineLeft, spectacleSineLeft),
        createParticle(spectacle.x + spectacleJ[0], spectacle.y + spectacleJ[1], -spectacleJ[0] * particleSpeed, -spectacleJ[1] * particleSpeed, "#4EA2F5", spectacleCosine, spectacleSine),
        createParticle(spectacle.x + spectacleJ[0], spectacle.y + spectacleJ[1], -spectacleJRight[0] * particleSpeed, -spectacleJRight[1] * particleSpeed, "#42F5EF", spectacleCosineRight, spectacleSineRight)
    );

    applyGravity(environment.gravitySources, environment.scene.filter(obj => obj.mass != undefined), delta);

    planet.xVel = 0;
    planet.yVel = 0;
    sun.xVel = 0;
    sun.yVel = 0;

    let renderBlocks = [];
    environment.scene.forEach(obj => {
        obj.x += obj.xVel * delta;
        obj.y += obj.yVel * delta;
        renderBlocks.push(...obj.obj.map(arr => generateRenderBlock(arr, obj.fillStyle, obj.x, obj.y, obj.cosine, obj.sine)));
    });
    if (input.debug)
        console.log(renderBlocks);
    
    draw(renderBlocks, environment.background);

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
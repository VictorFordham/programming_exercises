const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const mousePosition = {x: 0, y: 0};

class Animation {
    constructor(start, end, f, extra={}) {
        this.start = start;
        this.end = end;
        this.f = f;

        this.initialized = false;
        this.init = extra.init ?? null;
        this.deinit = extra.deinit ?? null;
    }
}

class Box {
    constructor(centerX, centerY, sideLength, subdivisions, visible=true) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.sideLength = sideLength;
        this.subdivisions = subdivisions;
        this.visible = visible;
    }

    draw() {
        if (!this.visible) {
            return;
        }
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        const halfSideLength = this.sideLength / 2;
        const x = this.centerX - halfSideLength;
        const y = this.centerY - halfSideLength;

        ctx.strokeRect(x, y, this.sideLength, this.sideLength);

        if (this.subdivisions <= 0) {
            return;
        }

        const sections = Math.pow(2, this.subdivisions);
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 1; i < sections; i++) {
            const frac = i / sections;
            const offsetX = x + frac * this.sideLength;
            const offsetY = y + frac * this.sideLength;

            ctx.moveTo(x, offsetY);
            ctx.lineTo(x + this.sideLength, offsetY);

            ctx.moveTo(offsetX, y);
            ctx.lineTo(offsetX, y + this.sideLength);
        }
        ctx.stroke();
    }
}

const world = [];
const animations = [];

const resetWorld = () => {
    world.splice(0, world.length);
    animations.splice(0, animations.length);

    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    const sideLength = Math.min(canvas.clientWidth, canvas.clientHeight) - 40;
    const subdivisions = 0;

    const majorBox = new Box(
        centerX, 
        centerY,
        sideLength,
        subdivisions,
    );

    world.push([majorBox]);

    // create minor boxes
    for (let _ = 0; _ < 3; _++) {
        const minorBox = new Box(
            centerX,
            centerY,
            sideLength,
            subdivisions,
            false,
        );

        world[0].push(minorBox);
    }
};

const drawLine = (a, b, c, d) => {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.stroke();
};

const rotate = (x, y, angle) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return [x * c - y * s, x * s + y * c];
}

const defineCurve = (startX, startY, increment, depth, rotation=0, forward=true) => {
    let moves = [
        3 * Math.PI / 2,
        0,
        Math.PI / 2,
    ];
    if (!forward) {
        moves = moves.reverse().map(x => x + Math.PI);
    }

    if (depth <= 1) {
        let prevX = startX;
        let prevY = startY;
        for (let move of moves) {
            const [x, y] = rotate(increment, 0, move + rotation);
            drawLine(prevX, prevY, prevX + x, prevY + y);
            prevX += x;
            prevY += y;
        }

        return [prevX, prevY];
    }

    const dir = forward ? Math.PI / 2 : -Math.PI / 2;
    const [section0X, section0Y] = defineCurve(startX, startY, increment, depth - 1, rotation + dir, !forward);
    const [move0X, move0Y] = rotate(increment, 0, moves[0] + rotation);
    let curX = section0X + move0X;
    let curY = section0Y + move0Y;
    drawLine(section0X, section0Y, curX, curY);
    const [section1X, section1Y] = defineCurve(curX, curY, increment, depth - 1, rotation, forward);
    const [move1X, move1Y] = rotate(increment, 0, moves[1] + rotation);
    curX = section1X + move1X;
    curY = section1Y + move1Y;
    drawLine(section1X, section1Y, curX, curY);
    const [section2X, section2Y] = defineCurve(curX, curY, increment, depth - 1, rotation, forward);
    const [move2X, move2Y] = rotate(increment, 0, moves[2] + rotation);
    curX = section2X + move2X;
    curY = section2Y + move2Y;
    drawLine(section2X, section2Y, curX, curY);
    const [section3X, section3Y] = defineCurve(curX, curY, increment, depth - 1, rotation - dir, !forward);

    return [section3X, section3Y];
};

let init = false;
let lastTimestamp = {current: 0};
const main = timestamp => {
    lastTimestamp.current = timestamp;

    if (!init) {
        init = true;

        resetWorld();
    }
    
    for (let animation of animations) {
        const duration = animation.end - animation.start;
        const t = Math.min((timestamp - animation.start) / duration, 1);
        if (t < 0) {
            continue;
        }
        if (animation.init && !animation.initialized) {
            animation.init();
        }
        animation.initialized = true;
        
        animation.f(t);
    }
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    for (let layer of world) {
        for (let item of layer) {
            item.draw();
        }
    }

    const majorBox = world[0][0];
    if (majorBox.subdivisions > 0) {
        const p = Math.pow(2, majorBox.subdivisions);
        const x = majorBox.centerX - (p-1)/p * 1/2 * majorBox.sideLength;
        const y = majorBox.centerY + (p-1)/p * 1/2 * majorBox.sideLength;
        defineCurve(x, y, majorBox.sideLength / p, majorBox.subdivisions, 0, true);
    }

    for (let i = 0; i < animations.length; i++) {
        const finished = timestamp >= animations[i].end;

        if (finished && animations[i].deinit) {
            animations[i].deinit();
        }

        if (finished) {
            animations.splice(i, 1);
            i--;
        }
    }

    window.requestAnimationFrame(main);
};

canvas.addEventListener("mousemove", e => {
    mousePosition.x = e.clientX - e.target.offsetLeft;
    mousePosition.y = e.clientY - e.target.offsetTop;
});

window.addEventListener("resize", e => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener("keydown", e => {
    if (e.key === "c") {
        init = false;
    }

    if (animations.length) {
        return;
    }

    // if (e.key === "b") {
    //     const majorBox = world[0][0];
    //     const newX = majorBox.centerX;
    //     const newY = majorBox.centerY;
    //     const newSideLength = majorBox.sideLength;

    //     const oldX = newX - 1/4 * newSideLength;
    //     const oldY = newY + 1/4 * newSideLength;
    //     const oldSideLength = newSideLength / 2;

    //     animations.push(new Animation(lastTimestamp.current, lastTimestamp.current + 1500, t => {
    //         const scale = Math.sin(Math.PI * t * t * t / 2);

    //         const diffX = newX - oldX;
    //         const diffY = newY - oldY;
    //         const diffSideLength = newSideLength - oldSideLength;

    //         majorBox.centerX = scale * diffX + oldX;
    //         majorBox.centerY = scale * diffY + oldY;
    //         majorBox.sideLength = scale * diffSideLength + oldSideLength;
    //     }, {
    //         init: () => {
    //             majorBox.sideLength = oldSideLength;
    //             majorBox.centerX = oldX;
    //             majorBox.centerY = oldY;
    //             majorBox.subdivisions--;
    //         }
    //     }));
    // }
    if (e.key === "n") {
        const majorBox = world[0][0];
        const oldX = majorBox.centerX;
        const oldY = majorBox.centerY;
        const oldSideLength = majorBox.sideLength;
        
        const newX = oldX - 1/4 * oldSideLength;
        const newY = oldY + 1/4 * oldSideLength;
        const newSideLength = oldSideLength / 2;

        animations.push(new Animation(lastTimestamp.current, lastTimestamp.current + 1000, t => {
            const scale = Math.sin(Math.PI * t * t * t / 2);

            const diffSideLength = newSideLength - oldSideLength;

            for (let i = 0; i < 4; i++) {
                world[0][i].sideLength = scale * diffSideLength + oldSideLength;
            }
        }));

        animations.push(new Animation(lastTimestamp.current, lastTimestamp.current + 1000, t => {
            const scale = Math.sin(Math.PI * t * t * t / 2);

            const diffX = newX - oldX;
            const diffY = newY - oldY;

            majorBox.centerX = scale * diffX + oldX;
            majorBox.centerY = scale * diffY + oldY;
        }));

        const square2DestX = newX;
        const square2DestY = newY - newSideLength;
        const square3DestX = newX + newSideLength;
        const square3DestY = newY - newSideLength;
        const square4DestX = newX + newSideLength;
        const square4DestY = newY;
        animations.push(new Animation(lastTimestamp.current + 800, lastTimestamp.current + 1800, t => {
            const scale = Math.sin(Math.PI * t * t / 2);
            const params = [
                [world[0][1], world[0][0].centerX, world[0][0].centerY, square2DestX, square2DestY],
                [world[0][2], world[0][0].centerX, world[0][0].centerY, square3DestX, square3DestY],
                [world[0][3], world[0][0].centerX, world[0][0].centerY, square4DestX, square4DestY],
            ];

            for (let param of params) {
                const [sq, srcX, srcY, dstX, dstY] = param;

                const diffX = dstX - srcX;
                const diffY = dstY - srcY;

                sq.centerX = scale * diffX + srcX;
                sq.centerY = scale * diffY + srcY;
            }
        }, {
            init: () => {
                for (let i = 1; i < 4; i++) {
                    world[0][i].centerX = newX;
                    world[0][i].centerY = newY;
                    world[0][i].subdivisions = world[0][0].subdivisions;
                    world[0][i].visible = true;
                }
            },
            deinit: () => {
                for (let i = 1; i < 4; i++) {
                    world[0][i].visible = false;
                }

                majorBox.sideLength = oldSideLength;
                majorBox.centerX = oldX;
                majorBox.centerY = oldY;
                majorBox.subdivisions++;
            }
        }));
    }
});

window.requestAnimationFrame(main);

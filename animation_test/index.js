const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const mousePosition = {x: 0, y: 0};

const rotate = (cX, cY, x, y, r) => {
    c = Math.cos(r);
    s = Math.sin(r);

    const adjX = x - cX;
    const adjY = y - cY;

    return [
        cX + c * adjX - s * adjY,
        cY + c * adjY + s * adjX,
    ];
}

const generateLineMove = (startX, startY, endX, endY) => {
    return (t) => {
        const scale = Math.sin(Math.PI * t * t * t / 2);
        // const scale = t * t;
        // const scale = (Math.sin(Math.PI * t - Math.PI / 2) + 1) / 2;
        const offsetX = (endX - startX) * scale;
        const offsetY = (endY - startY) * scale;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + offsetX, startY + offsetY);
        ctx.stroke();
    };
}

class Animation {
    constructor(start, end, f) {
        this.start = start;
        this.end = end;
        this.f = f;
    }
}

let animations = [];

let init = false;
let lastTimestamp = 0;
const main = timestamp => {
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!init) {
        init = true;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const timestampOffset = 50;
        let halfSideLength = Math.min(centerX, centerY) - 20;
        let rotation = 0;
        for (let i = 0; i < 10; i++) {
            let [pointX, pointY] = rotate(
                centerX, 
                centerY, 
                centerX - halfSideLength, 
                centerY - halfSideLength,
                rotation
            );
            for (let j = 0; j < 4; j++) {
                const dir = i % 2 == 0 ? 1 : -1;
                const [newX, newY] = rotate(centerX, centerY, pointX, pointY, dir * Math.PI / 2);
                const start = timestamp + 4 * i * timestampOffset + j * timestampOffset;
                animations.push(
                    new Animation(
                        start,
                        start + 1000,
                        generateLineMove(pointX, pointY, newX, newY),
                    )
                );

                pointX = newX;
                pointY = newY;
            }

            halfSideLength = Math.sqrt(halfSideLength * halfSideLength / 2);
            rotation += Math.PI / 4;
        }
        // animations.push(
        //     new Animation(
        //         timestamp,
        //         timestamp + 1000,
        //         generateLineMove(10, 10, 400, 10),
        //     )
        // );
        // animations.push(
        //     new Animation(
        //         timestamp,
        //         timestamp + 1000,
        //         generateLineMove(400, 10, 400, 410),
        //     )
        // );
        // animations.push(
        //     new Animation(
        //         timestamp,
        //         timestamp + 1000,
        //         generateLineMove(400, 410, 10, 410),
        //     )
        // );
        // animations.push(
        //     new Animation(
        //         timestamp,
        //         timestamp + 1000,
        //         generateLineMove(10, 410, 10, 10),
        //     )
        // );
    }

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    for (let animation of animations) {
        const duration = animation.end - animation.start;
        const t = Math.min((timestamp - animation.start) / duration, 1);
        if (t < 0) {
            continue;
        }

        animation.f(t);
    }

    // const majorSquareSideLength = canvas.height - 20;
    // const majorSquareOffset = {x: canvas.width / 2 - majorSquareSideLength / 2, y: 10};

    // ctx.fillStyle = "white";
    // ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // ctx.strokeStyle = "black";
    // ctx.fillStyle = "blue";
    // ctx.lineWidth = 6;
    // ctx.strokeRect(
    //     majorSquareOffset.x,
    //     majorSquareOffset.y, 
    //     majorSquareSideLength, 
    //     majorSquareSideLength
    // );
    // const minorSquareSideLength = majorSquareSideLength / 2;

    // ctx.lineWidth = 2;
    // ctx.beginPath();
    // ctx.moveTo(
    //     majorSquareOffset.x + minorSquareSideLength, 
    //     majorSquareOffset.y
    // );
    // ctx.lineTo(
    //     majorSquareOffset.x + minorSquareSideLength,
    //     majorSquareOffset.y + majorSquareSideLength
    // );
    // ctx.moveTo(
    //     majorSquareOffset.x,
    //     majorSquareOffset.y + minorSquareSideLength
    // );
    // ctx.lineTo(
    //     majorSquareOffset.x + majorSquareSideLength,
    //     majorSquareOffset.y + minorSquareSideLength
    // );
    // ctx.stroke();

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
    if (e.key == "c") {
        init = false;
        animations = [];
    }
});

window.requestAnimationFrame(main);

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    scale(magnitude) {
        return new Vec2(
            this.x * magnitude,
            this.y * magnitude
        );
    }

    add(v) {
        return new Vec2(
            this.x + v.x,
            this.y + v.y
        );
    }

    sub(v) {
        return new Vec2(
            this.x - v.x,
            this.y - v.y
        );
    }
}

const mousePosition = new Vec2(0, 0);
let chaserPosition = new Vec2(0, 0);

const errorHistory = [];
const getCorrectionMagnitude = error => {
    while (errorHistory.length > 19)
        errorHistory.shift();

    errorHistory.push(error);
    
    const correction = errorHistory.reduce((a, b) => a + b) * 0.0001;

    return correction;
};

let lastTimestamp = 0;
const main = timestamp => {
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const chaserToMouse = mousePosition.sub(chaserPosition);
    const error = chaserToMouse.magnitude();
    const correctionMagnitude = getCorrectionMagnitude(error) * delta;

    const movement = correctionMagnitude / error;
    if (!isNaN(movement)) {
        chaserPosition = chaserPosition.add(
            chaserToMouse.scale(movement)
        );
    }

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.beginPath();
    ctx.arc(chaserPosition.x, chaserPosition.y, 50, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();

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

window.requestAnimationFrame(main);

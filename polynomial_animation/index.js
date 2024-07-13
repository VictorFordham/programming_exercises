const c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
const ctx = c.getContext("2d");

const maxIncrement = 0.08;
const points = [];

const mouseState = {
    x: 0,
    y: 0,
    isClicked: false,
};
let randomize = false;
let selectedPoint = null;

const generatePolynomials = points => {
    const xPolynomials = [];
    const yPolynomials = [];

    points.forEach((point, i) => {
        const zeros = [...Array(points.length).keys()].filter(x => x !== i);
        const basePolynomial_i = zeros.reduce((acc, zero) => acc * (i - zero), 1);

        let xScalar = point.x / basePolynomial_i;
        let yScalar = point.y / basePolynomial_i;

        const evaluatePolynomial = (x, zerosIdx) => {
            const zero = zeros[zerosIdx];
            if (zerosIdx === zeros.length - 1) {
                return [x - zero, 1];
            }

            const v = x - zero;
            const [y, yDot] = evaluatePolynomial(x, zerosIdx + 1);

            return [v * y, v * yDot + y];
        };

        xPolynomials.push(t => {
            const [x, xDot] = evaluatePolynomial(t, 0);
            return [x * xScalar, xDot * xScalar];
        });
        yPolynomials.push(t => {
            const [y, yDot] = evaluatePolynomial(t, 0);
            return [y * yScalar, yDot * yScalar];
        });
    });

    const vecAdd = ([a, b], [c, d]) => [a + c, b + d];

    return [
        x => xPolynomials.reduce((acc, f) => vecAdd(acc, f(x)), [0, 0]),
        y => yPolynomials.reduce((acc, f) => vecAdd(acc, f(y)), [0, 0])
    ];
};

let lastTime = 0;
let spawnIncrement = 0;

const mainLoop = timestamp => {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    
    spawnIncrement += delta;
    if (randomize && spawnIncrement > 100) {
        spawnIncrement = 0;
        points.push({
            x: Math.random() * c.width,
            y: Math.random() * c.height,
        });
    }

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);    

    if (points.length > 0) {
        const fullPoints = mouseState.isClicked && !selectedPoint ? [...points, mouseState] : points;
        if (selectedPoint) {
            selectedPoint.x = mouseState.x;
            selectedPoint.y = mouseState.y;
        }
        const [xPolynomial, yPolynomial] = generatePolynomials(fullPoints);

        ctx.fillStyle = "blue";
        fullPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        });

        for (let t = 0; t < fullPoints.length - 1;) {
            const [x, xDot] = xPolynomial(t);
            const [y, yDot] = yPolynomial(t);

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();

            const increment = 4 / Math.sqrt(xDot * xDot + yDot * yDot);
            t += Math.min(increment, maxIncrement);
        }
    }

    window.requestAnimationFrame(mainLoop);
};

c.addEventListener("mousedown", e => {
    mouseState.isClicked = true;

    const closestPoint = points.find(point => {
        const x = mouseState.x - point.x;
        const y = mouseState.y - point.y;

        return x * x + y * y < 150;
    });
    if (closestPoint) {
        selectedPoint = closestPoint;
    }
});

c.addEventListener("mouseup", e => {
    mouseState.isClicked = false;
    if (selectedPoint) {
        selectedPoint = null;
        return;
    }

    points.push({
        x: mouseState.x,
        y: mouseState.y,
    });
});

c.addEventListener("mousemove", e => {
    mouseState.x = e.clientX - e.target.offsetLeft;
    mouseState.y = e.clientY - e.target.offsetTop;
});

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "r":
            randomize = true;
            break;
        case "c":
            points.length = 0;
            break;
        default:
            return;
    }
}, true);

window.addEventListener("keyup", e => {
    switch (e.key) {
        case "r":
            randomize = false;
            break;
        default:
            return;
    }
}, true);

window.addEventListener("resize", e => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
});

window.requestAnimationFrame(mainLoop);
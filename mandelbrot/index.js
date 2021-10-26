let c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
let width = c.width;
let height = c.height;
let ctx = c.getContext("2d");

let maxIterations = 1;

const renderPixel = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

const testComplexPoint = (x, y) => {
    let _x = x;
    let _y = y;

    let iterations;

    for (iterations = 0; iterations < maxIterations; iterations++) {
        let __x = (_x * _x) - (_y * _y);
        let __y = (_x * _y) * 2;

        __x += x;
        __y += y;

        _x = __x;
        _y = __y;

        if (((_x * _x) + (_y * _y)) > 4)
            return iterations;
    }

    return iterations;
};

const normalize = (value, srcMin, srcMax, dstMin, dstMax) => {
    return dstMin + ((dstMax - dstMin) / (srcMax - srcMin)) * (value - srcMin);
};

const getPixelColor = (x, y) => {
    let result = testComplexPoint(x, y);

    if (result == maxIterations)
        return "#000000";

    return `#0000${Math.floor(normalize(result, 0, maxIterations, 100, 255)).toString(16)}`;
};

const renderMandelbrotSet = () => {
    const size = Math.min(width, height);
    const offset = Math.floor(width / 2) - Math.floor(size / 2);

    for (let x = 0; x < size; x++)
        for (let y = 0; y < size; y++) {
            let _x = normalize(x, 0, size, -2.0, 2.0);
            let _y = normalize(y, 0, size, -2.0, 2.0);

            renderPixel(x + offset, y, getPixelColor(_x, _y));
        }
    
    return true;
};

let lastTime = 0;

let lastRender = -1000;

//let rendered = false;

const mainLoop = timestamp => {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    //rendered = rendered || renderMandelbrotSet();

    if ((timestamp - lastRender) >= 1000) {
        lastRender = timestamp;
        ctx.fillStyle = "#000064";
        ctx.fillRect(0, 0, width, height);
        renderMandelbrotSet();
        maxIterations++;
    }

    window.requestAnimationFrame(mainLoop);
};

window.addEventListener("resize", e => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    width = c.width;
    height = c.height;
    rendered = false;
});

window.requestAnimationFrame(mainLoop);
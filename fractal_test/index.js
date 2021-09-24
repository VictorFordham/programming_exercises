let c = document.getElementById("c");
c.width = window.innerWidth;
c.height = window.innerHeight;
let width = c.width;
let height = c.height;
let ctx = c.getContext("2d");
const sizeSlider = document.getElementById("size");
const offsetSlider = document.getElementById("offset");
const rotationSlider = document.getElementById("rotation");
const params = new URLSearchParams(document.location.search);

const Point = (x, y) => {
    return { x, y };
};

const Square = (center, p1, p2, p3, p4, fillColor) => {
    return {
        center,
        xys: [p1, p2, p3, p4],
        fillColor,
    };
};

let rotation = 1.5;
let squareSize = 0.4;
let squareOffset = 0;

const updateSearchParams = () => {
    const state = {
        rotation,
        squareSize,
        squareOffset
    };

    if (history.pushState) {
        const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?state=${JSON.stringify(state)}`;
        window.history.pushState({path:newurl},'',newurl);
    } else document.location.search = `?state=${JSON.stringify(state)}`;
};

if (params.has("state")) {
    const state = JSON.parse(params.get("state"));
    ({rotation, squareSize, squareOffset} = state);
} else updateSearchParams();

sizeSlider.value = squareSize * sizeSlider.max;
offsetSlider.value = squareOffset * offsetSlider.max;
rotationSlider.value = (rotation / 1.56) * rotationSlider.max;

/*
    "#5ecae6",
    "#e6d947",
    "#e6306f",
*/

let colors = [
    //"#9e9a73",
    "#5ecae6",
    "#e6d947",
    "#e6306f",
    //"#99284f"
];
let colorIndex = 0;

/* this was cool
    Square(
        Point(height * 0.5, height * 0.5),
        Point(height * 0.2, height * 0.1),
        Point(height * 0.2 + height * 0.6, height * 0.1),
        Point(height * 0.2 + height * 0.6, height * 0.1 + height * 0.6),
        Point(height * 0.2, height * 0.1 + height * 0.6),
        colors[0]
    );

    Square(
        Point(width * 0.5, height * 0.5),
        Point(height * 0.2, height * 0.1),
        Point(height * 0.2 + height * 0.6, height * 0.1),
        Point(height * 0.2 + height * 0.6, height * 0.1 + height * 0.6),
        Point(height * 0.2, height * 0.1 + height * 0.6),
        colors[0]
    );
*/

const generateStartingSquare = () => {
    const offset = width * 0.5 * squareOffset;
    return Square(
        Point(width * 0.5, height * 0.5),
        Point(width * 0.5 - height * squareSize - offset, height * 0.5 - height * squareSize),
        Point(width * 0.5 + height * squareSize - offset, height * 0.5 - height * squareSize),
        Point(width * 0.5 + height * squareSize - offset, height * 0.5 + height * squareSize),
        Point(width * 0.5 - height * squareSize - offset, height * 0.5 + height * squareSize),
        colors[0]
    );
}

let lastSquare = generateStartingSquare();

const findLineIntersection = (l1_p1, l1_p2, l2_p1, l2_p2) => {
    const A1 = l1_p2.y - l1_p1.y;
    const B1 = l1_p1.x - l1_p2.x;
    const C1 = A1 * l1_p1.x + B1 * l1_p1.y;

    const A2 = l2_p2.y - l2_p1.y;
    const B2 = l2_p1.x - l2_p2.x;
    const C2 = A2 * l2_p1.x + B2 * l2_p1.y;

    const det = A1 * B2 - A2 * B1;
    if (det != 0) {
        return Point(
            (B2 * C1 - B1 * C2) / det,
            (A1 * C2 - A2 * C1) / det
        );
    }

    return Point(l2_p1.x, l2_p1.y);
};

const rotate = (p1, p2, angle) => {
    const x = p2.x - p1.x;
    const y = p2.y - p1.y;

    const s = Math.sin(angle);
    const c = Math.cos(angle);

    const new_x = x * c - y * s;
    const new_y = x * s + y * c;

    return Point(new_x + p1.x, new_y + p1.y);
};

const renderer = square => {
    ctx.beginPath();
    ctx.fillStyle = square.fillColor;
    //ctx.strokeStyle = square.fillColor;
    ctx.moveTo(square.xys[0].x, square.xys[0].y);
    ctx.lineTo(square.xys[1].x, square.xys[1].y);
    ctx.lineTo(square.xys[2].x, square.xys[2].y);
    ctx.lineTo(square.xys[3].x, square.xys[3].y);
    ctx.lineTo(square.xys[0].x, square.xys[0].y);
    ctx.fill();
    ctx.stroke();
};

const rerender = () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.stroke();
    colorIndex = 0;
    lastSquare = generateStartingSquare();
};

let lastTime = 0;

const mainLoop = timestamp => {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    renderer(lastSquare);

    let points = [];
    for (let i = 0; i < 4; i++) {
        const p1 = lastSquare.xys[i];
        const p2 = lastSquare.xys[(i + 1) % 4];

        const new_p1 = rotate(lastSquare.center, p1, rotation);
        const new_p2 = rotate(lastSquare.center, p2, rotation);

        points.push(findLineIntersection(p1, p2, new_p1, new_p2));
    }

    colorIndex = (colorIndex + 1) % colors.length;

    lastSquare = Square(
        lastSquare.center,
        ...points,
        colors[colorIndex]
    );

    window.requestAnimationFrame(mainLoop);
};

window.addEventListener("resize", e => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    width = c.width;
    height = c.height;
    rerender();
});

const handleSizeChange = () => {
    squareSize = sizeSlider.value / sizeSlider.max;
    rerender();
    updateSearchParams();
};

const handleOffsetChange = () => {
    squareOffset = offsetSlider.value / offsetSlider.max;
    rerender();
    updateSearchParams();
};

const handleRotationChange = () => {
    rotation = 1.56 * (rotationSlider.value / rotationSlider.max);
    rerender();
    updateSearchParams();
}

window.requestAnimationFrame(mainLoop);
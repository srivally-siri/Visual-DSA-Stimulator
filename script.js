// ==========================================
// VISUAL DSA ALGORITHM SIMULATOR
// ==========================================

// Common helper functions

const $ = (id) => document.getElementById(id);

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));


// ==========================================
// 1. SORTING VISUALIZER
// ==========================================

let sortValues = [];
let sortBusy = false;
let sortPaused = false;
let sortStop = false;

const sortInfo = {
    bubble: ["Bubble Sort", "O(n)", "O(n²)", "O(1)"],
    selection: ["Selection Sort", "O(n²)", "O(n²)", "O(1)"],
    insertion: ["Insertion Sort", "O(n)", "O(n²)", "O(1)"],
    merge: ["Merge Sort", "O(n log n)", "O(n log n)", "O(n)"],
    quick: ["Quick Sort", "O(n log n)", "O(n²)", "O(log n) average"]
};


// Generate random array

function randomArray(size) {

    return Array.from(
        { length: size },
        () => Math.floor(Math.random() * 90) + 10
    );

}


// Render sorting bars

function renderSort(active = [], moving = [], sorted = []) {

    const container = $("sortBars");

    container.innerHTML = "";

    const max = Math.max(...sortValues, 1);

    sortValues.forEach((value, index) => {

        const bar = document.createElement("div");

        bar.className = "bar";

        if (sorted.includes(index)) {
            bar.classList.add("sorted");
        }

        else if (active.includes(index)) {
            bar.classList.add("compare");
        }

        else if (moving.includes(index)) {
            bar.classList.add("swap");
        }

        bar.style.height =
            `${(value / max) * 95}%`;

        bar.title = value;

        container.appendChild(bar);

    });

}


// Update sorting statistics

function updateSortStats(comparisons, accesses) {

    $("comparisons").textContent = comparisons;

    $("accesses").textContent = accesses;

}


// Update complexity information

function updateSortComplexity() {

    const info = sortInfo[$("sortAlgorithm").value];

    $("sortName").textContent = info[0];

    $("sortComplexity").innerHTML = `

        <div class="complexity-item">
            <span>Best Time</span>
            <strong>${info[1]}</strong>
        </div>

        <div class="complexity-item">
            <span>Worst Time</span>
            <strong>${info[2]}</strong>
        </div>

        <div class="complexity-item">
            <span>Space Complexity</span>
            <strong>${info[3]}</strong>
        </div>

    `;

}


// Generate new array

function newArray() {

    if (sortBusy) return;

    const size = Number($("arraySize").value);

    sortValues = randomArray(size);

    renderSort();

    updateSortStats(0, 0);

}


// Array size control

$("arraySize").addEventListener("input", () => {

    $("sizeValue").textContent = $("arraySize").value;

    newArray();

});


// Speed control

$("sortSpeed").addEventListener("input", () => {

    const speed = Number($("sortSpeed").value);

    $("speedValue").textContent =
        speed < 35 ? "Slow" :
        speed > 75 ? "Fast" : "Medium";

});


// Generate button

$("newArray").addEventListener("click", newArray);


// Algorithm selection

$("sortAlgorithm").addEventListener(
    "change",
    updateSortComplexity
);


// Reset sorting

$("sortReset").addEventListener("click", () => {

    sortStop = true;

    sortPaused = false;

    sortValues = randomArray(Number($("arraySize").value));

    renderSort();

    updateSortStats(0, 0);

    $("sortPause").disabled = true;

    $("sortPause").textContent = "Ⅱ Pause";

});


// Pause and resume

$("sortPause").addEventListener("click", () => {

    sortPaused = !sortPaused;

    $("sortPause").textContent =
        sortPaused ? "▶ Resume" : "Ⅱ Pause";

});


// Delay based on speed

function getSortDelay() {

    return 510 - Number($("sortSpeed").value) * 4.7;

}


async function waitSort() {

    while (sortPaused && !sortStop) {
        await sleep(100);
    }

    if (sortStop) {
        throw new Error("Sorting stopped");
    }

    await sleep(getSortDelay());

}


// Main sorting function

async function runSort() {

    if (sortBusy) return;

    sortBusy = true;

    sortStop = false;

    sortPaused = false;

    $("sortStart").disabled = true;

    $("sortPause").disabled = false;

    $("sortPause").textContent = "Ⅱ Pause";

    let comparisons = 0;

    let accesses = 0;

    const arr = sortValues.slice();

    const n = arr.length;

    const type = $("sortAlgorithm").value;


    // Visualization helper

    const draw = async (
        active = [],
        moving = [],
        sorted = []
    ) => {

        renderSort(active, moving, sorted);

        updateSortStats(comparisons, accesses);

        await waitSort();

    };


    try {

        // ==================================
        // BUBBLE SORT
        // ==================================

        if (type === "bubble") {

            for (let i = 0; i < n - 1; i++) {

                for (let j = 0; j < n - i - 1; j++) {

                    comparisons++;

                    accesses += 2;

                    await draw([j, j + 1]);

                    if (arr[j] > arr[j + 1]) {

                        [arr[j], arr[j + 1]] =
                            [arr[j + 1], arr[j]];

                        accesses += 2;

                        await draw([], [j, j + 1]);

                    }

                }

                await draw(
                    [],
                    [],
                    Array.from(
                        { length: i + 1 },
                        (_, k) => n - 1 - k
                    )
                );

            }

        }


        // ==================================
        // SELECTION SORT
        // ==================================

        else if (type === "selection") {

            for (let i = 0; i < n - 1; i++) {

                let min = i;

                for (let j = i + 1; j < n; j++) {

                    comparisons++;

                    accesses += 2;

                    await draw([min, j]);

                    if (arr[j] < arr[min]) {

                        min = j;

                    }

                }

                if (min !== i) {

                    [arr[i], arr[min]] =
                        [arr[min], arr[i]];

                    accesses += 2;

                    await draw([], [i, min]);

                }

                await draw(
                    [],
                    [],
                    Array.from(
                        { length: i + 1 },
                        (_, k) => k
                    )
                );

            }

        }


        // ==================================
        // INSERTION SORT
        // ==================================

        else if (type === "insertion") {

            for (let i = 1; i < n; i++) {

                let key = arr[i];

                let j = i - 1;

                while (j >= 0) {

                    comparisons++;

                    accesses += 2;

                    await draw([j, j + 1]);

                    if (arr[j] > key) {

                        arr[j + 1] = arr[j];

                        accesses++;

                        await draw([], [j, j + 1]);

                        j--;

                    }

                    else {

                        break;

                    }

                }

                arr[j + 1] = key;

                accesses++;

                await draw([j + 1]);

            }

        }


        // ==================================
        // MERGE SORT
        // ==================================

        else if (type === "merge") {

            async function mergeSort(left, right) {

                if (left >= right) return;

                const mid = Math.floor(
                    (left + right) / 2
                );

                await mergeSort(left, mid);

                await mergeSort(mid + 1, right);

                let leftArray = arr.slice(
                    left,
                    mid + 1
                );

                let rightArray = arr.slice(
                    mid + 1,
                    right + 1
                );

                let i = 0;

                let j = 0;

                let k = left;


                while (
                    i < leftArray.length &&
                    j < rightArray.length
                ) {

                    comparisons++;

                    accesses += 2;

                    await draw([
                        left + i,
                        mid + 1 + j
                    ]);

                    if (leftArray[i] <= rightArray[j]) {

                        arr[k++] = leftArray[i++];

                    }

                    else {

                        arr[k++] = rightArray[j++];

                    }

                    accesses++;

                    await draw(
                        [],
                        Array.from(
                            { length: k - left },
                            (_, x) => left + x
                        )
                    );

                }


                while (i < leftArray.length) {

                    arr[k++] = leftArray[i++];

                    accesses++;

                    await draw([], [k - 1]);

                }


                while (j < rightArray.length) {

                    arr[k++] = rightArray[j++];

                    accesses++;

                    await draw([], [k - 1]);

                }

            }

            await mergeSort(0, n - 1);

        }


        // ==================================
        // QUICK SORT
        // ==================================

        else if (type === "quick") {

            async function quickSort(left, right) {

                if (left >= right) return;

                let pivot = arr[right];

                let i = left;

                for (
                    let j = left;
                    j < right;
                    j++
                ) {

                    comparisons++;

                    accesses += 2;

                    await draw([j, right]);

                    if (arr[j] < pivot) {

                        [arr[i], arr[j]] =
                            [arr[j], arr[i]];

                        accesses += 2;

                        await draw([], [i, j]);

                        i++;

                    }

                }


                [arr[i], arr[right]] =
                    [arr[right], arr[i]];

                accesses += 2;

                await draw([], [i, right]);

                await quickSort(left, i - 1);

                await quickSort(i + 1, right);

            }

            await quickSort(0, n - 1);

        }


        // Final sorted array

        sortValues = arr;

        renderSort(
            [],
            [],
            Array.from({ length: n }, (_, i) => i)
        );

        updateSortStats(comparisons, accesses);

    }

    catch (error) {

        // Sorting was reset.

    }

    finally {

        sortBusy = false;

        $("sortStart").disabled = false;

        $("sortPause").disabled = true;

        $("sortPause").textContent = "Ⅱ Pause";

    }

}


// Start sorting

$("sortStart").addEventListener("click", runSort);


// ==========================================
// 2. SEARCHING VISUALIZER
// ==========================================

let searchValues = [];

let searchBusy = false;


// Generate sorted values

function makeSearchValues() {

    searchValues = Array.from(
        { length: 18 },
        () => Math.floor(Math.random() * 90) + 10
    );

    searchValues.sort((a, b) => a - b);

    renderSearch();

    $("searchResult").textContent =
        "New sorted values are ready.";

}


// Render searching bars

function renderSearch(
    active = [],
    found = -1,
    range = null
) {

    const container = $("searchBars");

    container.innerHTML = "";

    searchValues.forEach((value, index) => {

        const bar = document.createElement("div");

        bar.className = "bar";

        if (index === found) {

            bar.classList.add("found");

        }

        else if (active.includes(index)) {

            bar.classList.add("compare");

        }

        if (
            range &&
            (index < range[0] || index > range[1])
        ) {

            bar.style.opacity = "0.25";

        }

        bar.style.height = `${value}%`;

        bar.textContent = value;

        bar.title = `Index ${index}: ${value}`;

        container.appendChild(bar);

    });

}


// New values button

$("searchNew").addEventListener(
    "click",
    makeSearchValues
);


// Update searching complexity

function updateSearchComplexity() {

    const binary =
        $("searchAlgorithm").value === "binary";

    $("searchComplexity").innerHTML = `

        <div class="complexity-item">
            <span>Best Time</span>
            <strong>O(1)</strong>
        </div>

        <div class="complexity-item">
            <span>Worst Time</span>
            <strong>${binary ? "O(log n)" : "O(n)"}</strong>
        </div>

        <div class="complexity-item">
            <span>Space Complexity</span>
            <strong>O(1)</strong>
        </div>

    `;

}


// Change algorithm

$("searchAlgorithm").addEventListener(
    "change",
    () => {

        $("searchHint").textContent =
            $("searchAlgorithm").value === "binary"
                ? "Binary search repeatedly halves a sorted search range."
                : "Linear search checks each value from left to right.";

        updateSearchComplexity();

    }
);


// Search button

$("searchStart").addEventListener(
    "click",
    async () => {

        if (searchBusy) return;

        const target = Number($("searchTarget").value);

        if (!Number.isFinite(target)) return;

        searchBusy = true;

        $("searchStart").disabled = true;

        $("searchResult").textContent = "Searching...";

        let found = -1;


        // LINEAR SEARCH

        if (
            $("searchAlgorithm").value === "linear"
        ) {

            for (
                let i = 0;
                i < searchValues.length;
                i++
            ) {

                renderSearch([i]);

                await sleep(280);

                if (searchValues[i] === target) {

                    found = i;

                    break;

                }

            }

        }


        // BINARY SEARCH

        else {

            let left = 0;

            let right = searchValues.length - 1;

            while (left <= right) {

                let mid = Math.floor(
                    (left + right) / 2
                );

                renderSearch(
                    [mid],
                    -1,
                    [left, right]
                );

                await sleep(450);

                if (searchValues[mid] === target) {

                    found = mid;

                    break;

                }

                else if (searchValues[mid] < target) {

                    left = mid + 1;

                }

                else {

                    right = mid - 1;

                }

            }

        }


        if (found !== -1) {

            renderSearch([], found);

            $("searchResult").textContent =
                `Found ${target} at index ${found}.`;

        }

        else {

            renderSearch();

            $("searchResult").textContent =
                `${target} was not found in the array.`;

        }

        $("searchStart").disabled = false;

        searchBusy = false;

    }
);


// ==========================================
// 3. GRAPH PATHFINDING VISUALIZER
// ==========================================

const ROWS = 15;

const COLS = 25;

const START_ID = 7 * COLS + 3;

const END_ID = 7 * COLS + 21;

let startNode = START_ID;

let endNode = END_ID;

let walls = new Set();

let graphBusy = false;

let mouseDown = false;


// Build grid

function buildGrid() {

    const grid = $("grid");

    grid.innerHTML = "";

    for (
        let id = 0;
        id < ROWS * COLS;
        id++
    ) {

        const cell = document.createElement("div");

        cell.className = "cell";

        cell.dataset.id = id;

        if (id === startNode) {

            cell.classList.add("start");

        }

        if (id === endNode) {

            cell.classList.add("end");

        }

        if (walls.has(id)) {

            cell.classList.add("wall");

        }

        grid.appendChild(cell);

    }

}


// Clear visited and path colors

function clearGraphPaint() {

    document.querySelectorAll(".cell").forEach(
        cell => {

            cell.classList.remove(
                "visited",
                "path"
            );

        }
    );

}


// Toggle walls

function toggleWall(id) {

    if (
        id === startNode ||
        id === endNode ||
        graphBusy
    ) return;

    if (walls.has(id)) {

        walls.delete(id);

    }

    else {

        walls.add(id);

    }

    const cell = document.querySelector(
        `.cell[data-id="${id}"]`
    );

    if (cell) {

        cell.classList.toggle(
            "wall",
            walls.has(id)
        );

    }

}


// Mouse events for drawing walls

$("grid").addEventListener(
    "mousedown",
    event => {

        const cell = event.target.closest(".cell");

        if (cell) {

            mouseDown = true;

            toggleWall(Number(cell.dataset.id));

        }

    }
);


$("grid").addEventListener(
    "mouseover",
    event => {

        if (mouseDown) {

            const cell = event.target.closest(".cell");

            if (
                cell &&
                !walls.has(Number(cell.dataset.id))
            ) {

                toggleWall(Number(cell.dataset.id));

            }

        }

    }
);


document.addEventListener(
    "mouseup",
    () => {

        mouseDown = false;

    }
);


// Clear walls button

$("graphClear").addEventListener(
    "click",
    () => {

        if (graphBusy) return;

        walls.clear();

        buildGrid();

        $("graphResult").textContent =
            "Walls cleared.";

    }
);


// Reset grid

$("graphReset").addEventListener(
    "click",
    () => {

        if (graphBusy) return;

        walls.clear();

        clearGraphPaint();

        buildGrid();

        $("graphResult").textContent =
            "Grid reset.";

    }
);


// Find neighboring cells

function neighbors(id) {

    const row = Math.floor(id / COLS);

    const col = id % COLS;

    const directions = [

        [row - 1, col],

        [row, col + 1],

        [row + 1, col],

        [row, col - 1]

    ];

    return directions

        .filter(
            ([r, c]) =>
                r >= 0 &&
                r < ROWS &&
                c >= 0 &&
                c < COLS
        )

        .map(
            ([r, c]) => r * COLS + c
        )

        .filter(
            id => !walls.has(id)
        );

}


// Reconstruct path

function reconstructPath(parent, end) {

    const path = [];

    let current = end;

    while (current !== undefined) {

        path.unshift(current);

        current = parent.get(current);

    }

    return path;

}


// ==========================================
// BREADTH FIRST SEARCH
// ==========================================

function runBFS() {

    const visited = [];

    const parent = new Map();

    const seen = new Set([startNode]);

    const queue = [startNode];

    while (queue.length > 0) {

        const current = queue.shift();

        visited.push(current);

        if (current === endNode) {

            break;

        }

        for (const next of neighbors(current)) {

            if (!seen.has(next)) {

                seen.add(next);

                parent.set(next, current);

                queue.push(next);

            }

        }

    }

    return {

        visited,

        path: seen.has(endNode)
            ? reconstructPath(parent, endNode)
            : []

    };

}


// ==========================================
// DEPTH FIRST SEARCH
// ==========================================

function runDFS() {

    const visited = [];

    const parent = new Map();

    const seen = new Set([startNode]);

    const stack = [startNode];

    while (stack.length > 0) {

        const current = stack.pop();

        visited.push(current);

        if (current === endNode) {

            break;

        }

        for (const next of neighbors(current)) {

            if (!seen.has(next)) {

                seen.add(next);

                parent.set(next, current);

                stack.push(next);

            }

        }

    }

    return {

        visited,

        path: seen.has(endNode)
            ? reconstructPath(parent, endNode)
            : []

    };

}


// ==========================================
// DIJKSTRA'S ALGORITHM
// ==========================================

function runDijkstra() {

    const distance = new Map();

    const parent = new Map();

    const visited = [];

    const unvisited = new Set();

    distance.set(startNode, 0);

    for (
        let i = 0;
        i < ROWS * COLS;
        i++
    ) {

        if (!walls.has(i)) {

            unvisited.add(i);

        }

    }


    while (unvisited.size > 0) {

        let current = null;

        let bestDistance = Infinity;


        // Find the unvisited node with minimum distance

        for (const id of unvisited) {

            const d = distance.get(id) ?? Infinity;

            if (d < bestDistance) {

                bestDistance = d;

                current = id;

            }

        }


        if (current === null) {

            break;

        }

        unvisited.delete(current);

        visited.push(current);


        if (current === endNode) {

            break;

        }


        for (const next of neighbors(current)) {

            if (!unvisited.has(next)) continue;

            const newDistance = bestDistance + 1;

            if (
                newDistance <
                (distance.get(next) ?? Infinity)
            ) {

                distance.set(next, newDistance);

                parent.set(next, current);

            }

        }

    }


    return {

        visited,

        path: distance.has(endNode)
            ? reconstructPath(parent, endNode)
            : []

    };

}


// ==========================================
// ANIMATE GRAPH SEARCH
// ==========================================

async function animateGraph(visited, path) {

    for (const id of visited) {

        if (
            id !== startNode &&
            id !== endNode
        ) {

            document.querySelector(
                `.cell[data-id="${id}"]`
            )?.classList.add("visited");

        }

        await sleep(12);

    }


    for (const id of path) {

        if (
            id !== startNode &&
            id !== endNode
        ) {

            document.querySelector(
                `.cell[data-id="${id}"]`
            )?.classList.add("path");

        }

        await sleep(35);

    }

}


// Start graph algorithm

$("graphStart").addEventListener(
    "click",
    async () => {

        if (graphBusy) return;

        graphBusy = true;

        $("graphStart").disabled = true;

        clearGraphPaint();

        const algorithm = $("graphAlgorithm").value;

        let result;


        if (algorithm === "bfs") {

            result = runBFS();

        }

        else if (algorithm === "dfs") {

            result = runDFS();

        }

        else {

            result = runDijkstra();

        }


        await animateGraph(
            result.visited,
            result.path
        );


        if (result.path.length > 0) {

            $("graphResult").textContent =
                `Path found! ${
                    result.path.length - 1
                } steps · ${
                    result.visited.length
                } cells explored.`;

        }

        else {

            $("graphResult").textContent =
                "No path found. Try removing some walls.";

        }


        $("graphStart").disabled = false;

        graphBusy = false;

    }
);


// Graph complexity information

$("graphAlgorithm").addEventListener(
    "change",
    () => {

        const algorithm =
            $("graphAlgorithm").value;

        $("graphComplexity").innerHTML = `

            <div class="complexity-item">
                <span>Time Complexity</span>
                <strong>${
                    algorithm === "dijkstra"
                        ? "O(V²) in this implementation"
                        : "O(V + E)"
                }</strong>
            </div>

            <div class="complexity-item">
                <span>Space Complexity</span>
                <strong>O(V)</strong>
            </div>

            <div class="complexity-item">
                <span>Algorithm</span>
                <strong>${algorithm.toUpperCase()}</strong>
            </div>

        `;

    }
);


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

function init() {

    // Sorting

    newArray();

    updateSortComplexity();


    // Searching

    makeSearchValues();

    updateSearchComplexity();


    // Graphs

    buildGrid();

    $("graphComplexity").innerHTML = `

        <div class="complexity-item">
            <span>Time Complexity</span>
            <strong>O(V + E)</strong>
        </div>

        <div class="complexity-item">
            <span>Space Complexity</span>
            <strong>O(V)</strong>
        </div>

        <div class="complexity-item">
            <span>Algorithm</span>
            <strong>BFS</strong>
        </div>

    `;

}


// Run application

init();
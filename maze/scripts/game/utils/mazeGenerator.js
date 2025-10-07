export const generateMaze = ({ gridSize, randomSeed = Date.now() }) => {
    const maze = Array(gridSize).fill().map(() =>
        Array(gridSize).fill().map(() => ({
            top: true,
            right: true,
            bottom: true,
            left: true,
            visited: false
        }))
    );

    let currentSeed = randomSeed;
    const random = () => {
        currentSeed += 1;
        const x = Math.sin(currentSeed) * 10000;
        return x - Math.floor(x);
    };

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const edges = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (x < gridSize - 1) {
                edges.push({ x, y, nx: x + 1, ny: y, dir: 'right', opposite: 'left' });
            }
            if (y < gridSize - 1) {
                edges.push({ x, y, nx: x, ny: y + 1, dir: 'bottom', opposite: 'top' });
            }
        }
    }

    shuffle(edges);

    const parent = Array.from({ length: gridSize * gridSize }, (_, index) => index);
    const rank = Array(gridSize * gridSize).fill(0);
    const indexOf = (x, y) => y * gridSize + x;

    const find = (node) => {
        if (parent[node] !== node) {
            parent[node] = find(parent[node]);
        }
        return parent[node];
    };

    const union = (a, b) => {
        const rootA = find(a);
        const rootB = find(b);
        if (rootA === rootB) return false;

        if (rank[rootA] < rank[rootB]) {
            parent[rootA] = rootB;
        } else if (rank[rootA] > rank[rootB]) {
            parent[rootB] = rootA;
        } else {
            parent[rootB] = rootA;
            rank[rootA] += 1;
        }
        return true;
    };

    edges.forEach((edge) => {
        const cellIndex = indexOf(edge.x, edge.y);
        const neighborIndex = indexOf(edge.nx, edge.ny);
        if (union(cellIndex, neighborIndex)) {
            maze[edge.y][edge.x][edge.dir] = false;
            maze[edge.ny][edge.nx][edge.opposite] = false;
        }
    });

    return {
        maze,
        start: { x: 0, y: 0 },
        end: { x: gridSize - 1, y: gridSize - 1 }
    };
};


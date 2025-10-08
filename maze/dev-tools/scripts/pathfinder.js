/**
 * 使用BFS (廣度優先搜索) 算法找到從起點到終點的最短路徑
 * @param {Object} params - 參數對象
 * @param {Array} params.maze - 迷宮數據
 * @param {Object} params.start - 起點座標 {x, y}
 * @param {Object} params.end - 終點座標 {x, y}
 * @returns {Array|null} 路徑數組，包含所有移動方向，如果無法到達則返回null
 */
export function findShortestPath({ maze, start, end }) {
    const gridSize = maze.length;
    
    // BFS 隊列，每個元素包含當前位置和到達該位置的路徑
    const queue = [{ x: start.x, y: start.y, path: [] }];
    
    // 訪問記錄
    const visited = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    visited[start.y][start.x] = true;
    
    // 方向映射：上、右、下、左
    const directions = [
        { dx: 0, dy: -1, name: 'top', move: { dx: 0, dy: -1 } },
        { dx: 1, dy: 0, name: 'right', move: { dx: 1, dy: 0 } },
        { dx: 0, dy: 1, name: 'bottom', move: { dx: 0, dy: 1 } },
        { dx: -1, dy: 0, name: 'left', move: { dx: -1, dy: 0 } }
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // 到達終點
        if (current.x === end.x && current.y === end.y) {
            return current.path;
        }
        
        // 探索相鄰的格子
        for (const dir of directions) {
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            
            // 檢查邊界
            if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
                continue;
            }
            
            // 檢查是否已訪問
            if (visited[newY][newX]) {
                continue;
            }
            
            // 檢查牆壁
            const cell = maze[current.y][current.x];
            if (cell[dir.name]) {
                continue; // 有牆壁，不能通過
            }
            
            // 標記為已訪問
            visited[newY][newX] = true;
            
            // 添加到隊列，包含新的路徑
            queue.push({
                x: newX,
                y: newY,
                path: [...current.path, dir.move]
            });
        }
    }
    
    // 無法到達終點
    return null;
}

/**
 * 將路徑轉換為移動序列
 * @param {Array} path - 路徑數組
 * @returns {Array} 移動序列，每個元素包含 {dx, dy}
 */
export function pathToMoves(path) {
    return path;
}


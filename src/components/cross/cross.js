import {ref} from "vue";

import {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    BOARD_SIZE,
    CELL_STATE,
    GAME_STATE,
    MINED_CELL,
    OPENED_CELLS_PERCENT,
    EMPTY_CELL
} from "./const";
import {random} from "../../utils";

export default {
    setup() {
        return {
            gameState: ref(GAME_STATE.PLAY),
            board: ref([]),
            bombsCount: ref(0),
            flagsCount: ref(0),

            openedCellsCount: 0,

            CELL_STATE,
            GAME_STATE,
            MINED_CELL,
            EMPTY_CELL
        };
    },

    created() {
        this.resetGame();
    },

    methods: {
        sorter(a, b) {
            return b-a;
        },

        getBombsSeriesInCol(cell) {
            const sums = [];
            this.board.reduce((prevCellIsMined, row) => {
                const isMinedCell = row[cell.x].value === MINED_CELL;
                !prevCellIsMined && sums.unshift(0);
                isMinedCell && sums[0]++;
                return isMinedCell;
            }, false);
            return sums.sort(this.sorter)[0];
        },

        getBombsSeriesInRow(cell) {
            const sums = [];
            this.board[cell.y].reduce((prevCellIsMined, cell) => {
                const isMinedCell = cell.value === MINED_CELL;
                !prevCellIsMined && sums.unshift(0);
                isMinedCell && sums[0]++;
                return isMinedCell;
            }, false);
            return sums.sort(this.sorter)[0];

            // return this.board[cell.y].reduce((res, cell) => {
            //     return res + (cell.value === MINED_CELL) * 1;
            // }, 0);
        },

        getBombsCountInCol(cell) {
            return this.board.reduce((res, row) => {
                return res + (row[cell.x].value === MINED_CELL) * 1;
            }, 0);
        },

        getBombsCountInRow(cell) {
            return this.board[cell.y].reduce((res, cell) => {
                return res + (cell.value === MINED_CELL) * 1;
            }, 0);
        },

        forEachCell(onEveryRow, onEveryCell) {
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                if (onEveryRow && !onEveryRow(y, this.board[y])) return false;
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    if (onEveryCell && !onEveryCell(x, y, this.board[y], this.board[y]?.[x])) return false;
                }
            }
            return true;
        },

        hasEmptyCell() {
            return !this.forEachCell(null, (x, y, row, cell) => cell.value);
        },

        resetGame() {
            this.bombsCount = 0;
            this.flagsCount = 0;
            this.gameState = GAME_STATE.PLAY;
            this.openedCellsCount = 0;

            this.board = [];

            // init board
            this.forEachCell(
                () => this.board.push([]),
                (x, y, row) => row.push({
                    x, y,
                    value: 0,
                    state: CELL_STATE.CLOSED
                })
            );

            while (this.hasEmptyCell()) {
                const x = random(0, BOARD_WIDTH - 1);
                const y = random(0, BOARD_HEIGHT - 1);
                const cell = this.board[y][x];
                if (cell.value < MINED_CELL) {
                    if (random(0, 2)) {
                        cell.value = MINED_CELL;
                        this.bombsCount++;

                        for (let x = cell.x - 1; x <= cell.x + 1; x++) {
                            for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                                const nextCell = this.board[y]?.[x];
                                nextCell &&
                                nextCell.value < MINED_CELL && nextCell.value++;
                            }
                        }
                    } else {
                        cell.value = EMPTY_CELL;
                        cell.state = CELL_STATE.OPENED;
                        this.bombsCount++;
                        this.flagsCount++;
                    }
                }
            }

            let cellsToOpen = (BOARD_SIZE - this.bombsCount) / 100 * OPENED_CELLS_PERCENT;
            //let cellsToOpen = BOARD_SIZE - this.bombsCount;
            while (cellsToOpen > 0) {
                const x = random(0, BOARD_WIDTH - 1);
                const y = random(0, BOARD_HEIGHT - 1);
                const cell = this.board[y][x];
                if (cell.value !== MINED_CELL) {
                    //cell.state = CELL_STATE.OPENED;
                    this.openCell(cell);
                    cellsToOpen--;
                }
            }
        },

        openCell(cell) {
            cell.state = CELL_STATE.OPENED;
            this.openedCellsCount++;
        },

        onCellClick(cell) {
            if (cell.value === MINED_CELL) {
                this.gameState = GAME_STATE.LOSE;
                return;
            }

            this.openCell(cell);

            if (!cell.value) {
                for (let x = cell.x - 1; x <= cell.x + 1; x++) {
                    for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                        const nextCell = this.board[y]?.[x];
                        if (nextCell && nextCell.state < CELL_STATE.OPENED) {
                            nextCell.value ? this.openCell(nextCell) : this.onCellClick(nextCell);
                        }
                    }
                }
            }

            this.checkIsWin();
        },

        checkIsWin(){
            this.openedCellsCount >= BOARD_SIZE - this.bombsCount &&
            this.flagsCount >= this.bombsCount &&
            (this.gameState = GAME_STATE.WIN);
        },

        toggleFlag(cell) {
            cell.state = !cell.state * 1;
            this.flagsCount += cell.state ? 1 : -1;
            this.checkIsWin();
        }
    }
}
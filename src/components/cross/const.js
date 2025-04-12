/////////// Параметры игры /////////
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 10;
////////////////////////////////////

export const OPENED_CELLS_PERCENT = 50;

// общее количество клеток
export const BOARD_SIZE = BOARD_WIDTH * BOARD_HEIGHT;

// состояние игры
export const GAME_STATE = {
    PLAY: 0,
    WIN: 1,
    LOSE: 2
}

// состояние клетки
export const CELL_STATE = {
    CLOSED: 0, // клетка закрыта
    FLAGGED: 1, // на клетке стоит флаг
    OPENED: 2 // клетка открыта
}

export const MINED_CELL = 10;
export const EMPTY_CELL = 11;
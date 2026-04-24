let playerName = '';
let size = 3;
let tiles = [];
let moves = 0;
let seconds = 0;
let timer = null;
let started = false;

const $ = function(id) { return document.getElementById(id); };

// ========== ПАЛИТРЫ ==========
let palette = localStorage.getItem('palette') || 'cyan';
document.body.className = palette;

document.querySelectorAll('.palette-btn').forEach(function(btn) {
    if (btn.dataset.palette === palette) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }

    btn.onclick = function() {
        let p = btn.dataset.palette;
        document.body.className = p;
        localStorage.setItem('palette', p);
        document.querySelectorAll('.palette-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');
    };
});

// ========== ВХОД ==========
$('loginBtn').onclick = function() {
    let name = $('nameInput').value.trim();
    if (name) {
        playerName = name;
        $('userNameSpan').textContent = name;
    }
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function init() {
    clearInterval(timer);
    timer = null;
    moves = 0;
    seconds = 0;
    started = false;
    $('winMessage').classList.add('hidden');

    let total = size * size;
    tiles = [];
    for (let i = 0; i < total - 1; i++) {
        tiles.push(i + 1);
    }
    tiles.push(0);

    shuffle();
    updateUI();
    render();
}

// ========== ПЕРЕМЕШИВАНИЕ ==========
function shuffle() {
    for (let k = 0; k < 1000; k++) {
        let empty = tiles.indexOf(0);
        let row = Math.floor(empty / size);
        let col = empty % size;

        let neighbors = [];
        if (row > 0) neighbors.push(empty - size);
        if (row < size - 1) neighbors.push(empty + size);
        if (col > 0) neighbors.push(empty - 1);
        if (col < size - 1) neighbors.push(empty + 1);

        let rnd = neighbors[Math.floor(Math.random() * neighbors.length)];
        let tmp = tiles[empty];
        tiles[empty] = tiles[rnd];
        tiles[rnd] = tmp;
    }

    if (isSolved()) {
        let last = tiles.length - 1;
        let tmp = tiles[last];
        tiles[last] = tiles[last - 1];
        tiles[last - 1] = tmp;
    }
}

// ========== ОТРИСОВКА ==========
function render() {
    let grid = $('gameGrid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(' + size + ', 85px)';

    for (let i = 0; i < tiles.length; i++) {
        let tile = document.createElement('div');
        tile.classList.add('tile');
        
        if (tiles[i] === 0) {
            tile.classList.add('empty');
        } else {
            tile.textContent = tiles[i];
        }

        tile.onclick = function() {
            move(i);
        };

        grid.appendChild(tile);
    }
}

// ========== ХОД ==========
function move(index) {
    if (isSolved()) return;

    let empty = tiles.indexOf(0);
    let eRow = Math.floor(empty / size);
    let eCol = empty % size;
    let iRow = Math.floor(index / size);
    let iCol = index % size;

    let diff = Math.abs(eRow - iRow) + Math.abs(eCol - iCol);
    if (diff !== 1) return;

    if (!started) {
        started = true;
        timer = setInterval(function() {
            seconds++;
            $('timerDisplay').textContent = seconds;
        }, 1000);
    }

    let tmp = tiles[empty];
    tiles[empty] = tiles[index];
    tiles[index] = tmp;

    moves++;
    $('movesCount').textContent = moves;

    render();

    if (isSolved()) {
        clearInterval(timer);
        started = false;
        saveRecord();
        $('winMoves').textContent = moves;
        $('winTime').textContent = seconds;
        $('winMessage').classList.remove('hidden');
    }
}

// ========== ПРОВЕРКА ПОБЕДЫ ==========
function isSolved() {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
}

// ========== ОБНОВЛЕНИЕ ИНФО ==========
function updateUI() {
    $('movesCount').textContent = moves;
    $('timerDisplay').textContent = seconds;
}

// ========== РЕКОРДЫ ==========
function saveRecord() {
    if (!playerName) return;

    let key = 'pz_' + size;
    let records = JSON.parse(localStorage.getItem(key)) || [];

    records.push({
        name: playerName,
        moves: moves,
        time: seconds
    });

    records.sort(function(a, b) {
        if (a.moves !== b.moves) return a.moves - b.moves;
        return a.time - b.time;
    });

    if (records.length > 10) {
        records = records.slice(0, 10);
    }

    localStorage.setItem(key, JSON.stringify(records));
}

function showRating(s) {
    let key = 'pz_' + s;
    let records = JSON.parse(localStorage.getItem(key)) || [];
    let list = $('ratingList');
    list.innerHTML = '';

    if (records.length === 0) {
        list.innerHTML = '<li>Нет рекордов</li>';
        return;
    }

    for (let i = 0; i < records.length; i++) {
        let li = document.createElement('li');
        li.textContent = records[i].name + ' — ' + records[i].moves + ' ходов, ' + records[i].time + 'с';

        if (i === 0) {
            li.style.color = '#ff0';
            li.style.fontWeight = 'bold';
        }

        list.appendChild(li);
    }
}

// ========== КНОПКИ СЛОЖНОСТИ ==========
document.querySelectorAll('.diff-btn').forEach(function(btn) {
    btn.onclick = function() {
        document.querySelectorAll('.diff-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        size = parseInt(btn.dataset.size);
        init();
    };
});

// ========== ОСТАЛЬНЫЕ КНОПКИ ==========
$('restartBtn').onclick = init;
$('winCloseBtn').onclick = function() {
    $('winMessage').classList.add('hidden');
};

$('ratingBtn').onclick = function() {
    showRating(size);
    $('modal').style.display = 'block';
};

$('closeModal').onclick = function() {
    $('modal').style.display = 'none';
};

window.onclick = function(e) {
    if (e.target === $('modal')) {
        $('modal').style.display = 'none';
    }
};

document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.onclick = function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        showRating(btn.dataset.tab);
    };
});

// ========== СТАРТ ==========
init();
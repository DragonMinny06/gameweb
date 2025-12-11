// Variables de jeu
const MOVE_SPEED = 3;       // px par frame
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_GAP = 35;        // gap en vh
const PIPE_SEPARATION_FRAMES = 115;

const bird = document.querySelector('.bird');
const img = document.getElementById('bird-1');
const scoreValElem = document.querySelector('.score_val');
const scoreTitleElem = document.querySelector('.score_title');
const message = document.getElementById('message');
const flapButton = document.getElementById('flap-button');

let gameState = 'Start';
let birdDy = 0;
let pipes = []; // conteneurs .pipe_sprite
let pipeSeparationCounter = 0;
let frameIdMove = null;
let frameIdGravity = null;
let frameIdPipes = null;
let nextPairId = 1;

img.style.display = 'none';
message.classList.add('messageStyle');
scoreTitleElem.textContent = '';
scoreValElem.textContent = '0';

function flap(){
    if (gameState !== 'Play') return;
    img.src = 'images/bird-2.png';
    birdDy = FLAP_STRENGTH;
    setTimeout(() => { if (gameState === 'Play') img.src = 'images/bird_jeu.png'; }, 120);
}

function startGame(){
    // Réinitialisation
    document.querySelectorAll('.pipe_sprite').forEach(e => e.remove());
    pipes = [];
    img.style.display = 'block';
    bird.style.top = '40vh';
    birdDy = 0;
    scoreValElem.textContent = '0';
    scoreTitleElem.textContent = 'Score :';
    message.textContent = ' ';
    message.classList.remove('messageStyle');
    gameState = 'Play';

    cancelAnimationFrame(frameIdMove);
    cancelAnimationFrame(frameIdGravity);
    cancelAnimationFrame(frameIdPipes);
    frameIdMove = requestAnimationFrame(movePipes);
    frameIdGravity = requestAnimationFrame(applyGravity);
    frameIdPipes = requestAnimationFrame(createPipes);
}

function endGame(){
    gameState = 'End';
    message.innerHTML = '<span style="color:red">Game Over</span><br>Appuyez / Touchez pour recommencer';
    message.classList.add('messageStyle');
    img.style.display = 'none';
    cancelAnimationFrame(frameIdMove);
    cancelAnimationFrame(frameIdGravity);
    cancelAnimationFrame(frameIdPipes);
}

function isColliding(r1, r2){
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function movePipes(){
    if (gameState !== 'Play') return;
    const birdRect = bird.getBoundingClientRect();

    for (let i = pipes.length - 1; i >= 0; i--){
        const p = pipes[i];
        // assure que left est défini en px
        if (!p.style.left) p.style.left = window.innerWidth + 'px';
        const leftPx = parseFloat(p.style.left);
        const newLeft = leftPx - MOVE_SPEED;
        p.style.left = newLeft + 'px';

        const pRect = p.getBoundingClientRect();

        // collision
        if (isColliding(birdRect, pRect)){
            endGame();
            return;
        }

        // score : compter quand la paire a été passée (on compte sur la partie 'bottom')
        if (!p.dataset.counted && (pRect.right < birdRect.left)){
            if (p.dataset.pair && p.dataset.part === 'bottom'){
                const current = parseInt(scoreValElem.textContent || '0', 10);
                scoreValElem.textContent = (current + 1).toString();
                document.querySelectorAll(`.pipe_sprite[data-pair="${p.dataset.pair}"]`).forEach(el => el.dataset.counted = 'true');
            }
        }

        // retirer hors écran
        if (pRect.right <= 0){
            p.remove();
            pipes.splice(i, 1);
        }
    }

    frameIdMove = requestAnimationFrame(movePipes);
}

function applyGravity(){
    if (gameState !== 'Play') return;
    birdDy += GRAVITY;
    const birdRectBefore = bird.getBoundingClientRect();
    let newTop = birdRectBefore.top + birdDy;

    if (newTop <= 0 || newTop + birdRectBefore.height >= window.innerHeight){
        endGame();
        return;
    }

    bird.style.top = newTop + 'px';
    frameIdGravity = requestAnimationFrame(applyGravity);
}

function createPipes(){
    if (gameState !== 'Play') return;

    if (pipeSeparationCounter > PIPE_SEPARATION_FRAMES){
        pipeSeparationCounter = 0;

        // topVh = position (en vh) du bord supérieur du gap
        const minTopVh = 8;
        const maxTopVh = 43;
        const topVh = Math.floor(Math.random() * (maxTopVh - minTopVh + 1)) + minTopVh;

        // conversion vh -> px
        const topPx = (topVh / 100) * window.innerHeight;
        const gapPx = (PIPE_GAP / 100) * window.innerHeight;

        // --- ECLAIR SUPERIEUR : conteneur de hauteur topPx, ancré en haut (0px) ---
        const pipeTop = document.createElement('div');
        pipeTop.className = 'pipe_sprite top';
        pipeTop.style.top = '0px';
        pipeTop.style.height = Math.max(0, topPx) + 'px';
        pipeTop.style.left = window.innerWidth + 'px';
        pipeTop.dataset.pair = String(nextPairId);
        pipeTop.dataset.part = 'top';

        const imgTop = document.createElement('img');
        imgTop.src = 'images/eclair_jeu.png';
        imgTop.className = 'bolt_img';
        imgTop.alt = 'éclair';
        pipeTop.appendChild(imgTop);

        document.body.appendChild(pipeTop);
        pipes.push(pipeTop);

        // --- ECLAIR INFERIEUR : conteneur de hauteur restant sous le gap ---
        const bottomHeight = Math.max(0, window.innerHeight - (topPx + gapPx));
        const pipeBottom = document.createElement('div');
        pipeBottom.className = 'pipe_sprite bottom';
        pipeBottom.style.top = (topPx + gapPx) + 'px';
        pipeBottom.style.height = bottomHeight + 'px';
        pipeBottom.style.left = window.innerWidth + 'px';
        pipeBottom.dataset.pair = String(nextPairId);
        pipeBottom.dataset.part = 'bottom';

        const imgBottom = document.createElement('img');
        imgBottom.src = 'images/eclair_jeu.png';
        imgBottom.className = 'bolt_img';
        imgBottom.alt = 'éclair';
        pipeBottom.appendChild(imgBottom);

        document.body.appendChild(pipeBottom);
        pipes.push(pipeBottom);

        nextPairId++;
    }

    pipeSeparationCounter++;
    frameIdPipes = requestAnimationFrame(createPipes);
}

/* Événements */
message.addEventListener('pointerdown', () => { if (gameState !== 'Play') startGame(); });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameState !== 'Play') startGame();
    if ((e.key === ' ' || e.key === 'ArrowUp') && gameState === 'Play') flap();
});

document.addEventListener('pointerdown', (e) => { if (gameState === 'Play') flap(); });

if (flapButton){
    flapButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState !== 'Play') startGame();
        else flap();
    });
}

message.addEventListener('pointerup', () => {
    if (gameState === 'End') startGame();
});
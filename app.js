const grid = document.getElementById('grid');
const cells = [];
const model = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
const player = new mm.Player();

// 1. Build the 16-step grid (Notes: C, D, E, G, A)
const notes = [60, 62, 64, 67, 69]; 
for (let i = 0; i < 80; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.step = i % 16;
    cell.dataset.note = notes[Math.floor(i / 16)];
    cell.onclick = () => cell.classList.toggle('active');
    grid.appendChild(cell);
    cells.push(cell);
}

// 2. Convert Grid to Magenta Sequence
function getSequence() {
    const activeCells = cells.filter(c => c.classList.contains('active'));
    return {
        notes: activeCells.map(c => ({
            pitch: parseInt(c.dataset.note),
            startTime: parseInt(c.dataset.step) * 0.5,
            endTime: (parseInt(c.dataset.step) + 1) * 0.5
        })),
        totalTime: 8
    };
}

// 3. AI Magic: Predict the next notes
async function generateAI() {
    await model.initialize();
    const userSeq = getSequence();
    
    // AI looks at your pattern and generates 16 more steps
    const aiSeq = await model.continueSequence(userSeq, 16, 1.1);
    
    // Show AI notes on the grid
    aiSeq.notes.forEach(note => {
        const step = (note.startTime / 0.5) % 16;
        const target = cells.find(c => c.dataset.note == note.pitch && c.dataset.step == step);
        if (target) target.classList.add('active');
    });
}

function play() {
    mm.Player.tone.context.resume();
    player.start(getSequence());
}

function clearGrid() {
    cells.forEach(c => c.classList.remove('active'));
}

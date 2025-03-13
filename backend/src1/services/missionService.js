const { spawn } = require('child_process');

async function generateMission(city, difficulty) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', ['python_services/generate_mission.py', city, difficulty]);

        let result = '';
        pythonProcess.stdout.on('data', (data) => result += data.toString());
        pythonProcess.stderr.on('data', (data) => reject(data.toString()));

        pythonProcess.on('close', () => resolve(result.trim()));
    });
}

module.exports = { generateMission };

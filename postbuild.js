import { promises as fs } from 'fs';

const filePath = './build/src/XrmEx.js';

async function replaceInFile() {
    try {
        let data = await fs.readFile(filePath, 'utf8');
        const result = data.replace(/export var XrmEx/g, 'var XrmEx');
        await fs.writeFile(filePath, result, 'utf8');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

replaceInFile();
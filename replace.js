import { promises as fs } from 'fs';

async function replaceInFile(searchValue, replaceValue, filePath) {
    try {
        console.log(`Replacing "${searchValue}" with "${replaceValue}" in file ${filePath}`);
        let data = await fs.readFile(filePath, 'utf8');
        const result = data.replace(new RegExp(searchValue, 'g'), replaceValue);
        await fs.writeFile(filePath, result, 'utf8');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
const [searchValue, replaceValue, filePath] = process.argv.slice(2);
replaceInFile(searchValue, replaceValue, filePath);
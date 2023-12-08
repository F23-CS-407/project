import { join } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..'); // Assuming the directory is one level up

export async function storeContent(req, res) {
  try {
    const { type, content } = req.body;

    // Validate that 'type' and 'content' are present in the request body
    if (!type || !content) {
      return res.status(400).json({ error: 'Invalid request. Please provide both "type" and "content".' });
    }

    // Create a filename based on the type
    const filename = `${type}.txt`;
    const filePath = join(__dirname, '../../', 'storage', filename);

    // Check if the file exists
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    // Append content to the file with a divider
    await fs.appendFile(filePath, `${fileExists ? '\n\n' : ''}----- New Entry -----\n${content}`);

    res.status(200).json({ message: 'Content stored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

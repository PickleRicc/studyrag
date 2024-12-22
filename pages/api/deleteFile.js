import { removeFileFromActive, getActiveFiles } from '../../utils/fileManagement';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { fileName } = req.query;

        if (!fileName) {
            return res.status(400).json({ error: 'fileName is required' });
        }

        console.log('Before deletion - Active files:', getActiveFiles());
        
        // Remove from active files
        await removeFileFromActive(fileName);
        
        const currentActiveFiles = getActiveFiles();
        console.log('After deletion - Active files:', currentActiveFiles);

        return res.status(200).json({ 
            message: 'File removed successfully',
            activeFiles: currentActiveFiles
        });
    } catch (error) {
        console.error('Error removing file:', error);
        return res.status(500).json({ error: 'Failed to remove file' });
    }
}

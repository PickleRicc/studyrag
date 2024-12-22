import { getActiveFiles } from '../../utils/fileManagement';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const activeFiles = getActiveFiles();
        console.log('Current active files:', activeFiles);
        
        return res.status(200).json({ 
            activeFiles,
            count: activeFiles.length
        });
    } catch (error) {
        console.error('Error getting active files:', error);
        return res.status(500).json({ error: 'Failed to get active files' });
    }
}

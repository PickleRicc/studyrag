import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export function useDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchDocuments = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addDocument = async (fileName, filePath, fileSize) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('documents')
                .insert({
                    user_id: user.id,
                    file_name: fileName,
                    file_path: filePath,
                    file_size: fileSize,
                    embedding_status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;
            setDocuments(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error adding document:', err);
            throw err;
        }
    };

    const updateEmbeddingStatus = async (documentId, status, namespace = null) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('documents')
                .update({ 
                    embedding_status: status,
                    ...(namespace && { pinecone_namespace: namespace })
                })
                .eq('id', documentId)
                .eq('user_id', user.id);

            if (error) throw error;
            
            // Update local state
            setDocuments(prev => prev.map(doc => 
                doc.id === documentId 
                    ? { ...doc, embedding_status: status, ...(namespace && { pinecone_namespace: namespace }) }
                    : doc
            ));
        } catch (err) {
            console.error('Error updating embedding status:', err);
            throw err;
        }
    };

    useEffect(() => {
        if (user) {
            fetchDocuments();
        } else {
            setDocuments([]);
        }
    }, [user]);

    return {
        documents,
        loading,
        error,
        addDocument,
        updateEmbeddingStatus,
        refreshDocuments: fetchDocuments
    };
}

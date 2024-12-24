import { supabase } from './supabase';

export async function testDocumentsTable(userId) {
    try {
        // Test insert
        const { data: insertedDoc, error: insertError } = await supabase
            .from('documents')
            .insert({
                user_id: userId,
                file_name: 'test-document.pdf',
                file_path: `${userId}/test-document.pdf`,
                file_size: 1024
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return false;
        }
        console.log('Successfully inserted document:', insertedDoc);

        // Test select
        const { data: documents, error: selectError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId);

        if (selectError) {
            console.error('Select error:', selectError);
            return false;
        }
        console.log('Retrieved documents:', documents);

        // Clean up test data
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', insertedDoc.id);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return false;
        }
        console.log('Successfully cleaned up test data');

        return true;
    } catch (error) {
        console.error('Error testing documents table:', error);
        return false;
    }
}

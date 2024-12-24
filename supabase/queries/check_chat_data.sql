-- Query to check chat sessions and their messages
SELECT 
    cs.id as session_id,
    cs.title as session_title,
    cs.created_at as session_created,
    cs.last_updated,
    json_agg(json_build_object(
        'id', sm.id,
        'role', sm.role,
        'content', sm.content,
        'created_at', sm.created_at,
        'sources', sm.sources
    ) ORDER BY sm.created_at) as messages
FROM chat_sessions cs
LEFT JOIN session_messages sm ON cs.id = sm.session_id
WHERE cs.user_id = 'f254da89-fc50-4c1f-878d-d8788e1e8d04'  -- Your user ID from the logs
GROUP BY cs.id, cs.title, cs.created_at, cs.last_updated
ORDER BY cs.last_updated DESC;

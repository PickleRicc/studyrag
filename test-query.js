import fetch from 'node-fetch';

async function testQueries() {
    const queries = [
        {
            type: "Specific Query",
            query: "What is the glycemic index and how does it affect blood sugar?",
            files: ["Carbs.pdf"]
        },
        {
            type: "Vague Query",
            query: "Give me an overview of what these documents are about",
            files: ["Carbs.pdf", "stemcell.pdf"]
        }
    ];

    for (const testCase of queries) {
        console.log(`\nTesting ${testCase.type}:`);
        console.log(`Query: "${testCase.query}"`);
        console.log('Files:', testCase.files);

        try {
            const response = await fetch('http://localhost:3000/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: testCase.query,
                    topK: 5,
                    fileNames: testCase.files
                })
            });

            const data = await response.json();
            
            // Print concise results
            console.log('\nResults:');
            console.log('Query Type:', data.queryType);
            console.log('Answer:', data.answer);
            console.log('Sources:', data.sources);
            console.log('Total Results:', data.totalResults);
        } catch (error) {
            console.error(`Test failed for ${testCase.type}:`, error);
        }
    }
}

testQueries();

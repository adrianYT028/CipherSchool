const Groq = require("groq-sdk");

let groqClient = null;

function _getClient() {
    if (!groqClient) {
        const key = process.env.GROQ_API_KEY;
        if (!key) {
            throw new Error("GROQ_API_KEY is not set in environment variables.");
        }
        groqClient = new Groq({ apiKey: key });
    }
    return groqClient;
}

const generateHint = async (question, userQuery, sampleTables) => {
    const client = _getClient();

    const tableDescriptions = (sampleTables || [])
        .map((t) => `Table "${t.tableName}" with columns: ${t.columns.join(", ")}`)
        .join("\n");

    const systemPrompt = [
        "You are a helpful SQL tutor assisting a student with a practice problem.",
        "Your job is to guide the student toward the correct answer, NOT to write the full query for them.",
        "",
        "Rules you MUST follow:",
        "1. Never provide the complete SQL solution under any circumstances.",
        "2. Give at most ONE conceptual hint at a time.",
        "3. If the student has written a partial query, point out what they are doing well and suggest the next logical step.",
        "4. Mention relevant SQL keywords or clauses they might need (e.g., JOIN, GROUP BY, HAVING) but do NOT assemble them into a full query.",
        "5. Keep your response concise -- three to five sentences maximum.",
        "6. If the student has not written anything yet, suggest which clause to start with and what table to reference.",
    ].join("\n");

    const userPrompt = [
        `Assignment question: ${question}`,
        "",
        `Available tables:\n${tableDescriptions}`,
        "",
        userQuery
            ? `The student's current attempt:\n${userQuery}`
            : "The student has not written any SQL yet.",
        "",
        "Provide a single helpful hint following the rules above.",
    ].join("\n");

    const chatCompletion = await client.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 300,
    });

    return chatCompletion.choices[0]?.message?.content || "Unable to generate hint.";
};

module.exports = { generateHint };

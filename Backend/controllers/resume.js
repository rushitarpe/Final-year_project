const pdf = require('pdf-parse');
const { getAIResponse } = require('../services/gemini');

// @desc    Parse uploaded resume PDF
// @route   POST /api/resume/parse
// @access  Private (or Public for signup)
exports.parseResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file' });
        }

        // 1. Extract text from PDF buffer
        let pdfData;
        try {
            pdfData = await pdf(req.file.buffer);
        } catch (err) {
            return res.status(400).json({ success: false, error: 'Could not read PDF file' });
        }

        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'PDF appears to be empty or unreadable text' });
        }

        // 2. Prepare Gemini Prompt
        const prompt = `
I have extracted text from a user's resume. Please analyze this text and extract their professional skills, work experience history, and any spoken languages.

Extract into this exact JSON schema:
{
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "e.g., Jan 2020 - Present",
      "description": "Short summary of responsibilities"
    }
  ],
  "languages": ["Language 1", "Language 2"]
}

Important Rules:
1. Return ONLY the raw JSON object.
2. DO NOT include markdown formatting (e.g., no \`\`\`json).
3. If a field is missing from the resume, return an empty array for it.

Resume Text:
${resumeText.substring(0, 15000)}
        `;

        // 3. Get AI Response
        const systemContext = "You are an expert technical recruiter AI. Your job is to parse unstructured resume text into highly structured JSON data.";
        const aiResponseText = await getAIResponse(prompt, systemContext);

        // 4. Parse the AI Response String
        let extractedData;
        try {
            // Clean up potentially wrapped markdown from Gemini if it disobeys instructions
            const cleanedText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
            extractedData = JSON.parse(cleanedText);
        } catch (parseErr) {
            console.error('Failed to parse Gemini JSON output:', aiResponseText);
            return res.status(500).json({ success: false, error: 'AI failed to generate valid structured data' });
        }

        res.status(200).json({
            success: true,
            data: extractedData
        });

    } catch (err) {
        next(err);
    }
};

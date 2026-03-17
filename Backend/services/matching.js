const Mentor = require('../models/Mentor');
const { getAIResponse } = require('./gemini');

// Calculate match score using Gemini AI and fallback to basic scoring
exports.findMatches = async (menteeId, menteeProfile) => {
    const mentors = await Mentor.find({ role: 'mentor', isApproved: true });

    const matches = await Promise.all(mentors.map(async (mentor) => {
        let score = 0;
        
        try {
            // Construct a prompt for Gemini AI to evaluate the match
            const systemContext = "You are an AI matchmaking assistant for a tech mentorship platform. Your job is to output a single integer from 0 to 100 representing the compatibility score between a Mentee and a Mentor. Only output the integer, nothing else.";
            
            // Build a rich mentee experience summary for the prompt
            const menteeExpSummary = (menteeProfile.experience || [])
                .slice(0, 3)
                .map(e => `${e.title} at ${e.company} (${e.duration})`)
                .join('; ') || 'None';

            const prompt = `
                Evaluate the mentorship compatibility between this Mentee and Mentor.
                
                Mentee:
                Goals: ${menteeProfile.goals || 'Not specified'}
                Interests: ${menteeProfile.interests?.join(', ') || 'None'}
                Skills: ${menteeProfile.skills?.join(', ') || 'None'}
                Languages: ${menteeProfile.languages?.join(', ') || 'None'}
                Experience Level: ${menteeProfile.experienceLevel || 'Beginner'}
                Work Experience: ${menteeExpSummary}

                Mentor:
                Category/Field: ${mentor.category || 'Not specified'}
                Expertise/Skills: ${(mentor.expertise || mentor.skills || []).join(', ') || 'None'}
                Languages: ${(mentor.languages || []).join(', ') || 'None'}
                Bio: ${mentor.bio || 'None'}

                Score the match from 0–100. Consider skill overlap, language alignment, experience relevance, and field match. Return ONLY a single integer.
            `;

            const aiResponse = await getAIResponse(prompt, systemContext);
            const parsedScore = parseInt(aiResponse.trim(), 10);
            
            if (!isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100) {
                score = parsedScore;
            } else {
                // Fallback scoring if AI parsing fails
                const mentorSkillsAll = [...(mentor.skills || []), ...(mentor.expertise || [])];
                if (menteeProfile.skills && mentorSkillsAll.length) {
                    const common = menteeProfile.skills.filter(s => mentorSkillsAll.map(x => x.toLowerCase()).includes(s.toLowerCase()));
                    score += (common.length * 15);
                }
                if (menteeProfile.interests && mentor.category && mentor.category.toLowerCase().includes((menteeProfile.interests[0] || '').toLowerCase())) {
                    score += 20;
                }
            }

        } catch (error) {
            console.error('Error during AI matchmaking component:', error);
            // Basic fallback scoring
            const mentorSkillsAll = [...(mentor.skills || []), ...(mentor.expertise || [])];
            if (menteeProfile.skills && mentorSkillsAll.length) {
                const commonSkills = menteeProfile.skills.filter(skill => mentorSkillsAll.map(x => x.toLowerCase()).includes(skill.toLowerCase()));
                score += (commonSkills.length * 10);
            }
            if (menteeProfile.goals && mentor.category) {
                if (mentor.category.toLowerCase().includes(menteeProfile.goals.toLowerCase()) || menteeProfile.goals.toLowerCase().includes(mentor.category.toLowerCase())) {
                    score += 30;
                }
            }
        }

        return {
            mentor,
            matchScore: score > 100 ? 100 : score
        };
    }));

    // Sort by highest score first
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, 10); // Return top 10 matches
};

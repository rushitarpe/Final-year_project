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
            
            const prompt = `
                Evaluate the match between this Mentee and Mentor.
                
                Mentee:
                Goals: ${menteeProfile.goals || 'Not specified'}
                Interests: ${menteeProfile.interests?.join(', ') || 'None'}
                Skills: ${menteeProfile.skills?.join(', ') || 'None'}
                Experience Level: ${menteeProfile.experienceLevel || 'Beginner'}

                Mentor:
                Category/Field: ${mentor.category || 'Not specified'}
                Expertise/Skills: ${mentor.expertise?.join(', ') || 'None'}
                Bio: ${mentor.bio || 'None'}

                Return a single number between 0 and 100 representing how good of a match this is. 100 is a perfect match.
            `;

            const aiResponse = await getAIResponse(prompt, systemContext);
            const parsedScore = parseInt(aiResponse.trim(), 10);
            
            if (!isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100) {
                score = parsedScore;
            } else {
                // Fallback scoring if AI parsing fails
                if (menteeProfile.skills && mentor.expertise) {
                    const common = menteeProfile.skills.filter(s => mentor.expertise.includes(s));
                    score += (common.length * 15);
                }
                if (menteeProfile.interests && mentor.category && mentor.category.includes(menteeProfile.interests[0])) {
                    score += 20;
                }
            }

        } catch (error) {
            console.error('Error during AI matchmaking component:', error);
            // Basic fallback scoring
            if (menteeProfile.skills && mentor.expertise) {
                const commonSkills = menteeProfile.skills.filter(skill => mentor.expertise.includes(skill));
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

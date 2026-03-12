const Mentor = require('../models/Mentor');

// Calculate match score using weighted scoring approach
exports.findMatches = async (menteeId, menteeProfile) => {
    const mentors = await Mentor.find({ role: 'mentor', isApproved: true });

    const matches = mentors.map((mentor) => {
        let score = 0;

        // 1. Skill overlap (Weight: 50%)
        if (menteeProfile.interests && mentor.skills) {
            const commonSkills = menteeProfile.interests.filter(skill => mentor.skills.includes(skill));
            score += (commonSkills.length * 10);
        }

        // 2. Category matching (Weight: 30%)
        // Assuming simple string matching for category
        if (menteeProfile.goals && mentor.category) {
            if (mentor.category.toLowerCase().includes(menteeProfile.goals.toLowerCase()) ||
                menteeProfile.goals.toLowerCase().includes(mentor.category.toLowerCase())) {
                score += 30;
            }
        }

        // 3. Experience level (Weight: 20%)
        // Depending on mentee experience, match with appropriate mentor
        if (menteeProfile.experienceLevel) {
            score += 20; // simplified
        }

        return {
            mentor,
            matchScore: score
        };
    });

    // Sort by highest score first
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, 10); // Return top 10 matches
};

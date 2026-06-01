// constants.js — Single source of truth for all dropdown options

const MENTOR_CATEGORIES = [
    'Technology', 'Business', 'Design', 'Marketing', 'Finance',
    'Healthcare', 'Education', 'Engineering', 'Science', 'Law',
    'Arts & Media', 'Architecture', 'Agriculture', 'Social Work',
    'Sports & Fitness', 'Hospitality', 'Fashion', 'Music', 'Other'
];

const EDUCATION_STREAMS = [
    // Science & Engineering
    'Computer Science & Engineering', 'Information Technology',
    'Electronics & Communication', 'Electrical Engineering',
    'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
    'Aerospace Engineering', 'Biotechnology', 'Biomedical Engineering',
    'Environmental Engineering', 'Industrial Engineering',
    'Physics', 'Chemistry', 'Mathematics & Statistics',
    'Biology', 'Microbiology', 'Biochemistry', 'Genetics',
    'Pharmacy', 'Nursing', 'MBBS / Medicine', 'BDS / Dentistry',
    'Ayurveda (BAMS)', 'Homeopathy (BHMS)', 'Physiotherapy',
    'Agriculture', 'Horticulture', 'Forestry', 'Veterinary Science',
    'Food Technology', 'Textile Engineering', 'Naval Architecture',
    'Geology', 'Meteorology', 'Oceanography', 'Astrophysics',
    // Commerce
    'Bachelor of Commerce (B.Com)', 'Master of Commerce (M.Com)',
    'Business Administration (BBA / MBA)', 'Chartered Accountancy (CA)',
    'Cost Accountancy (CMA)', 'Company Secretary (CS)',
    'Economics', 'Finance & Banking', 'Accounting & Taxation',
    'Insurance', 'Actuarial Science', 'Supply Chain Management',
    'Human Resource Management', 'International Business',
    'Retail Management', 'E-Commerce', 'Investment Banking',
    // Arts & Humanities
    'English Literature', 'Hindi Literature', 'History',
    'Political Science', 'Geography', 'Sociology', 'Psychology',
    'Philosophy', 'Anthropology', 'Linguistics',
    'Journalism & Mass Communication', 'Public Administration',
    'Social Work', 'Library Science', 'Education (B.Ed / M.Ed)',
    // Design & Creative
    'Visual Communication', 'Graphic Design', 'UX/UI Design',
    'Industrial Design', 'Fashion Design', 'Interior Design',
    'Animation & VFX', 'Photography', 'Film & Television',
    'Fine Arts', 'Performing Arts', 'Music', 'Theatre',
    // Law
    'LLB', 'LLM', 'Integrated BA LLB', 'Cyber Law',
    'Corporate Law', 'Criminal Law', 'Constitutional Law',
    // Management & Others
    'Hotel Management', 'Event Management', 'Sports Management',
    'Aviation Management', 'Healthcare Management',
    'NGO & Development Studies', 'Defence & Military Studies',
    'Other'
];

const DEGREE_TYPES = [
    'High School (10th)', 'Senior Secondary (12th)',
    'Diploma', 'ITI', 'Polytechnic',
    'B.Tech / B.E.', 'B.Sc', 'B.Com', 'B.A.', 'BBA', 'BCA',
    'B.Arch', 'B.Des', 'B.Pharm', 'MBBS', 'BDS', 'LLB', 'B.Ed',
    'M.Tech / M.E.', 'M.Sc', 'M.Com', 'M.A.', 'MBA', 'MCA',
    'M.Arch', 'M.Des', 'M.Pharm', 'MD', 'LLM', 'M.Ed',
    'Ph.D', 'Post Doctoral', 'Certificate Course',
    'Professional Certification', 'Other'
];

const SKILL_OPTIONS = [
    // Tech — Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Frontend
    'React', 'Next.js', 'Vue.js', 'Angular', 'HTML/CSS', 'Tailwind CSS',
    // Backend
    'Node.js', 'Express.js', 'Django', 'FastAPI', 'Spring Boot', 'Laravel', 'Ruby on Rails',
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase',
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Linux',
    // AI/ML
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Data Analysis',
    'SQL', 'Tableau', 'Power BI', 'Pandas', 'NumPy',
    // Mobile
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    // Other Tech
    'Blockchain', 'Solidity', 'Web3', 'Cybersecurity', 'Ethical Hacking',
    'System Design', 'Microservices', 'REST API', 'GraphQL',
    // Business & Finance
    'Product Management', 'Project Management', 'Agile', 'Scrum', 'OKRs',
    'Business Strategy', 'Market Research', 'Business Development',
    'Financial Modelling', 'Valuation', 'Investment Analysis',
    'Accounting', 'Taxation', 'Audit', 'GST', 'Tally',
    'Trading', 'Equity Research', 'Mutual Funds', 'Derivatives',
    'Fundraising', 'Venture Capital', 'Private Equity',
    'Supply Chain', 'Operations Management', 'Lean / Six Sigma',
    // Design
    'UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Sketch',
    'Graphic Design', 'Branding', 'Motion Design', 'Illustration',
    'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro',
    // Marketing & Sales
    'Digital Marketing', 'SEO', 'SEM', 'Content Marketing',
    'Social Media Marketing', 'Email Marketing', 'Performance Marketing',
    'Copywriting', 'Growth Hacking', 'Brand Management',
    'B2B Sales', 'B2C Sales', 'CRM', 'HubSpot', 'Salesforce',
    // Soft Skills
    'Leadership', 'Public Speaking', 'Communication',
    'Team Building', 'Mentoring', 'Negotiation', 'Problem Solving',
    'Critical Thinking', 'Emotional Intelligence', 'Time Management',
    // Healthcare
    'Clinical Research', 'Medical Writing', 'Healthcare IT',
    'Patient Care', 'Nutrition & Dietetics', 'Mental Health Counseling',
    // Law
    'Contract Law', 'IPR', 'Corporate Governance', 'Legal Research',
    // Other
    'Teaching', 'Curriculum Design', 'Research & Development',
    'Photography', 'Video Production', 'Music Production',
    'Event Management', 'Agriculture Tech', 'Sustainability',
    'NGO Management', 'Policy Research'
];

const LANGUAGES = [
    'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada',
    'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Odia',
    'Urdu', 'Assamese', 'Sanskrit', 'French', 'German',
    'Spanish', 'Japanese', 'Mandarin', 'Arabic', 'Russian', 'Other'
];

const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const SESSION_DURATIONS = [30, 45, 60, 90, 120]; // minutes

const SESSION_FREQUENCIES = ['once', 'weekly', 'biweekly', 'monthly'];

const MENTORSHIP_TYPES = [
    'Career Guidance', 'Interview Preparation', 'Skill Development',
    'Project Review', 'Resume / Portfolio Review', 'Academic Guidance',
    'Startup Mentorship', 'Research Guidance', 'Study Abroad Counseling',
    'Entrance Exam Prep', 'Job Search Strategy', 'Freelancing & Consulting'
];

const AVAILABLE_DAYS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
];

const AVAILABLE_TIMES = [
    'Early Morning (6am–9am)', 'Morning (9am–12pm)',
    'Afternoon (12pm–3pm)', 'Evening (3pm–6pm)',
    'Night (6pm–9pm)', 'Late Night (9pm–12am)'
];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Andaman & Nicobar', 'Dadra & Nagar Haveli', 'Lakshadweep'
];

const GOAL_OPTIONS = [
    'Get a job at a top company', 'Switch careers', 'Start my own business',
    'Get into a top university', 'Improve technical skills',
    'Crack competitive exams', 'Build a project / portfolio',
    'Learn a new skill', 'Grow in current role', 'Prepare for interviews',
    'Get international opportunities', 'Build a professional network',
    'Publish research', 'Get promoted', 'Freelance successfully'
];

const INTEREST_OPTIONS = [
    'Artificial Intelligence', 'Web Development', 'Mobile Development',
    'Data Science', 'Cybersecurity', 'Cloud Computing', 'Blockchain',
    'Open Source', 'Product Design', 'UI/UX', 'Entrepreneurship',
    'Investing & Trading', 'Fintech', 'Healthtech', 'Edtech',
    'Social Impact', 'Climate Tech', 'Space Technology',
    'Gaming', 'AR/VR', 'Robotics', 'IoT', 'Quantum Computing',
    'Digital Marketing', 'Content Creation', 'Photography',
    'Music', 'Writing', 'Research', 'Policy & Governance',
    'Sports Science', 'Psychology', 'Law & Justice'
];

const COMPANY_TYPES = [
    'FAANG / Big Tech', 'Indian Unicorn', 'Early Stage Startup (Series A/B)',
    'Pre-Seed / Bootstrap Startup', 'MNC', 'PSU / Government',
    'Academic / Research Institution', 'NGO / Non-Profit',
    'Consulting Firm', 'Investment Bank', 'Hospital / Healthcare',
    'Media & Entertainment', 'Defense / Armed Forces', 'Any'
];

module.exports = {
    MENTOR_CATEGORIES,
    EDUCATION_STREAMS,
    DEGREE_TYPES,
    SKILL_OPTIONS,
    LANGUAGES,
    EXPERIENCE_LEVELS,
    SESSION_DURATIONS,
    SESSION_FREQUENCIES,
    MENTORSHIP_TYPES,
    AVAILABLE_DAYS,
    AVAILABLE_TIMES,
    INDIAN_STATES,
    GOAL_OPTIONS,
    INTEREST_OPTIONS,
    COMPANY_TYPES
};

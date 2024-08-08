
export const atsResumeAnalysisPrompt = (resumeParsedData: String) =>
  ` This is the parsed data from the resume: ${resumeParsedData}:
    PROFESSIONAL SUMMARY: Summarize the candidate's professional background and career highlights.
    EXPERIENCE: Detail the candidate's work experience, including job titles, responsibilities, and achievements.
    EDUCATION: Provide an overview of the candidate's educational background, degrees, and any relevant coursework.
    SKILLS: List the candidate's technical and soft skills, including proficiency levels.
    CERTIFICATIONS: Mention any certifications the candidate has earned.
    PROJECTS: Describe any projects the candidate has worked on, including the context, role, and outcomes.
    ACHIEVEMENTS: Highlight any notable achievements or recognitions the candidate has received.
    LANGUAGES: Indicate any languages the candidate speaks and their proficiency levels.
    VOLUNTEER EXPERIENCE: Detail any volunteer work the candidate has done.
    
    The above categories need to be reviewed. Based on this information, we need to generate strengths and feedback for each category.
    For each category, assign a score out of 10 and provide feedback and strengths with at least 4 points for strengths and 4 points for feedback.
  `;

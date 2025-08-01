const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   POST /api/ai/generate-plan
// @desc    Generate AI study plan
// @access  Private
router.post('/generate-plan', auth, async (req, res) => {
  try {
    const { subject, examDate, totalHours, dailyHours, topics, difficulty } = req.body;
    
    if (!subject || !examDate || !totalHours || !dailyHours) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = req.userDoc;
    const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const prompt = `
    Create a comprehensive study plan for a student with the following requirements:
    
    Subject: ${subject}
    Exam Date: ${examDate}
    Days until exam: ${daysUntilExam}
    Total study hours available: ${totalHours}
    Daily study hours: ${dailyHours}
    Difficulty level: ${difficulty}
    Topics to cover: ${topics ? topics.join(', ') : 'Standard curriculum'}
    
    Student preferences:
    - Preferred study time: ${user.studyPreferences.preferredStudyTime}
    - Study session duration: ${user.studyPreferences.studySessionDuration} minutes
    - Break duration: ${user.studyPreferences.breakDuration} minutes
    
    Please provide a JSON response with the following structure:
    {
      "title": "Study plan title",
      "description": "Brief description",
      "syllabus": [
        {
          "topic": "Topic name",
          "subtopics": ["subtopic1", "subtopic2"],
          "estimatedHours": 5,
          "difficulty": "medium",
          "priority": 7
        }
      ],
      "weeklyGoals": [
        {
          "weekNumber": 1,
          "startDate": "2024-01-01",
          "endDate": "2024-01-07",
          "topics": [
            {
              "topic": "Topic name",
              "hours": 10
            }
          ],
          "targetHours": 28
        }
      ],
      "milestones": [
        {
          "title": "Milestone title",
          "description": "Description",
          "targetDate": "2024-01-15",
          "targetPercentage": 50
        }
      ],
      "aiInsights": [
        {
          "type": "recommendation",
          "message": "Focus on fundamentals first",
          "priority": "high"
        }
      ]
    }
    
    Make sure the plan is realistic, well-distributed, and accounts for the student's available time.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational AI that creates personalized study plans. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0].message.content;
    let studyPlanData;

    try {
      studyPlanData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ message: 'Failed to generate study plan' });
    }

    // Create study plan in database
    const studyPlan = new StudyPlan({
      user: user._id,
      subject,
      examDate,
      totalHours,
      dailyHours,
      difficulty,
      aiGenerated: true,
      ...studyPlanData
    });

    await studyPlan.save();

    res.json({
      message: 'Study plan generated successfully',
      studyPlan
    });

  } catch (error) {
    console.error('AI study plan generation error:', error);
    res.status(500).json({ message: 'Failed to generate study plan' });
  }
});

// @route   POST /api/ai/chat
// @desc    Chat with AI study assistant
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = req.userDoc;
    
    const systemPrompt = `
    You are an AI study assistant helping students with their academic goals. 
    
    Student context:
    - Name: ${user.name}
    - Study preferences: ${JSON.stringify(user.studyPreferences)}
    - Current level: ${user.gamification.level}
    - Study streak: ${user.gamification.streaks.current} days
    
    Additional context: ${context || 'None'}
    
    Provide helpful, encouraging, and practical study advice. Keep responses concise but informative.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      message: 'AI response generated',
      response: aiResponse
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
});

// @route   POST /api/ai/summarize
// @desc    Summarize study content
// @access  Private
router.post('/summarize', auth, async (req, res) => {
  try {
    const { content, type = 'general' } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const prompt = `
    Please provide a concise summary of the following ${type} content for study purposes:
    
    ${content}
    
    Format the summary with:
    1. Key points (bullet points)
    2. Important concepts to remember
    3. Study tips for this topic
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an educational content summarizer. Create clear, structured summaries that help students learn effectively."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    const summary = completion.choices[0].message.content;

    res.json({
      message: 'Content summarized successfully',
      summary
    });

  } catch (error) {
    console.error('AI summarization error:', error);
    res.status(500).json({ message: 'Failed to summarize content' });
  }
});

// @route   POST /api/ai/study-tips
// @desc    Get personalized study tips
// @access  Private
router.post('/study-tips', auth, async (req, res) => {
  try {
    const { subject, topic, difficulty } = req.body;
    const user = req.userDoc;

    const prompt = `
    Provide 5 personalized study tips for:
    Subject: ${subject}
    Topic: ${topic || 'General'}
    Difficulty: ${difficulty || 'medium'}
    
    Student profile:
    - Study streak: ${user.gamification.streaks.current} days
    - Preferred study time: ${user.studyPreferences.preferredStudyTime}
    - Session duration: ${user.studyPreferences.studySessionDuration} minutes
    
    Make the tips specific, actionable, and encouraging.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a study coach providing personalized learning strategies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    const tips = completion.choices[0].message.content;

    res.json({
      message: 'Study tips generated',
      tips
    });

  } catch (error) {
    console.error('AI study tips error:', error);
    res.status(500).json({ message: 'Failed to generate study tips' });
  }
});

// @route   POST /api/ai/quiz
// @desc    Generate quiz questions
// @access  Private
router.post('/quiz', auth, async (req, res) => {
  try {
    const { subject, topic, difficulty = 'medium', questionCount = 5 } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic are required' });
    }

    const prompt = `
    Generate ${questionCount} ${difficulty} level quiz questions about ${topic} in ${subject}.
    
    Return a JSON array with this structure:
    [
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Why this is correct"
      }
    ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an educational content creator. Generate clear, accurate quiz questions with explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1200
    });

    let questions;
    try {
      questions = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      return res.status(500).json({ message: 'Failed to generate quiz questions' });
    }

    res.json({
      message: 'Quiz generated successfully',
      questions
    });

  } catch (error) {
    console.error('AI quiz generation error:', error);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
});

module.exports = router;

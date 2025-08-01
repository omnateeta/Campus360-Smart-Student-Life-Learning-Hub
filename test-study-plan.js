const fetch = require('node-fetch');

async function testStudyPlanCreation() {
  try {
    // First, let's test if we can reach the endpoint
    console.log('Testing study plan API endpoint...');
    
    // Test data matching the frontend structure
    const testData = {
      title: "Test Study Plan",
      description: "Test description",
      subject: "Mathematics",
      examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      totalHours: 40,
      dailyHours: 2,
      difficulty: "medium",
      syllabus: [
        {
          topic: "Algebra",
          subtopics: [],
          estimatedHours: 20,
          difficulty: "medium",
          priority: 5,
          completed: false
        },
        {
          topic: "Geometry", 
          subtopics: [],
          estimatedHours: 20,
          difficulty: "medium",
          priority: 5,
          completed: false
        }
      ],
      aiGenerated: false,
      status: "active"
    };

    console.log('Sending request to:', 'http://localhost:5000/api/study-plans');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:5000/api/study-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This test doesn't include auth token - that might be the issue!
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.error('API Error:', response.status, responseText);
    } else {
      console.log('Success!', responseText);
    }

  } catch (error) {
    console.error('Network/Request Error:', error.message);
  }
}

testStudyPlanCreation();

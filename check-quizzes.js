const { getQuizStatistics, lessonQuizzes } = require('./lib/practice/quiz.js');

const stats = getQuizStatistics();

console.log('=== TAJWEED QUIZ SYSTEM - QUALITY AUDIT ===\n');
console.log('Total Lessons:', stats.totalLessons);
console.log('Lessons with Quizzes:', stats.lessonsWithQuizzes);
console.log('Total Questions:', stats.totalQuestions);
console.log('Average Questions per Lesson:', stats.averageQuestionsPerLesson);
console.log('Verified Questions:', stats.verifiedQuestions);
console.log('\n=== SAMPLE LESSON QUIZZES (First 3) ===');

const samples = lessonQuizzes.slice(0, 3);
samples.forEach(quiz => {
  console.log(`\nLesson: ${quiz.lessonName} (${quiz.lessonSlug})`);
  console.log(`Questions: ${quiz.questions.length}`);
  quiz.questions.forEach((q, i) => {
    console.log(`  Q${i+1} (${q.purpose}): ${q.question.substring(0, 70)}...`);
  });
});

console.log('\n=== SAMPLE LESSON QUIZZES (Last 3) ===');
const lastSamples = lessonQuizzes.slice(-3);
lastSamples.forEach(quiz => {
  console.log(`\nLesson: ${quiz.lessonName} (${quiz.lessonSlug})`);
  console.log(`Questions: ${quiz.questions.length}`);
  quiz.questions.forEach((q, i) => {
    console.log(`  Q${i+1} (${q.purpose}): ${q.question.substring(0, 70)}...`);
  });
});

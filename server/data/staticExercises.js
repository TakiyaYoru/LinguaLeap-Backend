// ===============================================
// STATIC EXERCISE DATA FOR 28 SUBTYPES
// ===============================================

export const STATIC_EXERCISES = {
  // Multiple Choice subtypes (4)
  vocabulary_multiple_choice: {
    type: 'multiple_choice',
    exercise_subtype: 'vocabulary_multiple_choice',
    title: 'Chọn từ vựng đúng',
    instruction: 'Chọn từ tiếng Anh đúng cho từ tiếng Việt',
    content: {
      question: 'What is the English word for "xin chào"?',
      options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
      correctAnswer: 0,
      feedback: {
        correct: 'Đúng rồi! "Hello" có nghĩa là "xin chào"',
        incorrect: 'Sai rồi, thử lại!',
        hint: 'Đây là lời chào cơ bản nhất'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary']
  },

  grammar_multiple_choice: {
    type: 'multiple_choice',
    exercise_subtype: 'grammar_multiple_choice',
    title: 'Chọn ngữ pháp đúng',
    instruction: 'Chọn câu có ngữ pháp đúng',
    content: {
      question: 'Which sentence is grammatically correct?',
      options: [
        'I am student',
        'I is a student', 
        'I are a student',
        'I am a student'
      ],
      correctAnswer: 3,
      feedback: {
        correct: 'Đúng rồi! "I am a student" có ngữ pháp đúng',
        incorrect: 'Sai rồi, kiểm tra lại ngữ pháp',
        hint: 'Chú ý động từ "to be" và mạo từ'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['grammar']
  },

  listening_multiple_choice: {
    type: 'multiple_choice',
    exercise_subtype: 'listening_multiple_choice',
    title: 'Nghe và chọn',
    instruction: 'Nghe audio và chọn đáp án đúng',
    content: {
      question: 'What did you hear?',
      options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
      correctAnswer: 0,
      audioText: 'Hello, how are you?',
      feedback: {
        correct: 'Đúng rồi! Bạn đã nghe "Hello"',
        incorrect: 'Sai rồi, nghe lại kỹ hơn',
        hint: 'Chú ý từ đầu tiên'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: true,
    requiresMicrophone: false,
    skillFocus: ['listening']
  },

  pronunciation_multiple_choice: {
    type: 'multiple_choice',
    exercise_subtype: 'pronunciation_multiple_choice',
    title: 'Chọn phát âm đúng',
    instruction: 'Chọn từ có phát âm đúng',
    content: {
      question: 'Which word is pronounced correctly?',
      options: ['/həˈloʊ/', '/həˈlaʊ/', '/həˈliː/', '/həˈlɔː/'],
      correctAnswer: 0,
      phonetic: '/həˈloʊ/',
      feedback: {
        correct: 'Đúng rồi! /həˈloʊ/ là phát âm đúng của "hello"',
        incorrect: 'Sai rồi, kiểm tra lại phát âm',
        hint: 'Chú ý âm cuối /oʊ/'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['pronunciation']
  },

  // Fill Blank subtypes (4)
  vocabulary_fill_blank: {
    type: 'fill_blank',
    exercise_subtype: 'vocabulary_fill_blank',
    title: 'Điền từ vựng',
    instruction: 'Điền từ tiếng Anh vào chỗ trống',
    content: {
      sentence: 'Hello, my name ___ John.',
      correctAnswer: 'is',
      alternatives: ['are', 'am', 'be'],
      feedback: {
        correct: 'Đúng rồi! "is" là động từ đúng',
        incorrect: 'Sai rồi, kiểm tra lại động từ',
        hint: 'Chủ ngữ "my name" số ít'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary']
  },

  grammar_fill_blank: {
    type: 'fill_blank',
    exercise_subtype: 'grammar_fill_blank',
    title: 'Điền ngữ pháp',
    instruction: 'Điền từ ngữ pháp đúng vào chỗ trống',
    content: {
      sentence: 'I ___ a student.',
      correctAnswer: 'am',
      alternatives: ['is', 'are', 'be'],
      feedback: {
        correct: 'Đúng rồi! "am" là động từ đúng cho "I"',
        incorrect: 'Sai rồi, kiểm tra lại ngữ pháp',
        hint: 'Chủ ngữ "I" dùng "am"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['grammar']
  },

  listening_fill_blank: {
    type: 'fill_blank',
    exercise_subtype: 'listening_fill_blank',
    title: 'Nghe và điền',
    instruction: 'Nghe audio và điền từ vào chỗ trống',
    content: {
      sentence: 'Hello, ___ are you?',
      correctAnswer: 'how',
      alternatives: ['what', 'where', 'when'],
      audioText: 'Hello, how are you?',
      feedback: {
        correct: 'Đúng rồi! Bạn đã nghe "how"',
        incorrect: 'Sai rồi, nghe lại kỹ hơn',
        hint: 'Chú ý từ thứ hai'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: true,
    requiresMicrophone: false,
    skillFocus: ['listening']
  },

  writing_fill_blank: {
    type: 'fill_blank',
    exercise_subtype: 'writing_fill_blank',
    title: 'Viết và điền',
    instruction: 'Viết từ đúng vào chỗ trống',
    content: {
      sentence: 'Please ___ your name here.',
      correctAnswer: 'write',
      alternatives: ['read', 'speak', 'listen'],
      feedback: {
        correct: 'Đúng rồi! "write" có nghĩa là "viết"',
        incorrect: 'Sai rồi, kiểm tra lại nghĩa',
        hint: 'Hành động tạo ra chữ viết'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['writing']
  },

  // Translation subtypes (3)
  vocabulary_translation: {
    type: 'translation',
    exercise_subtype: 'vocabulary_translation',
    title: 'Dịch từ vựng',
    instruction: 'Dịch từ tiếng Việt sang tiếng Anh',
    content: {
      sentence: 'Xin chào',
      correctAnswer: 'Hello',
      alternatives: ['Hi', 'Good morning', 'Hey'],
      feedback: {
        correct: 'Đúng rồi! "Hello" là cách dịch phù hợp',
        incorrect: 'Sai rồi, kiểm tra lại nghĩa',
        hint: 'Lời chào cơ bản'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary']
  },

  grammar_translation: {
    type: 'translation',
    exercise_subtype: 'grammar_translation',
    title: 'Dịch ngữ pháp',
    instruction: 'Dịch câu với ngữ pháp đúng',
    content: {
      sentence: 'Tôi là học sinh',
      correctAnswer: 'I am a student',
      alternatives: ['I is a student', 'I are a student', 'I be a student'],
      feedback: {
        correct: 'Đúng rồi! Ngữ pháp và nghĩa đều đúng',
        incorrect: 'Sai rồi, kiểm tra lại ngữ pháp',
        hint: 'Chủ ngữ "I" dùng "am"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['grammar']
  },

  writing_translation: {
    type: 'translation',
    exercise_subtype: 'writing_translation',
    title: 'Dịch câu',
    instruction: 'Dịch câu hoàn chỉnh sang tiếng Anh',
    content: {
      sentence: 'Xin chào, tôi tên là Lan',
      correctAnswer: 'Hello, my name is Lan',
      alternatives: ['Hi, I name is Lan', 'Hello, I am Lan', 'Hi, my name Lan'],
      feedback: {
        correct: 'Đúng rồi! Câu dịch hoàn chỉnh và đúng ngữ pháp',
        incorrect: 'Sai rồi, kiểm tra lại cấu trúc câu',
        hint: 'Chú ý cấu trúc "my name is"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['writing']
  },

  // Word Matching subtypes (1)
  vocabulary_word_matching: {
    type: 'word_matching',
    exercise_subtype: 'vocabulary_word_matching',
    title: 'Ghép từ vựng',
    instruction: 'Ghép từ tiếng Anh với nghĩa tiếng Việt',
    content: {
      pairs: {
        'Hello': 'Xin chào',
        'Goodbye': 'Tạm biệt',
        'Thank you': 'Cảm ơn',
        'Sorry': 'Xin lỗi'
      },
      feedback: {
        correct: 'Đúng rồi! Bạn đã ghép đúng các cặp từ',
        incorrect: 'Sai rồi, kiểm tra lại nghĩa',
        hint: 'Chú ý nghĩa của từng từ'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 60,
    estimatedTime: 40,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary']
  },

  // Listening subtypes (3)
  vocabulary_listening: {
    type: 'listening',
    exercise_subtype: 'vocabulary_listening',
    title: 'Nghe từ vựng',
    instruction: 'Nghe và chọn từ đúng',
    content: {
      audioText: 'Hello, how are you?',
      question: 'What word did you hear first?',
      options: ['Hello', 'How', 'Are', 'You'],
      correctAnswer: 0,
      feedback: {
        correct: 'Đúng rồi! Bạn đã nghe "Hello"',
        incorrect: 'Sai rồi, nghe lại kỹ hơn',
        hint: 'Chú ý từ đầu tiên'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: true,
    requiresMicrophone: false,
    skillFocus: ['listening']
  },

  grammar_listening: {
    type: 'listening',
    exercise_subtype: 'grammar_listening',
    title: 'Nghe ngữ pháp',
    instruction: 'Nghe và chọn câu có ngữ pháp đúng',
    content: {
      audioText: 'I am a student. She is a teacher.',
      question: 'Which sentence has correct grammar?',
      options: ['I am a student', 'I is a student', 'I are a student', 'I be a student'],
      correctAnswer: 0,
      feedback: {
        correct: 'Đúng rồi! "I am a student" có ngữ pháp đúng',
        incorrect: 'Sai rồi, kiểm tra lại ngữ pháp',
        hint: 'Chủ ngữ "I" dùng "am"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: true,
    requiresMicrophone: false,
    skillFocus: ['listening']
  },

  pronunciation_listening: {
    type: 'listening',
    exercise_subtype: 'pronunciation_listening',
    title: 'Nghe phát âm',
    instruction: 'Nghe và chọn phát âm đúng',
    content: {
      audioText: 'Hello, how are you?',
      question: 'How is "hello" pronounced?',
      options: ['/həˈloʊ/', '/həˈlaʊ/', '/həˈliː/', '/həˈlɔː/'],
      correctAnswer: 0,
      feedback: {
        correct: 'Đúng rồi! /həˈloʊ/ là phát âm đúng',
        incorrect: 'Sai rồi, nghe lại kỹ hơn',
        hint: 'Chú ý âm cuối /oʊ/'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: true,
    requiresMicrophone: false,
    skillFocus: ['pronunciation']
  },

  // Speaking subtypes (3)
  vocabulary_speaking: {
    type: 'speaking',
    exercise_subtype: 'vocabulary_speaking',
    title: 'Nói từ vựng',
    instruction: 'Phát âm từ tiếng Anh',
    content: {
      textToSpeak: 'Hello',
      phonetic: '/həˈloʊ/',
      feedback: {
        correct: 'Đúng rồi! Phát âm rất tốt',
        incorrect: 'Sai rồi, thử lại',
        hint: 'Chú ý âm /h/ và /oʊ/'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: true,
    requiresMicrophone: true,
    skillFocus: ['speaking']
  },

  grammar_speaking: {
    type: 'speaking',
    exercise_subtype: 'grammar_speaking',
    title: 'Nói ngữ pháp',
    instruction: 'Đọc câu với ngữ pháp đúng',
    content: {
      textToSpeak: 'I am a student',
      feedback: {
        correct: 'Đúng rồi! Ngữ pháp và phát âm đều tốt',
        incorrect: 'Sai rồi, kiểm tra lại',
        hint: 'Chú ý phát âm "am"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: true,
    requiresMicrophone: true,
    skillFocus: ['speaking']
  },

  pronunciation_speaking: {
    type: 'speaking',
    exercise_subtype: 'pronunciation_speaking',
    title: 'Phát âm',
    instruction: 'Phát âm từ theo chuẩn',
    content: {
      textToSpeak: 'Hello',
      phonetic: '/həˈloʊ/',
      evaluationCriteria: ['/h/ sound', '/ə/ sound', '/l/ sound', '/oʊ/ sound'],
      feedback: {
        correct: 'Đúng rồi! Phát âm rất chuẩn',
        incorrect: 'Sai rồi, thử lại',
        hint: 'Chú ý từng âm một'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: true,
    requiresMicrophone: true,
    skillFocus: ['pronunciation']
  },

  // Reading subtypes (3)
  vocabulary_reading: {
    type: 'reading',
    exercise_subtype: 'vocabulary_reading',
    title: 'Đọc từ vựng',
    instruction: 'Đọc và hiểu từ vựng',
    content: {
      text: 'Hello, my name is John. I am a student.',
      question: 'What is the person\'s name?',
      options: ['Hello', 'John', 'Student', 'Name'],
      correctAnswer: 1,
      feedback: {
        correct: 'Đúng rồi! Tên là "John"',
        incorrect: 'Sai rồi, đọc lại kỹ hơn',
        hint: 'Tìm từ sau "name is"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['reading']
  },

  grammar_reading: {
    type: 'reading',
    exercise_subtype: 'grammar_reading',
    title: 'Đọc ngữ pháp',
    instruction: 'Đọc và phân tích ngữ pháp',
    content: {
      text: 'I am a student. She is a teacher. They are friends.',
      question: 'Which sentence uses "are"?',
      options: ['I am a student', 'She is a teacher', 'They are friends', 'None'],
      correctAnswer: 2,
      feedback: {
        correct: 'Đúng rồi! "They are friends" dùng "are"',
        incorrect: 'Sai rồi, kiểm tra lại',
        hint: 'Chủ ngữ số nhiều dùng "are"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['grammar']
  },

  comprehension_reading: {
    type: 'reading',
    exercise_subtype: 'comprehension_reading',
    title: 'Đọc hiểu',
    instruction: 'Đọc và trả lời câu hỏi',
    content: {
      text: 'Hello! My name is Lan. I am a student at ABC School. I like English very much.',
      question: 'What does Lan like?',
      options: ['Math', 'English', 'Science', 'History'],
      correctAnswer: 1,
      feedback: {
        correct: 'Đúng rồi! Lan thích tiếng Anh',
        incorrect: 'Sai rồi, đọc lại kỹ hơn',
        hint: 'Tìm từ "like" trong bài'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 60,
    estimatedTime: 45,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['reading']
  },

  // Writing subtypes (3)
  vocabulary_writing: {
    type: 'writing',
    exercise_subtype: 'vocabulary_writing',
    title: 'Viết từ vựng',
    instruction: 'Viết từ tiếng Anh',
    content: {
      prompt: 'Write the English word for "xin chào"',
      correctAnswer: 'Hello',
      alternatives: ['Hi', 'Good morning', 'Hey'],
      feedback: {
        correct: 'Đúng rồi! "Hello" là từ đúng',
        incorrect: 'Sai rồi, kiểm tra lại',
        hint: 'Lời chào cơ bản'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary']
  },

  grammar_writing: {
    type: 'writing',
    exercise_subtype: 'grammar_writing',
    title: 'Viết ngữ pháp',
    instruction: 'Viết câu với ngữ pháp đúng',
    content: {
      prompt: 'Complete the sentence: "I ___ a student"',
      correctAnswer: 'am',
      alternatives: ['is', 'are', 'be'],
      feedback: {
        correct: 'Đúng rồi! "am" là động từ đúng',
        incorrect: 'Sai rồi, kiểm tra lại ngữ pháp',
        hint: 'Chủ ngữ "I" dùng "am"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['grammar']
  },

  sentence_writing: {
    type: 'writing',
    exercise_subtype: 'sentence_writing',
    title: 'Viết câu',
    instruction: 'Viết câu hoàn chỉnh',
    content: {
      prompt: 'Write a sentence introducing yourself',
      correctAnswer: 'My name is Lan',
      alternatives: ['I name is Lan', 'I am Lan', 'My name Lan'],
      feedback: {
        correct: 'Đúng rồi! Câu hoàn chỉnh và đúng ngữ pháp',
        incorrect: 'Sai rồi, kiểm tra lại cấu trúc',
        hint: 'Dùng "My name is"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 45,
    estimatedTime: 30,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['writing']
  },

  // True/False subtypes (3)
  vocabulary_true_false: {
    type: 'true_false',
    exercise_subtype: 'vocabulary_true_false',
    title: 'Đúng/Sai từ vựng',
    instruction: 'Chọn đúng hoặc sai',
    content: {
      statement: '"Hello" means "xin chào" in Vietnamese',
      isCorrect: true,
      explanation: 'Đúng, "Hello" có nghĩa là "xin chào"',
      feedback: {
        correct: 'Đúng rồi! "Hello" có nghĩa là "xin chào"',
        incorrect: 'Sai rồi, kiểm tra lại nghĩa',
        hint: 'Đây là lời chào cơ bản'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 20,
    estimatedTime: 15,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary']
  },

  grammar_true_false: {
    type: 'true_false',
    exercise_subtype: 'grammar_true_false',
    title: 'Đúng/Sai ngữ pháp',
    instruction: 'Chọn đúng hoặc sai về ngữ pháp',
    content: {
      statement: '"I am a student" is grammatically correct',
      isCorrect: true,
      explanation: 'Đúng, câu này có ngữ pháp đúng',
      feedback: {
        correct: 'Đúng rồi! Câu có ngữ pháp đúng',
        incorrect: 'Sai rồi, kiểm tra lại ngữ pháp',
        hint: 'Chủ ngữ "I" dùng "am"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 20,
    estimatedTime: 15,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['grammar']
  },

  listening_true_false: {
    type: 'true_false',
    exercise_subtype: 'listening_true_false',
    title: 'Đúng/Sai nghe hiểu',
    instruction: 'Nghe và chọn đúng hoặc sai',
    content: {
      statement: 'The audio says "Hello, how are you?"',
      isCorrect: true,
      audioText: 'Hello, how are you?',
      explanation: 'Đúng, audio nói "Hello, how are you?"',
      feedback: {
        correct: 'Đúng rồi! Bạn đã nghe đúng',
        incorrect: 'Sai rồi, nghe lại kỹ hơn',
        hint: 'Chú ý từng từ'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: true,
    requiresMicrophone: false,
    skillFocus: ['listening']
  },

  // Drag & Drop subtypes (3)
  vocabulary_drag_drop: {
    type: 'drag_drop',
    exercise_subtype: 'vocabulary_drag_drop',
    title: 'Kéo thả từ vựng',
    instruction: 'Kéo từ vào đúng vị trí',
    content: {
      items: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
      targets: [
        { id: 'greeting', label: 'Lời chào', correctItem: 'Hello' },
        { id: 'farewell', label: 'Lời tạm biệt', correctItem: 'Goodbye' },
        { id: 'gratitude', label: 'Lời cảm ơn', correctItem: 'Thank you' },
        { id: 'apology', label: 'Lời xin lỗi', correctItem: 'Sorry' }
      ],
      feedback: {
        correct: 'Đúng rồi! Bạn đã kéo đúng vị trí',
        incorrect: 'Sai rồi, kiểm tra lại',
        hint: 'Chú ý nghĩa của từng từ'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 60,
    estimatedTime: 40,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary']
  },

  grammar_drag_drop: {
    type: 'drag_drop',
    exercise_subtype: 'grammar_drag_drop',
    title: 'Kéo thả ngữ pháp',
    instruction: 'Kéo từ vào đúng vị trí ngữ pháp',
    content: {
      items: ['am', 'is', 'are', 'be'],
      targets: [
        { id: 'i', label: 'I ___ a student', correctItem: 'am' },
        { id: 'she', label: 'She ___ a teacher', correctItem: 'is' },
        { id: 'they', label: 'They ___ friends', correctItem: 'are' }
      ],
      feedback: {
        correct: 'Đúng rồi! Ngữ pháp đều đúng',
        incorrect: 'Sai rồi, kiểm tra lại ngữ pháp',
        hint: 'Chú ý chủ ngữ và động từ'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 60,
    estimatedTime: 40,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['grammar']
  },

  writing_drag_drop: {
    type: 'drag_drop',
    exercise_subtype: 'writing_drag_drop',
    title: 'Kéo thả viết',
    instruction: 'Kéo từ để tạo câu hoàn chỉnh',
    content: {
      items: ['My', 'name', 'is', 'Lan'],
      targets: [
        { id: 'sentence', label: '___ ___ ___ ___', correctOrder: ['My', 'name', 'is', 'Lan'] }
      ],
      feedback: {
        correct: 'Đúng rồi! Câu hoàn chỉnh và đúng ngữ pháp',
        incorrect: 'Sai rồi, kiểm tra lại thứ tự',
        hint: 'Dùng cấu trúc "My name is"'
      }
    },
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 60,
    estimatedTime: 40,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['writing']
  }
};

// Helper function to get exercise by subtype
export function getExerciseBySubtype(subtype) {
  return STATIC_EXERCISES[subtype] || null;
}

// Helper function to get all exercise subtypes
export function getAllExerciseSubtypes() {
  return Object.keys(STATIC_EXERCISES);
}

// Helper function to get exercises by skill focus
export function getExercisesBySkill(skill) {
  return Object.values(STATIC_EXERCISES).filter(exercise => 
    exercise.skillFocus.includes(skill)
  );
}

// Helper function to get exercises by type
export function getExercisesByType(type) {
  return Object.values(STATIC_EXERCISES).filter(exercise => 
    exercise.type === type
  );
} 
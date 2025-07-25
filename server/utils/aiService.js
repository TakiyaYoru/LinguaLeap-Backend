// ===============================================
// AI SERVICE - CLAUDE INTEGRATION
// ===============================================

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ===============================================
// PROMPT TEMPLATES FOR 9 EXERCISE TYPES
// ===============================================

const EXERCISE_TEMPLATES = {
  multiple_choice: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập multiple choice phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"

Tạo câu hỏi multiple choice về chủ đề cơ bản cho người học tiếng Anh.
    
Yêu cầu:
- Câu hỏi thực tế, dễ hiểu, phù hợp level {user_level}
- 4 đáp án: 1 đúng, 3 sai hợp lý  
- Đáp án sai cùng chủ đề nhưng rõ ràng sai
- Tránh ngữ pháp phức tạp
- Nếu có từ vựng cụ thể, sử dụng từ đó làm câu hỏi chính

QUAN TRỌNG: Chỉ trả về JSON, không có text khác.

JSON format:
{
  "question": "Câu hỏi bằng tiếng Anh",
  "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
  "correctAnswer": 0,
  "feedback": {
    "correct": "Đúng rồi!",
    "incorrect": "Sai rồi, thử lại!",
    "hint": "Gợi ý"
  }
}`,
    
    expected_output_format: {
      question: "string",
      options: ["string1", "string2", "string3", "string4"],
      correctAnswer: "number",
      feedback: {
        correct: "string",
        incorrect: "string",
        hint: "string"
      }
    },
    
    fallback_template: {
      question: "What is the English word for 'số hai'?",
      options: ["two", "one", "three", "four"],
      correctAnswer: 0,
      feedback: {
        correct: "Correct! 'số hai' means 'two' in English.",
        incorrect: "Not quite right. Try again!",
        hint: "Think about counting numbers in English."
      }
    }
  },

  fill_blank: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập fill blank phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo câu điền từ cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- Câu đơn giản, dễ hiểu
- Từ cần điền phù hợp ngữ cảnh
- Có thể có 1-2 từ thay thế
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "sentence": "string",
  "correct_word": "string",
  "translation": "string",
  "alternatives": ["string1", "string2"]
}`,
    
    expected_output_format: {
      sentence: "string",
      correct_word: "string",
      translation: "string",
      alternatives: ["string1", "string2"]
    },
    
    fallback_template: {
      sentence: "I say _____ when I meet my friends.",
      correct_word: "{word}",
      translation: "Tôi nói _____ khi gặp bạn bè.",
      alternatives: ["hi", "hey"]
    }
  },

  listening: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập listening phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo bài tập listening cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- Câu ngắn gọn, rõ ràng
- Từ khóa dễ nghe
- 4 đáp án hợp lý
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "audio_text": "string",
  "question": "string",
  "options": ["string1", "string2", "string3", "string4"],
  "correct_index": "number"
}`,
    
    expected_output_format: {
      audio_text: "string",
      question: "string",
      options: ["string1", "string2", "string3", "string4"],
      correct_index: "number"
    },
    
    fallback_template: {
      audio_text: "Hello, how are you today?",
      question: "What greeting did you hear?",
      options: ["Hello", "Goodbye", "Thank you", "Sorry"],
      correct_index: 0
    }
  },

  translation: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập translation phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo bài tập dịch cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- Dịch từ Việt sang Anh hoặc ngược lại
- Có thể có 1-2 cách dịch khác
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "source_text": "string",
  "source_language": "string",
  "target_language": "string",
  "correct_translation": "string",
  "alternatives": ["string1", "string2"]
}`,
    
    expected_output_format: {
      source_text: "string",
      source_language: "string",
      target_language: "string",
      correct_translation: "string",
      alternatives: ["string1", "string2"]
    },
    
    fallback_template: {
      source_text: "Xin chào",
      source_language: "vi",
      target_language: "en",
      correct_translation: "Hello",
      alternatives: ["Hi", "Hey there"]
    }
  },

  word_matching: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập word matching phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo bài tập ghép từ cho các từ trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- 3-5 cặp từ phù hợp
- Từ dễ hiểu, thực tế
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "pairs": [
    {"word": "string", "meaning": "string"},
    {"word": "string", "meaning": "string"}
  ],
  "instruction": "string"
}`,
    
    expected_output_format: {
      pairs: [
        {word: "string", meaning: "string"}
      ],
      instruction: "string"
    },
    
    fallback_template: {
      pairs: [
        {word: "Hello", meaning: "Xin chào"},
        {word: "Goodbye", meaning: "Tạm biệt"},
        {word: "Thanks", meaning: "Cảm ơn"}
      ],
      instruction: "Ghép từ tiếng Anh với nghĩa tiếng Việt"
    }
  },

  sentence_building: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập sentence building phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo bài tập sắp xếp câu cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- Câu đơn giản, dễ hiểu
- Từ đã được xáo trộn
- Có bản dịch tiếng Việt
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "target_sentence": "string",
  "shuffled_words": ["string1", "string2", "string3"],
  "translation": "string",
  "hint": "string"
}`,
    
    expected_output_format: {
      target_sentence: "string",
      shuffled_words: ["string1", "string2", "string3"],
      translation: "string",
      hint: "string"
    },
    
    fallback_template: {
      target_sentence: "Hello, how are you?",
      shuffled_words: ["you", "how", "Hello", "are", "?"],
      translation: "Xin chào, bạn khỏe không?",
      hint: "Bắt đầu với lời chào"
    }
  },

  true_false: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập true/false phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo câu true/false cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- Câu rõ ràng, dễ hiểu
- Có thể đúng hoặc sai
- Giải thích ngắn gọn
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "statement": "string",
  "is_correct": "boolean",
  "explanation": "string"
}`,
    
    expected_output_format: {
      statement: "string",
      is_correct: "boolean",
      explanation: "string"
    },
    
    fallback_template: {
      statement: "'Hello' is used to say goodbye in English.",
      is_correct: false,
      explanation: "'Hello' dùng để chào hỏi, không phải tạm biệt"
    }
  },

  listen_choose: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập listen and choose phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo bài tập nghe và chọn hình ảnh cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- Từ ngắn gọn, dễ nghe
- 3-4 lựa chọn hình ảnh
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "audio_text": "string",
  "instruction": "string",
  "options": [
    {"id": "string", "image_url": "string", "label": "string"}
  ],
  "correct_option_id": "string"
}`,
    
    expected_output_format: {
      audio_text: "string",
      instruction: "string",
      options: [
        {id: "string", image_url: "string", label: "string"}
      ],
      correct_option_id: "string"
    },
    
    fallback_template: {
      audio_text: "apple",
      instruction: "Listen and choose the correct image",
      options: [
        {id: "opt1", image_url: "/images/apple.jpg", label: "Apple"},
        {id: "opt2", image_url: "/images/banana.jpg", label: "Banana"},
        {id: "opt3", image_url: "/images/orange.jpg", label: "Orange"}
      ],
      correct_option_id: "opt1"
    }
  },

  speak_repeat: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập speak and repeat phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Tạo bài tập nói và lặp lại cho từ '{word}' nghĩa '{meaning}' trong ngữ cảnh '{lesson_context}'.
    
Yêu cầu:
- Câu ngắn gọn, dễ phát âm
- Có phiên âm IPA
- Có thể có biến thể chấp nhận được
- Phù hợp tình huống {situation}

Trả về JSON format: {
  "text_to_speak": "string",
  "phonetic": "string",
  "audio_url": "string",
  "evaluation_criteria": "string",
  "acceptable_variations": ["string1", "string2"]
}`,
    
    expected_output_format: {
      text_to_speak: "string",
      phonetic: "string",
      audio_url: "string",
      evaluation_criteria: "string",
      acceptable_variations: ["string1", "string2"]
    },
    
    fallback_template: {
      text_to_speak: "Hello, nice to meet you",
      phonetic: "/həˈloʊ naɪs tu mit ju/",
      audio_url: "generated_audio_url",
      evaluation_criteria: "basic_word_matching",
      acceptable_variations: ["Hello nice to meet you", "Hello, nice to meet you!"]
    }
  }
};

// ===============================================
// AI SERVICE FUNCTIONS
// ===============================================

export class AIService {
  
  // Generate exercise content using Claude
  static async generateExercise(exerciseType, context) {
    try {
      console.log('🤖 Generating exercise:', exerciseType);
      
      const template = EXERCISE_TEMPLATES[exerciseType];
      if (!template) {
        throw new Error(`Unsupported exercise type: ${exerciseType}`);
      }
      
      // Replace variables in prompt
      let systemContext = template.system_context;
      let mainPrompt = template.main_prompt;
      
      // Replace placeholders with actual values
      const variables = {
        word: context.word || '',
        meaning: context.meaning || '',
        lesson_context: context.lesson_context || '',
        situation: context.situation || '',
        user_level: context.user_level || 'beginner',
        user_context: context.user_context || context.lesson_context || 'basic English vocabulary'
      };
      
      Object.keys(variables).forEach(key => {
        const placeholder = `{${key}}`;
        systemContext = systemContext.replace(new RegExp(placeholder, 'g'), variables[key]);
        mainPrompt = mainPrompt.replace(new RegExp(placeholder, 'g'), variables[key]);
      });
      
      // Call Claude API
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemContext,
        messages: [
          {
            role: 'user',
            content: mainPrompt
          }
        ]
      });
      
      const content = response.content[0].text;
      
      // Try to parse JSON response
      try {
        console.log('📝 Raw AI response:', content);
        
        // Try to find JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const exerciseData = JSON.parse(jsonMatch[0]);
          console.log('✅ Exercise generated successfully:', exerciseData);
          
          // Validate the structure
          if (exerciseData.question && exerciseData.options && exerciseData.correctAnswer !== undefined) {
            return exerciseData;
          } else {
            console.warn('⚠️ Invalid exercise structure, using fallback');
          }
        } else {
          console.warn('⚠️ No JSON found in response');
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse JSON response:', parseError.message);
      }
      
      // Use fallback template if parsing fails
      console.log('🔄 Using fallback template');
      return this.generateFallbackExercise(exerciseType, context);
      
    } catch (error) {
      console.error('❌ Error generating exercise:', error.message);
      return this.generateFallbackExercise(exerciseType, context);
    }
  }
  
  // Generate fallback exercise using template
  static generateFallbackExercise(exerciseType, context) {
    const template = EXERCISE_TEMPLATES[exerciseType];
    if (!template) {
      throw new Error(`Unsupported exercise type: ${exerciseType}`);
    }
    
    const fallback = template.fallback_template;
    
    // Replace variables in fallback
    let result = JSON.parse(JSON.stringify(fallback));
    
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'string') {
        result[key] = result[key].replace('{word}', context.word || '')
                                 .replace('{meaning}', context.meaning || '');
      }
    });
    
    return result;
  }
  
  // Generate multiple exercises for a lesson
  static async generateLessonExercises(lesson, vocabularyList, userLevel = 'beginner') {
    try {
      console.log('📚 Generating exercises for lesson:', lesson.title);
      
      const exercises = [];
      const generationConfig = lesson.exercise_generation || {
        total_exercises: 6,
        exercise_distribution: {
          multiple_choice: 2,
          fill_blank: 2,
          listening: 1,
          translation: 1
        }
      };
      
      // Generate exercises based on distribution
      for (const [exerciseType, count] of Object.entries(generationConfig.exercise_distribution)) {
        for (let i = 0; i < count; i++) {
          // Select vocabulary for this exercise
          const vocabIndex = i % vocabularyList.length;
          const vocabulary = vocabularyList[vocabIndex];
          
          const context = {
            word: vocabulary.word,
            meaning: vocabulary.meaning,
            lesson_context: lesson.lesson_context?.situation || lesson.title,
            situation: lesson.lesson_context?.situation || 'general',
            user_level: userLevel
          };
          
          const exerciseContent = await this.generateExercise(exerciseType, context);
          
          exercises.push({
            type: exerciseType,
            content: exerciseContent,
            vocabulary: vocabulary,
            sortOrder: exercises.length + 1
          });
        }
      }
      
      console.log(`✅ Generated ${exercises.length} exercises`);
      return exercises;
      
    } catch (error) {
      console.error('❌ Error generating lesson exercises:', error.message);
      throw error;
    }
  }
  
  // Validate exercise content
  static validateExerciseContent(exerciseType, content) {
    const template = EXERCISE_TEMPLATES[exerciseType];
    if (!template) return false;
    
    const expectedFormat = template.expected_output_format;
    
    // Basic validation - check if required fields exist
    for (const field of Object.keys(expectedFormat)) {
      if (!(field in content)) {
        console.warn(`⚠️ Missing field: ${field}`);
        return false;
      }
    }
    
    return true;
  }
}

export default AIService; 
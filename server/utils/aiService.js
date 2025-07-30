// ===============================================
// AI SERVICE - CLAUDE INTEGRATION (COMPLETE ENHANCED VERSION)
// ===============================================

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ===============================================
// ENHANCED JSON PARSER CLASS
// ===============================================

class EnhancedJSONParser {
  
  // Làm sạch ký tự đặc biệt và smart quotes
  static cleanSpecialCharacters(text) {
    return text
      // Xử lý smart quotes (từ AI thường tạo ra)
      .replace(/[\u2018\u2019]/g, "'")    // ' ' → '
      .replace(/[\u201C\u201D]/g, '"')    // " " → "
      .replace(/[\u2013\u2014]/g, "-")    // – — → -
      
      // Xử lý các ký tự Unicode khác
      .replace(/[\u00A0]/g, " ")          // Non-breaking space → regular space
      .replace(/[\u2026]/g, "...")        // … → ...
      
      // Loại bỏ ký tự control chars
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim();
  }
  
  // Tìm và extract JSON blocks từ text
  static extractJSONBlocks(content) {
    const jsonBlocks = [];
    
    // Method 1: Simple regex pattern
    const simplePattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    let matches = content.match(simplePattern);
    if (matches) {
      jsonBlocks.push(...matches);
    }
    
    // Method 2: Bracket counting for nested JSON
    let braceCount = 0;
    let start = -1;
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          if (braceCount === 0) start = i;
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && start !== -1) {
            const block = content.substring(start, i + 1);
            if (!jsonBlocks.includes(block)) {
              jsonBlocks.push(block);
            }
          }
        }
      }
    }
    
    return jsonBlocks;
  }
  
  // Sửa lỗi JSON thường gặp
  static fixCommonJSONErrors(jsonString) {
    return jsonString
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      
      // Fix missing quotes around keys
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      
      // Fix single quotes to double quotes (nhưng không trong nội dung)
      .replace(/'([^']*)':/g, '"$1":')
      
      // Fix newlines và tabs trong strings
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      
      // Fix multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // Escape unescaped quotes trong feedback sections và tất cả strings
  static fixFeedbackQuotes(jsonString) {
    // Fix 1: Xử lý feedback sections
    let fixed = jsonString.replace(
      /"feedback"\s*:\s*\{([^}]+)\}/g,
      (match, feedbackContent) => {
        // Fix quotes inside feedback values
        const fixedContent = feedbackContent.replace(
          /"([^"]*)":\s*"([^"]*)"([^"]*)"([^"]*)"/g,
          (valueMatch, key, p1, p2, p3) => {
            if (p2 && p3) {
              // Có unescaped quotes trong value
              return `"${key}": "${p1}\\"${p2}\\"${p3}"`;
            }
            return valueMatch;
          }
        );
        return `"feedback": {${fixedContent}}`;
      }
    );

    // Fix 2: Xử lý tất cả string values có unescaped quotes
    fixed = fixed.replace(
      /"([^"]*)":\s*"([^"\\]*)("([^"\\]*)")*([^"]*)"/g,
      (match, key, start, middle, middleContent, end) => {
        if (middle && middleContent !== undefined) {
          // Có quotes chưa escaped trong value
          const escapedValue = `${start}\\"${middleContent}\\"${end}`;
          return `"${key}": "${escapedValue}"`;
        }
        return match;
      }
    );

    // Fix 3: Pattern đặc biệt cho các trường hợp như "Good morning" trong feedback
    fixed = fixed.replace(
      /"(correct|incorrect|hint)"\s*:\s*"([^"]*)"([^"]*)"([^"]*)"/g,
      (match, field, p1, p2, p3) => {
        if (p2 && p3) {
          return `"${field}": "${p1}\\"${p2}\\"${p3}"`;
        }
        return match;
      }
    );

    return fixed;
  }
  
  // Parse JSON với nhiều strategies
  static parseWithStrategies(content) {
    console.log('🔍 Attempting to parse JSON from content...');
    
    const strategies = [
      // Strategy 1: Direct parse
      {
        name: "Direct Parse",
        method: () => JSON.parse(content)
      },
      
      // Strategy 2: Clean special chars first
      {
        name: "Clean Special Characters",
        method: () => {
          const cleaned = this.cleanSpecialCharacters(content);
          return JSON.parse(cleaned);
        }
      },
      
      // Strategy 3: Fix feedback quotes
      {
        name: "Fix Feedback Quotes",
        method: () => {
          let fixed = this.fixFeedbackQuotes(content);
          fixed = this.cleanSpecialCharacters(fixed);
          return JSON.parse(fixed);
        }
      },
      
      // Strategy 4: Extract JSON blocks
      {
        name: "Extract JSON Blocks", 
        method: () => {
          const blocks = this.extractJSONBlocks(content);
          for (const block of blocks) {
            try {
              return JSON.parse(block);
            } catch (e) {
              // Try fixing the block
              try {
                const fixed = this.fixFeedbackQuotes(block);
                return JSON.parse(fixed);
              } catch (e2) {
                continue;
              }
            }
          }
          throw new Error('No valid JSON found in blocks');
        }
      },
      
      // Strategy 5: Fix common errors then parse
      {
        name: "Fix Common Errors",
        method: () => {
          let fixed = this.fixCommonJSONErrors(content);
          fixed = this.fixFeedbackQuotes(fixed);
          return JSON.parse(fixed);
        }
      },
      
      // Strategy 6: Aggressive cleaning với better quote handling
      {
        name: "Aggressive Cleaning",
        method: () => {
          let cleaned = content
            // Remove all non-printable characters except Vietnamese
            .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF\u0100-\u017F]/g, '')
            
            // Replace smart quotes
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'")
            
            // Fix specific patterns that cause issues
            .replace(/"([^"]*)"([^"]*)"([^"]*)"(?=\s*[,}])/g, (match, p1, p2, p3) => {
              // Pattern: "text"more text"end" -> "text\"more text\"end"
              return `"${p1}\\"${p2}\\"${p3}"`;
            })
            
            // Fix pattern: "key": "value"internal"text"
            .replace(/:\s*"([^"]*)"([^"]*)"([^"]*)"(?=\s*[,}])/g, (match, p1, p2, p3) => {
              return `: "${p1}\\"${p2}\\"${p3}"`;
            })
            
            // Fix standalone quoted words in strings like: "Good morning"
            .replace(/"\s*([^"]+)\s*"\s*([^"]+)\s*"/g, (match, quoted, rest) => {
              return `"${quoted} ${rest}"`;
            });
          
          // Find JSON part
          const start = cleaned.indexOf('{');
          const end = cleaned.lastIndexOf('}') + 1;
          
          if (start !== -1 && end > start) {
            cleaned = cleaned.substring(start, end);
          }
          
          return JSON.parse(cleaned);
        }
      },
      
      // Strategy 8: Ultra aggressive quote fixing
      {
        name: "Ultra Aggressive Quote Fixing",
        method: () => {
          let fixed = content;
          
          // Step 1: Replace all smart quotes
          fixed = fixed.replace(/[""]/g, '"').replace(/['']/g, "'");
          
          // Step 2: Find and fix all problematic quote patterns
          // Pattern: "value" trong string values
          fixed = fixed.replace(
            /("(?:correct|incorrect|hint|statement|question|sentence)"\s*:\s*")([^"]*)"([^"]*)"([^"]*?)(")/g,
            (match, start, p1, p2, p3, end) => {
              return `${start}${p1}\\"${p2}\\"${p3}${end}`;
            }
          );
          
          // Step 3: Handle edge cases với multiple quotes
          fixed = fixed.replace(
            /(":\s*")([^"]*)"([^"]*)"([^"]*)"([^"]*?)(")/g,
            (match, start, p1, p2, p3, p4, end) => {
              return `${start}${p1}\\"${p2}\\"${p3}\\"${p4}${end}`;
            }
          );
          
          // Step 4: Last resort - remove problematic characters
          fixed = fixed.replace(/[\u201C\u201D\u2018\u2019]/g, '');
          
          return JSON.parse(fixed);
        }
      }
    ];
    
    // Thử từng strategy
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`📝 Trying strategy ${i + 1}: ${strategies[i].name}`);
        const result = strategies[i].method();
        console.log(`✅ JSON parsed successfully with strategy: ${strategies[i].name}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Strategy "${strategies[i].name}" failed: ${error.message}`);
        if (i === strategies.length - 1) {
          throw new Error(`All parsing strategies failed. Last error: ${error.message}`);
        }
      }
    }
  }
}

// ===============================================
// ENHANCED PROMPT TEMPLATES WITH SKILL FOCUS
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

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Thay dấu ngoặc kép bằng từ ngữ mô tả hoặc dấu nháy đơn
- Feedback ngắn gọn, tránh ký tự đặc biệt

JSON format:
{
  "question": "Câu hỏi bằng tiếng Anh",
  "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
  "correctAnswer": 0,
  "feedback": {
    "correct": "Đúng rồi! Giải thích không có dấu ngoặc kép",
    "incorrect": "Sai rồi, thử lại!",
    "hint": "Gợi ý ngắn gọn"
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
      question: "What is the English word for số hai?",
      options: ["two", "one", "three", "four"],
      correctAnswer: 0,
      feedback: {
        correct: "Correct! số hai means two in English.",
        incorrect: "Not quite right. Try again!",
        hint: "Think about counting numbers in English."
      }
    }
  },

  fill_blank: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập fill blank phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"

Tạo câu điền từ cho người học tiếng Anh.
    
Yêu cầu:
- Câu đơn giản, dễ hiểu, phù hợp level {user_level}
- Sử dụng _____ để đánh dấu chỗ trống
- Từ cần điền phù hợp ngữ cảnh
- Có thể có 1-2 từ thay thế
- Nếu có từ vựng cụ thể, sử dụng từ đó làm từ cần điền

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Thay dấu ngoặc kép bằng từ ngữ mô tả
- Feedback ngắn gọn, tránh ký tự đặc biệt

JSON format:
{
  "sentence": "Câu có chỗ trống bằng tiếng Anh",
  "correctAnswer": "Từ đúng",
  "alternatives": ["Từ thay thế 1", "Từ thay thế 2"],
  "feedback": {
    "correct": "Đúng rồi! Giải thích không có dấu ngoặc kép",
    "incorrect": "Sai rồi, thử lại!",
    "hint": "Gợi ý ngắn gọn"
  }
}`,
    
    expected_output_format: {
      sentence: "string",
      correctAnswer: "string",
      alternatives: ["string1", "string2"],
      feedback: {
        correct: "string",
        incorrect: "string",
        hint: "string"
      }
    },
    
    fallback_template: {
      sentence: "I say _____ when I meet my friends.",
      correctAnswer: "hello",
      alternatives: ["hi", "hey"],
      feedback: {
        correct: "Correct! hello is a common greeting.",
        incorrect: "Not quite right. Try again!",
        hint: "Think about common greetings in English."
      }
    }
  },

  // TRUE/FALSE with Skill Focus Support
  true_false: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập true/false với mục đích học tiếng Anh hiệu quả.`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"
{skill_focus_prompt}

Tạo câu đúng/sai cho người học tiếng Anh.
    
Yêu cầu chung:
- Câu khẳng định rõ ràng, dễ hiểu, phù hợp level {user_level}
- Có thể đúng hoặc sai một cách hợp lý
- Nội dung thực tế, gần gũi với cuộc sống hàng ngày
- Tránh câu phức tạp hoặc mơ hồ

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Thay dấu ngoặc kép bằng từ ngữ mô tả
- Feedback ngắn gọn, tránh ký tự đặc biệt

JSON format:
{
  "statement": "Câu khẳng định bằng tiếng Anh",
  "isTrue": true,
  "feedback": {
    "correct": "Đúng rồi! Giải thích ngắn gọn không có dấu ngoặc kép",
    "incorrect": "Sai rồi! Giải thích ngắn gọn",
    "hint": "Gợi ý ngắn gọn"
  }{skill_focus_fields}
}`,
    
    expected_output_format: {
      statement: "string",
      isTrue: "boolean",
      feedback: {
        correct: "string",
        incorrect: "string",
        hint: "string"
      }
    },
    
    fallback_template: {
      statement: "The sun rises in the east.",
      isTrue: true,
      feedback: {
        correct: "Correct! The sun always rises in the east.",
        incorrect: "Not quite right. The sun rises in the east.",
        hint: "Think about the direction of sunrise."
      }
    }
  },

  // TRUE/FALSE - Vocabulary Focus
  true_false_vocabulary: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập true/false tập trung vào từ vựng (Vocabulary).`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"
Skill Focus: Vocabulary
Chủ đề: {topic}

Tạo câu đúng/sai tập trung vào kiểm tra hiểu biết từ vựng.

Yêu cầu cụ thể cho Vocabulary:
- Kiểm tra nghĩa của từ, cụm từ
- Sử dụng từ trong ngữ cảnh phù hợp
- Phân biệt từ đồng nghĩa/trái nghĩa
- Kiểm tra từ loại (noun, verb, adjective...)
- Phù hợp level {user_level}

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Tập trung vào kiến thức từ vựng

JSON format:
{
  "statement": "Câu khẳng định về từ vựng để đánh giá",
  "isTrue": true,
  "feedback": {
    "correct": "Đúng rồi! Giải thích về từ vựng không có dấu ngoặc kép",
    "incorrect": "Sai rồi! Giải thích về từ vựng",
    "hint": "Gợi ý về từ vựng"
  },
  "vocabulary_focus": {
    "target_word": "Từ chính được kiểm tra",
    "word_type": "noun",
    "difficulty": "beginner"
  },
  "skill_focus": "vocabulary",
  "topic": "{topic}"
}`,
    
    expected_output_format: {
      statement: "string",
      isTrue: "boolean",
      feedback: {
        correct: "string",
        incorrect: "string",
        hint: "string"
      },
      vocabulary_focus: {
        target_word: "string",
        word_type: "string",
        difficulty: "string"
      },
      skill_focus: "vocabulary",
      topic: "string"
    },
    
    fallback_template: {
      statement: "The word happy is a noun in English.",
      isTrue: false,
      feedback: {
        correct: "Correct! Happy là tính từ (adjective), không phải danh từ (noun).",
        incorrect: "Not quite right. Happy is an adjective, not a noun.",
        hint: "Think about what type of word happy is."
      },
      vocabulary_focus: {
        target_word: "happy",
        word_type: "adjective",
        difficulty: "beginner"
      },
      skill_focus: "vocabulary",
      topic: "emotions"
    }
  },

  // TRUE/FALSE - Listening Focus
  true_false_listening: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập true/false tập trung vào kỹ năng nghe (Listening).`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"
Skill Focus: Listening
Chủ đề: {topic}

Tạo câu đúng/sai tập trung vào kiểm tra kỹ năng nghe hiểu.

Yêu cầu cụ thể cho Listening:
- Kiểm tra khả năng phân biệt âm thanh
- Hiểu nội dung từ audio (mô tả audio content)
- Nhận biết trọng âm, ngữ điệu
- Phân biệt từ đồng âm khác nghĩa
- Hiểu ngữ cảnh từ âm thanh
- Phù hợp level {user_level}

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Tập trung vào khả năng nghe hiểu

JSON format:
{
  "statement": "Câu khẳng định về nội dung nghe để đánh giá",
  "isTrue": true,
  "feedback": {
    "correct": "Đúng rồi! Giải thích về nội dung nghe",
    "incorrect": "Sai rồi! Giải thích về nội dung nghe",
    "hint": "Gợi ý về việc nghe"
  },
  "listening_focus": {
    "audio_content": "Mô tả nội dung audio sẽ nghe",
    "listening_skill": "comprehension",
    "audio_length": "5 seconds",
    "difficulty": "beginner"
  },
  "skill_focus": "listening",
  "topic": "{topic}"
}`,
    
    expected_output_format: {
      statement: "string",
      isTrue: "boolean",
      feedback: {
        correct: "string",
        incorrect: "string",
        hint: "string"
      },
      listening_focus: {
        audio_content: "string",
        listening_skill: "string",
        audio_length: "string",
        difficulty: "string"
      },
      skill_focus: "listening",
      topic: "string"
    },
    
    fallback_template: {
      statement: "In the audio, the speaker says Good afternoon.",
      isTrue: false,
      feedback: {
        correct: "Correct! Trong audio, người nói nói Good morning, không phải Good afternoon.",
        incorrect: "Not quite right. Listen again to what the speaker says.",
        hint: "Pay attention to the time of day mentioned."
      },
      listening_focus: {
        audio_content: "A person greeting someone in the morning",
        listening_skill: "comprehension",
        audio_length: "3 seconds",
        difficulty: "beginner"
      },
      skill_focus: "listening",
      topic: "greetings"
    }
  },

  // TRUE/FALSE - Grammar Focus
  true_false_grammar: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập true/false tập trung vào ngữ pháp (Grammar).`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"
Skill Focus: Grammar
Chủ đề: {topic}

Tạo câu đúng/sai tập trung vào kiểm tra kiến thức ngữ pháp.

Yêu cầu cụ thể cho Grammar:
- Kiểm tra cấu trúc câu, thì động từ
- Sử dụng đúng từ loại, giới từ
- Quy tắc ngữ pháp cơ bản
- Cách sắp xếp từ trong câu
- So sánh, điều kiện, bị động...
- Phù hợp level {user_level}

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Tập trung vào quy tắc ngữ pháp

JSON format:
{
  "statement": "Câu khẳng định về ngữ pháp để đánh giá",
  "isTrue": true,
  "feedback": {
    "correct": "Đúng rồi! Giải thích quy tắc ngữ pháp",
    "incorrect": "Sai rồi! Giải thích quy tắc ngữ pháp",
    "hint": "Gợi ý về ngữ pháp"
  },
  "grammar_focus": {
    "grammar_point": "Điểm ngữ pháp được kiểm tra",
    "rule_type": "tense",
    "example_correct": "Ví dụ câu đúng",
    "difficulty": "beginner"
  },
  "skill_focus": "grammar",
  "topic": "{topic}"
}`,
    
    expected_output_format: {
      statement: "string",
      isTrue: "boolean",
      feedback: {
        correct: "string",
        incorrect: "string",
      hint: "string"
      },
      grammar_focus: {
        grammar_point: "string",
        rule_type: "string",
        example_correct: "string",
        difficulty: "string"
      },
      skill_focus: "grammar",
      topic: "string"
    },
    
    fallback_template: {
      statement: "The sentence I am go to school is grammatically correct.",
      isTrue: false,
      feedback: {
        correct: "Correct! Câu đúng phải là I go to school hoặc I am going to school.",
        incorrect: "Not quite right. The sentence has a grammar error.",
        hint: "Think about present tense vs present continuous."
      },
      grammar_focus: {
        grammar_point: "Present tense vs Present continuous",
        rule_type: "tense",
        example_correct: "I go to school every day",
        difficulty: "beginner"
      },
      skill_focus: "grammar",
      topic: "daily_activities"
    }
  },

  // Keep other existing templates...
  translation: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập translation phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"

Tạo bài tập dịch thuật cho người học tiếng Anh.
    
Yêu cầu:
- Câu tiếng Anh đơn giản, dễ hiểu, phù hợp level {user_level}
- Bản dịch tiếng Việt chính xác và tự nhiên
- Nội dung thực tế, gần gũi với cuộc sống hàng ngày
- Nếu có từ vựng cụ thể, sử dụng từ đó trong câu
- Tránh câu phức tạp hoặc mơ hồ

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Feedback ngắn gọn, tránh ký tự đặc biệt

JSON format:
{
  "sourceText": "Câu tiếng Anh cần dịch",
  "targetText": "Bản dịch tiếng Việt chính xác",
  "feedback": {
    "correct": "Đúng rồi! Giải thích ngắn gọn",
    "incorrect": "Sai rồi, thử lại! Giải thích ngắn gọn",
    "hint": "Gợi ý ngắn gọn"
  }
}`,
    
    expected_output_format: {
      sourceText: "string",
      targetText: "string",
      feedback: {
        correct: "string",
        incorrect: "string",
        hint: "string"
      }
    },
    
    fallback_template: {
      sourceText: "Hello, how are you?",
      targetText: "Xin chào, bạn khỏe không?",
      feedback: {
        correct: "Correct! Bản dịch chính xác và tự nhiên.",
        incorrect: "Not quite right. Hãy chú ý đến ngữ cảnh chào hỏi.",
        hint: "Đây là câu chào hỏi thông dụng."
      }
    }
  },

  word_matching: {
    system_context: `Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}.
Bạn tạo bài tập word matching phù hợp văn hóa Việt Nam.`,
    
    main_prompt: `Dựa trên yêu cầu: "{user_context}"

Tạo bài tập ghép từ tiếng Anh với nghĩa tiếng Việt.
    
Yêu cầu:
- 4-5 cặp từ phù hợp level {user_level}
- Từ tiếng Anh đơn giản, dễ hiểu
- Nghĩa tiếng Việt chính xác và tự nhiên
- Nội dung thực tế, gần gũi với cuộc sống hàng ngày
- Nếu có từ vựng cụ thể, sử dụng từ đó
- Tránh từ phức tạp hoặc mơ hồ

QUAN TRỌNG - JSON RULES:
- Chỉ trả về JSON hợp lệ, không có text khác
- KHÔNG sử dụng dấu ngoặc kép trong feedback content
- Feedback ngắn gọn, tránh ký tự đặc biệt

JSON format:
{
  "pairs": [
    {
      "word": "Từ tiếng Anh",
      "meaning": "Nghĩa tiếng Việt"
    }
  ],
  "instruction": "Hướng dẫn làm bài tập",
  "feedback": {
    "correct": "Đúng rồi! Giải thích ngắn gọn",
    "incorrect": "Sai rồi, thử lại! Giải thích ngắn gọn",
    "hint": "Gợi ý ngắn gọn"
  }
}`,
    
    expected_output_format: {
      pairs: [
        {
          word: "string",
          meaning: "string"
        }
      ],
      instruction: "string",
      feedback: {
        correct: "string",
        incorrect: "string",
        hint: "string"
      }
    },
    
    fallback_template: {
      pairs: [
        {
          word: "Hello",
          meaning: "Xin chào"
        },
        {
          word: "Goodbye",
          meaning: "Tạm biệt"
        },
        {
          word: "Thank you",
          meaning: "Cảm ơn"
        },
        {
          word: "Please",
          meaning: "Xin vui lòng"
        }
      ],
      instruction: "Ghép từ tiếng Anh với nghĩa tiếng Việt tương ứng",
      feedback: {
        correct: "Correct! Bạn đã ghép từ chính xác.",
        incorrect: "Not quite right. Hãy kiểm tra lại từng cặp từ.",
        hint: "Đọc kỹ từng từ và nghĩa của chúng."
      }
    }
  }
};

// ===============================================
// AI SERVICE WITH ENHANCED ERROR HANDLING
// ===============================================

export class AIService {
  
  // Generate exercise content using Claude
  static async generateExercise(exerciseType, context) {
    try {
      console.log('🤖 Generating exercise:', exerciseType);
      console.log('📝 Context:', context);
      
      // Parse context properly
      const parsedContext = {
        word: context.word || '',
        meaning: context.meaning || '',
        lesson_context: context.lesson_context || '',
        situation: context.situation || 'general',
        user_level: context.user_level || 'A1',
        user_context: context.user_context || context.lesson_context || 'basic English vocabulary',
        skill_focus: context.skill_focus || [],
        topic: context.topic || 'general'
      };
      
      console.log('📝 Parsed context:', parsedContext);
      
      // Handle skill-specific templates
      let actualExerciseType = exerciseType;
      if (exerciseType === 'fill_blank' && parsedContext.skill_focus) {
        const skillFocus = Array.isArray(parsedContext.skill_focus) 
          ? parsedContext.skill_focus[0] 
          : parsedContext.skill_focus;
        actualExerciseType = `fill_blank_${skillFocus}`;
        console.log('🎯 Using skill-specific template:', actualExerciseType);
      } else if (exerciseType === 'true_false' && parsedContext.skill_focus) {
        const skillFocus = Array.isArray(parsedContext.skill_focus) 
          ? parsedContext.skill_focus[0] 
          : parsedContext.skill_focus;
        if (['vocabulary', 'listening', 'grammar'].includes(skillFocus)) {
          actualExerciseType = `true_false_${skillFocus}`;
          console.log('🎯 Using skill-specific true/false template:', actualExerciseType);
        }
      }
      
      const template = EXERCISE_TEMPLATES[actualExerciseType] || EXERCISE_TEMPLATES[exerciseType];
      if (!template) {
        throw new Error(`Unsupported exercise type: ${actualExerciseType}`);
      }
      
      // Replace variables in prompt
      let systemContext = template.system_context;
      let mainPrompt = template.main_prompt;
      
      // Add skill focus specific prompts for true_false
      if (exerciseType === 'true_false' && parsedContext.skill_focus) {
        const skillFocus = Array.isArray(parsedContext.skill_focus) 
          ? parsedContext.skill_focus[0] 
          : parsedContext.skill_focus;
        
        let skillFocusPrompt = '';
        let skillFocusFields = '';
        
        if (skillFocus === 'vocabulary') {
          skillFocusPrompt = 'Skill Focus: Vocabulary - Tập trung vào kiểm tra hiểu biết từ vựng';
          skillFocusFields = `,
  "vocabulary_focus": {
    "target_word": "Từ chính được kiểm tra",
    "word_type": "noun/verb/adjective/adverb",
    "difficulty": "beginner/intermediate/advanced"
  },
  "skill_focus": "vocabulary"`;
        } else if (skillFocus === 'listening') {
          skillFocusPrompt = 'Skill Focus: Listening - Tập trung vào kiểm tra kỹ năng nghe hiểu';
          skillFocusFields = `,
  "listening_focus": {
    "audio_content": "Mô tả nội dung audio",
    "listening_skill": "comprehension/discrimination/intonation",
    "audio_length": "3-10 seconds",
    "difficulty": "beginner/intermediate/advanced"
  },
  "skill_focus": "listening"`;
        } else if (skillFocus === 'grammar') {
          skillFocusPrompt = 'Skill Focus: Grammar - Tập trung vào kiểm tra kiến thức ngữ pháp';
          skillFocusFields = `,
  "grammar_focus": {
    "grammar_point": "Điểm ngữ pháp được kiểm tra",
    "rule_type": "tense/word_order/preposition/article",
    "example_correct": "Ví dụ câu đúng",
    "difficulty": "beginner/intermediate/advanced"
  },
  "skill_focus": "grammar"`;
        }
        
        mainPrompt = mainPrompt.replace('{skill_focus_prompt}', skillFocusPrompt);
        mainPrompt = mainPrompt.replace('{skill_focus_fields}', skillFocusFields);
      } else {
        mainPrompt = mainPrompt.replace('{skill_focus_prompt}', '');
        mainPrompt = mainPrompt.replace('{skill_focus_fields}', '');
      }
      
      // Replace placeholders with actual values
      Object.keys(parsedContext).forEach(key => {
        const placeholder = `{${key}}`;
        systemContext = systemContext.replace(new RegExp(placeholder, 'g'), parsedContext[key]);
        mainPrompt = mainPrompt.replace(new RegExp(placeholder, 'g'), parsedContext[key]);
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
      console.log('📝 Raw AI response:', content);
      
      // Enhanced JSON parsing
      try {
        const exerciseData = EnhancedJSONParser.parseWithStrategies(content);
        
        // Validate the structure
        const isValid = this.validateExerciseStructure(actualExerciseType, exerciseData);
          
          if (isValid) {
          console.log('✅ Exercise generated successfully:', exerciseData);
            return exerciseData;
          } else {
            console.warn('⚠️ Invalid exercise structure, using fallback');
        }
      } catch (parseError) {
        console.warn('⚠️ All JSON parsing attempts failed:', parseError.message);
        console.log('📝 Original content that failed to parse:', content);
      }
      
      // Use fallback template if parsing fails
      console.log('🔄 Using fallback template');
      return this.generateFallbackExercise(exerciseType, parsedContext);
      
    } catch (error) {
      console.error('❌ Error generating exercise:', error.message);
      return this.generateFallbackExercise(exerciseType, context);
    }
  }
  
  // Validate exercise structure
  static validateExerciseStructure(exerciseType, exerciseData) {
    try {
      if (!exerciseData || typeof exerciseData !== 'object') {
        return false;
      }
      
      // Base validation for all exercise types
      if (exerciseType === 'multiple_choice') {
        return exerciseData.question && 
               Array.isArray(exerciseData.options) && 
               exerciseData.options.length === 4 &&
               typeof exerciseData.correctAnswer === 'number' &&
               exerciseData.feedback &&
               exerciseData.feedback.correct &&
               exerciseData.feedback.incorrect;
      } else if (exerciseType === 'fill_blank' || exerciseType.startsWith('fill_blank_')) {
        return exerciseData.sentence && 
               exerciseData.correctAnswer &&
               exerciseData.feedback &&
               exerciseData.feedback.correct &&
               exerciseData.feedback.incorrect;
      } else if (exerciseType === 'true_false' || exerciseType.startsWith('true_false_')) {
        const baseValid = exerciseData.statement && 
                         typeof exerciseData.isTrue === 'boolean' &&
                         exerciseData.feedback &&
                         exerciseData.feedback.correct &&
                         exerciseData.feedback.incorrect;
        
        // Additional validation for skill-specific true_false
        if (exerciseType === 'true_false_vocabulary') {
          return baseValid && exerciseData.vocabulary_focus;
        } else if (exerciseType === 'true_false_listening') {
          return baseValid && exerciseData.listening_focus;
        } else if (exerciseType === 'true_false_grammar') {
          return baseValid && exerciseData.grammar_focus;
        }
        
        return baseValid;
      } else if (exerciseType === 'translation') {
        return exerciseData.sourceText && 
               exerciseData.targetText &&
               exerciseData.feedback &&
               exerciseData.feedback.correct &&
               exerciseData.feedback.incorrect;
      }
      
      // For other types, just check if we have some basic structure
      return Object.keys(exerciseData).length > 0;
    } catch (error) {
      console.warn('⚠️ Error validating exercise structure:', error.message);
      return false;
    }
  }
  
  // Generate fallback exercise using template
  static generateFallbackExercise(exerciseType, context) {
    // Try skill-specific template first
    let template = EXERCISE_TEMPLATES[exerciseType];
    if (!template && exerciseType.startsWith('fill_blank_')) {
      template = EXERCISE_TEMPLATES['fill_blank'];
    } else if (!template && exerciseType.startsWith('true_false_')) {
      template = EXERCISE_TEMPLATES['true_false'];
    }
    
    if (!template) {
      throw new Error(`Unsupported exercise type: ${exerciseType}`);
    }
    
    const fallback = template.fallback_template;
    
    // Replace variables in fallback
    let result = JSON.parse(JSON.stringify(fallback));
    
    // Customize fallback based on context
    if (context.user_context) {
      if (exerciseType === 'multiple_choice') {
        // Customize question based on user context
        if (context.user_context.includes('chào hỏi') || context.user_context.includes('greeting')) {
          result.question = "What is the most common English greeting?";
          result.options = ["Hello", "Goodbye", "Thank you", "Sorry"];
          result.correctAnswer = 0;
          result.feedback.correct = "Đúng rồi! Hello là cách chào phổ biến nhất.";
          result.feedback.hint = "Đây là cách chào khi gặp ai đó.";
        }
      } else if (exerciseType === 'fill_blank' || exerciseType.startsWith('fill_blank_')) {
        if (context.user_context.includes('chào hỏi') || context.user_context.includes('greeting')) {
          result.sentence = "_____ everyone! Nice to meet you.";
          result.correctAnswer = "Hello";
          result.alternatives = ["Hi", "Hey"];
          result.feedback.correct = "Đúng rồi! Hello là cách chào phổ biến.";
          result.feedback.hint = "Từ chào hỏi phổ biến nhất.";
        }
      } else if (exerciseType === 'true_false' || exerciseType.startsWith('true_false_')) {
        if (context.user_context.includes('chào hỏi') || context.user_context.includes('greeting')) {
          result.statement = "People say Hello when they meet each other.";
          result.isTrue = true;
          result.feedback.correct = "Đúng rồi! Hello là cách chào phổ biến.";
          result.feedback.hint = "Đây là cách chào khi gặp ai đó.";
        } else if (context.user_context.includes('số đếm') || context.user_context.includes('number')) {
          result.statement = "The number after five is seven.";
          result.isTrue = false;
          result.feedback.correct = "Đúng rồi! Số sau five (5) là six (6), không phải seven (7).";
          result.feedback.hint = "Hãy đếm từ một đến mười.";
        }
      } else if (exerciseType === 'translation') {
        if (context.user_context.includes('chào hỏi')) {
          result.sourceText = "Good morning! How are you?";
          result.targetText = "Chào buổi sáng! Bạn khỏe không?";
          result.feedback.correct = "Đúng rồi! Bản dịch chính xác.";
          result.feedback.hint = "Đây là câu chào buổi sáng.";
                 } else if (context.user_context.includes('số đếm')) {
           result.sourceText = "I have three apples.";
           result.targetText = "Tôi có ba quả táo.";
           result.feedback.correct = "Đúng rồi! Số đếm được dịch chính xác.";
           result.feedback.hint = "Chú ý đến số đếm trong câu.";
         }
       } else if (exerciseType === 'word_matching') {
         if (context.user_context.includes('chào hỏi')) {
           result.pairs = [
             { word: "Hello", meaning: "Xin chào" },
             { word: "Goodbye", meaning: "Tạm biệt" },
             { word: "Thank you", meaning: "Cảm ơn" },
             { word: "Please", meaning: "Xin vui lòng" }
           ];
           result.feedback.correct = "Đúng rồi! Các từ chào hỏi được ghép chính xác.";
           result.feedback.hint = "Đây là các từ chào hỏi cơ bản.";
         } else if (context.user_context.includes('số đếm')) {
           result.pairs = [
             { word: "One", meaning: "Một" },
             { word: "Two", meaning: "Hai" },
             { word: "Three", meaning: "Ba" },
             { word: "Four", meaning: "Bốn" }
           ];
           result.feedback.correct = "Đúng rồi! Số đếm được ghép chính xác.";
           result.feedback.hint = "Đây là các số đếm cơ bản.";
         }
       }
     }
    
    // Replace any remaining placeholders
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'string') {
        result[key] = result[key].replace('{word}', context.word || '')
                                 .replace('{meaning}', context.meaning || '')
                                 .replace('{topic}', context.topic || 'general');
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        // Handle nested objects like feedback
        Object.keys(result[key]).forEach(subKey => {
          if (typeof result[key][subKey] === 'string') {
            result[key][subKey] = result[key][subKey].replace('{word}', context.word || '')
                                                     .replace('{meaning}', context.meaning || '')
                                                     .replace('{topic}', context.topic || 'general');
          }
        });
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
          try {
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
            
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`❌ Error generating ${exerciseType} exercise ${i + 1}:`, error.message);
            // Continue with next exercise instead of failing completely
          }
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
    
    // Specific validation for each exercise type
    if (exerciseType === 'multiple_choice') {
      return content.options && 
             Array.isArray(content.options) && 
             content.options.length === 4 &&
             typeof content.correctAnswer === 'number' &&
             content.correctAnswer >= 0 && 
             content.correctAnswer < 4;
    } else if (exerciseType === 'fill_blank') {
      return content.sentence && 
             content.correctAnswer &&
             content.feedback &&
             content.feedback.correct &&
             content.feedback.incorrect;
    } else if (exerciseType === 'true_false' || exerciseType.startsWith('true_false_')) {
      return content.statement && 
             typeof content.isTrue === 'boolean' &&
             content.feedback &&
             content.feedback.correct &&
             content.feedback.incorrect;
         } else if (exerciseType === 'translation') {
       return content.sourceText && 
              content.targetText &&
              content.feedback &&
              content.feedback.correct &&
              content.feedback.incorrect;
     } else if (exerciseType === 'word_matching') {
       return content.pairs && 
              Array.isArray(content.pairs) && 
              content.pairs.length >= 3 &&
              content.pairs.every(pair => pair.word && pair.meaning) &&
              content.feedback &&
              content.feedback.correct &&
              content.feedback.incorrect;
    }
    
    return true;
  }
}

export default AIService; 
/**
 * Tessarion — Security Limits
 * Conservative limits for real-world usage to prevent abuse and denial of service.
 */

export const SECURITY_LIMITS = {
  // 50k characters is roughly 10-15 pages of text.
  MAX_SOURCE_TEXT_LENGTH: 50_000,
  
  // 5k characters is plenty for a teach-back response.
  MAX_TEACH_BACK_LENGTH: 5_000,
  
  // 2k characters for a short conversational response.
  MAX_TUTORING_RESPONSE_LENGTH: 2_000,
  
  // 1k characters is very generous for a search query.
  MAX_RETRIEVAL_QUERY_LENGTH: 1_000,
  
  // Titles shouldn't be essays.
  MAX_TITLE_LENGTH: 200,
  
  // Prevent runaway tutoring states.
  MAX_ACTIVE_TUTORING_SESSIONS: 3,
};

/**
 * ChatGPT 인라인 뷰 - DOM 분석기 모듈
 * ChatGPT 웹 인터페이스의 DOM 구조 분석 및 데이터 추출
 */

(function(window) {
  // 메시지 타입 정의
  const MessageType = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
  };
  
  // DOM 분석기 클래스
  class DOMAnalyzer {
    constructor() {
      // 선택자 정의 (ChatGPT DOM 구조에 맞춤)
      this.selectors = {
        // 대화 컨테이너
        conversationContainer: '.flex.flex-col.items-center.text-sm',
        
        // 메시지 관련 선택자
        messageWrapper: '.group.w-full',
        userMessageWrapper: '.group.w-full:has(.dark\\:bg-gray-800)',
        assistantMessageWrapper: '.group.w-full:has(.dark\\:bg-gray-700)',
        messageContent: '.markdown',
        
        // 테마 관련 선택자
        darkModeIndicator: '.dark',
        
        // 인라인 뷰 삽입 위치
        insertionPoint: '.flex.flex-col.items-center.text-sm > .w-full'
      };
    }
    
    /**
     * ChatGPT 페이지인지 확인
     * @returns {boolean} ChatGPT 페이지 여부
     */
    isChatPage() {
      const url = window.location.href;
      return url.includes('chat.openai.com') || url.includes('chatgpt.com');
    }
    
    /**
     * 대화 내용 추출
     * @returns {Array} 메시지 객체 배열
     */
    extractConversation() {
      try {
        if (!this.isChatPage()) {
          return [];
        }
        
        // 메시지 래퍼 요소 찾기
        const messageWrappers = document.querySelectorAll(this.selectors.messageWrapper);
        if (!messageWrappers || messageWrappers.length === 0) {
          return [];
        }
        
        // 메시지 배열 생성
        const messages = [];
        
        // 각 메시지 래퍼에서 데이터 추출
        messageWrappers.forEach((wrapper, index) => {
          // 메시지 타입 결정
          let type = MessageType.SYSTEM;
          if (wrapper.matches(this.selectors.userMessageWrapper)) {
            type = MessageType.USER;
          } else if (wrapper.matches(this.selectors.assistantMessageWrapper)) {
            type = MessageType.ASSISTANT;
          }
          
          // 메시지 내용 추출
          const contentElement = wrapper.querySelector(this.selectors.messageContent);
          if (!contentElement) {
            return; // 내용 없으면 건너뛰기
          }
          
          // 메시지 ID 생성 (고유 식별자)
          const messageId = `msg-${type}-${index}`;
          
          // 메시지 객체 생성
          const message = {
            id: messageId,
            type: type,
            content: contentElement.innerHTML,
            timestamp: new Date().toISOString()
          };
          
          // 배열에 추가
          messages.push(message);
        });
        
        return messages;
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 대화 추출 중 오류 발생:', error);
        return [];
      }
    }
    
    /**
     * 인라인 뷰 삽입 위치 찾기
     * @returns {HTMLElement|null} 삽입 위치 요소
     */
    findInsertionPoint() {
      try {
        // 기본 삽입 위치 찾기
        const insertionPoint = document.querySelector(this.selectors.insertionPoint);
        if (insertionPoint) {
          return insertionPoint;
        }
        
        // 대체 삽입 위치 찾기 (첫 번째 메시지 앞)
        const firstMessage = document.querySelector(this.selectors.messageWrapper);
        if (firstMessage) {
          return firstMessage;
        }
        
        // 대화 컨테이너 찾기
        const container = document.querySelector(this.selectors.conversationContainer);
        if (container) {
          return container.firstChild;
        }
        
        return null;
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 삽입 위치 찾기 중 오류 발생:', error);
        return null;
      }
    }
    
    /**
     * 현재 테마 감지 (다크/라이트 모드)
     * @returns {string} 'dark' 또는 'light'
     */
    detectTheme() {
      try {
        // 1. 로컬 스토리지에서 사용자 설정 확인
        const settings = window.ChatGPTInlineView && window.ChatGPTInlineView.Utils ? 
          window.ChatGPTInlineView.Utils.getSettings() : null;
        
        if (settings && settings.darkMode !== null) {
          return settings.darkMode ? 'dark' : 'light';
        }
        
        // 2. 문서 body의 클래스 확인 (ChatGPT 사이트 특화)
        if (document.body.classList.contains('dark')) {
          return 'dark';
        }
        
        // 3. 시스템 다크 모드 설정 확인
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        
        return 'light';
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 테마 감지 중 오류 발생:', error);
        return 'light'; // 기본값
      }
    }
  }
  
  // 싱글톤 인스턴스 생성
  const instance = new DOMAnalyzer();
  
  // 전역 네임스페이스에 등록
  window.DOMAnalyzer = instance;
  window.MessageType = MessageType;
  
  // ChatGPT 인라인 뷰 네임스페이스 초기화
  if (!window.ChatGPTInlineView) {
    window.ChatGPTInlineView = {};
  }
  
  // 네임스페이스에 등록
  window.ChatGPTInlineView.DOMAnalyzer = instance;
  window.ChatGPTInlineView.MessageType = MessageType;
  
})(window); 
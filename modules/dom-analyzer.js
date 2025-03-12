/**
 * ChatGPT 인라인 뷰 - DOM 분석기 모듈
 * ChatGPT 페이지의 DOM 구조를 분석하여 대화 내용을 추출합니다.
 */

import * as Utils from './utils.js';

// 대화 메시지 타입
export const MessageType = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
};

// 대화 메시지 클래스
export class ChatMessage {
  constructor(type, content, timestamp = new Date()) {
    this.type = type;
    this.content = content;
    this.timestamp = timestamp;
    this.id = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
}

// DOM 분석기 클래스
class DOMAnalyzer {
  constructor() {
    // 마지막으로 분석한 메시지 수
    this.lastMessageCount = 0;
    
    // 메시지 선택자 (ChatGPT DOM 구조에 맞춤)
    this.selectors = {
      // 메인 채팅 컨테이너
      chatContainer: '.flex.flex-col.items-center.text-sm.dark\\:bg-gray-800',
      
      // 대화 항목 컨테이너
      conversationItems: '.flex.flex-col.items-center.text-sm.dark\\:bg-gray-800 > div',
      
      // 사용자 메시지
      userMessages: '.flex.flex-col.items-center.text-sm.dark\\:bg-gray-800 div[data-message-author-role="user"]',
      
      // 어시스턴트 메시지
      assistantMessages: '.flex.flex-col.items-center.text-sm.dark\\:bg-gray-800 div[data-message-author-role="assistant"]',
      
      // 메시지 내용
      messageContent: '.markdown'
    };
  }
  
  /**
   * 현재 페이지에서 모든 대화 메시지를 추출합니다.
   * @returns {ChatMessage[]} 추출된 대화 메시지 배열
   */
  extractConversation() {
    try {
      const messages = [];
      
      // 사용자 메시지 추출
      const userElements = document.querySelectorAll(this.selectors.userMessages);
      userElements.forEach(element => {
        const contentElement = element.querySelector(this.selectors.messageContent);
        if (contentElement) {
          const content = contentElement.innerHTML;
          messages.push(new ChatMessage(MessageType.USER, content));
        }
      });
      
      // 어시스턴트 메시지 추출
      const assistantElements = document.querySelectorAll(this.selectors.assistantMessages);
      assistantElements.forEach(element => {
        const contentElement = element.querySelector(this.selectors.messageContent);
        if (contentElement) {
          const content = contentElement.innerHTML;
          messages.push(new ChatMessage(MessageType.ASSISTANT, content));
        }
      });
      
      // 메시지 순서 정렬 (사용자와 어시스턴트 메시지 번갈아가며 표시)
      messages.sort((a, b) => {
        const indexA = Array.from(document.querySelectorAll(this.selectors.conversationItems)).findIndex(
          el => el.textContent.includes(a.content.replace(/<[^>]*>/g, ''))
        );
        const indexB = Array.from(document.querySelectorAll(this.selectors.conversationItems)).findIndex(
          el => el.textContent.includes(b.content.replace(/<[^>]*>/g, ''))
        );
        return indexA - indexB;
      });
      
      // 메시지 수 업데이트
      this.lastMessageCount = messages.length;
      
      return messages;
    } catch (error) {
      Utils.logError('대화 추출 중 오류 발생', error);
      return [];
    }
  }
  
  /**
   * 새로운 메시지가 있는지 확인합니다.
   * @returns {boolean} 새 메시지 존재 여부
   */
  hasNewMessages() {
    try {
      const currentCount = document.querySelectorAll(
        `${this.selectors.userMessages}, ${this.selectors.assistantMessages}`
      ).length;
      
      return currentCount !== this.lastMessageCount;
    } catch (error) {
      Utils.logError('새 메시지 확인 중 오류 발생', error);
      return false;
    }
  }
  
  /**
   * 현재 페이지가 ChatGPT 대화 페이지인지 확인합니다.
   * @returns {boolean} ChatGPT 대화 페이지 여부
   */
  isChatPage() {
    try {
      // URL 확인
      const url = window.location.href;
      const isChatURL = url.includes('chat.openai.com') || url.includes('chatgpt.com');
      
      // DOM 구조 확인
      const hasChatContainer = !!document.querySelector(this.selectors.chatContainer);
      
      return isChatURL && hasChatContainer;
    } catch (error) {
      Utils.logError('채팅 페이지 확인 중 오류 발생', error);
      return false;
    }
  }
  
  /**
   * 인라인 뷰를 삽입할 위치를 찾습니다.
   * @returns {Element|null} 삽입 위치 요소
   */
  findInsertionPoint() {
    try {
      // 메인 채팅 컨테이너 찾기
      const chatContainer = document.querySelector(this.selectors.chatContainer);
      
      if (chatContainer) {
        // 첫 번째 대화 항목 이전에 삽입
        const firstConversationItem = chatContainer.querySelector('div');
        if (firstConversationItem) {
          return firstConversationItem;
        }
        
        // 대화 항목이 없으면 컨테이너 자체를 반환
        return chatContainer;
      }
      
      return null;
    } catch (error) {
      Utils.logError('삽입 위치 찾기 중 오류 발생', error);
      return null;
    }
  }
  
  /**
   * 현재 테마(다크/라이트 모드)를 감지합니다.
   * @returns {string} 'dark' 또는 'light'
   */
  detectTheme() {
    try {
      // 사용자 설정 확인
      const settings = Utils.getSettings();
      if (settings && settings.theme !== 'auto') {
        return settings.theme;
      }
      
      // 다크 모드 감지
      return Utils.isDarkMode() ? 'dark' : 'light';
    } catch (error) {
      Utils.logError('테마 감지 중 오류 발생', error);
      return 'light'; // 기본값
    }
  }
}

// 싱글톤 인스턴스 생성
const instance = new DOMAnalyzer();

// 기본 내보내기
export default instance; 
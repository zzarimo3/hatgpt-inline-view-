/**
 * ChatGPT 인라인 뷰 - 이벤트 버스 모듈
 * 모듈 간 통신을 위한 이벤트 버스 구현
 */

(function(window) {
  // 이벤트 타입 정의
  const EventTypes = {
    URL_CHANGED: 'url_changed',
    CONVERSATION_UPDATED: 'conversation_updated',
    THEME_CHANGED: 'theme_changed',
    VISIBILITY_CHANGED: 'visibility_changed',
    SETTINGS_UPDATED: 'settings_updated'
  };
  
  // 이벤트 버스 클래스
  class EventBus {
    constructor() {
      // 이벤트 리스너 맵
      this.listeners = new Map();
    }
    
    /**
     * 이벤트 구독
     * @param {string} event - 이벤트 이름
     * @param {Function} callback - 콜백 함수
     * @returns {Function} 구독 취소 함수
     */
    subscribe(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      
      const eventListeners = this.listeners.get(event);
      eventListeners.push(callback);
      
      // 구독 취소 함수 반환
      return () => {
        const index = eventListeners.indexOf(callback);
        if (index !== -1) {
          eventListeners.splice(index, 1);
        }
      };
    }
    
    /**
     * 이벤트 발행
     * @param {string} event - 이벤트 이름
     * @param {any} data - 이벤트 데이터
     */
    publish(event, data) {
      if (!this.listeners.has(event)) {
        return;
      }
      
      const eventListeners = this.listeners.get(event);
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] 이벤트 처리 중 오류 발생: ${event}`, error);
        }
      });
    }
    
    /**
     * 모든 이벤트 리스너 제거
     */
    clear() {
      this.listeners.clear();
    }
    
    /**
     * 특정 이벤트의 모든 리스너 제거
     * @param {string} event - 이벤트 이름
     */
    clearEvent(event) {
      if (this.listeners.has(event)) {
        this.listeners.delete(event);
      }
    }
  }
  
  // 싱글톤 인스턴스 생성
  const instance = new EventBus();
  
  // 전역 네임스페이스에 등록
  window.EventBus = instance;
  window.EventTypes = EventTypes;
  
  // ChatGPT 인라인 뷰 네임스페이스 초기화
  if (!window.ChatGPTInlineView) {
    window.ChatGPTInlineView = {};
  }
  
  // 네임스페이스에 등록
  window.ChatGPTInlineView.EventBus = instance;
  window.ChatGPTInlineView.EventTypes = EventTypes;
  
})(window); 
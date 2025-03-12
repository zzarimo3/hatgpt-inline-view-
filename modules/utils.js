/**
 * ChatGPT 인라인 뷰 - 유틸리티 모듈
 * 공통 유틸리티 함수 모음
 */

(function(window) {
  // 버전 정보
  const VERSION = '1.5.2';
  
  // 디버그 모드 상태
  let debugMode = false;
  
  /**
   * 디버그 모드 설정
   * @param {boolean} enabled - 활성화 여부
   */
  function setDebugMode(enabled) {
    debugMode = !!enabled;
  }
  
  /**
   * 디버그 로그 출력
   * @param {string} message - 로그 메시지
   */
  function logDebug(message) {
    if (debugMode) {
      console.log(`[ChatGPT 인라인 뷰] ${message}`);
    }
  }
  
  /**
   * 경고 로그 출력
   * @param {string} message - 경고 메시지
   */
  function logWarning(message) {
    console.warn(`[ChatGPT 인라인 뷰] ${message}`);
  }
  
  /**
   * 오류 로그 출력
   * @param {string} message - 오류 메시지
   * @param {Error} [error] - 오류 객체
   */
  function logError(message, error) {
    console.error(`[ChatGPT 인라인 뷰] ${message}`, error || '');
  }
  
  /**
   * 현재 URL 가져오기
   * @returns {string} 현재 URL
   */
  function getCurrentURL() {
    return window.location.href;
  }
  
  /**
   * 두 URL이 같은 대화인지 확인
   * @param {string} url1 - 첫 번째 URL
   * @param {string} url2 - 두 번째 URL
   * @returns {boolean} 같은 대화 여부
   */
  function isSameConversation(url1, url2) {
    // ChatGPT URL 형식: https://chat.openai.com/c/[대화ID]
    try {
      const getConversationId = (url) => {
        const match = url.match(/\/c\/([a-zA-Z0-9-]+)/);
        return match ? match[1] : null;
      };
      
      const id1 = getConversationId(url1);
      const id2 = getConversationId(url2);
      
      return id1 && id2 && id1 === id2;
    } catch (error) {
      logError('URL 비교 중 오류 발생', error);
      return false;
    }
  }
  
  /**
   * HTML 요소 생성
   * @param {string} tag - 태그 이름
   * @param {Object} [attributes] - 속성 객체
   * @param {Array|string} [content] - 내용 (문자열 또는 요소 배열)
   * @returns {HTMLElement} 생성된 요소
   */
  function createElement(tag, attributes, content) {
    const element = document.createElement(tag);
    
    // 속성 설정
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.substring(2).toLowerCase();
          element.addEventListener(eventName, value);
        } else {
          element.setAttribute(key, value);
        }
      });
    }
    
    // 내용 추가
    if (content) {
      if (Array.isArray(content)) {
        content.forEach(item => {
          if (typeof item === 'string') {
            element.appendChild(document.createTextNode(item));
          } else if (item instanceof Node) {
            element.appendChild(item);
          }
        });
      } else if (typeof content === 'string') {
        element.textContent = content;
      }
    }
    
    return element;
  }
  
  /**
   * 설정 가져오기
   * @returns {Object|null} 설정 객체 또는 null
   */
  function getSettings() {
    try {
      const settingsJson = localStorage.getItem('chatgpt-inline-view-settings');
      return settingsJson ? JSON.parse(settingsJson) : null;
    } catch (error) {
      logError('설정 로드 중 오류 발생', error);
      return null;
    }
  }
  
  /**
   * 설정 저장하기
   * @param {Object} settings - 설정 객체
   */
  function saveSettings(settings) {
    try {
      localStorage.setItem('chatgpt-inline-view-settings', JSON.stringify(settings));
      logDebug('설정 저장됨');
    } catch (error) {
      logError('설정 저장 중 오류 발생', error);
    }
  }
  
  /**
   * 브라우저 정보 가져오기
   * @returns {Object} 브라우저 정보 객체
   */
  function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";
    
    if (userAgent.indexOf("Chrome") > -1) {
      browserName = "Chrome";
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      browserVersion = match ? match[1] : "Unknown";
    } else if (userAgent.indexOf("Firefox") > -1) {
      browserName = "Firefox";
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      browserVersion = match ? match[1] : "Unknown";
    } else if (userAgent.indexOf("Safari") > -1) {
      browserName = "Safari";
      const match = userAgent.match(/Version\/([0-9.]+)/);
      browserVersion = match ? match[1] : "Unknown";
    } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
      browserName = "Edge";
      const match = userAgent.match(/Edge\/([0-9.]+)/) || userAgent.match(/Edg\/([0-9.]+)/);
      browserVersion = match ? match[1] : "Unknown";
    }
    
    return {
      name: browserName,
      version: browserVersion,
      userAgent: userAgent
    };
  }
  
  /**
   * 경고 알림 표시
   * @param {string} message - 알림 메시지
   */
  function showWarningNotification(message) {
    showNotification(message, 'warning');
  }
  
  /**
   * 오류 알림 표시
   * @param {string} message - 알림 메시지
   */
  function showErrorNotification(message) {
    showNotification(message, 'error');
  }
  
  /**
   * 성공 알림 표시
   * @param {string} message - 알림 메시지
   */
  function showSuccessNotification(message) {
    showNotification(message, 'success');
  }
  
  /**
   * 알림 표시
   * @param {string} message - 알림 메시지
   * @param {string} type - 알림 유형 (success, warning, error)
   */
  function showNotification(message, type = 'info') {
    try {
      // 기존 알림 확인
      let notification = document.getElementById('chatgpt-inline-view-notification');
      
      // 없으면 생성
      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'chatgpt-inline-view-notification';
        notification.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 10px 15px;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          z-index: 10000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        `;
        document.body.appendChild(notification);
      }
      
      // 타입에 따른 배경색 설정
      let backgroundColor = '#2196F3'; // 기본 (info)
      
      switch (type) {
        case 'success':
          backgroundColor = '#4CAF50';
          break;
        case 'warning':
          backgroundColor = '#FF9800';
          break;
        case 'error':
          backgroundColor = '#F44336';
          break;
      }
      
      notification.style.backgroundColor = backgroundColor;
      
      // 메시지 설정
      notification.textContent = message;
      
      // 표시
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      }, 10);
      
      // 자동 숨김
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // 완전히 숨겨진 후 제거
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 5000);
    } catch (error) {
      logError('알림 표시 중 오류 발생', error);
    }
  }
  
  // 공개 API
  const Utils = {
    VERSION,
    setDebugMode,
    logDebug,
    logWarning,
    logError,
    getCurrentURL,
    isSameConversation,
    createElement,
    getSettings,
    saveSettings,
    getBrowserInfo,
    showWarningNotification,
    showErrorNotification,
    showSuccessNotification
  };
  
  // 전역 네임스페이스에 등록
  window.Utils = Utils;
  
  // ChatGPT 인라인 뷰 네임스페이스 초기화
  if (!window.ChatGPTInlineView) {
    window.ChatGPTInlineView = {};
  }
  
  // 네임스페이스에 등록
  window.ChatGPTInlineView.Utils = Utils;
  
})(window); 
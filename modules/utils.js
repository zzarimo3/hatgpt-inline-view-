/**
 * ChatGPT 인라인 뷰 - 유틸리티 모듈
 * 공통 유틸리티 함수 모음
 */

// 버전 정보
export const VERSION = '1.5.0';

// 디버그 모드 설정
let debugMode = false;

// 디버그 모드 설정 함수
export function setDebugMode(enabled) {
  debugMode = enabled;
}

// 디버그 로그 출력
export function logDebug(message) {
  if (debugMode) {
    console.log(`[ChatGPT 인라인 뷰] ${message}`);
  }
}

// 오류 로그 출력
export function logError(message, error) {
  console.error(`[ChatGPT 인라인 뷰] ${message}`, error);
}

// 경고 로그 출력
export function logWarning(message) {
  console.warn(`[ChatGPT 인라인 뷰] ${message}`);
}

// 확장 프로그램 버전 가져오기
export function getExtensionVersion() {
  return VERSION;
}

// 브라우저 정보 가져오기
export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  
  if (userAgent.indexOf("Chrome") > -1) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf("Edge") > -1) {
    browserName = "Edge";
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)[1];
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent: userAgent
  };
}

// 다크 모드 감지
export function isDarkMode() {
  // 1. 로컬 스토리지에서 사용자 설정 확인
  const settings = getSettings();
  if (settings && settings.darkMode !== null) {
    return settings.darkMode;
  }
  
  // 2. 문서 body의 클래스 확인 (ChatGPT 사이트 특화)
  if (document.body.classList.contains('dark')) {
    return true;
  }
  
  // 3. 시스템 다크 모드 설정 확인
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// 로컬 스토리지에서 설정 가져오기
export function getSettings() {
  try {
    const settingsJson = localStorage.getItem('chatgpt-inline-view-settings');
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch (error) {
    logError('설정을 가져오는 중 오류 발생', error);
    return null;
  }
}

// 로컬 스토리지에 설정 저장
export function saveSettings(settings) {
  try {
    localStorage.setItem('chatgpt-inline-view-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    logError('설정을 저장하는 중 오류 발생', error);
    return false;
  }
}

// DOM 요소 생성 헬퍼
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // 속성 설정
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
  
  // 자식 요소 추가
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
}

// 텍스트 내용 요약 (긴 텍스트 처리)
export function summarizeText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

// HTML 이스케이프
export function escapeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// 알림 표시
export function showNotification(message, type = 'info', duration = 3000) {
  // 기존 알림 확인
  let notification = document.getElementById('chatgpt-inline-view-notification');
  
  // 없으면 생성
  if (!notification) {
    notification = createElement('div', {
      id: 'chatgpt-inline-view-notification',
      style: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 15px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '14px',
        zIndex: '10000',
        transition: 'opacity 0.3s ease',
        opacity: '0'
      }
    });
    document.body.appendChild(notification);
  }
  
  // 타입에 따른 스타일 설정
  let backgroundColor;
  switch (type) {
    case 'success':
      backgroundColor = '#4CAF50';
      break;
    case 'error':
      backgroundColor = '#F44336';
      break;
    case 'warning':
      backgroundColor = '#FF9800';
      break;
    default:
      backgroundColor = '#2196F3';
  }
  notification.style.backgroundColor = backgroundColor;
  
  // 메시지 설정
  notification.textContent = message;
  
  // 표시
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // 자동 숨김
  setTimeout(() => {
    notification.style.opacity = '0';
  }, duration);
}

// 오류 알림 표시
export function showErrorNotification(message) {
  showNotification(message, 'error', 5000);
}

// 성공 알림 표시
export function showSuccessNotification(message) {
  showNotification(message, 'success', 3000);
}

// 경고 알림 표시
export function showWarningNotification(message) {
  showNotification(message, 'warning', 4000);
}

// 현재 URL 가져오기
export function getCurrentURL() {
  return window.location.href;
}

// 두 URL이 같은 대화인지 확인
export function isSameConversation(url1, url2) {
  // ChatGPT URL 형식: https://chat.openai.com/c/[conversation-id]
  const getConversationId = (url) => {
    const match = url.match(/\/c\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  };
  
  const id1 = getConversationId(url1);
  const id2 = getConversationId(url2);
  
  return id1 && id2 && id1 === id2;
}

// 지연 실행 (디바운스)
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// 제한된 빈도로 실행 (쓰로틀)
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 로컬 스토리지 사용 가능 여부 확인
export function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// 기본 내보내기
export default {
  VERSION,
  setDebugMode,
  logDebug,
  logError,
  logWarning,
  getExtensionVersion,
  getBrowserInfo,
  isDarkMode,
  getSettings,
  saveSettings,
  createElement,
  summarizeText,
  escapeHTML,
  showNotification,
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
  getCurrentURL,
  isSameConversation,
  debounce,
  throttle,
  isLocalStorageAvailable
}; 
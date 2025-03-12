/**
 * ChatGPT 인라인 뷰 - 유틸리티 모듈
 * 공통 유틸리티 함수 및 성능 최적화 기능
 */

// 디버그 모드 설정
const DEBUG = true;

/**
 * 디버그 로그 출력
 * @param {string} message - 로그 메시지
 * @param {any} data - 추가 데이터 (선택 사항)
 */
function logDebug(message, data) {
  if (DEBUG) {
    if (data !== undefined) {
      console.log(`[ChatGPT 인라인 뷰] ${message}`, data);
    } else {
      console.log(`[ChatGPT 인라인 뷰] ${message}`);
    }
  }
}

/**
 * 오류 로그 출력
 * @param {string} message - 오류 메시지
 * @param {Error} error - 오류 객체
 */
function logError(message, error) {
  console.error(`[ChatGPT 인라인 뷰] ${message}`, error);
  console.trace();
  
  // 사용자에게 오류 알림 (심각한 오류일 경우)
  if (error && (error.message?.includes('fatal') || error.stack?.includes('fatal'))) {
    showErrorNotification(message);
  }
}

/**
 * 오류 알림 표시
 * @param {string} message - 오류 메시지
 */
function showErrorNotification(message) {
  // 기존 알림 제거
  const existingNotification = document.getElementById('chatgpt-inline-view-error');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 새 알림 생성
  const notification = document.createElement('div');
  notification.id = 'chatgpt-inline-view-error';
  
  // 스타일 설정
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '10000',
    padding: '15px',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '400px'
  });
  
  // 메시지 영역
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `<strong>오류 발생</strong><br>${message}`;
  
  // 닫기 버튼
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '24px';
  closeButton.style.marginLeft = '15px';
  closeButton.style.cursor = 'pointer';
  
  closeButton.addEventListener('click', () => {
    notification.remove();
  });
  
  // 요소 추가
  notification.appendChild(messageDiv);
  notification.appendChild(closeButton);
  document.body.appendChild(notification);
  
  // 자동 제거 타이머
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 8000);
}

/**
 * 스로틀링 함수 (성능 최적화)
 * @param {Function} func - 스로틀링할 함수
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {Function} 스로틀링된 함수
 */
function throttle(func, delay) {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    // 마지막 호출 후 지연 시간이 경과하지 않은 경우
    if (timeSinceLastCall < delay) {
      // 기존 타임아웃 취소
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 남은 지연 시간 후에 실행하도록 예약
      const remainingTime = delay - timeSinceLastCall;
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func.apply(this, args);
        timeoutId = null;
      }, remainingTime);
      
      return;
    }
    
    // 충분한 시간이 경과한 경우 즉시 실행
    lastCall = now;
    func.apply(this, args);
  };
}

/**
 * 디바운스 함수 (성능 최적화)
 * @param {Function} func - 디바운스할 함수
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, delay) {
  let timeoutId = null;
  
  return function(...args) {
    // 기존 타임아웃 취소
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // 새 타임아웃 설정
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 요소에서 텍스트 콘텐츠만 추출 (HTML 제거)
 * @param {Element} element - 텍스트를 추출할 요소
 * @returns {string} 추출된 텍스트
 */
function extractTextContent(element) {
  if (!element) return '';
  
  // HTML 복제
  const clone = element.cloneNode(true);
  
  // 코드 블록, 스크립트, 스타일 등 불필요한 요소 제거
  const unwantedTags = ['script', 'style', 'svg', 'canvas', 'button'];
  unwantedTags.forEach(tag => {
    const elements = clone.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].remove();
    }
  });
  
  // 텍스트 노드만 추출하여 정리
  return clone.textContent
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 버전 확인 함수
 * @returns {string} 확장 프로그램 버전
 */
function getExtensionVersion() {
  try {
    // manifest.json에서 버전 정보 획득 시도
    if (chrome && chrome.runtime && chrome.runtime.getManifest) {
      return chrome.runtime.getManifest().version;
    }
  } catch (e) {
    // 브라우저 API를 사용할 수 없는 경우
  }
  
  // 기본값 반환
  return '1.3.0';
}

/**
 * 브라우저 환경 확인
 * @returns {Object} 브라우저 정보
 */
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Chrome
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = 'Chrome';
    const match = userAgent.match(/(?:chrome|chromium|crios)\/(\d+)/i);
    if (match && match[1]) browserVersion = match[1];
  } 
  // Firefox
  else if (userAgent.match(/firefox|fxios/i)) {
    browserName = 'Firefox';
    const match = userAgent.match(/(?:firefox|fxios)\/(\d+)/i);
    if (match && match[1]) browserVersion = match[1];
  }
  // Safari
  else if (userAgent.match(/safari/i) && !userAgent.match(/chrome|chromium|crios/i)) {
    browserName = 'Safari';
    const match = userAgent.match(/version\/(\d+)/i);
    if (match && match[1]) browserVersion = match[1];
  }
  // Edge
  else if (userAgent.match(/edg/i)) {
    browserName = 'Edge';
    const match = userAgent.match(/edg\/(\d+)/i);
    if (match && match[1]) browserVersion = match[1];
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent: userAgent
  };
}

/**
 * DOM에서 요소가 로드될 때까지 기다림
 * @param {string} selector - CSS 선택자
 * @param {number} timeout - 최대 대기 시간 (밀리초)
 * @returns {Promise<Element>} 발견된 요소
 */
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    // 이미 존재하는 요소가 있는지 확인
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }
    
    // 타임아웃 ID
    let timeoutId;
    
    // 요소를 감시할 옵저버 생성
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        // 요소를 찾으면 리소스 정리 후 해결
        obs.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });
    
    // 전체 문서 감시 시작
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    // 타임아웃 설정
    timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`요소를 찾을 수 없음: ${selector} (${timeout}ms 초과)`));
    }, timeout);
  });
}

// 전역 변수로 노출 (Chrome 확장 프로그램에서 사용하기 위함)
window.Utils = {
  logDebug,
  logError,
  showErrorNotification,
  throttle,
  debounce,
  extractTextContent,
  getExtensionVersion,
  getBrowserInfo,
  waitForElement
}; 
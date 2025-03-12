/**
 * ChatGPT 인라인 뷰 - 유틸리티 함수 모음
 * 다양한 헬퍼 함수들을 제공합니다.
 */

// 스로틀 함수: 일정 시간 내에 함수 호출을 제한합니다.
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

// 디바운스 함수: 연속된 호출 중 마지막 호출만 실행합니다.
function debounce(func, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
      timer = null;
    }, delay);
  };
}

// 오류 로깅 함수
function logError(message, error) {
  console.error(`${message}:`, error);
  console.trace();
}

// 전역 변수로 노출 (Chrome 확장 프로그램에서 사용하기 위함)
window.Utils = {
  throttle,
  debounce,
  logError
}; 
/**
 * ChatGPT 인라인 뷰 - 콘텐츠 스크립트 로더
 * 모듈식 구조로 확장 프로그램의 스크립트를 로드합니다.
 */

(function() {
  'use strict';
  
  // 모듈 경로 설정
  const MODULE_BASE_PATH = chrome.runtime.getURL('modules/');
  const STYLE_BASE_PATH = chrome.runtime.getURL('styles/');
  
  // 로드할 모듈 목록
  const MODULES = [
    'utils.js',
    'dom-analyzer.js',
    'ui-manager.js',
    'event-handlers.js',
    'main.js'
  ];
  
  // 스타일시트 로드
  function loadStylesheet() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = STYLE_BASE_PATH + 'styles.css';
    document.head.appendChild(link);
    console.log('[ChatGPT 인라인 뷰] 스타일시트 로드 완료');
  }
  
  // 모듈 스크립트 로드
  function loadModules() {
    let loadedCount = 0;
    
    // 각 모듈을 순차적으로 로드
    MODULES.forEach((module, index) => {
      const script = document.createElement('script');
      script.src = MODULE_BASE_PATH + module;
      script.type = 'text/javascript';
      
      // 마지막 모듈이 로드된 후 초기화 실행
      script.onload = () => {
        loadedCount++;
        console.log(`[ChatGPT 인라인 뷰] 모듈 로드: ${module}`);
        
        // 모든 모듈이 로드되면 초기화
        if (loadedCount === MODULES.length) {
          initializeExtension();
        }
      };
      
      script.onerror = (error) => {
        console.error(`[ChatGPT 인라인 뷰] 모듈 로드 실패: ${module}`, error);
      };
      
      document.head.appendChild(script);
    });
  }
  
  // 확장 프로그램 초기화
  function initializeExtension() {
    // 페이지가 완전히 로드된 후 지연 실행
    setTimeout(() => {
      console.log('[ChatGPT 인라인 뷰] 초기화 시작...');
      
      // 메인 모듈이 이미 초기화되었는지 확인
      if (window.chatGPTInlineView && window.chatGPTInlineView.initialized) {
        console.log('[ChatGPT 인라인 뷰] 메인 모듈이 이미 초기화되었습니다.');
      } else {
        console.log('[ChatGPT 인라인 뷰] 메인 모듈 초기화 시작...');
        
        // 메인 모듈이 아직 초기화되지 않은 경우, 수동으로 초기화
        if (window.ChatGPTInlineView) {
          window.chatGPTInlineView = new window.ChatGPTInlineView();
        } else {
          console.error('[ChatGPT 인라인 뷰] 메인 모듈을 찾을 수 없습니다.');
        }
      }
    }, 1000);
  }
  
  // 페이지 로드 확인
  function checkPageLoaded() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      loadStylesheet();
      loadModules();
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        loadStylesheet();
        loadModules();
      });
    }
  }
  
  // 실행
  checkPageLoaded();
  
  // 페이지 언로드 시 리소스 정리
  window.addEventListener('beforeunload', () => {
    if (window.chatGPTInlineView) {
      window.chatGPTInlineView.cleanup();
    }
  });
})(); 
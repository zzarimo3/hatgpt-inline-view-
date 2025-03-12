/**
 * ChatGPT 인라인 뷰 - 콘텐츠 스크립트 로더
 * ES 모듈을 로드하기 위한 진입점 스크립트
 */

(function() {
  // 디버그 모드
  const DEBUG = true;
  
  // 로그 함수
  function log(message) {
    if (DEBUG) {
      console.log(`[ChatGPT 인라인 뷰 로더] ${message}`);
    }
  }
  
  // 오류 로그 함수
  function logError(message, error) {
    console.error(`[ChatGPT 인라인 뷰 로더] ${message}`, error);
  }
  
  // ES 모듈 로드 함수
  function loadESModule() {
    log('모듈 로딩 시작');
    
    try {
      // 기존 모듈 스크립트 확인
      const existingScript = document.getElementById('chatgpt-inline-view-module');
      if (existingScript) {
        log('기존 모듈 스크립트 감지됨, 제거 후 재로딩');
        existingScript.remove();
      }
      
      // 모듈 타입 스크립트 생성
      const script = document.createElement('script');
      script.id = 'chatgpt-inline-view-module';
      script.type = 'module';
      
      // 모듈 내용 생성
      script.textContent = `
        // ES 모듈 시스템 사용
        import DOMAnalyzer from '${chrome.runtime.getURL('modules/dom-analyzer.js')}';
        import UIManager from '${chrome.runtime.getURL('modules/ui-manager.js')}';
        import EventHandlers from '${chrome.runtime.getURL('modules/event-handlers.js')}';
        import * as Utils from '${chrome.runtime.getURL('modules/utils.js')}';
        import InlineView from '${chrome.runtime.getURL('modules/main.js')}';
        
        // 글로벌 네임스페이스에 추가 (디버깅용)
        window.ChatGPTInlineView = {
          DOMAnalyzer,
          UIManager,
          EventHandlers,
          Utils,
          app: InlineView
        };
        
        // 초기화 로그
        console.log('[ChatGPT 인라인 뷰] 모듈 로드 및 초기화 완료');
      `;
      
      // 문서에 추가
      document.head.appendChild(script);
      log('모듈 스크립트 추가됨');
    } catch (error) {
      logError('모듈 로드 중 오류 발생', error);
      
      // 오류 발생 시 대체 방법으로 콘텐츠 스크립트 로드
      loadContentScripts();
    }
  }
  
  // 기존 방식의 콘텐츠 스크립트 로드 (폴백 메서드)
  function loadContentScripts() {
    log('대체 방법으로 콘텐츠 스크립트 로드 시도');
    
    try {
      // DOM 분석기 스크립트
      const analyzerScript = document.createElement('script');
      analyzerScript.src = chrome.runtime.getURL('content.js');
      document.head.appendChild(analyzerScript);
      
      log('기존 콘텐츠 스크립트 로드됨');
    } catch (error) {
      logError('대체 콘텐츠 스크립트 로드 중 오류 발생', error);
    }
  }
  
  // 확장 프로그램 설정 로드
  function loadExtensionSettings() {
    log('확장 프로그램 설정 로드 시도');
    
    // Chrome 스토리지 API를 사용하여 설정 로드
    try {
      chrome.storage.sync.get({
        // 기본 설정값
        enabled: true,
        darkMode: null,
        compactView: false,
        showLineNumbers: true
      }, function(items) {
        log('설정 로드됨: ' + JSON.stringify(items));
        
        // 로컬 스토리지에 설정 저장 (모듈에서 접근할 수 있도록)
        localStorage.setItem('chatgpt-inline-view-settings', JSON.stringify(items));
        
        // ES 모듈 로드
        loadESModule();
      });
    } catch (error) {
      logError('설정 로드 중 오류 발생', error);
      
      // 오류 발생 시 기본 설정으로 진행
      loadESModule();
    }
  }
  
  // DOM 로드 완료 시 실행
  function onDOMContentLoaded() {
    log('DOM 로드 완료, 초기화 시작');
    
    // 설정 로드 후 모듈 초기화
    loadExtensionSettings();
  }
  
  // DOM 로드 이벤트 등록 또는 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
    log('DOMContentLoaded 이벤트 리스너 등록됨');
  } else {
    log('문서가 이미 로드됨, 즉시 초기화');
    onDOMContentLoaded();
  }
})(); 
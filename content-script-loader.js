/**
 * ChatGPT 인라인 뷰 - 콘텐츠 스크립트 로더
 * 확장 프로그램 진입점 스크립트
 * 
 * 버전: 1.5.2
 * 최종 수정일: 2023-07-16
 */

(function() {
  // 디버그 모드
  const DEBUG = true;
  
  // 로더 버전
  const LOADER_VERSION = '1.5.2';
  
  // 로드 시작 시간 (성능 측정용)
  const startTime = performance.now();
  
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
  
  // 성능 로그 함수
  function logPerformance(label) {
    if (DEBUG) {
      const elapsed = Math.round(performance.now() - startTime);
      console.log(`[ChatGPT 인라인 뷰 로더] ${label}: ${elapsed}ms`);
    }
  }
  
  // 모듈 URL 생성 함수
  function getModuleURL(path) {
    try {
      return chrome.runtime.getURL(path);
    } catch (error) {
      logError('모듈 URL 생성 중 오류 발생', error);
      // 폴백: 상대 경로 사용
      return path;
    }
  }
  
  // 스크립트 순차 로드 함수
  function loadScriptsSequentially(scripts, onComplete) {
    let index = 0;
    
    function loadNextScript() {
      if (index >= scripts.length) {
        if (typeof onComplete === 'function') {
          onComplete();
        }
        return;
      }
      
      const scriptPath = scripts[index];
      const script = document.createElement('script');
      script.src = getModuleURL(scriptPath);
      script.onload = function() {
        log(`스크립트 로드 완료: ${scriptPath}`);
        index++;
        loadNextScript();
      };
      script.onerror = function(error) {
        logError(`스크립트 로드 실패: ${scriptPath}`, error);
        index++;
        loadNextScript();
      };
      
      document.head.appendChild(script);
    }
    
    loadNextScript();
  }
  
  // 모듈 로드 함수
  function loadModules() {
    log('모듈 로딩 시작');
    
    // 로드할 스크립트 목록 (순서 중요)
    const scripts = [
      'modules/utils.js',
      'modules/event-bus.js',
      'modules/dom-analyzer.js',
      'modules/ui-manager.js',
      'modules/event-handlers.js',
      'modules/main.js'
    ];
    
    // 순차적으로 스크립트 로드
    loadScriptsSequentially(scripts, function() {
      log('모든 모듈 로드 완료');
      logPerformance('모듈 로드 완료');
      
      // 초기화 로그
      console.log(
        '%c ChatGPT 인라인 뷰 %c v' + LOADER_VERSION + ' %c',
        'background:#10a37f;color:white;font-weight:bold;border-radius:3px 0 0 3px;padding:2px 8px;',
        'background:#333;color:white;font-weight:bold;border-radius:0 3px 3px 0;padding:2px 8px;',
        'background:transparent'
      );
      
      // 앱 초기화
      if (window.ChatGPTInlineView && window.ChatGPTInlineView.app) {
        log('앱 초기화 시작');
      } else {
        logError('앱 초기화 실패: 모듈이 제대로 로드되지 않음');
        // 폴백 메서드 호출
        loadContentScripts();
      }
    });
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
      logPerformance('폴백 스크립트 로드');
    } catch (error) {
      logError('대체 콘텐츠 스크립트 로드 중 오류 발생', error);
      
      // 사용자에게 오류 알림
      showErrorNotification('확장 프로그램 로드 중 오류가 발생했습니다. 페이지를 새로고침하거나 확장 프로그램을 재설치해 보세요.');
    }
  }
  
  // 오류 알림 표시
  function showErrorNotification(message) {
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
          background-color: #F44336;
          color: white;
          border-radius: 4px;
          font-size: 14px;
          z-index: 10000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        `;
        document.body.appendChild(notification);
      }
      
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
      }, 5000);
    } catch (error) {
      // 알림 표시 중 오류 발생 시 콘솔에만 로그
      console.error('[ChatGPT 인라인 뷰] 알림 표시 중 오류 발생', error);
    }
  }
  
  // 확장 프로그램 설정 로드
  function loadExtensionSettings() {
    log('확장 프로그램 설정 로드 시도');
    logPerformance('설정 로드 시작');
    
    // 로컬 스토리지에서 설정 확인
    try {
      const localSettings = localStorage.getItem('chatgpt-inline-view-settings');
      if (localSettings) {
        log('로컬 스토리지에서 설정 로드됨');
        logPerformance('로컬 스토리지에서 설정 로드');
        
        // 모듈 로드
        loadModules();
        return;
      }
    } catch (error) {
      logError('로컬 스토리지에서 설정 로드 중 오류 발생', error);
    }
    
    // Chrome 스토리지 API를 사용하여 설정 로드
    try {
      if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get({
          // 기본 설정값
          enabled: true,
          darkMode: null,
          compactView: false,
          showLineNumbers: true,
          debugMode: DEBUG,
          refreshInterval: 1000
        }, function(items) {
          log('Chrome 스토리지에서 설정 로드됨: ' + JSON.stringify(items));
          logPerformance('Chrome 스토리지에서 설정 로드');
          
          try {
            // 로컬 스토리지에 설정 저장 (모듈에서 접근할 수 있도록)
            localStorage.setItem('chatgpt-inline-view-settings', JSON.stringify(items));
            
            // 모듈 로드
            loadModules();
          } catch (storageError) {
            logError('설정 저장 중 오류 발생', storageError);
            loadModules();
          }
        });
      } else {
        // Chrome 스토리지를 사용할 수 없는 경우 기본 설정 사용
        log('Chrome 스토리지를 사용할 수 없음, 기본 설정 사용');
        
        const defaultSettings = {
          enabled: true,
          darkMode: null,
          compactView: false,
          showLineNumbers: true,
          debugMode: DEBUG,
          refreshInterval: 1000
        };
        
        try {
          localStorage.setItem('chatgpt-inline-view-settings', JSON.stringify(defaultSettings));
        } catch (storageError) {
          logError('기본 설정 저장 중 오류 발생', storageError);
        }
        
        // 모듈 로드
        loadModules();
      }
    } catch (error) {
      logError('설정 로드 중 오류 발생', error);
      
      // 오류 발생 시 기본 설정으로 진행
      loadModules();
    }
  }
  
  // 브라우저 환경 확인
  function checkBrowserEnvironment() {
    log('브라우저 환경 확인');
    
    // 브라우저 정보 확인
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
    
    log(`브라우저: ${browserName} ${browserVersion}`);
    
    // 현재 URL 확인
    const currentURL = window.location.href;
    const isChatGPTDomain = 
      currentURL.includes('chat.openai.com') || 
      currentURL.includes('chatgpt.com');
    
    log(`현재 URL: ${currentURL}, ChatGPT 도메인: ${isChatGPTDomain}`);
    
    return {
      browser: { name: browserName, version: browserVersion },
      isChatGPTDomain: isChatGPTDomain,
      url: currentURL
    };
  }
  
  // DOM 로드 완료 시 실행
  function onDOMContentLoaded() {
    log('DOM 로드 완료, 초기화 시작');
    logPerformance('DOM 로드 완료');
    
    // 브라우저 환경 확인
    const env = checkBrowserEnvironment();
    
    // ChatGPT 도메인이 아닌 경우 경고
    if (!env.isChatGPTDomain) {
      log('ChatGPT 도메인이 아님, 일부 기능이 제한될 수 있음');
    }
    
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
  
  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', function() {
    log('페이지 언로드, 리소스 정리');
    
    // 글로벌 객체 정리
    if (window.ChatGPTInlineView && window.ChatGPTInlineView.app) {
      try {
        window.ChatGPTInlineView.app.cleanup();
      } catch (error) {
        logError('리소스 정리 중 오류 발생', error);
      }
    }
  });
})(); 
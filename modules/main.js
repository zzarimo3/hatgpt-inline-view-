/**
 * ChatGPT 인라인 뷰 - 메인 모듈
 * 확장 프로그램의 진입점 및 모듈 통합
 */

(function(window) {
  // 확장 프로그램 메인 클래스
  class ChatGPTInlineViewApp {
    constructor() {
      this.version = '1.5.3';
      this.initialized = false;
      this.initRetryCount = 0;
      this.maxRetries = 3;
      this.retryDelay = 5000; // 5초
      
      // 이벤트 구독 취소 함수 목록
      this.unsubscribers = [];
    }
    
    // 초기화
    initialize() {
      try {
        if (this.initialized) {
          console.log('[ChatGPT 인라인 뷰] 이미 초기화됨, 중복 실행 방지');
          return;
        }
        
        console.log(`[ChatGPT 인라인 뷰] 확장 프로그램 v${this.version} 초기화 시작`);
        
        // 설정 로드 및 디버그 모드 설정
        this.loadSettings();
        
        // 실행 환경 확인
        if (!this.checkEnvironment()) {
          console.warn('[ChatGPT 인라인 뷰] 지원되지 않는 환경에서 실행 중입니다. 일부 기능이 제한될 수 있습니다.');
        }
        
        // 이벤트 구독
        this.subscribeToEvents();
        
        // 모듈 초기화
        this.initializeModules();
        
        // 초기화 완료 표시
        this.initialized = true;
        this.initRetryCount = 0;
        console.log('[ChatGPT 인라인 뷰] 초기화 완료');
        
        // 시작 메시지 출력
        console.log(
          '%c ChatGPT 인라인 뷰 %c v' + this.version + ' %c',
          'background:#10a37f;color:white;font-weight:bold;border-radius:3px 0 0 3px;padding:2px 8px;',
          'background:#333;color:white;font-weight:bold;border-radius:0 3px 3px 0;padding:2px 8px;',
          'background:transparent'
        );
        
        // 초기화 성공 이벤트 발행
        if (window.EventBus) {
          window.EventBus.publish('app:initialized', { version: this.version });
        }
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 초기화 중 오류 발생', error);
        
        // 재시도 횟수 증가
        this.initRetryCount++;
        
        // 최대 재시도 횟수 초과 시 오류 알림
        if (this.initRetryCount > this.maxRetries) {
          if (window.Utils) {
            window.Utils.showErrorNotification('초기화 실패: 최대 재시도 횟수 초과');
          }
          console.error('[ChatGPT 인라인 뷰] 초기화 실패: 최대 재시도 횟수 초과');
          return;
        }
        
        // 재시도 알림
        console.warn(`[ChatGPT 인라인 뷰] 초기화 재시도 (${this.initRetryCount}/${this.maxRetries})...`);
        
        // 지연 후 재시도
        const self = this;
        setTimeout(function() {
          self.initialized = false;
          self.initialize();
        }, this.retryDelay);
      }
    }
    
    // 이벤트 구독
    subscribeToEvents() {
      console.log('[ChatGPT 인라인 뷰] 이벤트 구독 시작');
      
      if (window.EventBus && window.EventTypes) {
        // 설정 업데이트 이벤트 구독
        this.unsubscribers.push(
          window.EventBus.subscribe(window.EventTypes.SETTINGS_UPDATED, this.handleSettingsUpdated.bind(this))
        );
        
        // 오류 이벤트 구독
        this.unsubscribers.push(
          window.EventBus.subscribe('app:error', this.handleAppError.bind(this))
        );
      }
      
      console.log('[ChatGPT 인라인 뷰] 이벤트 구독 완료');
    }
    
    // 설정 업데이트 이벤트 처리
    handleSettingsUpdated(data) {
      const { settings } = data;
      
      if (settings && window.Utils) {
        // 디버그 모드 설정 업데이트
        window.Utils.setDebugMode(settings.debugMode || false);
        
        console.log('[ChatGPT 인라인 뷰] 설정 업데이트됨');
      }
    }
    
    // 앱 오류 이벤트 처리
    handleAppError(data) {
      const { error, source, fatal } = data;
      
      console.error(`[ChatGPT 인라인 뷰] [${source}] 오류 발생`, error);
      
      // 치명적 오류인 경우 사용자에게 알림
      if (fatal && window.Utils) {
        window.Utils.showErrorNotification(`오류 발생: ${error.message || '알 수 없는 오류'}`);
        
        // 앱 재초기화 시도
        this.cleanup();
        const self = this;
        setTimeout(function() {
          self.initialize();
        }, 3000);
      }
    }
    
    // 설정 로드
    loadSettings() {
      try {
        // 로컬 스토리지에서 설정 로드 시도
        if (window.Utils) {
          const settings = window.Utils.getSettings();
          
          if (settings) {
            // 디버그 모드 설정
            window.Utils.setDebugMode(settings.debugMode || false);
            console.log('[ChatGPT 인라인 뷰] 로컬 스토리지에서 설정 로드 완료');
            return settings;
          }
        }
        
        // 기본 설정 사용
        const defaultSettings = {
          enabled: true,
          darkMode: null,
          compactView: false,
          showLineNumbers: true,
          debugMode: false,
          refreshInterval: 1000
        };
        
        if (window.Utils) {
          window.Utils.saveSettings(defaultSettings);
          window.Utils.setDebugMode(defaultSettings.debugMode);
        }
        
        console.log('[ChatGPT 인라인 뷰] 기본 설정 사용');
        return defaultSettings;
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 설정 로드 중 오류 발생', error);
        
        // 오류 발생 시 기본 설정 사용
        const defaultSettings = {
          enabled: true,
          darkMode: null,
          compactView: false,
          showLineNumbers: true,
          debugMode: false,
          refreshInterval: 1000
        };
        
        if (window.Utils) {
          window.Utils.saveSettings(defaultSettings);
        }
        
        return defaultSettings;
      }
    }
    
    // 실행 환경 확인
    checkEnvironment() {
      // 실행 중인 도메인 확인
      const currentDomain = window.location.hostname;
      const isChatGPTDomain = 
        currentDomain === 'chatgpt.com' || 
        currentDomain === 'chat.openai.com' ||
        currentDomain.endsWith('.chatgpt.com');
      
      // 브라우저 정보 확인
      let browserInfo = { name: 'Unknown', version: 'Unknown' };
      if (window.Utils && window.Utils.getBrowserInfo) {
        browserInfo = window.Utils.getBrowserInfo();
      }
      console.log(`[ChatGPT 인라인 뷰] 브라우저 정보: ${browserInfo.name} ${browserInfo.version}`);
      
      // ChatGPT 도메인이 아닌 경우 경고
      if (!isChatGPTDomain) {
        console.warn(`[ChatGPT 인라인 뷰] 지원되지 않는 도메인에서 실행 중: ${currentDomain}`);
      }
      
      console.log(`[ChatGPT 인라인 뷰] 실행 환경: 도메인=${currentDomain}, 지원여부=${isChatGPTDomain}`);
      return isChatGPTDomain;
    }
    
    // 모듈 초기화
    initializeModules() {
      console.log('[ChatGPT 인라인 뷰] 모듈 초기화 시작');
      
      try {
        // 스타일시트 로드
        this.loadStylesheet();
        
        // UI 관리자 초기화
        if (window.UIManager && window.UIManager.init) {
          window.UIManager.init();
        }
        
        // 이벤트 핸들러 초기화
        if (window.EventHandlers && window.EventHandlers.init) {
          window.EventHandlers.init();
        }
        
        console.log('[ChatGPT 인라인 뷰] 모듈 초기화 완료');
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 모듈 초기화 중 오류 발생', error);
        
        // 오류 이벤트 발행
        if (window.EventBus) {
          window.EventBus.publish('app:error', {
            error: error,
            source: 'ModuleInitialization',
            fatal: true
          });
        }
        
        throw error;
      }
    }
    
    // 스타일시트 로드
    loadStylesheet() {
      // 기존 스타일시트 확인
      const existingStyle = document.getElementById('chatgpt-inline-view-styles');
      if (existingStyle) {
        return;
      }
      
      try {
        // 새 스타일 요소 생성
        const style = document.createElement('style');
        style.id = 'chatgpt-inline-view-styles';
        
        // 스타일 내용 설정 (필요한 경우)
        // style.textContent = `...`;
        
        // 문서에 추가
        document.head.appendChild(style);
        console.log('[ChatGPT 인라인 뷰] 스타일시트 로드 완료');
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 스타일시트 로드 중 오류 발생', error);
        
        // 오류 이벤트 발행
        if (window.EventBus) {
          window.EventBus.publish('app:error', {
            error: error,
            source: 'StylesheetLoading',
            fatal: false
          });
        }
      }
    }
    
    // 리소스 정리
    cleanup() {
      try {
        console.log('[ChatGPT 인라인 뷰] 리소스 정리 시작');
        
        // 이벤트 구독 취소
        this.unsubscribers.forEach(function(unsubscribe) {
          unsubscribe();
        });
        this.unsubscribers = [];
        
        // 이벤트 핸들러 정리
        if (window.EventHandlers && window.EventHandlers.cleanup) {
          window.EventHandlers.cleanup();
        }
        
        // UI 정리
        if (window.UIManager && window.UIManager.cleanup) {
          window.UIManager.cleanup();
        }
        
        // 초기화 상태 재설정
        this.initialized = false;
        
        console.log('[ChatGPT 인라인 뷰] 리소스 정리 완료');
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] 리소스 정리 중 오류 발생', error);
        
        // 오류 이벤트 발행
        if (window.EventBus) {
          window.EventBus.publish('app:error', {
            error: error,
            source: 'Cleanup',
            fatal: false
          });
        }
      }
    }
  }
  
  // 인스턴스 생성
  const instance = new ChatGPTInlineViewApp();
  
  // 전역 네임스페이스에 등록
  window.ChatGPTInlineViewApp = instance;
  
  // ChatGPT 인라인 뷰 네임스페이스 초기화
  if (!window.ChatGPTInlineView) {
    window.ChatGPTInlineView = {};
  }
  
  // 네임스페이스에 등록
  window.ChatGPTInlineView.app = instance;
  
})(window); 
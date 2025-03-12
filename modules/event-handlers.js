/**
 * ChatGPT 인라인 뷰 - 이벤트 처리 모듈
 * DOM 변경 감지, URL 변경 감지 등 이벤트 처리 담당
 */

// 이벤트 핸들러 모듈
const EventHandlers = {
  // 현재 URL 저장
  currentUrl: '',
  
  // DOM 변경 감지를 위한 MutationObserver
  observer: null,
  
  // URL 변경 감지 타이머
  urlCheckTimer: null,
  
  // 정기 업데이트 타이머
  updateTimer: null,
  
  // 초기화
  init() {
    // 현재 URL 저장
    this.currentUrl = window.location.href;
    
    // DOM 변경 감지 설정
    this.setupDOMObserver();
    
    // URL 변경 감지 타이머 설정
    this.setupUrlChangeDetection();
    
    // 정기 업데이트 타이머 설정
    this.setupPeriodicUpdate();
    
    // 페이지 로드 완료 시 초기 실행
    this.onInitialLoad();
    
    console.log("[EventHandlers] 이벤트 핸들러 초기화 완료");
    return this;
  },
  
  // DOM 변경 감지 설정
  setupDOMObserver() {
    // 기존 옵저버 해제
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // 스로틀링된 업데이트 함수
    const throttledUpdate = Utils.throttle(() => {
      this.updateInlineView();
    }, 1000);
    
    // 새 MutationObserver 설정
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        // 1. 속성 변경 확인
        if (mutation.type === 'attributes' && 
            mutation.target.hasAttribute && 
            mutation.target.hasAttribute('data-message-author-role')) {
          shouldUpdate = true;
        }
        
        // 2. 노드 추가 확인
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // 요소 노드인 경우
              // 메시지 역할 속성이 있는지 확인
              if ((node.hasAttribute && node.hasAttribute('data-message-author-role')) ||
                  (node.querySelector && node.querySelector('[data-message-author-role]'))) {
                shouldUpdate = true;
              }
              
              // 대화 턴 요소인지 확인
              if ((node.hasAttribute && node.getAttribute('data-testid')?.startsWith('conversation-turn-')) ||
                  (node.querySelector && node.querySelector('[data-testid^="conversation-turn-"]'))) {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        console.log("[EventHandlers] DOM 변경 감지, 인라인 뷰 업데이트 예약");
        throttledUpdate();
      }
    });
    
    // 관찰 시작 (메인 컨테이너만 관찰)
    const targetNode = DOMAnalyzer.findMainContainer();
    this.observer.observe(targetNode, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['data-message-author-role'] 
    });
    
    console.log("[EventHandlers] DOM 변경 감지 설정 완료");
  },
  
  // URL 변경 감지 설정
  setupUrlChangeDetection() {
    // 기존 타이머 제거
    if (this.urlCheckTimer) {
      clearInterval(this.urlCheckTimer);
    }
    
    // 디바운스된 체크 함수
    const debouncedCheck = Utils.debounce(() => {
      this.checkUrlChange();
    }, 500);
    
    // 주기적으로 URL 변경 검사
    this.urlCheckTimer = setInterval(debouncedCheck, 1000);
    
    console.log("[EventHandlers] URL 변경 감지 타이머 설정 완료");
  },
  
  // 정기 업데이트 타이머 설정
  setupPeriodicUpdate() {
    // 기존 타이머 제거
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    // 스로틀링된 업데이트 함수
    const throttledUpdate = Utils.throttle(() => {
      this.updateInlineView();
    }, 2000);
    
    // 주기적으로 인라인 뷰 업데이트
    this.updateTimer = setInterval(throttledUpdate, 10000);
    
    console.log("[EventHandlers] 정기 업데이트 타이머 설정 완료");
  },
  
  // URL 변경 감지 처리
  checkUrlChange() {
    const newUrl = window.location.href;
    
    if (this.currentUrl !== newUrl) {
      console.log("[EventHandlers] URL 변경 감지:", newUrl);
      this.currentUrl = newUrl;
      
      // UIManager에 뷰 제거 요청
      UIManager.removeInlineView();
      
      // 지연 후 새로운 페이지에 맞는 뷰 생성
      setTimeout(() => {
        this.updateInlineView();
      }, 2000);
    }
  },
  
  // 인라인 뷰 업데이트
  updateInlineView() {
    try {
      console.log("[EventHandlers] 인라인 뷰 업데이트 시작");
      
      // DOM에서 메시지 요소 찾기
      const { userMessages, assistantMessages } = DOMAnalyzer.findChatElements();
      
      // 메시지가 존재하면 새 인라인 뷰 생성
      if (userMessages.length > 0 || assistantMessages.length > 0) {
        // UI 관리자에 뷰 생성 요청
        const container = UIManager.createInlineView(userMessages, assistantMessages);
        
        // 생성된 컨테이너가 있으면 표시
        if (container) {
          UIManager.showInlineView();
        }
      }
      
      console.log("[EventHandlers] 인라인 뷰 업데이트 완료");
    } catch (error) {
      Utils.logError("[EventHandlers] 인라인 뷰 업데이트 중 오류 발생", error);
    }
  },
  
  // 초기 로드 시 실행
  onInitialLoad() {
    console.log("[EventHandlers] 페이지 초기 로드 처리");
    
    // 지연 후 초기 DOM 분석 및 인라인 뷰 생성
    setTimeout(() => {
      try {
        // DOM 구조 분석 (디버깅용)
        DOMAnalyzer.logDOMStructure();
        
        // 첫 인라인 뷰 업데이트
        this.updateInlineView();
      } catch (error) {
        Utils.logError("[EventHandlers] 초기 로드 처리 중 오류 발생", error);
      }
    }, 3000);
  },
  
  // 해제 (클린업)
  cleanup() {
    // 옵저버 해제
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // 타이머 해제
    if (this.urlCheckTimer) {
      clearInterval(this.urlCheckTimer);
      this.urlCheckTimer = null;
    }
    
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    console.log("[EventHandlers] 이벤트 핸들러 정리 완료");
  }
};

// 전역 변수로 노출 (Chrome 확장 프로그램에서 사용하기 위함)
window.EventHandlers = EventHandlers; 
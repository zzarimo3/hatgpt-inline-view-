/**
 * ChatGPT 인라인 뷰 - UI 관리자 모듈
 * 인라인 뷰 UI 요소 생성 및 관리
 */

(function(window) {
  // UI 관리자 클래스
  class UIManager {
    constructor() {
      // 인라인 뷰 컨테이너 ID
      this.containerId = 'chatgpt-inline-view-container';
      
      // 알림 ID
      this.notificationId = 'chatgpt-inline-view-notification';
      
      // 인라인 뷰 상태
      this.state = {
        isVisible: true,
        isCompactView: false,
        isDarkMode: null,
        showLineNumbers: true,
        lastUpdateTime: null
      };
      
      // 디버그 모드
      this.debugMode = false;
    }
    
    /**
     * 초기화
     */
    init() {
      try {
        console.log('[ChatGPT 인라인 뷰] UI 관리자: 초기화 시작');
        
        // 설정 로드
        this.loadSettings();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        console.log('[ChatGPT 인라인 뷰] UI 관리자: 초기화 완료');
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 초기화 중 오류 발생', error);
        
        // 오류 이벤트 발행
        if (window.EventBus) {
          window.EventBus.publish('app:error', {
            error: error,
            source: 'UIManager.init',
            fatal: false
          });
        }
      }
    }
    
    /**
     * 디버그 모드 설정
     * @param {boolean} enabled - 디버그 모드 활성화 여부
     */
    setDebugMode(enabled) {
      this.debugMode = !!enabled;
      if (this.debugMode) {
        console.log('[ChatGPT 인라인 뷰] UI 관리자: 디버그 모드 활성화됨');
      }
    }
    
    /**
     * 디버그 로그 출력
     * @param {string} message - 로그 메시지
     * @param {any} data - 추가 데이터 (선택 사항)
     */
    logDebug(message, data) {
      if (!this.debugMode) return;
      
      if (data) {
        console.log(`[ChatGPT 인라인 뷰] UI 관리자: ${message}`, data);
      } else {
        console.log(`[ChatGPT 인라인 뷰] UI 관리자: ${message}`);
      }
    }
    
    /**
     * 설정 로드
     */
    loadSettings() {
      try {
        // 로컬 스토리지에서 설정 로드
        if (window.Utils) {
          const settings = window.Utils.getSettings();
          
          if (settings) {
            // 상태 업데이트
            this.state.isCompactView = settings.compactView || false;
            this.state.isDarkMode = settings.darkMode;
            this.state.showLineNumbers = settings.showLineNumbers !== false;
            
            this.logDebug('설정 로드됨', settings);
          }
        }
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 설정 로드 중 오류 발생', error);
      }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
      try {
        // 이벤트 버스가 있는 경우 이벤트 구독
        if (window.EventBus && window.EventTypes) {
          // 설정 업데이트 이벤트 구독
          window.EventBus.subscribe(window.EventTypes.SETTINGS_UPDATED, this.handleSettingsUpdated.bind(this));
          
          // 새 메시지 이벤트 구독
          window.EventBus.subscribe(window.EventTypes.NEW_MESSAGES, this.handleNewMessages.bind(this));
          
          this.logDebug('이벤트 리스너 설정 완료');
        }
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 이벤트 리스너 설정 중 오류 발생', error);
      }
    }
    
    /**
     * 설정 업데이트 이벤트 처리
     * @param {Object} data - 이벤트 데이터
     */
    handleSettingsUpdated(data) {
      const { settings } = data;
      
      if (settings) {
        // 상태 업데이트
        this.state.isCompactView = settings.compactView || false;
        this.state.isDarkMode = settings.darkMode;
        this.state.showLineNumbers = settings.showLineNumbers !== false;
        
        // UI 업데이트
        this.updateInlineViewStyles();
        
        this.logDebug('설정 업데이트로 UI 업데이트됨', settings);
      }
    }
    
    /**
     * 새 메시지 이벤트 처리
     * @param {Object} data - 이벤트 데이터
     */
    handleNewMessages(data) {
      const { messages } = data;
      
      if (messages && messages.length > 0) {
        // 인라인 뷰 업데이트
        this.updateInlineView(messages);
        
        this.logDebug('새 메시지로 인라인 뷰 업데이트됨', { messageCount: messages.length });
      }
    }
    
    /**
     * 인라인 뷰 컨테이너 생성
     * @returns {HTMLElement} 생성된 컨테이너 요소
     */
    createInlineViewContainer() {
      // 기존 컨테이너 확인
      let container = document.getElementById(this.containerId);
      
      // 기존 컨테이너가 있으면 반환
      if (container) {
        return container;
      }
      
      // 새 컨테이너 생성
      container = document.createElement('div');
      container.id = this.containerId;
      
      // 테마 모드 설정
      const themeMode = this.getThemeMode();
      container.classList.add(themeMode === 'dark' ? 'dark-mode' : 'light-mode');
      
      // 압축 보기 모드 설정
      if (this.state.isCompactView) {
        container.classList.add('compact-view');
      }
      
      // 헤더 생성
      const header = document.createElement('div');
      header.className = 'inline-view-header';
      
      // 제목
      const title = document.createElement('h2');
      title.className = 'inline-view-title';
      title.textContent = 'ChatGPT 인라인 뷰';
      header.appendChild(title);
      
      // 버튼 컨테이너
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'inline-view-buttons';
      
      // 토글 버튼
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'inline-view-toggle-btn';
      toggleBtn.textContent = '접기';
      toggleBtn.addEventListener('click', this.toggleInlineView.bind(this));
      buttonContainer.appendChild(toggleBtn);
      
      // 설정 버튼
      const settingsBtn = document.createElement('button');
      settingsBtn.className = 'inline-view-settings-btn';
      settingsBtn.textContent = '설정';
      settingsBtn.addEventListener('click', this.openSettings.bind(this));
      buttonContainer.appendChild(settingsBtn);
      
      header.appendChild(buttonContainer);
      container.appendChild(header);
      
      // 메시지 컨테이너
      const messagesContainer = document.createElement('div');
      messagesContainer.className = 'inline-view-messages';
      container.appendChild(messagesContainer);
      
      // 빈 메시지 안내
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'inline-view-empty-message';
      emptyMessage.textContent = '대화가 시작되면 여기에 표시됩니다.';
      messagesContainer.appendChild(emptyMessage);
      
      this.logDebug('인라인 뷰 컨테이너 생성됨');
      return container;
    }
    
    /**
     * 인라인 뷰 삽입
     */
    insertInlineView() {
      try {
        // DOM 분석기가 있는지 확인
        if (!window.DOMAnalyzer) {
          console.error('[ChatGPT 인라인 뷰] UI 관리자: DOM 분석기를 찾을 수 없음');
          return;
        }
        
        // 삽입 위치 찾기
        const insertionPoint = window.DOMAnalyzer.findInsertionPoint();
        if (!insertionPoint) {
          console.warn('[ChatGPT 인라인 뷰] UI 관리자: 인라인 뷰 삽입 위치를 찾을 수 없음');
          return;
        }
        
        // 컨테이너 생성
        const container = this.createInlineViewContainer();
        
        // 삽입 위치에 컨테이너 추가
        insertionPoint.parentNode.insertBefore(container, insertionPoint.nextSibling);
        
        this.logDebug('인라인 뷰 삽입됨');
        
        // 이벤트 발행
        if (window.EventBus) {
          window.EventBus.publish('ui:inlineViewInserted', { container });
        }
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 인라인 뷰 삽입 중 오류 발생', error);
      }
    }
    
    /**
     * 인라인 뷰 업데이트
     * @param {Array} messages - 메시지 배열
     */
    updateInlineView(messages) {
      try {
        // 인라인 뷰 컨테이너 확인
        let container = document.getElementById(this.containerId);
        
        // 컨테이너가 없으면 생성 및 삽입
        if (!container) {
          this.insertInlineView();
          container = document.getElementById(this.containerId);
          
          if (!container) {
            console.error('[ChatGPT 인라인 뷰] UI 관리자: 인라인 뷰 컨테이너를 찾을 수 없음');
            return;
          }
        }
        
        // 메시지 컨테이너 찾기
        const messagesContainer = container.querySelector('.inline-view-messages');
        if (!messagesContainer) {
          console.error('[ChatGPT 인라인 뷰] UI 관리자: 메시지 컨테이너를 찾을 수 없음');
          return;
        }
        
        // 메시지 컨테이너 초기화
        messagesContainer.innerHTML = '';
        
        // 메시지가 없는 경우 빈 메시지 표시
        if (!messages || messages.length === 0) {
          const emptyMessage = document.createElement('div');
          emptyMessage.className = 'inline-view-empty-message';
          emptyMessage.textContent = '대화가 시작되면 여기에 표시됩니다.';
          messagesContainer.appendChild(emptyMessage);
          return;
        }
        
        // 메시지 렌더링
        messages.forEach((message, index) => {
          const chatRow = this.createChatRow(message, index);
          messagesContainer.appendChild(chatRow);
        });
        
        // 마지막 업데이트 시간 기록
        this.state.lastUpdateTime = new Date();
        
        this.logDebug('인라인 뷰 업데이트됨', { messageCount: messages.length });
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 인라인 뷰 업데이트 중 오류 발생', error);
      }
    }
    
    /**
     * 채팅 행 요소 생성
     * @param {Object} message - 메시지 객체
     * @param {number} index - 메시지 인덱스
     * @returns {HTMLElement} 생성된 채팅 행 요소
     */
    createChatRow(message, index) {
      // 채팅 행 컨테이너
      const chatRow = document.createElement('div');
      chatRow.className = 'chat-row';
      chatRow.dataset.index = index;
      
      // 줄 번호 표시 (설정에 따라)
      if (this.state.showLineNumbers) {
        const rowIndex = document.createElement('div');
        rowIndex.className = 'chat-row-index';
        rowIndex.textContent = (index + 1).toString();
        chatRow.appendChild(rowIndex);
      }
      
      // 사용자 메시지 (왼쪽)
      const userMessage = document.createElement('div');
      userMessage.className = 'chat-user-message';
      
      // 어시스턴트 메시지 (오른쪽)
      const assistantMessage = document.createElement('div');
      assistantMessage.className = 'chat-assistant-message';
      
      // 메시지 유형에 따라 내용 설정
      if (message.type === 'user') {
        userMessage.innerHTML = message.html || message.content || '(내용 없음)';
        assistantMessage.textContent = '';
      } else if (message.type === 'assistant') {
        userMessage.textContent = '';
        assistantMessage.innerHTML = message.html || message.content || '(내용 없음)';
      } else {
        // 시스템 메시지 또는 알 수 없는 유형
        userMessage.textContent = '';
        assistantMessage.innerHTML = message.html || message.content || '(시스템 메시지)';
      }
      
      // 행에 메시지 추가
      chatRow.appendChild(userMessage);
      chatRow.appendChild(assistantMessage);
      
      return chatRow;
    }
    
    /**
     * 인라인 뷰 스타일 업데이트
     */
    updateInlineViewStyles() {
      try {
        // 인라인 뷰 컨테이너 확인
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        // 테마 모드 업데이트
        const themeMode = this.getThemeMode();
        container.classList.remove('dark-mode', 'light-mode');
        container.classList.add(themeMode === 'dark' ? 'dark-mode' : 'light-mode');
        
        // 압축 보기 모드 업데이트
        if (this.state.isCompactView) {
          container.classList.add('compact-view');
        } else {
          container.classList.remove('compact-view');
        }
        
        this.logDebug('인라인 뷰 스타일 업데이트됨', {
          themeMode,
          isCompactView: this.state.isCompactView
        });
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 스타일 업데이트 중 오류 발생', error);
      }
    }
    
    /**
     * 인라인 뷰 토글
     */
    toggleInlineView() {
      try {
        // 인라인 뷰 컨테이너 확인
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        // 메시지 컨테이너 찾기
        const messagesContainer = container.querySelector('.inline-view-messages');
        if (!messagesContainer) return;
        
        // 토글 버튼 찾기
        const toggleBtn = container.querySelector('.inline-view-toggle-btn');
        
        // 표시 상태 토글
        this.state.isVisible = !this.state.isVisible;
        
        // 상태에 따라 UI 업데이트
        if (this.state.isVisible) {
          messagesContainer.style.display = 'block';
          if (toggleBtn) toggleBtn.textContent = '접기';
        } else {
          messagesContainer.style.display = 'none';
          if (toggleBtn) toggleBtn.textContent = '펼치기';
        }
        
        this.logDebug('인라인 뷰 토글됨', { isVisible: this.state.isVisible });
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 인라인 뷰 토글 중 오류 발생', error);
      }
    }
    
    /**
     * 설정 페이지 열기
     */
    openSettings() {
      try {
        // 설정 페이지 URL
        const settingsUrl = chrome.runtime.getURL('options/options.html');
        
        // 새 탭에서 설정 페이지 열기
        window.open(settingsUrl, '_blank');
        
        this.logDebug('설정 페이지 열림');
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 설정 페이지 열기 중 오류 발생', error);
        
        // 대체 방법: 알림 표시
        this.showNotification('설정 페이지를 열 수 없습니다. 확장 프로그램 관리 페이지에서 설정을 확인하세요.', 'error');
      }
    }
    
    /**
     * 알림 표시
     * @param {string} message - 알림 메시지
     * @param {string} type - 알림 유형 ('info', 'success', 'warning', 'error')
     * @param {number} duration - 표시 시간 (밀리초)
     */
    showNotification(message, type = 'info', duration = 3000) {
      try {
        // 기존 알림 요소 확인
        let notification = document.getElementById(this.notificationId);
        
        // 없으면 생성
        if (!notification) {
          notification = document.createElement('div');
          notification.id = this.notificationId;
          document.body.appendChild(notification);
        }
        
        // 이전 타이머 정리
        if (this.notificationTimer) {
          clearTimeout(this.notificationTimer);
        }
        
        // 알림 유형에 따른 스타일 설정
        notification.className = type;
        
        // 메시지 설정
        notification.textContent = message;
        
        // 표시 애니메이션
        notification.classList.add('visible');
        
        // 자동 숨김 타이머 설정
        this.notificationTimer = setTimeout(() => {
          notification.classList.remove('visible');
        }, duration);
        
        this.logDebug('알림 표시됨', { message, type, duration });
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 알림 표시 중 오류 발생', error);
      }
    }
    
    /**
     * 현재 테마 모드 가져오기
     * @returns {string} 'dark' 또는 'light'
     */
    getThemeMode() {
      // 설정에서 테마 모드가 명시적으로 설정된 경우
      if (this.state.isDarkMode !== null) {
        return this.state.isDarkMode ? 'dark' : 'light';
      }
      
      // DOM 분석기를 통해 페이지 테마 확인
      if (window.DOMAnalyzer) {
        return window.DOMAnalyzer.getThemeMode();
      }
      
      // 기본값: 시스템 테마 확인
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    }
    
    /**
     * 인라인 뷰 제거
     */
    removeInlineView() {
      try {
        // 인라인 뷰 컨테이너 확인
        const container = document.getElementById(this.containerId);
        if (container) {
          // 컨테이너 제거
          container.remove();
          this.logDebug('인라인 뷰 제거됨');
        }
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 인라인 뷰 제거 중 오류 발생', error);
      }
    }
    
    /**
     * 리소스 정리
     */
    cleanup() {
      try {
        // 인라인 뷰 제거
        this.removeInlineView();
        
        // 알림 요소 제거
        const notification = document.getElementById(this.notificationId);
        if (notification) {
          notification.remove();
        }
        
        // 타이머 정리
        if (this.notificationTimer) {
          clearTimeout(this.notificationTimer);
          this.notificationTimer = null;
        }
        
        this.logDebug('UI 관리자 리소스 정리 완료');
      } catch (error) {
        console.error('[ChatGPT 인라인 뷰] UI 관리자: 리소스 정리 중 오류 발생', error);
      }
    }
  }
  
  // 인스턴스 생성
  const instance = new UIManager();
  
  // 전역 네임스페이스에 등록
  window.UIManager = instance;
  
  // ChatGPT 인라인 뷰 네임스페이스 초기화
  if (!window.ChatGPTInlineView) {
    window.ChatGPTInlineView = {};
  }
  
  // 네임스페이스에 등록
  window.ChatGPTInlineView.uiManager = instance;
  
})(window); 
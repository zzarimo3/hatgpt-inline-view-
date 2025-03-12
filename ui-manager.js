/**
 * ChatGPT 인라인 뷰 - UI 관리자 모듈
 * 인라인 뷰 생성 및 관리, UI 컴포넌트 관련 기능
 */

// 기본 설정값
const DEFAULT_SETTINGS = {
  enabled: true,        // 확장 프로그램 활성화 여부
  darkMode: null,       // 다크모드 (null: 시스템 설정 따름, true: 강제 다크모드, false: 강제 라이트모드)
  compactView: false,   // 압축 보기
  showLineNumbers: true // 줄 번호 표시
};

// UI 관리자 모듈
const UIManager = {
  // 현재 설정
  settings: { ...DEFAULT_SETTINGS },
  
  // 인라인 뷰 컨테이너 요소
  container: null,
  
  // 초기화
  init(userSettings = {}) {
    // 사용자 설정과 기본값 병합
    this.settings = { ...DEFAULT_SETTINGS, ...userSettings };
    this.loadSettings();
    this.createToggleButton();
    
    console.log("[UIManager] 초기화 완료, 설정:", this.settings);
    return this;
  },
  
  // 로컬 스토리지에서 설정 불러오기
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('chatgpt-inline-view-settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        console.log("[UIManager] 설정 불러옴:", this.settings);
      }
    } catch (error) {
      console.error("[UIManager] 설정 로드 중 오류:", error);
    }
  },
  
  // 로컬 스토리지에 설정 저장
  saveSettings() {
    try {
      localStorage.setItem('chatgpt-inline-view-settings', JSON.stringify(this.settings));
      console.log("[UIManager] 설정 저장됨:", this.settings);
    } catch (error) {
      console.error("[UIManager] 설정 저장 중 오류:", error);
    }
  },
  
  // 토글 버튼 생성 (확장 프로그램 활성화/비활성화)
  createToggleButton() {
    // 기존 버튼 제거
    const existingButton = document.getElementById('chatgpt-inline-view-toggle');
    if (existingButton) {
      existingButton.remove();
    }
    
    // 새 버튼 생성
    const button = document.createElement('button');
    button.id = 'chatgpt-inline-view-toggle';
    button.textContent = this.settings.enabled ? '인라인 뷰 OFF' : '인라인 뷰 ON';
    button.title = '인라인 뷰 켜기/끄기';
    
    // 스타일 적용
    Object.assign(button.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: '1000',
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: this.settings.enabled ? '#10a37f' : '#666',
      color: 'white',
      fontWeight: 'bold',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      cursor: 'pointer'
    });
    
    // 클릭 이벤트 처리
    button.addEventListener('click', () => {
      this.settings.enabled = !this.settings.enabled;
      button.textContent = this.settings.enabled ? '인라인 뷰 OFF' : '인라인 뷰 ON';
      button.style.backgroundColor = this.settings.enabled ? '#10a37f' : '#666';
      
      if (this.settings.enabled) {
        // 활성화 되면 빈 컨테이너 표시
        this.showInlineView();
      } else {
        // 비활성화 되면 컨테이너 제거
        this.removeInlineView();
      }
      
      this.saveSettings();
    });
    
    // 페이지에 추가
    document.body.appendChild(button);
    console.log("[UIManager] 토글 버튼 생성됨");
  },
  
  // 설정 패널 생성
  createSettingsPanel() {
    // 기존 패널 제거
    const existingPanel = document.getElementById('chatgpt-inline-view-settings');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // 패널 컨테이너 생성
    const panel = document.createElement('div');
    panel.id = 'chatgpt-inline-view-settings';
    
    // 패널 스타일
    Object.assign(panel.style, {
      position: 'fixed',
      right: '20px',
      bottom: '70px',
      zIndex: '1000',
      width: '300px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
      display: 'none'
    });
    
    // 제목
    const title = document.createElement('h3');
    title.textContent = '인라인 뷰 설정';
    title.style.marginTop = '0';
    panel.appendChild(title);
    
    // 옵션들 생성
    const options = [
      {
        id: 'darkMode',
        label: '다크 모드',
        type: 'select',
        options: [
          { value: 'null', label: '시스템 설정 따름' },
          { value: 'true', label: '다크 모드' },
          { value: 'false', label: '라이트 모드' }
        ]
      },
      {
        id: 'compactView',
        label: '압축 보기',
        type: 'checkbox'
      },
      {
        id: 'showLineNumbers',
        label: '줄 번호 표시',
        type: 'checkbox'
      }
    ];
    
    // 옵션 UI 생성
    options.forEach(option => {
      const row = document.createElement('div');
      row.style.margin = '10px 0';
      
      const label = document.createElement('label');
      label.textContent = option.label;
      label.style.display = 'block';
      label.style.marginBottom = '5px';
      
      row.appendChild(label);
      
      if (option.type === 'checkbox') {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.settings[option.id];
        checkbox.addEventListener('change', () => {
          this.settings[option.id] = checkbox.checked;
          this.saveSettings();
          this.updateInlineView();
        });
        row.appendChild(checkbox);
      } else if (option.type === 'select') {
        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.padding = '5px';
        
        option.options.forEach(opt => {
          const optElement = document.createElement('option');
          optElement.value = opt.value;
          optElement.textContent = opt.label;
          optElement.selected = String(this.settings[option.id]) === opt.value;
          select.appendChild(optElement);
        });
        
        select.addEventListener('change', () => {
          const value = select.value === 'null' ? null : select.value === 'true';
          this.settings[option.id] = value;
          this.saveSettings();
          this.updateInlineView();
        });
        
        row.appendChild(select);
      }
      
      panel.appendChild(row);
    });
    
    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.textContent = '닫기';
    closeButton.style.width = '100%';
    closeButton.style.padding = '8px';
    closeButton.style.marginTop = '15px';
    closeButton.style.backgroundColor = '#10a37f';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
      panel.style.display = 'none';
    });
    
    panel.appendChild(closeButton);
    
    // 페이지에 추가
    document.body.appendChild(panel);
    
    // 설정 버튼에 연결
    const settingsButton = document.getElementById('chatgpt-inline-view-settings-btn');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    return panel;
  },
  
  // 인라인 뷰 생성
  createInlineView(userMessages, assistantMessages) {
    // 설정이 비활성화된 경우 생성하지 않음
    if (!this.settings.enabled) {
      console.log("[UIManager] 인라인 뷰 비활성화됨, 생성 취소");
      return null;
    }
    
    console.log("[UIManager] 인라인 뷰 생성 시작");
    
    // 기존 뷰 제거
    this.removeInlineView();
    
    // 메시지 쌍 생성
    const messagePairs = [];
    const minLength = Math.min(userMessages.length, assistantMessages.length);
    
    for (let i = 0; i < minLength; i++) {
      messagePairs.push({
        user: userMessages[i],
        assistant: assistantMessages[i]
      });
    }
    
    // 컨테이너 생성
    const container = document.createElement('div');
    container.id = 'chatgpt-inline-view-container';
    this.container = container;
    
    // 다크모드 설정 적용
    const isDarkMode = this.settings.darkMode === null 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : this.settings.darkMode;
    
    if (isDarkMode) {
      container.classList.add('dark-mode');
    } else {
      container.classList.add('light-mode');
    }
    
    // 압축 보기 설정 적용
    if (this.settings.compactView) {
      container.classList.add('compact-view');
    }
    
    // 헤더 영역 생성
    const header = document.createElement('div');
    header.className = 'inline-view-header';
    
    // 제목
    const title = document.createElement('h2');
    title.textContent = 'ChatGPT 인라인 뷰';
    title.className = 'inline-view-title';
    
    // 설정 버튼
    const settingsButton = document.createElement('button');
    settingsButton.id = 'chatgpt-inline-view-settings-btn';
    settingsButton.innerHTML = '⚙️';
    settingsButton.title = '설정';
    settingsButton.className = 'inline-view-settings-btn';
    
    // 토글 버튼
    const toggleViewButton = document.createElement('button');
    toggleViewButton.id = 'chatgpt-inline-view-toggle-view';
    toggleViewButton.textContent = '접기';
    toggleViewButton.className = 'inline-view-toggle-btn';
    
    // 헤더에 요소 추가
    header.appendChild(title);
    header.appendChild(settingsButton);
    header.appendChild(toggleViewButton);
    container.appendChild(header);
    
    // 콘텐츠 영역 생성
    const contentDiv = document.createElement('div');
    contentDiv.id = 'chatgpt-inline-view-content';
    container.appendChild(contentDiv);
    
    // 토글 기능 설정
    toggleViewButton.addEventListener('click', () => {
      if (contentDiv.style.display === 'none') {
        contentDiv.style.display = 'block';
        toggleViewButton.textContent = '접기';
      } else {
        contentDiv.style.display = 'none';
        toggleViewButton.textContent = '펼치기';
      }
    });
    
    // 쌍이 없는 경우 안내 메시지
    if (messagePairs.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = '대화 내용이 없습니다.';
      emptyMessage.className = 'inline-view-empty-message';
      contentDiv.appendChild(emptyMessage);
    } else {
      // 메시지 쌍 추가 (DocumentFragment 사용)
      const fragment = document.createDocumentFragment();
      
      messagePairs.forEach((pair, index) => {
        try {
          // 메시지 행 생성
          const row = document.createElement('div');
          row.className = 'chat-row';
          
          // 줄 번호 표시 (설정에 따라)
          if (this.settings.showLineNumbers) {
            const indexLabel = document.createElement('div');
            indexLabel.textContent = `#${index + 1}`;
            indexLabel.className = 'chat-row-index';
            row.appendChild(indexLabel);
          }
          
          // 질문 영역 생성
          const userDiv = document.createElement('div');
          userDiv.className = 'chat-user-message';
          
          // 답변 영역 생성
          const assistantDiv = document.createElement('div');
          assistantDiv.className = 'chat-assistant-message';
          
          // 원본 요소에서 콘텐츠 가져오기
          try {
            // 사용자 메시지 복제 및 정리
            const userContent = pair.user.cloneNode(true);
            // 불필요한 버튼 등 제거
            userContent.querySelectorAll('button, [data-testid="conversation-turn-header"]').forEach(el => el.remove());
            userDiv.appendChild(userContent);
            
            // 어시스턴트 메시지 복제 및 정리
            const assistantContent = pair.assistant.cloneNode(true);
            assistantContent.querySelectorAll('button, [data-testid="conversation-turn-header"]').forEach(el => el.remove());
            assistantDiv.appendChild(assistantContent);
          } catch (err) {
            // 복제 실패 시 텍스트 콘텐츠만 추출
            userDiv.textContent = pair.user.textContent || '(내용을 불러올 수 없습니다)';
            assistantDiv.textContent = pair.assistant.textContent || '(내용을 불러올 수 없습니다)';
            console.error(`[UIManager] 메시지 #${index} 복제 중 오류:`, err);
          }
          
          // 행에 메시지 추가
          row.appendChild(userDiv);
          row.appendChild(assistantDiv);
          fragment.appendChild(row);
        } catch (err) {
          console.error(`[UIManager] 메시지 쌍 #${index} 처리 중 오류:`, err);
        }
      });
      
      contentDiv.appendChild(fragment);
    }
    
    // 설정 패널 생성
    this.createSettingsPanel();
    
    return container;
  },
  
  // 인라인 뷰 표시
  showInlineView() {
    // 컨테이너가 없거나 비활성화된 경우 아무것도 하지 않음
    if (!this.container || !this.settings.enabled) return;
    
    // 적절한 위치에 삽입 (main 요소 아래)
    const mainElement = document.querySelector('main') || document.body;
    mainElement.appendChild(this.container);
    
    console.log("[UIManager] 인라인 뷰 표시됨");
  },
  
  // 인라인 뷰 업데이트
  updateInlineView() {
    // 컨테이너가 있고, 표시 중인 경우에만 업데이트
    if (this.container && this.settings.enabled) {
      // 다크모드 상태 업데이트
      const isDarkMode = this.settings.darkMode === null 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches 
        : this.settings.darkMode;
      
      this.container.classList.toggle('dark-mode', isDarkMode);
      this.container.classList.toggle('light-mode', !isDarkMode);
      
      // 압축 보기 설정 적용
      this.container.classList.toggle('compact-view', this.settings.compactView);
      
      // 줄 번호 표시 설정 적용
      const indexLabels = this.container.querySelectorAll('.chat-row-index');
      indexLabels.forEach(label => {
        label.style.display = this.settings.showLineNumbers ? 'block' : 'none';
      });
      
      console.log("[UIManager] 인라인 뷰 업데이트됨:", this.settings);
    }
  },
  
  // 인라인 뷰 제거
  removeInlineView() {
    if (this.container) {
      this.container.remove();
      this.container = null;
      console.log("[UIManager] 인라인 뷰 제거됨");
    }
  }
};

// 전역 변수로 노출 (Chrome 확장 프로그램에서 사용하기 위함)
window.UIManager = UIManager; 
/**
 * ChatGPT 인라인 뷰 - UI 관리자 모듈
 * 인라인 뷰 UI 요소 생성 및 관리
 */

import * as Utils from './utils.js';
import DOMAnalyzer, { MessageType } from './dom-analyzer.js';

// UI 관리자 클래스
class UIManager {
  constructor() {
    // 인라인 뷰 컨테이너 요소
    this.container = null;
    
    // 현재 테마 (dark/light)
    this.currentTheme = 'light';
    
    // 압축 보기 모드 상태
    this.compactViewEnabled = false;
    
    // 줄 번호 표시 상태
    this.showLineNumbers = true;
    
    // 설정 로드
    this.loadSettings();
  }
  
  /**
   * 설정 로드
   */
  loadSettings() {
    const settings = Utils.getSettings();
    if (settings) {
      this.compactViewEnabled = settings.compactView || false;
      this.showLineNumbers = settings.showLineNumbers !== undefined ? settings.showLineNumbers : true;
    }
  }
  
  /**
   * UI 초기화
   */
  init() {
    Utils.logDebug('UI 관리자 초기화');
    this.loadSettings();
    this.detectTheme();
  }
  
  /**
   * 테마 감지 및 적용
   */
  detectTheme() {
    this.currentTheme = DOMAnalyzer.detectTheme();
    Utils.logDebug(`테마 감지: ${this.currentTheme}`);
    
    // 기존 컨테이너가 있으면 테마 적용
    if (this.container) {
      this.applyTheme();
    }
  }
  
  /**
   * 테마 적용
   */
  applyTheme() {
    if (!this.container) return;
    
    // 모든 테마 클래스 제거
    this.container.classList.remove('light-mode', 'dark-mode');
    
    // 현재 테마 클래스 추가
    this.container.classList.add(`${this.currentTheme}-mode`);
  }
  
  /**
   * 인라인 뷰 생성
   * @param {Array} messages - 대화 메시지 배열
   */
  createInlineView(messages) {
    Utils.logDebug('인라인 뷰 생성 시작');
    
    // 기존 인라인 뷰 제거
    this.removeInlineView();
    
    // 삽입 위치 찾기
    const insertionPoint = DOMAnalyzer.findInsertionPoint();
    if (!insertionPoint) {
      Utils.logError('인라인 뷰 삽입 위치를 찾을 수 없음');
      return;
    }
    
    // 컨테이너 생성
    this.container = Utils.createElement('div', {
      id: 'chatgpt-inline-view-container',
      className: `${this.currentTheme}-mode ${this.compactViewEnabled ? 'compact-view' : ''}`
    });
    
    // 헤더 추가
    const header = this.createHeader();
    this.container.appendChild(header);
    
    // 메시지가 없는 경우
    if (!messages || messages.length === 0) {
      const emptyMessage = Utils.createElement('div', {
        className: 'inline-view-empty-message'
      }, ['아직 대화 내용이 없습니다. 대화를 시작하면 여기에 표시됩니다.']);
      
      this.container.appendChild(emptyMessage);
    } else {
      // 메시지 행 추가
      messages.forEach((message, index) => {
        const chatRow = this.createChatRow(message, index);
        this.container.appendChild(chatRow);
      });
    }
    
    // 삽입 위치에 추가
    insertionPoint.parentNode.insertBefore(this.container, insertionPoint);
    
    Utils.logDebug('인라인 뷰 생성 완료');
  }
  
  /**
   * 헤더 생성
   * @returns {HTMLElement} 헤더 요소
   */
  createHeader() {
    const header = Utils.createElement('div', {
      className: 'inline-view-header'
    });
    
    // 제목
    const title = Utils.createElement('h2', {
      className: 'inline-view-title'
    }, ['ChatGPT 인라인 뷰']);
    
    // 버튼 컨테이너
    const buttonContainer = Utils.createElement('div', {
      className: 'inline-view-buttons'
    });
    
    // 압축 보기 토글 버튼
    const toggleCompactButton = Utils.createElement('button', {
      className: 'inline-view-toggle-btn',
      title: this.compactViewEnabled ? '확장 보기로 전환' : '압축 보기로 전환',
      onclick: () => this.toggleCompactView()
    }, [this.compactViewEnabled ? '확장 보기' : '압축 보기']);
    
    // 설정 버튼
    const settingsButton = Utils.createElement('button', {
      className: 'inline-view-settings-btn',
      title: '설정',
      onclick: () => this.openSettings()
    }, ['설정']);
    
    // 버튼 추가
    buttonContainer.appendChild(toggleCompactButton);
    buttonContainer.appendChild(settingsButton);
    
    // 헤더에 요소 추가
    header.appendChild(title);
    header.appendChild(buttonContainer);
    
    return header;
  }
  
  /**
   * 채팅 행 생성
   * @param {Object} message - 메시지 객체
   * @param {number} index - 메시지 인덱스
   * @returns {HTMLElement} 채팅 행 요소
   */
  createChatRow(message, index) {
    const row = Utils.createElement('div', {
      className: 'chat-row',
      'data-message-id': message.id
    });
    
    // 줄 번호 표시
    if (this.showLineNumbers) {
      const lineNumber = Utils.createElement('div', {
        className: 'chat-row-index'
      }, [`${index + 1}`]);
      
      row.appendChild(lineNumber);
    }
    
    // 사용자 메시지
    if (message.type === MessageType.USER) {
      const userMessage = Utils.createElement('div', {
        className: 'chat-user-message'
      });
      
      userMessage.innerHTML = message.content;
      row.appendChild(userMessage);
      
      // 빈 어시스턴트 메시지 (레이아웃 유지용)
      const emptyAssistantMessage = Utils.createElement('div', {
        className: 'chat-assistant-message',
        style: { visibility: 'hidden' }
      });
      
      row.appendChild(emptyAssistantMessage);
    } 
    // 어시스턴트 메시지
    else if (message.type === MessageType.ASSISTANT) {
      // 빈 사용자 메시지 (레이아웃 유지용)
      const emptyUserMessage = Utils.createElement('div', {
        className: 'chat-user-message',
        style: { visibility: 'hidden' }
      });
      
      row.appendChild(emptyUserMessage);
      
      // 어시스턴트 메시지
      const assistantMessage = Utils.createElement('div', {
        className: 'chat-assistant-message'
      });
      
      assistantMessage.innerHTML = message.content;
      row.appendChild(assistantMessage);
    }
    
    return row;
  }
  
  /**
   * 인라인 뷰 제거
   */
  removeInlineView() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }
  
  /**
   * 압축 보기 모드 토글
   */
  toggleCompactView() {
    this.compactViewEnabled = !this.compactViewEnabled;
    
    // 설정 저장
    const settings = Utils.getSettings() || {};
    settings.compactView = this.compactViewEnabled;
    Utils.saveSettings(settings);
    
    // UI 업데이트
    if (this.container) {
      if (this.compactViewEnabled) {
        this.container.classList.add('compact-view');
      } else {
        this.container.classList.remove('compact-view');
      }
      
      // 버튼 텍스트 업데이트
      const toggleButton = this.container.querySelector('.inline-view-toggle-btn');
      if (toggleButton) {
        toggleButton.textContent = this.compactViewEnabled ? '확장 보기' : '압축 보기';
        toggleButton.title = this.compactViewEnabled ? '확장 보기로 전환' : '압축 보기로 전환';
      }
    }
    
    Utils.logDebug(`압축 보기 모드 ${this.compactViewEnabled ? '활성화' : '비활성화'}`);
  }
  
  /**
   * 설정 페이지 열기
   */
  openSettings() {
    if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      Utils.showWarningNotification('설정 페이지를 열 수 없습니다.');
    }
  }
  
  /**
   * 인라인 뷰 업데이트
   * @param {Array} messages - 대화 메시지 배열
   */
  updateInlineView(messages) {
    // 인라인 뷰가 없으면 새로 생성
    if (!this.container) {
      this.createInlineView(messages);
      return;
    }
    
    // 기존 메시지 행 제거
    const existingRows = this.container.querySelectorAll('.chat-row');
    existingRows.forEach(row => row.remove());
    
    // 빈 메시지 제거
    const emptyMessage = this.container.querySelector('.inline-view-empty-message');
    if (emptyMessage) {
      emptyMessage.remove();
    }
    
    // 메시지가 없는 경우
    if (!messages || messages.length === 0) {
      const emptyMessage = Utils.createElement('div', {
        className: 'inline-view-empty-message'
      }, ['아직 대화 내용이 없습니다. 대화를 시작하면 여기에 표시됩니다.']);
      
      this.container.appendChild(emptyMessage);
    } else {
      // 메시지 행 추가
      messages.forEach((message, index) => {
        const chatRow = this.createChatRow(message, index);
        this.container.appendChild(chatRow);
      });
    }
    
    Utils.logDebug('인라인 뷰 업데이트 완료');
  }
}

// 싱글톤 인스턴스 생성
const instance = new UIManager();

// 기본 내보내기
export default instance; 
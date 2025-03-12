/**
 * ChatGPT 인라인 뷰 - 메인 모듈
 * 확장 프로그램의 진입점 및 모듈 통합
 */

import * as Utils from './utils.js';
import DOMAnalyzer from './dom-analyzer.js';
import UIManager from './ui-manager.js';
import EventHandlers from './event-handlers.js';

// 확장 프로그램 메인 클래스
class ChatGPTInlineView {
  constructor() {
    this.version = Utils.VERSION;
    this.initialized = false;
    
    // 초기화 시도
    this.initialize();
  }
  
  // 초기화
  async initialize() {
    try {
      Utils.logDebug(`ChatGPT 인라인 뷰 확장 프로그램 v${this.version} 초기화 시작`);
      
      // 이미 초기화된 경우 중복 실행 방지
      if (this.initialized) {
        Utils.logDebug('이미 초기화됨, 중복 실행 방지');
        return;
      }
      
      // 설정 로드 및 디버그 모드 설정
      this.loadSettings();
      
      // 실행 환경 확인
      this.checkEnvironment();
      
      // 모듈 초기화
      await this.initializeModules();
      
      // 초기화 완료 표시
      this.initialized = true;
      Utils.logDebug('초기화 완료');
      
      // 시작 메시지 출력
      console.log(
        '%c ChatGPT 인라인 뷰 %c v' + this.version + ' %c',
        'background:#10a37f;color:white;font-weight:bold;border-radius:3px 0 0 3px;padding:2px 8px;',
        'background:#333;color:white;font-weight:bold;border-radius:0 3px 3px 0;padding:2px 8px;',
        'background:transparent'
      );
    } catch (error) {
      Utils.logError('초기화 중 오류 발생', error);
      
      // 5초 후 재시도
      setTimeout(() => {
        this.initialized = false;
        this.initialize();
      }, 5000);
    }
  }
  
  // 설정 로드
  loadSettings() {
    const settings = Utils.getSettings() || {};
    
    // 디버그 모드 설정
    Utils.setDebugMode(settings.debugMode || false);
    
    Utils.logDebug('설정 로드 완료');
  }
  
  // 실행 환경 확인
  checkEnvironment() {
    // 실행 중인 도메인 확인
    const currentDomain = window.location.hostname;
    const isChatGPTDomain = 
      currentDomain === 'chatgpt.com' || 
      currentDomain === 'chat.openai.com' ||
      currentDomain.endsWith('.chatgpt.com');
    
    // ChatGPT 도메인이 아닌 경우 경고
    if (!isChatGPTDomain) {
      console.warn(`[ChatGPT 인라인 뷰] 지원되지 않는 도메인에서 실행 중: ${currentDomain}`);
    }
    
    Utils.logDebug(`실행 환경: 도메인=${currentDomain}, 지원여부=${isChatGPTDomain}`);
    return isChatGPTDomain;
  }
  
  // 모듈 초기화
  async initializeModules() {
    Utils.logDebug('모듈 초기화 시작');
    
    // 스타일시트 로드
    this.loadStylesheet();
    
    // UI 관리자 초기화
    UIManager.init();
    
    // 이벤트 핸들러 초기화
    EventHandlers.init();
    
    Utils.logDebug('모듈 초기화 완료');
  }
  
  // 스타일시트 로드
  loadStylesheet() {
    // 기존 스타일시트 확인
    const existingStyle = document.getElementById('chatgpt-inline-view-styles');
    if (existingStyle) {
      return;
    }
    
    // 새 스타일 요소 생성
    const style = document.createElement('style');
    style.id = 'chatgpt-inline-view-styles';
    style.textContent = `
      /* ChatGPT 인라인 뷰 스타일 */
      
      /* 메인 컨테이너 */
      #chatgpt-inline-view-container {
        width: 100%;
        max-width: 100%;
        margin: 20px 0;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      /* 라이트/다크 모드 */
      #chatgpt-inline-view-container.light-mode {
        background-color: rgba(248, 249, 250, 0.8);
        color: #333;
        border: 1px solid #e0e0e0;
      }
      
      #chatgpt-inline-view-container.dark-mode {
        background-color: rgba(52, 53, 65, 0.8);
        color: #f1f1f1;
        border: 1px solid #444;
      }
      
      /* 헤더 영역 */
      .inline-view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(128, 128, 128, 0.2);
      }
      
      .inline-view-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      /* 버튼 스타일 */
      .inline-view-toggle-btn,
      .inline-view-settings-btn {
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-left: 10px;
      }
      
      /* 버튼 색상 (라이트/다크 모드) */
      .light-mode .inline-view-toggle-btn,
      .light-mode .inline-view-settings-btn {
        background-color: #10a37f;
        color: white;
      }
      
      .dark-mode .inline-view-toggle-btn,
      .dark-mode .inline-view-settings-btn {
        background-color: #10a37f;
        color: white;
      }
      
      /* 빈 메시지 안내 */
      .inline-view-empty-message {
        text-align: center;
        padding: 20px;
        color: #888;
        font-style: italic;
      }
      
      /* 채팅 행 컨테이너 */
      .chat-row {
        display: flex;
        position: relative;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(128, 128, 128, 0.2);
      }
      
      /* 줄 번호 */
      .chat-row-index {
        position: absolute;
        left: -25px;
        top: 5px;
        font-size: 12px;
        color: #888;
      }
      
      /* 사용자/어시스턴트 메시지 공통 스타일 */
      .chat-user-message,
      .chat-assistant-message {
        padding: 10px;
        border-radius: 8px;
        overflow: auto;
      }
      
      /* 사용자 메시지 (왼쪽) */
      .chat-user-message {
        flex: 1;
        max-width: 45%;
        margin-right: 10px;
      }
      
      /* 어시스턴트 메시지 (오른쪽) */
      .chat-assistant-message {
        flex: 2;
        max-width: 55%;
      }
      
      /* 메시지 배경색 (라이트 모드) */
      .light-mode .chat-user-message {
        background-color: rgba(0, 0, 255, 0.1);
      }
      
      .light-mode .chat-assistant-message {
        background-color: rgba(0, 255, 0, 0.1);
      }
      
      /* 메시지 배경색 (다크 모드) */
      .dark-mode .chat-user-message {
        background-color: rgba(100, 100, 255, 0.2);
      }
      
      .dark-mode .chat-assistant-message {
        background-color: rgba(100, 255, 100, 0.2);
      }
      
      /* 압축 보기 모드 */
      #chatgpt-inline-view-container.compact-view .chat-row {
        margin-bottom: 10px;
        padding-bottom: 10px;
      }
      
      #chatgpt-inline-view-container.compact-view .chat-user-message,
      #chatgpt-inline-view-container.compact-view .chat-assistant-message {
        padding: 8px;
        font-size: 0.95em;
      }
      
      /* 모바일 반응형 스타일 */
      @media (max-width: 768px) {
        .chat-row {
          flex-direction: column;
        }
        
        .chat-user-message,
        .chat-assistant-message {
          max-width: 100% !important;
          margin: 0 0 10px 0;
        }
        
        .inline-view-header {
          flex-wrap: wrap;
        }
      }
      
      /* 토글 버튼 애니메이션 */
      #chatgpt-inline-view-toggle {
        transition: background-color 0.3s ease;
      }
      
      #chatgpt-inline-view-toggle:hover {
        background-color: #0d8c6d;
      }
    `;
    
    // 문서에 추가
    document.head.appendChild(style);
    Utils.logDebug('스타일시트 로드 완료');
  }
  
  // 리소스 정리
  cleanup() {
    try {
      Utils.logDebug('리소스 정리 시작');
      
      // 이벤트 핸들러 정리
      EventHandlers.cleanup();
      
      // UI 제거
      UIManager.removeInlineView();
      
      // 초기화 상태 재설정
      this.initialized = false;
      
      Utils.logDebug('리소스 정리 완료');
    } catch (error) {
      Utils.logError('리소스 정리 중 오류 발생', error);
    }
  }
}

// 인스턴스 생성
const instance = new ChatGPTInlineView();

// 기본 내보내기
export default instance; 
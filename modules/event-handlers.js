/**
 * ChatGPT 인라인 뷰 - 이벤트 핸들러 모듈
 * 이벤트 처리 및 상태 관리
 */

import * as Utils from './utils.js';
import DOMAnalyzer from './dom-analyzer.js';
import UIManager from './ui-manager.js';

// 이벤트 핸들러 클래스
class EventHandlers {
  constructor() {
    // 현재 URL 저장
    this.currentUrl = '';
    
    // URL 변경 감지 인터벌 ID
    this.urlCheckIntervalId = null;
    
    // 이벤트 리스너 목록
    this.listeners = [];
    
    // 초기화 상태
    this.initialized = false;
  }
  
  /**
   * 이벤트 핸들러 초기화
   */
  init() {
    if (this.initialized) {
      Utils.logDebug('이벤트 핸들러가 이미 초기화되었습니다.');
      return;
    }
    
    Utils.logDebug('이벤트 핸들러 초기화 시작');
    
    // 현재 URL 저장
    this.currentUrl = Utils.getCurrentURL();
    
    // URL 변경 감지 시작
    this.startUrlChangeDetection();
    
    // 페이지 가시성 변경 이벤트 리스너
    this.addListener(document, 'visibilitychange', this.handleVisibilityChange.bind(this));
    
    // 테마 변경 감지 (다크/라이트 모드)
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkModeMediaQuery.addEventListener) {
        this.addListener(darkModeMediaQuery, 'change', this.handleThemeChange.bind(this));
      }
    }
    
    // 초기 대화 내용 로드
    this.loadConversation();
    
    this.initialized = true;
    Utils.logDebug('이벤트 핸들러 초기화 완료');
  }
  
  /**
   * 이벤트 리스너 추가 (추적을 위해)
   * @param {EventTarget} target - 이벤트 대상
   * @param {string} type - 이벤트 타입
   * @param {Function} listener - 이벤트 리스너
   */
  addListener(target, type, listener) {
    target.addEventListener(type, listener);
    this.listeners.push({ target, type, listener });
  }
  
  /**
   * URL 변경 감지 시작
   */
  startUrlChangeDetection() {
    // 기존 인터벌 정리
    if (this.urlCheckIntervalId) {
      clearInterval(this.urlCheckIntervalId);
    }
    
    // 설정에서 인터벌 시간 가져오기
    const settings = Utils.getSettings() || {};
    const checkInterval = settings.refreshInterval || 1000;
    
    // 새 인터벌 설정
    this.urlCheckIntervalId = setInterval(this.checkUrlChange.bind(this), checkInterval);
    Utils.logDebug(`URL 변경 감지 시작 (인터벌: ${checkInterval}ms)`);
  }
  
  /**
   * URL 변경 확인
   */
  checkUrlChange() {
    const currentUrl = Utils.getCurrentURL();
    
    // URL이 변경된 경우
    if (currentUrl !== this.currentUrl) {
      Utils.logDebug(`URL 변경 감지: ${this.currentUrl} -> ${currentUrl}`);
      
      // 이전 URL과 현재 URL이 같은 대화인지 확인
      const isSameConversation = Utils.isSameConversation(this.currentUrl, currentUrl);
      
      // URL 업데이트
      this.currentUrl = currentUrl;
      
      // 같은 대화가 아닌 경우에만 인라인 뷰 초기화
      if (!isSameConversation) {
        Utils.logDebug('새로운 대화로 이동, 인라인 뷰 초기화');
        this.clearInlineView();
      }
      
      // 대화 내용 로드
      setTimeout(() => this.loadConversation(), 500);
    }
  }
  
  /**
   * 인라인 뷰 초기화
   */
  clearInlineView() {
    UIManager.removeInlineView();
  }
  
  /**
   * 대화 내용 로드 및 표시
   */
  loadConversation() {
    // ChatGPT 페이지인지 확인
    if (!DOMAnalyzer.isChatPage()) {
      Utils.logDebug('ChatGPT 대화 페이지가 아님, 로드 취소');
      return;
    }
    
    // 대화 내용 추출
    const messages = DOMAnalyzer.extractConversation();
    
    // 메시지가 있으면 인라인 뷰 생성/업데이트
    if (UIManager.container) {
      UIManager.updateInlineView(messages);
    } else {
      UIManager.createInlineView(messages);
    }
  }
  
  /**
   * 페이지 가시성 변경 처리
   */
  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      Utils.logDebug('페이지 가시성 변경: 보임');
      
      // 페이지가 다시 보이면 대화 내용 업데이트
      setTimeout(() => this.loadConversation(), 300);
    } else {
      Utils.logDebug('페이지 가시성 변경: 숨김');
    }
  }
  
  /**
   * 테마 변경 처리
   */
  handleThemeChange(event) {
    Utils.logDebug(`시스템 테마 변경: ${event.matches ? '다크' : '라이트'} 모드`);
    
    // UI 테마 업데이트
    UIManager.detectTheme();
  }
  
  /**
   * 리소스 정리
   */
  cleanup() {
    Utils.logDebug('이벤트 핸들러 리소스 정리 시작');
    
    // URL 변경 감지 인터벌 정리
    if (this.urlCheckIntervalId) {
      clearInterval(this.urlCheckIntervalId);
      this.urlCheckIntervalId = null;
    }
    
    // 등록된 모든 이벤트 리스너 제거
    this.listeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });
    
    // 리스너 목록 초기화
    this.listeners = [];
    
    // 초기화 상태 재설정
    this.initialized = false;
    
    Utils.logDebug('이벤트 핸들러 리소스 정리 완료');
  }
}

// 싱글톤 인스턴스 생성
const instance = new EventHandlers();

// 기본 내보내기
export default instance; 
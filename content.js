/**
 * ChatGPT 인라인 뷰 - 콘텐츠 스크립트
 * 확장 프로그램의 진입점 역할
 */

// 페이지 로드 후 지연 실행
setTimeout(() => {
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
}, 3000);

// 페이지 언로드 시 리소스 정리
window.addEventListener('beforeunload', () => {
  if (window.chatGPTInlineView) {
    window.chatGPTInlineView.cleanup();
  }
}); 
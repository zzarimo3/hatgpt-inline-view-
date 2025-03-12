// ChatGPT 인라인 뷰 확장 프로그램
// 질문과 답변을 한 줄에 정렬하여 표시하는 기능 구현

// 현재 URL 저장
let currentUrl = window.location.href;

// 인라인 뷰 컨테이너 초기화 함수
function clearInlineView() {
    // UI 관리자를 통해 인라인 뷰 제거
    UIManager.removeInlineView();
}

// URL 변경 감지 함수
function checkUrlChange() {
    const newUrl = window.location.href;
    if (currentUrl !== newUrl) {
        console.log("URL 변경 감지:", newUrl);
        currentUrl = newUrl;
        clearInlineView();
        setTimeout(rearrangeChat, 2000); // URL 변경 후 2초 후에 재배치 실행
    }
}

// 실제 인라인 뷰 기능 구현
function rearrangeChat() {
    console.log("인라인 뷰 적용 시도...");
    
    // 설정이 비활성화된 경우 실행하지 않음
    if (!UIManager.settings.enabled) {
        console.log("인라인 뷰가 비활성화되어 있습니다.");
        return;
    }
    
    // URL 변경 확인
    checkUrlChange();
    
    // DOM 분석기를 사용하여 메시지 요소 찾기
    const { userMessages, assistantMessages } = DOMAnalyzer.findChatElements();
    
    console.log(`사용자 메시지: ${userMessages.length}, 어시스턴트 메시지: ${assistantMessages.length}`);
    
    // 메시지 수가 일치하지 않으면 종료
    if (userMessages.length === 0 || assistantMessages.length === 0) {
        console.log("메시지를 찾을 수 없습니다.");
        return;
    }
    
    // UI 관리자를 사용하여 인라인 뷰 생성
    const container = UIManager.createInlineView(userMessages, assistantMessages);
    
    // 생성된 컨테이너가 없으면 종료
    if (!container) {
        console.log("인라인 뷰 컨테이너를 생성할 수 없습니다.");
        return;
    }
    
    // 인라인 뷰 표시
    UIManager.showInlineView();
    
    console.log("인라인 뷰 적용 완료");
}

// DOM 변경을 감지하여 실시간으로 실행
const observer = new MutationObserver((mutations) => {
    let shouldRearrange = false;
    
    mutations.forEach((mutation) => {
        // 새로운 메시지가 추가되었는지 확인
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                if (node.hasAttribute && node.hasAttribute('data-message-author-role')) {
                    shouldRearrange = true;
                }
            }
        });
    });
    
    if (shouldRearrange) {
        console.log("DOM 변경 감지: 새로운 메시지 추가됨");
        setTimeout(rearrangeChat, 1000);
    }
});

// URL 변경 감지를 위한 주기적 체크
setInterval(checkUrlChange, 1000);

// 초기화 함수
function initializeExtension() {
  Utils.logDebug("ChatGPT 인라인 뷰 확장 프로그램 초기화 시작...");
  
  try {
    // 버전 정보 로깅
    const version = Utils.getExtensionVersion();
    const browserInfo = Utils.getBrowserInfo();
    Utils.logDebug(`확장 프로그램 버전: ${version}, 브라우저: ${browserInfo.name} ${browserInfo.version}`);
    
    // UI 관리자 초기화
    UIManager.init();
    
    // 이벤트 핸들러 초기화
    EventHandlers.init();
    
    Utils.logDebug("ChatGPT 인라인 뷰 확장 프로그램 초기화 완료");
  } catch (error) {
    Utils.logError("초기화 중 오류 발생", error);
    Utils.showErrorNotification("확장 프로그램 초기화 중 오류가 발생했습니다. 페이지를 새로고침해 보세요.");
  }
}

// 페이지 로드 후 지연 실행
setTimeout(initializeExtension, 3000); 
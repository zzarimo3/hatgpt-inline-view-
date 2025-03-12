// ChatGPT 인라인 뷰 확장 프로그램
// 질문과 답변을 한 줄에 정렬하여 표시하는 기능 구현

// 현재 URL 저장
let currentUrl = window.location.href;

// 인라인 뷰 컨테이너 초기화 함수
function clearInlineView() {
    const container = document.getElementById('chatgpt-inline-view-container');
    if (container) {
        console.log("인라인 뷰 컨테이너 초기화");
        container.remove();
    }
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
    
    // DOM 분석기를 사용하여 메인 컨테이너 찾기
    const mainContainer = DOMAnalyzer.findMainContainer();
    
    // 기존 인라인 뷰 요소 제거
    clearInlineView();
    
    // 메시지 쌍 생성
    const messagePairs = [];
    const minLength = Math.min(userMessages.length, assistantMessages.length);
    
    for (let i = 0; i < minLength; i++) {
        messagePairs.push({
            user: userMessages[i],
            assistant: assistantMessages[i]
        });
    }
    
    // 인라인 뷰 컨테이너 생성
    let inlineViewContainer = document.createElement('div');
    inlineViewContainer.id = 'chatgpt-inline-view-container';
    inlineViewContainer.style.width = '100%';
    inlineViewContainer.style.padding = '20px';
    inlineViewContainer.style.backgroundColor = 'rgba(0,0,0,0.05)';
    inlineViewContainer.style.borderRadius = '10px';
    inlineViewContainer.style.marginTop = '20px';
    inlineViewContainer.style.marginBottom = '20px';
    
    // 제목 추가
    const title = document.createElement('h2');
    title.textContent = 'ChatGPT 인라인 뷰';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.color = '#444';
    inlineViewContainer.appendChild(title);
    
    // 각 메시지 쌍을 인라인으로 재배치
    messagePairs.forEach((pair, index) => {
        // 원본 요소 복제
        const userMsgClone = pair.user.cloneNode(true);
        const assistantMsgClone = pair.assistant.cloneNode(true);
        
        // 한 줄에 질문과 답변을 배치하는 div 생성
        let newRow = document.createElement('div');
        newRow.classList.add('chat-row');
        newRow.style.display = 'flex';
        newRow.style.alignItems = 'flex-start'; // 상단 정렬로 변경
        newRow.style.justifyContent = 'space-between';
        newRow.style.width = '100%';
        newRow.style.marginBottom = '20px';
        newRow.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        newRow.style.paddingBottom = '15px';
        
        // 질문 스타일 조정
        userMsgClone.style.flex = '1';
        userMsgClone.style.maxWidth = '45%';
        userMsgClone.style.textAlign = 'right';
        userMsgClone.style.padding = '10px';
        userMsgClone.style.borderRadius = '8px';
        userMsgClone.style.background = 'rgba(0,0,255,0.1)';
        userMsgClone.style.marginRight = '10px';
        
        // 답변 스타일 조정
        assistantMsgClone.style.flex = '2';
        assistantMsgClone.style.maxWidth = '55%';
        assistantMsgClone.style.textAlign = 'left';
        assistantMsgClone.style.padding = '10px';
        assistantMsgClone.style.borderRadius = '8px';
        assistantMsgClone.style.background = 'rgba(0,255,0,0.1)';
        
        try {
            // 새로운 줄에 복제된 요소 추가
            newRow.appendChild(userMsgClone);
            newRow.appendChild(assistantMsgClone);
            
            // 인라인 뷰 컨테이너에 새 행 추가
            inlineViewContainer.appendChild(newRow);
            console.log("메시지 쌍 재배치 성공:", index);
        } catch (e) {
            console.error("메시지 재배치 중 오류 발생:", e);
        }
    });
    
    // 메인 컨테이너에 인라인 뷰 컨테이너 추가
    mainContainer.appendChild(inlineViewContainer);
    
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

// 초기 실행
setTimeout(() => {
    // DOM 분석기를 사용하여 DOM 구조 로깅
    DOMAnalyzer.logDOMStructure();
    rearrangeChat();
    
    // DOM 변경 감지 시작
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 주기적으로 인라인 뷰 업데이트 (새로운 메시지가 추가될 수 있으므로)
    setInterval(rearrangeChat, 5000);
}, 3000); 
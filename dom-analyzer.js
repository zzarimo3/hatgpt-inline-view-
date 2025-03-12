/**
 * ChatGPT 인라인 뷰 - DOM 분석기 모듈
 * ChatGPT 웹사이트의 DOM 구조를 분석하고 필요한 요소를 찾아내는 기능 제공
 */

// DOM 분석 모듈
const DOMAnalyzer = {
  // 메시지 요소 찾기
  findChatElements() {
    console.log("[DOMAnalyzer] ChatGPT 메시지 요소 탐색 시작...");
    
    // 방법 1: data-testid 속성을 사용하는 최신 버전의 ChatGPT UI
    const conversationTurns = Array.from(
      document.querySelectorAll('[data-testid^="conversation-turn-"]')
    );
    
    // 대화 턴 요소가 존재하는 경우
    if (conversationTurns.length > 0) {
      const result = {
        userMessages: conversationTurns.filter(
          turn => turn.getAttribute('data-message-author-role') === 'user'
        ),
        assistantMessages: conversationTurns.filter(
          turn => turn.getAttribute('data-message-author-role') === 'assistant'
        )
      };
      
      console.log(`[DOMAnalyzer] 탐색 결과: 사용자 메시지 ${result.userMessages.length}개, 어시스턴트 메시지 ${result.assistantMessages.length}개 발견`);
      return result;
    }
    
    // 방법 2: 역할 속성을 직접 사용하는 대체 선택자
    console.log("[DOMAnalyzer] 대화 턴 요소를 찾을 수 없음, 대체 선택자 시도...");
    
    const userMessages = document.querySelectorAll('div[data-message-author-role="user"]');
    const assistantMessages = document.querySelectorAll('div[data-message-author-role="assistant"]');
    
    if (userMessages.length > 0 || assistantMessages.length > 0) {
      console.log(`[DOMAnalyzer] 대체 선택자로 발견: 사용자 메시지 ${userMessages.length}개, 어시스턴트 메시지 ${assistantMessages.length}개`);
      return { userMessages, assistantMessages };
    }
    
    // 방법 3: DOM 구조 분석을 통한 추론
    console.log("[DOMAnalyzer] 표준 선택자로 메시지를 찾을 수 없음, 구조 추론 시도...");
    
    // 가능한 대화 컨테이너 목록
    const possibleContainers = [
      ...document.querySelectorAll('main > div > div'),
      ...document.querySelectorAll('.flex.flex-col.items-center'),
      ...document.querySelectorAll('.text-token-text-primary'),
      ...document.querySelectorAll('.markdown')
    ];
    
    // 대화형 패턴 탐지 (번갈아 나타나는 자식 요소들)
    for (const container of possibleContainers) {
      const children = Array.from(container.children).filter(el => el.tagName === 'DIV');
      
      if (children.length >= 2) {
        // 패턴 분석: 홀수/짝수 인덱스로 분류
        const odd = children.filter((_, i) => i % 2 === 0);
        const even = children.filter((_, i) => i % 2 === 1);
        
        // 두 그룹이 모두 존재하는 경우
        if (odd.length > 0 && even.length > 0) {
          console.log("[DOMAnalyzer] 패턴 추론으로 메시지 발견: 패턴별 구분");
          
          // 첫 번째 요소 분석으로 사용자/어시스턴트 역할 추론
          const firstElementClasses = odd[0].className;
          const secondElementClasses = even[0].className;
          
          // 클래스명이나 내용으로 사용자/어시스턴트 역할 추론
          const isFirstUser = 
            firstElementClasses.includes('user') || 
            firstElementClasses.includes('right') ||
            odd[0].querySelector('.user-message');
            
          return isFirstUser
            ? { userMessages: odd, assistantMessages: even }
            : { userMessages: even, assistantMessages: odd };
        }
      }
    }
    
    // 하나도 찾지 못한 경우
    console.log("[DOMAnalyzer] 메시지 요소를 찾을 수 없음");
    return { userMessages: [], assistantMessages: [] };
  },
  
  // 대화 내용 추출 (텍스트만)
  extractMessageContent(messageElement) {
    if (!messageElement) return '';
    
    // 1. 마크다운 콘텐츠 찾기 시도
    const markdownContent = messageElement.querySelector('.markdown');
    if (markdownContent) {
      return markdownContent.textContent.trim();
    }
    
    // 2. 데이터 속성에서 메시지 찾기 시도
    if (messageElement.hasAttribute('data-message-content')) {
      return messageElement.getAttribute('data-message-content');
    }
    
    // 3. 일반 텍스트 콘텐츠 반환
    return messageElement.textContent.trim();
  },
  
  // 메인 컨테이너 찾기
  findMainContainer() {
    // 가능한 메인 컨테이너 선택자들
    const possibleSelectors = [
      'main',
      'main > div',
      '.flex.flex-col.items-center',
      'div[role="main"]',
      '#__next > div > div.flex.h-full.flex-col'
    ];
    
    for (const selector of possibleSelectors) {
      const container = document.querySelector(selector);
      if (container) {
        return container;
      }
    }
    
    // 컨테이너를 찾지 못한 경우 기본값
    return document.body;
  },
  
  // DOM 구조 분석 로깅 (디버깅용)
  logDOMStructure() {
    console.log("[DOMAnalyzer] ChatGPT DOM 구조 분석 시작...");
    
    // 주요 컨테이너 로깅
    const mainElement = document.querySelector('main');
    console.log("[DOMAnalyzer] 메인 요소:", mainElement);
    
    if (mainElement) {
      // 첫번째 레벨 자식 요소 로깅
      console.log("[DOMAnalyzer] 메인 요소 자식들:", Array.from(mainElement.children));
      
      // 대화 턴 요소 찾기
      const conversationTurns = mainElement.querySelectorAll('[data-testid^="conversation-turn-"]');
      console.log(`[DOMAnalyzer] 대화 턴 수: ${conversationTurns.length}`);
      
      if (conversationTurns.length > 0) {
        // 첫번째 대화 턴 분석
        const firstTurn = conversationTurns[0];
        console.log("[DOMAnalyzer] 첫번째 대화 턴:", firstTurn);
        console.log("[DOMAnalyzer] 첫번째 대화 턴 속성:", {
          role: firstTurn.getAttribute('data-message-author-role'),
          id: firstTurn.getAttribute('data-testid'),
          class: firstTurn.className
        });
      }
    }
    
    // 역할별 메시지 요소 찾기
    this.findChatElements();
    
    console.log("[DOMAnalyzer] DOM 구조 분석 완료");
  }
};

// 전역 변수로 노출 (Chrome 확장 프로그램에서 사용하기 위함)
window.DOMAnalyzer = DOMAnalyzer; 
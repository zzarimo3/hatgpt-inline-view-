/**
 * ChatGPT 인라인 뷰 - 옵션 페이지 스크립트
 * 사용자 설정을 관리합니다.
 */

// 기본 설정값
const DEFAULT_SETTINGS = {
  autoInitialize: true,
  compactView: false,
  refreshInterval: 1000,
  theme: 'auto',
  showLineNumbers: true,
  maxMessagesShown: 50,
  debugMode: false
};

// DOM 요소
const elements = {
  autoInitialize: document.getElementById('autoInitialize'),
  compactView: document.getElementById('compactView'),
  refreshInterval: document.getElementById('refreshInterval'),
  theme: document.getElementById('theme'),
  showLineNumbers: document.getElementById('showLineNumbers'),
  maxMessagesShown: document.getElementById('maxMessagesShown'),
  debugMode: document.getElementById('debugMode'),
  saveButton: document.getElementById('saveButton'),
  resetButton: document.getElementById('resetButton'),
  statusMessage: document.getElementById('statusMessage')
};

// 설정 저장
function saveSettings() {
  const settings = {
    autoInitialize: elements.autoInitialize.checked,
    compactView: elements.compactView.checked,
    refreshInterval: parseInt(elements.refreshInterval.value, 10),
    theme: elements.theme.value,
    showLineNumbers: elements.showLineNumbers.checked,
    maxMessagesShown: parseInt(elements.maxMessagesShown.value, 10),
    debugMode: elements.debugMode.checked
  };
  
  // 유효성 검사
  if (settings.refreshInterval < 500 || settings.refreshInterval > 5000) {
    showStatusMessage('URL 변경 확인 주기는 500ms에서 5000ms 사이여야 합니다.', 'error');
    return;
  }
  
  if (settings.maxMessagesShown < 5 || settings.maxMessagesShown > 100) {
    showStatusMessage('최대 표시 메시지 수는 5에서 100 사이여야 합니다.', 'error');
    return;
  }
  
  // 설정 저장
  chrome.storage.sync.set({ settings }, () => {
    showStatusMessage('설정이 저장되었습니다.', 'success');
  });
}

// 설정 불러오기
function loadSettings() {
  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || DEFAULT_SETTINGS;
    
    // UI 업데이트
    elements.autoInitialize.checked = settings.autoInitialize;
    elements.compactView.checked = settings.compactView;
    elements.refreshInterval.value = settings.refreshInterval;
    elements.theme.value = settings.theme;
    elements.showLineNumbers.checked = settings.showLineNumbers;
    elements.maxMessagesShown.value = settings.maxMessagesShown;
    elements.debugMode.checked = settings.debugMode;
  });
}

// 기본값으로 재설정
function resetSettings() {
  // UI 업데이트
  elements.autoInitialize.checked = DEFAULT_SETTINGS.autoInitialize;
  elements.compactView.checked = DEFAULT_SETTINGS.compactView;
  elements.refreshInterval.value = DEFAULT_SETTINGS.refreshInterval;
  elements.theme.value = DEFAULT_SETTINGS.theme;
  elements.showLineNumbers.checked = DEFAULT_SETTINGS.showLineNumbers;
  elements.maxMessagesShown.value = DEFAULT_SETTINGS.maxMessagesShown;
  elements.debugMode.checked = DEFAULT_SETTINGS.debugMode;
  
  // 저장
  saveSettings();
  showStatusMessage('설정이 기본값으로 재설정되었습니다.', 'success');
}

// 상태 메시지 표시
function showStatusMessage(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message ${type}`;
  elements.statusMessage.style.display = 'block';
  
  // 3초 후 메시지 숨기기
  setTimeout(() => {
    elements.statusMessage.style.display = 'none';
  }, 3000);
}

// 이벤트 리스너 등록
function setupEventListeners() {
  elements.saveButton.addEventListener('click', saveSettings);
  elements.resetButton.addEventListener('click', resetSettings);
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
}); 
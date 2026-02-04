# 💻 Windows WSL2 개발 환경 가이드

본 프로젝트는 **Windows 환경에서 WSL2(Windows Subsystem for Linux 2)** 를 사용하여  
개발 및 실행하는 것을 권장합니다.

아래 절차를 순서대로 진행하면 **Windows + WSL2 + VS Code** 기반 개발 환경을  
문제없이 구성할 수 있습니다.

---

## 1. WSL2 설치 및 설정
1. PowerShell을 관리자 권한으로 실행 후 아래 명령어를 입력합니다.
```text
  wsl --install
```
2. 설치 완료 후 PC를 재부팅합니다.
3. vscode 실행 합니다.
4. Ctrl + Shift + P 입력 후 상단 Command Palette(명령 팔레트)에서 wsl 입력 합니다.
5. 메뉴 중에 WSL: Connect to WSL in New Window 혹은 WSL: 새 창에서 WSL에 연결 을 클릭 합니다.
6. 새 창(vscode) 에서 Ctrl + ` 입력 하여 터미널 창을 엽니다.
7. 프로젝트 폴더를 생성 합니다.
```bash
~$ mkdir wsl-workspace
~$ cd wsl-workspace
```
8. git clone 주소를 복사 붙여넣기 합니다.
```text
git clone https://gitlab.wisenut.kr/enterprise-project/clt/clt-chatbot-system-mk1.git
```
  - SSL 인증서 오류가 발생할 경우 (SSL 검증 일시 중단)
  ```text
  git config --global http.sslVerify false
  git clone https://gitlab.wisenut.kr/enterprise-project/clt/clt-chatbot-system-mk1.git
  ```
  - 인증(Authentication) 오류가 발생할 경우
    1. GitLab 웹사이트에 로그인합니다.
    2. 우측 상단 프로필 클릭 → Settings (또는 Preferences) → 왼쪽 메뉴에서 Access Tokens 클릭.
    3. Token name을 정하고(예: wsl-git), Scopes에서 read_repository, write_repository를 체크합니다.
    4. Create personal access token 또는 Add new token 을 클릭한 뒤 생성된 토큰 문자열을 복사합니다. (이때 아니면 다시 볼 수 없으니 주의!)
    5. 터미널에서 git clone을 다시 시도하고, Password 입력란에 이 토큰을 붙여넣으세요.

  - 윈도우나 Git 설정에 꼬여 있을 경우 (계정 정보 재입력 강제하기)
  ```text
  # 현재 세션의 인증 정보 캐시 삭제
  git config --global --unset credential.helper
  git clone https://아이디@gitlab.wisenut.kr/enterprise-project/clt/clt-chatbot-system-mk1.git
  ```
  - 이후에 물어보는 Password란에는 발급받은 토큰을 입력하는 것이 가장 확실합니다.
9. 프로젝트 실행 && 종료
```bash
~/wsl-workspace$ cd clt-chatbot-system-mk1/01.workspaces/infra/
### 실행
~/wsl-workspace/clt-chatbot-system-mk1/01.workspaces/infra$ doker-compose up -d
### 종료
~/wsl-workspace/clt-chatbot-system-mk1/01.workspaces/infra$ doker-compose down
```

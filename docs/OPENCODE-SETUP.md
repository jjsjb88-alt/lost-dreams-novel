# OpenCode의 반복 권한 요청과 GitHub 계정 선택

두 창은 서로 다른 로컬 프로그램에서 나온다. 작가 승인 지침만 바꿔서는 없어지지 않는다. 아래 설정은 팝업이 뜨는 Windows PC에서 적용해야 한다. 클라우드에서 문서를 수정하거나 push한 것은 Windows 설정을 실행한 것이 아니다.

## 프로젝트 밖의 worktree 접근

이 저장소의 `opencode.json`은 스크린샷에서 확인된 프로젝트 작업 공간인 `~/.local/share/opencode/worktree/010406/**`에 대한 `external_directory` 요청을 자동 허용한다. `~`는 해당 PC의 사용자 홈으로 확장되므로 Windows 사용자 이름을 파일에 넣지 않는다. 이 프로젝트의 `records-r1` 등 하위 worktree에 적용되며, 다른 프로젝트 디렉터리를 일괄 허용하지 않는다.

Windows 원본 소설 저장소에서 최신 main을 받은 뒤 OpenCode를 재시작해 프로젝트 설정을 다시 읽게 한다. 진행 중인 작업이 있으면 먼저 상태를 기록한다. 현재 뜬 요청을 처리하려면 그 경로를 확인하고 `항상 허용`을 선택할 수 있지만, 그 선택은 현재 OpenCode 세션에만 적용된다.

다른 PC에서 작업 공간의 프로젝트 디렉터리 이름이 다르면 실제 요청에 표시된 **그 프로젝트의 상위 경로**로 설정 패턴을 바꾼다. 전체 홈이나 모든 프로젝트의 worktree를 허용할 필요는 없다. 에이전트별 규칙이나 더 높은 우선순위 설정이 `ask`를 지정하면 해당 규칙도 확인한다. 이 설정은 외부 경로 접근만 허용하며 `edit`·`bash` 등 각 도구의 별도 권한은 그대로 적용된다.

## GitHub의 Select an account

`jbseo-commits`와 다른 계정이 함께 나오는 창은 Git Credential Manager의 계정 선택이다. 해당 저장소의 HTTPS 인증 계정을 고정하려면 Windows의 **원본 소설 저장소 폴더**에서 아래 명령을 한 번 실행한다.

```powershell
git config --local credential.https://github.com.username jbseo-commits
```

이 Git 로컬 설정은 커밋하거나 push할 파일이 아니다. 같은 Git 공통 설정을 사용하는 worktree에도 적용된다. 기존 로그인된 `jbseo-commits`의 인증을 사용하며, 다른 계정을 삭제하지 않는다. 인증이 만료됐거나 저장된 인증이 없으면 실제 로그인이 한 번 필요할 수 있다. `git config user.name`은 커밋 작성자 설정이므로 이 계정 선택 문제를 해결하지 않는다.

설정과 최신 파일을 받은 뒤 OpenCode를 다시 시작한다.

```powershell
git config --local credential.https://github.com.username jbseo-commits
git pull --ff-only origin main
```

SSH 원격에는 이 HTTPS 설정을 적용하지 않는다. 화면에서 확인하지 않은 비밀번호·토큰을 채팅에 입력하거나 인증 저장소를 비울 필요는 없다.

## 공식 근거

- [OpenCode 외부 디렉터리·홈 경로·세션 승인](https://github.com/anomalyco/opencode/blob/dev/packages/web/src/content/docs/permissions.mdx)
- [OpenCode 프로젝트 설정과 우선순위](https://github.com/anomalyco/opencode/blob/dev/packages/web/src/content/docs/config.mdx)
- [Git Credential Manager 다중 계정 선택](https://github.com/git-ecosystem/git-credential-manager/blob/main/docs/multiple-users.md)

확인일: 2026-10-06. 설정 형식과 경로 범위는 확인했으며, 실제 Windows 팝업의 해소 여부는 해당 PC에서 확인한다.

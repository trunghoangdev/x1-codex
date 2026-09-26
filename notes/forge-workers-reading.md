# Ghi chú đọc hai CLI worker của Forge

Ngày đọc: 2026-09-26.

| Repo | HEAD đã đọc |
|---|---|
| `forge-worker-claude-code` | `4216f91634c32b807b72ad22442e644e41932bd7` |
| `forge-worker-codex` | `7cdd1a6aa9b1b49ba4c6501a981b3726223f8ba9` |

Ghi chú này chỉ dùng source và tài liệu trong hai repo worker. Không chứa nội dung
tài liệu cá nhân. Đã đọc README, contract `agent.task.v1`, luồng command/runtime,
configuration, credential, workspace, output, sandbox, transport và provenance;
đọc review history của Codex và các test tiêu biểu. Những phần Codex giống Claude
được đối chiếu bằng diff sau khi thay module import path, không giả định giống nhau.
Không khẳng định đã đọc từng test hoặc toàn bộ mã probe thử nghiệm.

Chỉ đọc, không sửa hai repo, không build, chạy test, chạy worker hay gọi provider.
Kiểm tra SHA-256 bằng script chỉ đọc: cả bảy vector pin của mỗi repo và pin tài liệu
`agent.task.v1` đều khớp file được vendor. Điều này xác nhận pin nội bộ khớp bytes,
không xác nhận conformance của implementation hay qualification của binary.

## Vai trò và ranh giới

Hai repo tích hợp runtime CLI thật, không viết lại planner/agent loop. Role của
worker được quyết định ở lớp công việc; worker không đồng nghĩa với developer.
Forge giữ authorization, evidence và governance; worker thực hiện việc trong
envelope được cấp rồi báo kết quả cùng observation của chính nó.

Cả hai là module Go 1.25.0, dependency ngoài standard library là `x/text` để
kiểm tra NFC. Không import internal packages của Forge. Work contract, protocol
và invocation configuration là ba lớp riêng.

- `agent.task.v1`: frozen read-only; input UTF-8, logical name không rỗng và không
  trùng; scope chính xác `["response"]`; đúng một response không rỗng, UTF-8,
  giữ nguyên bytes. Logical input không được diễn giải thành path.
- `agent.workspace-task.v1`: candidate mutable, không được đọc như schema đã
  frozen. Toàn bộ attempt-local working context writable; scope quyết định mục
  nào được đọc lại và trả về, không giới hạn từng thao tác trong workspace.
- Inference/provider transport có billing và provider-side effects; điều đó
  không trao quyền cho model thực hiện business effects bên ngoài.

## Luồng thực thi

Command nhận NDJSON qua stdin/stdout, kiểm tra conversation grammar rồi decode
body và contract trước khi gọi runtime. Runtime kiểm tra authority, envelope,
canonical configuration và material admission; chuẩn bị context/session/control
material; kiểm tra installation/socket; dựng bubblewrap; sau đó mới chạy vendor.

Hai authority pair được chấp nhận khi execute: `provider-api-egress` với
`brokered-session` hoặc `runtime-session`. Plan có thể biết cách dựng `none`
nhưng execute thật không nhận pair thiếu provider access/authentication.

`Inspect` chỉ tìm bwrap và kiểm tra file installation, không khởi động CLI hay
xác minh login. `Available=true` không chứng minh namespace dựng được hoặc một
lượt provider call sẽ thành công. Detail hiện còn diễn đạt thiên về brokered.

Mỗi run có HOME riêng, context tools qua MCP do chính adapter re-exec phục vụ.
Input read-only dùng tên file opaque và manifest nối logical name với bytes.
Ba tool là list/read/search context, chỉ tra manifest. Không có manifest được
khai báo là zero-input hợp lệ; manifest đã khai báo mà mất là lỗi.

## Các khác biệt cần nhớ

| Mặt thực thi | Claude Code | Codex |
|---|---|---|
| CLI | `claude -p --output-format stream-json` | `codex exec --json` qua `codex-run` |
| Lấy response | event `result` | `agent_message` cuối, cần `turn.completed` |
| JSONL lỗi | bỏ qua line unmarshal thất bại | từ chối malformed line; bỏ qua unknown event hợp lệ |
| Tool read-only | `--tools ""` và allowed MCP tools | disable danh sách feature native |
| Mutable tools | không thêm hai flag hạn chế read-only | không disable shell/unified_exec; vẫn disable browser/computer/plugins/code_mode_host |
| Tool fuse | 1.000; stream đếm `tool_use` | 32; stream chỉ đếm MCP call, không đếm native command |
| Mutable profile | `mutable-context/v1` | `governed-mutable-context/v1` |
| Nguồn workspace | cây nguồn tùy chọn, named input phủ lên cây | bắt buộc cây nguồn; input giữ riêng qua manifest/MCP |
| HOME trong boundary | `/tmp/forge-home` | `/run/forge-home`, state ở `.codex` bên dưới |
| Working root | `MkdirTemp("")`, dựa convention TMPDIR | từ chối TMPDIR thiếu/rỗng/relative/không phải directory |
| Environment hỗ trợ material | deployment env ngoài configuration | `material_environment` nằm trong configuration |
| Copy-in | skip symlink/special file | skip và ghi nhận; giữ source/destination root, exclusive create, chmod qua FD |
| Readback mỗi item | 4 MiB | 11 MiB; tổng changed content cũng 11 MiB |
| Trước gửi mutable result | writer kiểm tra ceiling | kiểm tra encoded ceiling trước khi đóng conversation, có error reply |

Hai tên mutable profile khác nhau nên không thể dùng một profile registry theo
kiểu thay binary mà bỏ qua expected boundary identity.

Claude README ghi 32 tool calls nhưng code hiện đặt 1.000, với comment nói rõ đó
là emergency fuse chưa được qualification như governance bound. Codex 32 chỉ
bounds MCP surface. Cả hai không có turn ceiling được authorize/enforce; wall
time, process/memory/workspace bounds phải đến từ nền tảng triển khai.

Codex dùng HOME ngoài `/tmp` vì repo ghi nhận runtime không publish editing
helper khi home ở temporary directory. Test helper thật không cần provider có
thể chứng minh helper xuất hiện và sửa subject; không chứng minh model tự dùng
helper thành công trong toàn bộ governed provider-backed execution.

## Credential và configuration

Brokered: real credential ở host broker; runtime nhận placeholder và trust
anchor để broker terminate TLS rồi thay credential. Delegated: grant cho phép
runtime giữ session copy, không nhận terminating trust anchor hoặc placeholder.
Hai posture khác authority, không phải hai cách spelling của cùng quyền.

Claude brokered thêm `--bare`; delegated bỏ flag đó và chỉ copy
`.credentials.json` vào root riêng, đặt `CLAUDE_CONFIG_DIR`. Enrollment source
không được mount hoặc ghi ngược. Codex copy enrolled tree qua held root vào
attempt-local state, skip links/special files và từ chối copy rỗng.

Cả hai resolve `identity@generation=absolute-path` từ deployment declaration.
Configuration bind fingerprint của identity, generation và location, không hash
credential bytes. Operator chịu trách nhiệm tăng generation khi thay enrollment.
Không có implicit discovery/fallback sang account ambient.

Compose-configuration chạy trước authorization để derive statement. Canonicalize
không tự đọc deployment state. Correct hand-written fingerprint vẫn có thể
resolve: đây là kiểm tra statement đang có hiệu lực, không attest ai viết config.
Claude composer nhận đầy đủ selection struct; Codex composer hiện chỉ nhận model,
delegation và working-context source, chưa expose mọi field config qua CLI này.

Codex brokered định nghĩa provider riêng, dùng Responses API với
`supports_websockets=false` và credential lấy từ env. Không chạy login để ghi
placeholder xuống disk. Delegated không chọn custom brokered provider.
Wrapper kiểm tra posture, từ chối API-key/placeholder env hiện diện khi delegated.
Đây là implementation của HEAD đã đọc, không phải hướng dẫn vendor áp dụng chung
cho mọi phiên bản CLI.

Material admission là exact path từ deployment, không phải arbitrary path được
configuration tự cấp quyền. Claude yêu cầu canonical spelling nguyên trạng;
Codex clean path khi so sánh. Cả hai admission chỉ theo pathname, không chứng minh
object identity/provenance của material được mount sau đó.

Environment có trust khác nhau: Claude nhận env hỗ trợ material qua deployment,
bảo vệ các tên được chính posture hiện hành dựng; Codex nhận list trong config,
chặn HOME/state/credential/CA/proxy và NO_PROXY. Không suy rộng các kiểm tra tên
này thành bảo đảm mọi loader/runtime variable tùy ý đều an toàn.

## Workspace và outcome

Copy-in giới hạn 20.000 files, 4 MiB/file, 256 MiB tổng. Preserve executable bit
của source thành owner execute, không mang setuid/setgid hoặc group/other bits.
Giới hạn copy-in không phải quota cho những gì runtime ghi sau đó. Codex yêu cầu
TMPDIR được khai báo nhưng không tự kiểm tra filesystem đó thực sự có quota.

Baseline lấy từ context đã materialize. Absent và empty phân biệt rõ:
absent→present là create, present→bytes khác là modify, unchanged không trả về;
present→absent làm từ chối vì output content không biểu diễn deletion. Codex
scan để diagnostic nêu thêm các changed item mất theo lượt bị từ chối.

Readback dùng `os.Root`. Claude kiểm tra regular leaf và đối chiếu opened FD,
bounded reader; Codex đi qua từng parent để từ chối symlink, kiểm tra size trước
và sau ReadFile. Đây là các cơ chế khác nhau; không gom thành tuyên bố cả hai
đã loại mọi race hoặc đã chứng minh confinement HELD.

Output mutable gồm changed UTF-8 items và đúng một change-set, kể cả khi empty.
Statement name được chọn ngoài toàn bộ scope để tránh collision. Hai worker
chọn base name khác nhau; canonical payload semantics mới là phần cần đối chiếu.
Codex kiểm tra agreement item/statement tại wire boundary; Forge vẫn phải kiểm
tra độc lập, worker tự báo compliance không thay thế verification.

Change-set schema `forge.workspace-change-set.v1`: sorted names, create/modify,
type tag và content SHA-256. Reject invalid UTF-8, control characters, non-NFC
identity và digest không đúng lowercase grammar; không tự sửa identity.
Claude dùng JSON encoder với declaration order phù hợp và tắt HTML escaping;
Codex tự sort member/encode string. Cả hai pin cùng published vector packet.

Cả hai hiện gửi runtime account bằng diagnostic `event` trước terminal result,
không biến account thành output artifact. Một số comment cũ vẫn nói bị bỏ.
Account, command-event tally và filesystem-derived changes là ba loại thông tin
khác nhau; lời runtime nói đã sửa/test không chứng minh điều đó đã xảy ra.

Codex có diagnostic retention và raw command-event capture opt-in. Retained tree
không phải authorized output hoặc successful outcome; copy có thể skip entries
và vẫn chịu copy-in ceilings. Không nên coi retained copy là snapshot đầy đủ mặc
định hoặc là evidence độc lập.

## Transport, containment và claim strength

Worker Protocol v0.1: strict field spelling/unknown fields/duplicate keys, 16 MiB
message ceiling, newline framing, state machine trước body. Framing lost không
reply; complete invalid frame có bad-input. Error vocabulary có bốn code; runtime
failures kể cả unconfinable đều đi ra `execution-failed`.

Optional input `artifact_digest` được wire validate nhưng hai runtime không mang
nó vào Input nội bộ. Hợp đồng reasoning hiện tại không xây exact artifact relation
từ field đó. Không suy ra content hash là governed artifact identity.

Bubblewrap dựng view từ các mount được chọn, unshare pid/ipc/uts/network,
die-with-parent và process-group cancellation. System read-only mounts gồm cả
`/usr`, `/bin`, libraries và CA files: không phải chỉ đúng hai executable.
Private scratch/runtime state có thể writable ngoài governed subject.

Egress relay chỉ forward TCP loopback→Unix socket, tối đa 64 connections; policy
ở phía host. Socket được kiểm tra type, safe ancestry và Confirm trước mount.
Root/effective UID thuộc trust domain của kiểm tra này; không phải isolation
giữa các workload cùng UID nhưng không tin nhau.

Codex có guard namespace collision cho execution material với tên do sandbox
đặt từ nguồn khác, gồm control/input/workspace/home/state/tmp/proc/dev. Claude
HEAD đang đọc chưa có guard tương ứng trong sandbox production.

Mỗi worker báo đúng một component `engine`, `runtime-resolved`, thường
`self-measured`, continuity `by-path`. File descriptor được giữ và hash nhưng
bwrap mount resolve pathname lần nữa. Không claim pinned. Re-exec adapter không
được bịa thành subordinate role `adapter-self`; host đo adapter riêng.

Object identity tests/probes opt-in không phải production object-binding fix.
Một số probe dùng modeled hop chain; các comment còn nêu `--ro-bind-fd` có thể
resolve thành pathname. Không đọc tên một flag hoặc một test xanh thành bảo đảm
measured object chính là object đã chạy.

## Đọc trạng thái qualification

README Claude mô tả readonly brokered/delegated đã có witnessed posture, mutable
chưa qualified. README Codex ghi established brokered baseline và các limitations,
nhưng vẫn còn câu lịch sử “has not been committed” dù repo có HEAD rõ ràng.
Những câu status này cần gắn với thời điểm, artifact và evidence riêng; đọc source
hiện tại không cấp qualification mới hoặc tái xác minh những execution đã kể.

Các test đã xem phân biệt subprocess stub, real bwrap, real vendor startup/helper,
và provider-backed whole-run witness. Test helper có thể skip nếu không khai báo
runtime installation. Không chạy suite trong phiên này, nên không tuyên bố pass.

Kết luận để dùng cho việc tiếp theo: hai worker cùng kiến trúc governance và
frozen readonly semantics; mutable vẫn có khác biệt đáng kể ở input/context,
profile, environment, quota convention, diagnostics và output ceiling. Khi dùng
thay thế nhau phải kiểm tra exact config/profile/contract/evidence của lượt cụ thể.

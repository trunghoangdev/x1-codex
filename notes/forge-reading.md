# Ghi chú đọc Forge

Ngày đọc: 2026-09-25. Source: `/home/trungh/ws_x1/forge`, HEAD
`1ca74048956affefddf05a0192d054279038c631`.

Ghi chú này chỉ tổng hợp nội dung từ Forge. Không đưa nội dung hai tài liệu
cá nhân đã đọc trước đó vào đây.

## Phạm vi và độ chắc chắn

Đã đọc sâu các contract cốt lõi và lần theo đường thực thi trong CLI, operator,
runtime, engine, storage, externalworker và verifier. Đã đọc thêm installation,
registry, qualification, contribution, delivery, remote admission và các test
crash/resume tiêu biểu. Đây không phải xác nhận đã đọc từng dòng của toàn bộ repo,
không phải security audit, và không phải kết quả chạy test.

Không sửa Forge, không build hay chạy test. Các nhận xét bên dưới là kết quả đọc
tài liệu và mã tại revision trên; việc một test có mặt không chứng minh nó đang pass.

## Forge đang thực hiện điều gì

Forge cung cấp nền tảng thực thi công việc có authorization, provenance, trạng thái
bền vững và evidence kiểm chứng độc lập. Assignment biểu đạt delegation ổn định;
attempt là một lần thực hiện cụ thể; artifact có danh tính bao gồm nguồn gốc và
dependencies, không chỉ hash của nội dung.

Các lớp đáng nhớ:

- `cmd/forge`: giao diện lệnh, chuyển việc sang operator/runtime.
- `internal/operator`: resolve installation, registry, trust, custody và các
  capability cần cho từng thao tác; điều phối contribution, delivery, resume.
- `internal/runtime`: chuẩn bị và thực hiện attempt, promotion, completion,
  assembly evidence; kết hợp các primitive thành luồng thực tế.
- `internal/engine` và `internal/attempt`: lifecycle grammar, append có kiểm tra
  trạng thái, replay và phân loại recovery.
- `internal/storage/filesystem`: objects/blobs theo digest, stream append,
  persistence, nonce và kiểm soát concurrent append.
- `internal/externalworker`: launch, handshake, protocol, đo executable,
  thiết lập boundary và thu nhận kết quả.
- `internal/verifier`: chạy tập obligation được chọn tường minh trên evidence.

## Một attempt đi qua hệ thống

1. Resolve material và kiểm tra admission; thiếu khả năng đánh giá khác với một
   quyết định từ chối sau khi đã đánh giá.
2. Plan xác lập identity của attempt. Create ghi attempt và genesis.
3. Authorization gắn proposal, policy decision, statement và signature với đúng
   assignment, attempt, actor, runtime, scope, grant, boundary và thời điểm.
4. Preparation ghi runtime binding, input references, prepared invocation và
   promotion requirement. Cấu hình cần cho invocation được giữ bằng identity.
5. Execute dựng request từ durable state và kiểm tra realization hiện tại còn
   khớp material đã ghim. `execution-started` phải bền vững trước execution.
6. Kết quả, blobs, observed identity, receipt và output binding được lưu trước
   khi ghi `execution-completed`.
7. Promotion tạo artifact từ kết quả đã ghi; admission là một fact riêng.
8. Assessment và quyết định approval/refusal hoàn tất phần governance sau đó.

Nguồn chính: `internal/runtime/prepared.go`, `run.go`, `promote.go`,
`internal/engine/attemptengine.go`, `docs/contracts/attempt.md`.

## Durability và recovery

Recovery phân biệt replay, phần persistence có thể hoàn tất xác định, và cửa sổ
external execution còn mơ hồ. Không suy ra worker chưa gây tác động chỉ vì không
còn process hay chưa có completion record.

`resume-attempt` có thật, nhưng phạm vi hẹp: hoàn tất các phần preparation được
phép, promotion từ Executed, hoặc admission từ Produced. Executing không được
đưa vào đường resume thực thi. Một retry không phải hồi sinh execution cũ.

Filesystem store sử dụng fsync, rename, fsync directory cho atomic publication;
nonce consumption và append đi cùng một durable entry. Lifecycle append dựa vào
snapshot đã kiểm tra và kiểm soát head thay đổi.

Đã đọc assertions của các test trong
`internal/runtime/execution_outcome_crash_test.go`: SIGKILL sau outcome durable,
reopen store, recover thành Executed, resume tới Admitted và kiểm tra executor
không được gọi lại. `internal/operator/resumeattempt_witness_test.go` kiểm tra
dispatch Executed/Produced và từ chối Executing. Đây là test mã nguồn đã đọc,
chưa chạy trong phiên này. Process-kill witness không bao phủ mọi lỗi mất điện.

## Worker và boundary

Protocol hiện tại là `worker-protocol/v0.1`; v0 giữ nghĩa lịch sử. Framing,
grammar, strict decoding và giới hạn kích thước đều thuộc contract. Input có thể
mang `artifact_digest` do host cung cấp; worker không tự suy identity đó từ bytes.

Trên Linux, host giữ fd của executable và đo image sau launch để ràng buộc bytes
được đo với image đang chạy. Handshake identity, image measurement, qualification
và observed executed components là các bằng chứng khác nhau.

Trình tự launch đáng chú ý: resource scope/reaper, workspace claim và tenant
placement trước process; kiểm tra identity thực tế và image trước handshake/work.
Worker chỉ nhận baseline environment và projection được khai báo. Cgroup, process
tree cleanup, egress broker và credential broker có các đường enforcement riêng.

Phải phân biệt boundary được khai báo, host đã thiết lập cơ chế gì, quan sát thu
được, và kết luận offline có thể đưa ra. Evidence không tự chứng minh mọi cơ chế
vật lý đã giữ đúng suốt execution.

## Artifact, output và contribution

Artifact identity khác content identity. Input reference nói provenance và
availability, không đồng nghĩa input đã được đánh giá tốt. Produced artifact phải
có admission được xác lập trước khi dùng làm input; chỉ có object trong store
chưa đủ. Imported origin không có producing attempt nên đường consumption được
mô tả hiện tại chưa hỗ trợ nó.

Opaque output đi qua typed-payload envelope. Với semantics phù hợp, nhiều item
được worker trả cùng một workspace change set: hệ thống kiểm tra đối ứng giữa
tên, type và digest của từng item với output binding. Host không tự sáng tác
aggregate thay cho kết quả execution. Change set hiện có create/modify, chưa có
delete. ExpectedOutputs của assignment được kiểm tra đối với inner payload type.

Luồng human contribution: work notice → intake và frozen snapshot → contributor
attestation → promotion → assessment → quyết định. Attribution của contributor
không phải assessment chất lượng. Intake không cần signer; promotion không chạy
lại worker để tạo ra một kết quả mới.

## Trust, custody và qualification

Enrolment quyết định chữ ký nào được tính; custody quyết định host có thể yêu cầu
ai ký. Contract root được pin độc lập, không bootstrap từ chính lời khai trong
profile. Operating runtime không giữ capability quyết định approval của bên
approver; assessment checker cũng nằm ngoài custody của operating host.

Signer giữ khóa ngoài governing process và giới hạn purpose. Tuy nhiên caller
còn quyền truy cập endpoint vẫn có thể xin chữ ký cho subject trong purpose đó.
Tách process dưới cùng uid chưa tương đương tách principal/custody thực sự.

Registry là cấu hình local, mutable, unsigned. Với worker có artifact đo được,
trạng thái qualified phải tham chiếu governed qualification record và được
kiểm chứng cùng projection của registry. Không lấy nhãn qualified làm bằng chứng.
Qualification có readiness, evidence, independent offline result và final record;
offline verifier phải khác identity ký readiness.

Installation declaration, deployment spec, role definition và verification
profile có hệ version riêng. Provisioning suy representation từ quyết định đã
khai báo; không tự chọn governance. Profile generation theo policy thực sự được
khai báo, không theo số version mới nhất binary biết.

## Delivery và remote admission

Delivery là offer tới installation, khác assignment và khác attempt. Reservation
ghi ownership trước; planned record ghim attempt identity trước Create; accepted
disposition bền vững trước phần tiếp tục attempt. Kết quả attempt về sau không sửa
lại delivery disposition. Re-offer không được ngầm trở thành execution mới.

`internal/operator/nodetakeup.go` đi qua runtime chung với `forge run`; không có
một lifecycle thứ hai dành riêng cho poll. CLI có node poll/drain/undrain; không
nên suy ra một coordinator hay daemon hoàn chỉnh chỉ từ các lệnh đó.

Remote admission dùng evidence của nguồn cùng reliance được bên nhận khai báo
theo principal. Nó mở rộng fact bên nhận có thể xác lập; local authorization,
grant và boundary vẫn phải được kiểm tra.

## Evidence và verifier

Bundle mang material và proofs, không tự mang verdict đáng tin. Verifier bootstrap
bằng signed profile và root pin độc lập; engine không tự chọn default policy.
`structural/v0` tại revision này có implementation version 23. Completed pass,
completed fail và unable-to-evaluate là kết quả khác nhau; obligation order có
tính xác định và kết quả dừng ở failure đầu tiên.

Structural checks gồm cả các điều kiện profile mà implementation hỗ trợ, ví dụ
boundary ceilings và executed-component assurance; pass không là phán quyết tổng
quát về chất lượng công việc hay confinement vật lý.

Assembly dùng persisted attempt state **cùng pinned deployment trust configuration**.
`internal/runtime/assemble.go` nêu rõ giới hạn: retire key trước khi export các
stream lịch sử có thể khiến proof lookup không còn tìm được key cần thiết dù
proof vẫn nằm trong store. Vì vậy không được diễn đạt là hoàn toàn chỉ phụ thuộc
attempt state. Closure walker cũng ghi rõ giới hạn nhận diện reference bằng
digest grammar; không phải chứng minh độc lập với mọi schema có thể có.

Evidence của dependent attempt không tự chứng minh toàn bộ lịch sử admission của
input; producing attempt có package riêng. Không suy một verdict bao trùm cả graph.

## Tài liệu cần đọc với revision cụ thể

Có mô tả thuộc các giai đoạn cũ còn tồn tại cạnh implementation mới:

- Một số overview/README còn gọi worker protocol v0, trong khi contract hiện tại
  và registry dùng v0.1.
- Bảng trong verification-profiles còn mô tả executed-component policy chỉ được
  mang theo; `executedcomponentpolicy.go` thực thi nó và lịch sử implementation
  version ghi thay đổi từ 17.
- `installation.md` đã mô tả declaration v6 và profile v4, nhưng một đoạn cũ
  bên dưới vẫn nói không có verification-profile/v4.
- Header cũ trong CLI nói không resume; dispatcher hiện có `resume-attempt`, với
  giới hạn an toàn nêu trên.

Đây là những chỗ cần đối chiếu contract, code và test; chưa sửa vì Forge chỉ được
đọc trong phạm vi quyền người dùng đã cấp.

## Cách kiểm chứng repo về sau

`dev/README.md` phân biệt dev, linux và privileged. Linux witnesses cần cgroup
delegation và bubblewrap; suite tạo scope riêng theo package. Crash-point build
là một chiều kiểm chứng riêng. Không quy test skip do thiếu host capability thành
pass, cũng không quy mọi lỗi môi trường thành regression.

Điểm xuất phát cho trao đổi tiếp theo: Forge đã có chuỗi thực thi, material,
recovery và verification cụ thể; từng claim phải gắn với lớp đang thực hiện nó,
policy áp dụng, version và giới hạn bằng chứng tương ứng.

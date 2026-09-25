# Ghi chú đọc forge-software-factory

Ngày đọc: 2026-09-25. Source: `/home/trungh/ws_x1/forge-software-factory`.
HEAD: `f25def284034d71be812bcaf35b858ba8e73e555`.

Đã đọc toàn bộ code production trong ba command và `internal/taskrun`, tài liệu
kiến trúc/vận hành, objective được commit, toàn bộ findings và production ledger.
Đã khảo sát danh mục test và đọc các test tiêu biểu về CLI, retention, cleanup,
work-product integration và validation. Không khẳng định đã đọc từng test.

Chỉ đọc source; không chạy command của sản phẩm, build, test, provider call hay
sửa repo. Các kết quả production dưới đây là những gì ledger ghi nhận, không
phải các execution mình tái kiểm chứng trong phiên này. Ghi chú chỉ dùng nội dung
từ repo này và kiến thức về source Forge đã đọc; không sao chép tài liệu cá nhân.

## Vai trò của repo

Software Factory là một specialization làm công việc phần mềm qua Forge. Nó sở
hữu ý định công việc, tiêu chí phần mềm, cách giữ attempt/candidate và dựng cây
để đánh giá. Forge sở hữu governed execution, authorization, artifact và evidence.

Repo không có server, UI hay database. Module Go 1.25.0 không khai báo dependency
ngoài standard library. Factory gọi CLI và đọc các JSON surface của Forge; không
import internal packages hay đọc layout object/blob store của Forge.

Nguyên tắc phát triển: công việc thật tạo ra áp lực; phân loại finding đúng owner,
sửa tối thiểu rồi quay lại công việc đó. Tự động hóa phần tái dựng xác định trước
phần phán đoán kỹ thuật. Sơ đồ các role/lifecycle trong development principles là
định hướng ranh giới, không phải bằng chứng các subsystem ấy đã tồn tại.

## Các identity và nguồn sự thật

- `WorkID`: identity được mint cho một đơn vị công việc còn tiếp tục qua nhiều
  lần restate assignment. Optional để assignment cũ vẫn hợp lệ.
- `Assignment.ID`: một statement của công việc. Thay scope/base/validator và
  supersede statement thì có ID mới, có thể giữ cùng WorkID.
- Factory attempt ID: một lần chạy được Factory giữ hồ sơ; khác governed
  `AttemptDigest` mà Forge trả về.
- Artifact identity và candidate: kết quả của governed attempt, được lấy qua
  surface work-product và giữ cùng identity envelope.

Work/attempt ID dùng UTC timestamp và 8 random bytes. Kiểm tra WorkID chỉ chứng
minh đúng spelling mà generator dùng; không chứng minh ai đã mint hay uniqueness
tuyệt đối. Assignment khác nhau có thể khai báo membership cùng WorkID.

Retention layout: có WorkID thì `<root>/<work_id>/attempts/<attempt_id>`;
không có thì `<root>/attempts/<attempt_id>`. Attempt directory được tạo exclusive.
Handle trả về chỉ gồm identity và đường dẫn. `attempt.json` mới thiết lập lịch sử.

## Installation và assignment

Installation descriptor riêng của Factory có version 1 và bốn giá trị:
platform binary, Forge deployment path, work-template path, retention root.
Nó tham chiếu deployment của Forge, không thay thế hay restate schema đó.

Assignment chứa objective file, nguồn làm việc, output scope, required effect
paths, validator, publication criterion, execution material và expected payload
type. Không chọn worker/model/runtime/credential.

Nguồn là một trong hai dạng:

- repository local + full 40 lowercase hex object identity; resolve về commit;
- prepared working context được cung cấp tường minh.

Repository form là đường thông thường. `git archive` dựng committed tree, không
lấy index, file chưa commit hay `.git`. Đây chưa phải portable source locator hay
cam kết lưu revision lâu dài, và chưa hỗ trợ mọi object format Git có thể dùng.

Objective phải nằm trong assignment cả về lexical path và resolved symlink;
được gộp thành một dòng và thay `VALIDATOR_PATH` trước khi gửi.

## Đường chạy hiện tại

`run-assignment -assignment ... -installation ...`:

1. Đọc Go build stamp; production từ dirty/unstamped harness bị từ chối trừ khi
   operator nêu development reason. Đây là provenance check, không là release
   signature hay hệ phân phối binary.
2. Load installation và assignment; kiểm tra required paths được scope cho phép,
   xuất hiện literal trong objective, và material/source có thể đọc.
3. Gọi publication criterion trên các tên Factory đã chọn, với source subject
   đúng revision. Criterion nhận PATH và `GIT_TERMINAL_PROMPT=0`, không nhận toàn
   bộ ambient environment. Không chạy được khác với chạy rồi từ chối.
4. Kiểm tra objective sau composition: giới hạn 4096 bytes được copy từ Forge,
   UTF-8/control characters; NFC chưa được mirrored.
5. Mở record `open` dưới retention root có sẵn do caller sở hữu, trước execution.
6. Dựng working context và deployment/environment-profile riêng trong scratch,
   admit material assignment chọn; installation gốc chỉ được đọc.
7. Compose work request từ operator template. Chỉ thay objective, output scope và
   phần invocation configuration Factory sở hữu; RawMessage tránh làm tròn số
   hoặc diễn giải lại các giá trị operator cung cấp.
8. Gọi `forge run`; giữ stdout/stderr trước khi diễn giải. Exit thành công vẫn
   phải trả state admitted và identity attempt/artifact không rỗng.
9. Cleanup scratch, quan sát kết quả cleanup, rồi settle produced hoặc failed.

`-preflight-only` dừng trước entry point thực thi và không mở attempt. Nó không
chứng minh installation sẵn sàng chạy: test hiện cố ý cho binary/template/root
không tồn tại vẫn qua preflight-only. Các kiểm tra cần cho run nằm ở bước sau.

`RunAssignment` trực tiếp có preflight riêng; full `ValidateAssignmentForAttempt`
được command gọi trước nó. Không gộp phạm vi hai entry point thành một claim.

Một coupling cụ thể: material admission hiện đi qua
`FORGE_CLAUDE_CODE_ADMITTED_MATERIAL`, đọc chuỗi deployment → registry → runtime →
environment profile. Assignment trung lập về worker không có nghĩa toàn bộ
implementation Factory đã trung lập với mọi adapter.

## Retention và giới hạn durability

Record version 2 giữ expected payload type ngay khi mở attempt, để acceptance
sau đó không lấy tiêu chí từ một assignment đã bị sửa. Record giữ request digest,
không giữ composed request; giữ diagnostics nguyên bản và platform coordinates
khi đã đọc được chúng.

Not yet observed, process chưa từng start, exit code, và signal termination được
phân biệt. Nếu settle write thất bại, caller vẫn nhận locator cùng lỗi; không
được coi outcome trong memory là lịch sử bền vững.

Write record và publish candidate dùng staging/rename, **không fsync**. Claim là
process-lifetime persistence, không ngang với crash-durability của Forge store.
Cleanup được quan sát trên đường `RunAssignment` trả về; panic/SIGKILL/host crash
chưa được bao phủ. Cleanup fail khiến Factory outcome failed nhưng không xóa các
coordinates đã biết của artifact được Forge tạo.

Stdout/stderr được giữ nguyên; repo không chứng minh diagnostics không có secret.
Platform stream buffers cũng không được giới hạn kích thước trong `run.go`.

## Work product và candidate

`TakeWorkProduct` đọc artifact identity và expected type từ attempt record,
gọi `forge work-product`, rồi kiểm tra:

- response trả đúng artifact được hỏi;
- payload schema là typed-payload/v1 và type đúng với attempt;
- typed-payload được dựng lại có content digest như đã khai báo;
- bytes base64url giải mã có blob digest đúng và không rỗng.

Artifact → payload vẫn là assertion của resolver: response không chứa đầy đủ
origin/inputs/supersession để Factory tự tính artifact identity. Full independent
verification là việc của evidence/verifier, không phải retrieval này.

Candidate giữ bytes và envelope cùng nhau, không ghi đè candidate đã nhận.
Reopen kiểm tra lại cùng acceptance terms và bytes trên disk; nó không tái chứng
minh platform từng phát biểu envelope ấy. Attempt record không bị biến thành
record phán xét chất lượng candidate.

## Materialization và validation

`materialize-candidate` đọc attempt, assignment, installation và destination:

1. Đòi assignment ID trùng record và repository base đã cố định.
2. Take candidate nếu chưa có; nếu có thì reopen, không accept lại.
3. Kiểm tra change set có đủ required effect paths.
4. Đọc item references; gọi `forge work-product-item <artifact> <digest>` cho
   từng body; kiểm tra artifact, digest và bytes được trả về.
5. Dựng base + đúng body của candidate trong staging rồi rename tới destination
   mới. Không dùng worker workspace để assessment.
6. Chạy validator assignment khai báo, không arguments, cwd là cây vừa dựng;
   lưu observation vào `validation.json` cạnh attempt.

Đây là phần đã có ở HEAD dù một số prose cũ nói command dừng ở dựng tree.
Validation observation gồm assignment/attempt/candidate digest, validator path,
timestamp, executed, termination/exit và diagnostics. Validator trả nonzero là
một observation thành công của command, không làm command tự reject/retry/delete
candidate. Không invoke được hoặc không lưu được observation thì command fail.

Diagnostics được truncate còn 64 KiB cộng thông báo khi lưu; code vẫn buffer toàn
bộ output trước đó, nên đây không phải giới hạn memory khi validator đang chạy.
`validation.json` được thay bằng rename cho lần observation sau, không phải ledger
append-only của mọi lần validation.

Các giới hạn cần nhớ khi nói “exact candidate”:

- Assignment sau execution chỉ được so ID, chưa có digest binding toàn bộ
  historical assignment; base, required paths, validator lấy từ file đang đọc.
- Materializer kiểm tra local path, duplicate name và body digest; không phải
  một implementation kiểm chứng đầy đủ mọi semantics của change-set contract.
- Production code này không tự thực hiện approval, authoritative repository
  effect, commit hay push. Nó tạo subject và observations cho người đánh giá.

## Điều lịch sử production thực sự ghi nhận

Ledger có các work item 1–20 và hai công việc về WorkID/installation mang identity
được sinh. Không dùng counters đầu file (7 completed, 11 effects) làm tổng hiện
tại: ledger tự ghi chúng đã stale và closure rows mới là authority.

Các mốc đáng nhớ:

- Các item đầu trả giá cho configuration/handshake/material/diagnostics và việc
  required effect bị nhầm với authorized output scope.
- Item 5 kết thúc NO CHANGE: yêu cầu sửa terminality sai với recovery semantics.
  Hoàn tất công việc không nhất thiết tạo repository effect.
- Nhiều effect là factory-originated rồi được sửa tay dưới review; ledger ghi rõ
  điều này. Không được tóm tắt tất cả là candidate được áp dụng nguyên vẹn.
- Item 9 giữ nguyên candidate khi chính validator bị falsify; sửa instrument
  không đồng nghĩa worker phải làm lại.
- Item 16–18 phơi bày khoảng cách giữa producer, published vectors và consumer:
  positive-only packet không đo refusal semantics; packet thay đổi trong lúc
  candidate đang được giữ review.
- Item 19 cần thêm repair sau commit vì producer qualification-bundle không theo
  contract consumer đã đổi; witness producer→consumer mặc định là phần còn thiếu.
- Item 20 là sửa test xác định, không có provider attempt; control script phải
  dùng exit status đúng làm verdict và có negative control cho chính nó.
- Hai job sau tạo WorkID và Factory installation descriptor; không cần đổi Forge.

Recurring lesson trong ledger: requirement phải có nơi được phép implement và
material đủ để hiểu nghĩa; witness phải phân biệt đúng claim; một lỗi trong
assignment/validator không được gán thành lỗi candidate. Các bước review nêu trong
ledger là lịch sử vận hành, không tự chứng minh có role/workflow engine trong repo.

## Findings còn phải đọc trong bối cảnh thời gian

Findings giữ nguyên nhiều phân tích lịch sử và status chưa cập nhật theo mọi
thay đổi sau đó. Ví dụ “chưa có candidate để approve” không thể dùng làm mô tả
production hiện tại; điều code vẫn cho thấy là approval chưa được triển khai tại
đây. README mô tả materialization tốt nhưng chưa nói rõ validator invocation mới
ở HEAD. Cần đọc current code, closure rows và mốc thời gian cùng nhau.

Các seam được repo nêu rõ: portable intent còn trộn host-local paths; completed
assignment và installation material chưa được giữ hoàn chỉnh trong repo; cleanup
qua abrupt exit chưa thiết lập; publication gate toàn candidate vẫn riêng với
preflight tên; scope governs thứ được lấy ra, không tự chứng minh mọi write ngoài
scope bị ngăn hoặc được quan sát.

## Test đã đối chiếu và điều chưa kết luận

Đã đọc test CLI chứng minh preflight-only không cần usable execution inputs;
test cleanup failure giữ coordinates và báo failed; test record replacement
giữ record cũ khi write mới bị cản; test materialize-candidate phân biệt validator
pass/refusal/could-not-run và giữ cây/candidate/observation.

Release-backed work-product integration test là Linux, opt-in bằng bốn env vars;
thiếu input thì SKIP. Các fake-platform test đo accounting và refusals của Factory,
không thay thế việc chạy với released Forge. Không test nào được chạy trong phiên
đọc này, không có kết luận suite đang xanh hay production host đang healthy.

Mức hiểu hiện tại: Factory đã có đường chạy, giữ hồ sơ, retrieval, materialization
và validator observation cụ thể; phần phán đoán, approval và effect vẫn phải phân
biệt với automation có mặt trong code.

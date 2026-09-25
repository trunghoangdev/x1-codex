# Ghi chú đọc DartMesh

Ngày đọc: 2026-09-25. Nguồn: `/home/trungh/ws_x1/dartmesh`, HEAD `97b7f0856101502950e6dc35c198cd1ceb82cb27`.
Đây là tổng hợp phục vụ làm việc, không phải quyết định kiến trúc mới. Chỉ đọc repo nguồn. Đã đọc README, toàn bộ 12 tài liệu trong docs, CONTRIBUTING, GOVERNANCE, SECURITY, CODE_OF_CONDUCT và LICENSE. Chưa kiểm tra triển khai Forge; không suy diễn quan hệ với x1 từ tài liệu DartMesh.

## Phạm vi

DartMesh định nghĩa reference architecture cho governed virtual organization: tổ chức có khả năng giải trình công việc do người, AI, công cụ deterministic hoặc hybrid thực hiện. Repo chứa khái niệm và các bất biến, chưa chứa mã triển khai. Forge được tài liệu xác định là nền tảng triển khai riêng. Runtime, vendor, wire format, storage, sandbox, scheduling và topology nằm ngoài phạm vi kiến trúc này.

Luồng khái niệm: goal → assignment → execution attempt [actor, worker, binding] → artifact → handoff → verification/assessment → approval theo policy → effect. Đây không phải pipeline cứng; policy quyết định hình dạng công việc và các gate cần thiết.

## Các phân biệt cần giữ

- Organization xác định mission, policy và cấu trúc accountability. Team điều phối assignment theo charter và tham chiếu role catalog dùng chung; team không sở hữu role và không nhất thiết phát hành mọi assignment nó điều phối.
- Role là trách nhiệm bền vững, có mandate, capability requirements, input/output contract, prohibited effects và accountability rules. Authority được trao cho actor, không tự có nhờ tên role.
- Assignment là delegation ổn định qua retry: objective, responsible role, accountable actor, approved inputs, expected-output contract, capability requirements và delegation policy/lifecycle. Thay đổi điều khoản hay accountable actor là delegation mới hoặc sửa đổi có ghi nhận.
- Attempt là một lần thử: executing actor, worker, binding, boundary, authorization và discriminator không tái sử dụng trong cùng assignment. Retry tạo attempt mới. Hai lifecycle độc lập và do policy xác định.
- Actor là identity chịu attribution; worker là bên thực hiện; binding mô tả cách worker tham gia một attempt. Cùng một người có thể là actor và worker nhưng hai ý nghĩa vẫn riêng. Model/engine là chi tiết tùy chọn phía dưới worker.
- Governance độc lập với producer và coordination. Bước nội bộ có thể riêng tư, nhưng sub-work đã được mô hình hóa thành governed assignment/attempt vẫn phải hiện diện theo policy.

## Authority và execution

Mandate, authority, authorization, grant, approval và policy có nghĩa riêng. Standing permission cho phép một lớp hành động; authorization là sự thực thi authority có xác thực, quy thuộc được cho một attempt hoặc effect cụ thể. Approval là quyết định mà policy yêu cầu, không thay cho effect authorization.

Grant quy định điều gì được phép; boundary mô tả phạm vi vận hành; evidence giúp xác lập enforcement thực tế. Boundary rộng hơn không tăng quyền, hẹp hơn không thu hồi authority. Policy, mandate, delegated authority, assignment constraints và grant tạo các giới hạn: tầng dưới không được nới điều cấm ở tầng chi phối.

Boundary phải được khai báo trước khi authorization ràng buộc nó; sau đó mới hiện thực hóa boundary và chạy. Declared, realized và held là ba trạng thái khác nhau. Authorization hợp lệ không chứng minh containment thành công.

Attempt authorization ràng buộc assignment, attempt, role, các actor liên quan, worker/binding, input/output contract, capabilities, grant và boundary. Effect authorization có hình dạng riêng: effect identity, target, parameters, risk, expiry/replay và idempotency/reconciliation/compensation thích hợp. Không mặc định mọi việc đều cần người duyệt.

## Artifact, handoff và evidence

- Artifact envelope bất biến. Content identity định danh payload; artifact identity định danh toàn bộ envelope gồm origin và provenance. Approval/handoff gắn artifact identity, không chỉ hash nội dung.
- Origin phân biệt produced (assignment + attempt) và imported root. Provenance gồm origin và input references. Handoff không phải đường import thứ hai.
- Supersession declaration và activation là hai việc riêng. Tạo artifact mới không tự cho quyền vô hiệu hóa artifact cũ. Effective supersession truyền staleness qua hard dependency; các dependency khác theo policy. Stale output phải được đánh giá lại, sửa hoặc chặn delivery.
- Handoff là transfer contract: source, receiver, exact artifacts, acceptance contract, status, governing policy. Accepted không phải assignment fulfilled; handoff thay thế là withdrawn, không gọi là superseded.
- Evidence là vai trò của material đối với claim, không phải loại object đồng nhất với artifact hay log. Evidence gắn subject/claim thích hợp, không bị ép hết vào attempt và không thuộc sở hữu của binding.
- Verification dành cho claim có thể kiểm tra lại; assessment dành cho judgment có provenance, rationale và accountability. Not established là kết quả hợp lệ khi thiếu material; không thay claim cần chứng minh bằng một claim yếu hơn.
- Governed identity phải được công bố qua authoritative governed surface trước khi bên khác dựa vào nó. Role phải referenceable trước delegation đầu tiên. Consumer không tự suy identity từ tên, schema, vị trí hay thứ tự.
- Mutable state có thể giúp tìm candidate; durable governed evidence mới xác lập lịch sử. Mọi constituent của một proposition tổng hợp phải còn reconstructable. Attribution phải tồn tại cả khi authority ban đầu không còn chạy.

## Trust và tổ chức qua nhiều authority

Evaluator tự chọn trust anchors theo scope. Authentication chỉ xác lập nguồn gốc; entitlement và correctness cần kiểm tra riêng. Kết luận gắn thời điểm, anchors và assumptions; các evaluator có thể kết luận khác nhau.

Một tổ chức có thể được hiện thực qua nhiều local governed authorities:

1. Participation phải có governed material đủ tái dựng lịch sử. Cùng tên, cấu hình hay trust anchor không chứng minh membership.
2. Composition, participation, reliance và shared policy không tự tạo execution, approval, assignment hoặc policy-change authority. Explicit scoped delegation vẫn được phép.
3. Reliance có scope, có hướng và có attribution khi làm cơ sở cho governed act. Không tự mang lại local establishment hay authority.
4. Authenticated origin → evidence verification → local establishment → organizational acceptance → execution authorization là năm ý nghĩa riêng, không phải chuỗi mà bước trước đảm bảo bước sau.
5. Policy applicability cần cả organizational assertion rằng P áp dụng ở A và local establishment của A. Có ba trạng thái: applicable, explicitly not applicable, not established. Không biết constraint có áp dụng không không có nghĩa được bỏ constraint đó.
6. Partial applicability và policy states khác nhau giữa các authority là điều mô hình cho phép. Compatibility chỉ cần xác lập cho mục đích yêu cầu nó. Hành vi lịch sử được xét theo policy áp dụng cho hành vi đó.
7. Governance xác lập exact governed facts/relations; organizational semantic contract xác định acceptance, owed, answers, discharged và trách nhiệm đã hoàn thành chưa. Governing contract không tự chứng minh các proposition trong contract.

## Những điều chưa được chốt

- Repo tự mô tả pre-public, experimental, đang kiểm chứng qua triển khai. Domain-neutral reuse là giả thuyết cần chứng minh.
- Local establishment là working phrase, chưa chốt tên cuối cùng.
- Cấu thành local governed authority chưa chốt. Không đồng nhất evaluator với toàn bộ authority; signing control, material control, establishment, enforcement và historical accountability không mặc định là một bundle nguyên tử.
- Không suy ra transfer, succession hay rotation của các thuộc tính authority từ composition.
- Thay đổi authority, evidence, identity, separation of duties hoặc effect/reconciliation semantics cần rationale được ghi lại. Proposal và accepted decision record là hai thứ riêng.

## Quản trị repo theo snapshot đã đọc

Founder-led; GOVERNANCE ghi Van Trung Hoang là người khởi xướng. Đóng góp dùng Apache-2.0 và DCO sign-off; AI-assisted contribution vẫn cần người đóng góp review và chịu trách nhiệm. Kênh security/conduct trong tài liệu mới reserved, chưa hoạt động; đây là trạng thái trong snapshot, không phải kết quả kiểm tra dịch vụ hiện tại.

## Bản đồ nguồn

- `docs/architecture.md`, `docs/overview.md`: phạm vi và các quyết định nền tảng.
- `docs/concepts/virtual-organization.md`: organization/team, participation và policy applicability.
- `docs/concepts/role.md`, `worker.md`, `assignment.md`: trách nhiệm, người/công cụ thực hiện, delegation và attempt.
- `docs/concepts/authority.md`: legitimacy, grants và non-escalation khi composition.
- `docs/concepts/artifact.md`: identities, provenance, supersession và handoff.
- `docs/concepts/evidence.md`: claim/evidence, exact references và historical reconstruction.
- `docs/concepts/governance.md`: governance plane và ranh giới organizational meaning.
- `docs/execution-model.md`, `docs/trust-model.md`: thứ tự thực thi và evaluator-relative trust.

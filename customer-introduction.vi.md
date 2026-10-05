# Forge — Xây dựng tổ chức tương xứng với tham vọng của bạn

**Kết hợp con người, AI và công cụ thành một tổ chức có thể đảm nhận thêm công việc và giữ trách nhiệm đối với kết quả.**

*Tầm nhìn sản phẩm: tài liệu mô tả trải nghiệm hoàn chỉnh chúng tôi hướng tới. Trạng thái triển khai hiện tại được trình bày riêng ở cuối.*

Cơ hội tiếp theo có thể đòi hỏi một đội ngũ bạn chưa thể xây dựng hôm nay: thêm năng lực kỹ thuật, một bộ phận nghiên cứu hoặc một dịch vụ mới cho khách hàng. Tạo thêm đầu ra chỉ là một phần. Công việc còn cần người chịu trách nhiệm, phối hợp, đánh giá và quyết định điều gì được đưa vào sử dụng.

Forge giúp bạn tổ chức năng lực ấy. Bạn xác định mục đích, thiết lập trách nhiệm và đưa con người, AI worker, công cụ phù hợp vào công việc. Tổ chức giữ mục tiêu và lịch sử khi các bên tham gia thay đổi và công việc phát triển.

## Một tổ chức bạn có thể vận hành

Virtual organization có mục đích, vai trò, công việc được giao, quyền quyết định và hồ sơ công việc liên tục. Đó có thể là một đội nhỏ tập trung vào một kết quả hoặc nhiều đội theo đuổi các mục tiêu liên quan.

Con người đóng góp chuyên môn, đánh giá và thực hiện quyền quyết định. AI nhận mục tiêu có ý nghĩa cùng bối cảnh và giới hạn, rồi chủ động chọn cách làm. Công cụ thực hiện các kiểm tra và thao tác phù hợp. Vai trò độc lập với model hoặc runtime đảm nhận nó.

Bạn có thể đổi bên thực hiện mà vẫn giữ trách nhiệm. Lần làm thất bại hoặc yêu cầu sửa đổi trở thành một phần của lịch sử, với căn cứ để tiếp tục.

## Nhìn toàn cảnh. Tham gia qua công việc của chính bạn.

Organization view kết nối mục tiêu, teams, workstreams, trách nhiệm và kết quả. Bạn thấy công việc đang tiến triển ra sao, điều gì phụ thuộc vào đóng góp khác, nơi thiếu ownership và quyết định nào cần chú ý. Công việc độc lập có thể tiến hành song song; mỗi lĩnh vực có cách phối hợp riêng.

**My Work** là lối vào trực tiếp cho trách nhiệm của từng người: chuẩn bị đóng góp, đánh giá một kết quả cụ thể, quyết định trong quyền hạn hoặc xem xét outcome còn chưa chắc chắn. Công việc cá nhân vẫn gắn với mục đích chung.

Delivery, xác nhận nhận hàng, assessment và các phiên bản sửa đổi có identity riêng. Bản sửa giữ lại kết quả và quyết định trước đó, giúp tổ chức tiếp tục mà không viết lại lịch sử.

## Giao quyền chủ động. Kiểm soát những hành động có hậu quả.

Giao cho worker mục tiêu, đầu vào liên quan, phạm vi được phép và yêu cầu bằng chứng. Worker có không gian lập kế hoạch, khám phá và thử nghiệm trong giới hạn ấy.

Policy xác định ai được giao việc, đánh giá hoặc cho phép từng loại hành động. Đánh giá kết quả, cho phép sử dụng và xác lập tác động đã xảy ra vẫn là các việc riêng. Bạn có thể xem xét đầu vào, bên thực hiện, quyết định và bằng chứng liên quan, đồng thời thấy rõ điều còn chưa biết.

Chất lượng vẫn cần tiêu chí và chuyên môn phù hợp. Hồ sơ tổ chức giúp xem xét căn cứ của quyết định; nó không thay thế năng lực đánh giá.

## Từ một đội ngũ đến nhiều môi trường vận hành

Tầm nhìn hoàn chỉnh bao gồm **Forge Control Plane** để vận hành nhiều tổ chức và môi trường thực thi. Lớp này sẽ cung cấp cái nhìn chung về công việc, năng lực worker, tình trạng vận hành và vấn đề phối hợp chưa được giải quyết, hỗ trợ tiếp tục qua thay đổi và gián đoạn.

Mỗi môi trường thực thi giữ boundary quyền hạn tại chỗ. Điều phối trung tâm yêu cầu công việc; quyền hạn local quyết định điều gì được phép chạy. Deployment có thể phát triển theo hướng khách hàng kiểm soát, managed hoặc hybrid tùy yêu cầu.

Continuity và recovery thuộc tầm nhìn sản phẩm; các bảo đảm cụ thể phải được chứng minh cho từng deployment được hỗ trợ.

## Hình dung tổ chức phần mềm của bạn

Đội ngũ theo đuổi nhiều cải tiến sản phẩm cùng lúc. Con người làm rõ mục tiêu khách hàng và tiêu chí chấp nhận. AI chuẩn bị thay đổi có scope. Công cụ kiểm tra. Reviewer đánh giá từng phiên bản và yêu cầu sửa. Người có thẩm quyền quyết định thay đổi nào được sử dụng; bên vận hành xem xét điều thực sự đã xảy ra.

Tổ chức xử lý nhiều workstreams mà không để mọi bàn giao phụ thuộc vào chat history của một người. Worker có thể thay đổi; trách nhiệm, quyết định và bằng chứng vẫn được kết nối.

Phần mềm là ứng dụng đầu tiên. Các tổ chức khác có thể áp dụng cùng nền tảng cho nghiên cứu, nội dung hoặc nghiệp vụ khác, với chuyên môn, work contracts và policy riêng.

## Giá trị bạn nhận được

Thêm năng lực theo đuổi mục tiêu. Ownership rõ hơn giữa con người và AI. Ít điều phối lặp lại. Tiếp tục qua retry và revision. Kiểm soát hành động có hậu quả. Lịch sử có thể xem xét khi cần giải thích một kết quả.

Đo giá trị bằng công việc được chấp nhận, công sức con người, tổng chi phí và khả năng tiếp tục đáng tin cậy; số task AI tự báo hoàn thành chưa đủ.

## Nền tảng và đường hiện thực hóa

DartMesh định nghĩa kiến trúc tham chiếu. Forge hiện thực nền tảng. Virtual organizations áp dụng nó vào công việc cụ thể; Control Plane mở rộng vận hành ở quy mô lớn.

Hiện nền tảng Forge và các lần thực thi nội bộ của Software Factory tạo căn cứ ban đầu; UI minh họa trải nghiệm tổ chức. Sản phẩm hoàn chỉnh mô tả ở đây, gồm live management integration và Control Plane, là tầm nhìn, chưa phải dịch vụ thương mại sẵn có. Công việc nội bộ hiện vẫn có review, approval và thay đổi kho mã do người vận hành thực hiện.

Bắt đầu từ một trách nhiệm quan trọng, các bên tham gia, quyền quyết định và tiêu chí chấp nhận. Chứng minh một đường làm việc hoàn chỉnh và giá trị của nó, rồi mở rộng quanh những gì thành công.

**Bạn sẽ xây dựng điều gì nếu năng lực tổ chức có thể lớn lên cùng tham vọng của bạn?**

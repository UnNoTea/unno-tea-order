# UNO TEA — Bản hoàn chỉnh deploy miễn phí

## Bạn cần 2 tài khoản miễn phí
1. Supabase — database, realtime, đăng nhập admin.
2. Vercel — hosting website.

## A. Tạo database Supabase
1. Vào https://supabase.com/ và tạo project.
2. Mở SQL Editor.
3. Dán toàn bộ file `supabase.sql` và Run.
4. Vào Authentication -> Users -> Add user, tạo email/mật khẩu cho nhân viên/admin.
5. Vào Project Settings -> API, lấy:
   - Project URL
   - anon/public key

## B. Cấu hình website
Mở `config.js`:
SUPABASE_URL: "..."
SUPABASE_ANON_KEY: "..."

Không dùng `service_role` key.

## C. Deploy Vercel
Cách dễ nhất:
1. Tạo tài khoản Vercel.
2. Tạo project mới / import repository GitHub.
3. Upload toàn bộ file trong thư mục này lên một GitHub repository.
4. Vercel -> Add New Project -> chọn repository -> Deploy.
Không cần build command; đây là website tĩnh.

## D. Sử dụng
Khách:
https://TEN-MIEN-VERCEL/?table=1
https://TEN-MIEN-VERCEL/?table=2
...

Admin:
https://TEN-MIEN-VERCEL/?admin=1

Đăng nhập bằng user đã tạo trong Supabase Auth.

## E. QR
Trong Admin -> QR bàn, có QR từ bàn 1 đến bàn 30.
In QR và dán lên từng bàn.

## F. Realtime
Khi khách gửi order:
Điện thoại khách -> Supabase -> màn hình Admin/Bếp.
Màn hình admin đang subscribe realtime bảng `orders`, nên đơn mới/cập nhật trạng thái sẽ tự làm mới.

## G. Hình món
Bạn có thể dùng URL ảnh online trong trường "URL ảnh".
Để có ảnh ổn định và riêng cho quán, nên nâng cấp sang Supabase Storage sau.

## Lưu ý bảo mật
- Không đưa service_role key vào website.
- Tài khoản admin dùng Supabase Auth.
- Chính sách SQL hiện cho phép khách tạo order, còn đọc/sửa/xóa order yêu cầu đăng nhập.
- Trước khi chạy quy mô lớn, nên thêm giới hạn chống spam/rate-limit và phân quyền staff/admin chi tiết.


### Bản source đã sửa
Bản ZIP này dùng ID order do trình duyệt tạo trước khi insert, nên khách không cần quyền đọc lại bảng `orders` sau khi gửi order. Điều này phù hợp với RLS hiện tại và tránh lộ danh sách đơn cho khách.

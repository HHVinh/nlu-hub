# 🏗 NLU Hub - Technical Architecture & Stack

> **LƯU Ý VỀ TÊN GỌI:** 
> **NLU** là viết tắt của **Nong Lam University** (Đại học Nông Lâm TP.HCM). Chữ **"Hub"** mang ý nghĩa là một trung tâm kết nối. Dự án này hoàn toàn **KHÔNG** liên quan đến trường Đại học Ngân Hàng TP.HCM (có mã trường là HUB). 

## 1. Tổng quan dự án (Project Overview)
**NLU Hub** là một nền tảng Web Fullstack được thiết kế dành riêng cho cộng đồng sinh viên Đại học Nông Lâm TP.HCM. Dự án hướng đến việc giải quyết các nhu cầu thiết yếu của sinh viên bao gồm: chia sẻ tài liệu học tập, diễn đàn hỏi đáp, giao thương mua bán đồ cũ (chợ sinh viên) và tìm kiếm đồ thất lạc.

Dự án được xây dựng với kiến trúc hiện đại, tập trung vào hiệu năng (Performance), tối ưu hóa công cụ tìm kiếm (SEO) và trải nghiệm người dùng (UX/UI) trên cả thiết bị di động và máy tính.

## 2. Công nghệ sử dụng (Technology Stack)

Hệ thống được phát triển dựa trên hệ sinh thái **JavaScript/TypeScript** toàn diện từ Frontend đến Backend.

### 2.1. Core Framework
* **[Next.js 16 (App Router)](https://nextjs.org/):** Sử dụng kiến trúc App Router mới nhất của Next.js. Tận dụng tối đa sức mạnh của **Server Components** để giảm tải dung lượng JavaScript gửi xuống client, kết hợp với **Server-Side Rendering (SSR)** giúp tối ưu hóa SEO cho các trang tài liệu và bài viết.
* **[React 19](https://react.dev/):** Quản lý trạng thái và xây dựng giao diện người dùng tương tác với các component tái sử dụng cao.

### 2.2. Frontend & UI/UX
* **[Tailwind CSS v4](https://tailwindcss.com/):** Framework Utility-first CSS giúp xây dựng giao diện nhanh chóng, linh hoạt và đảm bảo tính Responsive hoàn hảo trên mọi kích thước màn hình.
* **[Next Themes](https://github.com/pacocoursey/next-themes):** Quản lý chế độ hiển thị Sáng/Tối (Light/Dark Mode) một cách mượt mà, tự động lưu trữ tùy chọn của người dùng.
* **[React Hot Toast](https://react-hot-toast.com/):** Hiển thị các thông báo (toast notifications) thân thiện và không gây gián đoạn trải nghiệm người dùng.

### 2.3. Backend & Cơ sở dữ liệu (Database)
* **[Next.js Route Handlers (API Routes)](https://nextjs.org/docs/app/building-your-application/routing/route-handlers):** Xây dựng các API RESTful trực tiếp bên trong ứng dụng Next.js, giúp giảm thiểu độ trễ mạng và đơn giản hóa quá trình triển khai (deployment).
* **[MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/):** Cơ sở dữ liệu NoSQL linh hoạt, phù hợp với mô hình dữ liệu đa dạng của ứng dụng (Tài liệu, Bài đăng chợ sinh viên, Câu hỏi, Đồ thất lạc). Mongoose ODM được sử dụng để định nghĩa Schema và kiểm soát tính toàn vẹn của dữ liệu.

### 2.4. Xác thực & Bảo mật (Authentication & Security)
* **[NextAuth.js (v4)](https://next-auth.js.org/):** Giải pháp xác thực toàn diện. Hệ thống hiện đang sử dụng **Google OAuth 2.0 Provider**, cho phép sinh viên đăng nhập nhanh chóng bằng tài khoản Google cá nhân hoặc email sinh viên (@st.hcmuaf.edu.vn) mà không cần phải nhớ thêm mật khẩu mới, đồng thời giảm thiểu rủi ro bảo mật lưu trữ mật khẩu.

### 2.5. Dịch vụ bên thứ ba (Third-party Services)
* **[Cloudinary](https://cloudinary.com/):** Dịch vụ lưu trữ và phân phối hình ảnh (CDN). Tích hợp thông qua `next-cloudinary` để tự động tối ưu hóa kích thước, định dạng ảnh (WebP) tải lên từ người dùng (ảnh đồ thất lạc, ảnh sản phẩm chợ sinh viên).
* **[Nodemailer](https://nodemailer.com/):** Hệ thống gửi email tự động (SMTP) dùng để gửi thông báo cho người dùng khi có tương tác quan trọng.

### 2.6. Triển khai & Vận hành (Deployment & CI/CD)
* **[Vercel](https://vercel.com/):** Nền tảng triển khai tối ưu nhất cho Next.js. Hỗ trợ Continuous Deployment (CD) trực tiếp từ GitHub repository. Tự động cấp phát chứng chỉ bảo mật SSL và phân phối nội dung qua mạng lưới Edge Network toàn cầu.

## 3. Cấu trúc dữ liệu (Data Modeling)
Hệ thống sử dụng các Collection độc lập nhưng có tính liên kết chặt chẽ trong MongoDB:
* `Users`: Lưu trữ thông tin người dùng được định danh qua Google OAuth.
* `Documents` & `Subjects`: Cấu trúc phân cấp lưu trữ tài liệu học tập theo Khoa -> Môn học -> Tài liệu.
* `MarketItems`: Lưu trữ thông tin giao dịch chợ sinh viên (giá cả, tình trạng, hình ảnh đính kèm).
* `LostItems`: Phân loại đồ nhặt được (Found) và đồ đánh rơi (Lost).
* `Questions` & `Answers`: Mô hình quan hệ 1-N cho diễn đàn hỏi đáp.

## 4. Điểm nhấn Kỹ thuật (Technical Highlights)
* **Tối ưu hóa SEO (Metadata):** Các thẻ OpenGraph và Description được xử lý linh hoạt tại Server Component trước khi render, giúp chia sẻ link lên Zalo, Facebook hiển thị đầy đủ thông tin thu hút.
* **Responsive Design:** Giao diện được thiết kế theo phương châm *Mobile-First*, đảm bảo trải nghiệm sử dụng trên điện thoại mượt mà, thao tác tiện lợi với thanh điều hướng tối ưu không gian.
* **Type Safety:** Sử dụng TypeScript xuyên suốt từ Database Schema đến UI Props, giúp giảm thiểu tối đa các lỗi runtime (ví dụ: Optional Chaining xử lý triệt để lỗi `session.user`).

---

## 5. Hướng dẫn chạy dự án cục bộ (Local Development)

Để chạy dự án này trên máy tính cá nhân, bạn cần cài đặt **Node.js** (phiên bản 18 trở lên).

1. Clone dự án về máy:
   ```bash
   git clone https://github.com/HHVinh/nlu-hub.git
   cd nlu-hub
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy dự án ở môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Truy cập địa chỉ [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

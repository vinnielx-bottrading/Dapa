# DAPA

**Game trào phúng đập phá khu phố, phát triển bởi Vinh Làm Game.**
Tên gốc trong GDD: *BREAK THE CITY*.

> Đập. Phá. Bị tóm. Chơi lại.

DAPA là game arcade chạy thẳng trên trình duyệt. Người chơi cầm một cây búa hơi đồ chơi, phá đồ vật trong một khu phố hư cấu, tích Điểm Hỗn Loạn, kéo mức truy nã lên và cố trụ lâu nhất trước khi bị Đội Trật Tự tóm.

## Trạng thái

- **Phiên bản:** v0.1 prototype (đã chơi được)
- **Hướng hình ảnh:** pixel art, góc nhìn 3/4 từ trên xuống (2.5D giả)
- **Nền tảng:** trình duyệt desktop và mobile
- **Triển khai:** GitHub + Vercel, site tĩnh, không backend, không đăng nhập
- **Asset:** toàn bộ hình vẽ bằng code (pixel trên Canvas), âm thanh tổng hợp bằng Web Audio. Không có file ảnh hay âm thanh ngoài nên không có vấn đề bản quyền. Font VT323 và Silkscreen tải từ Google Fonts, nếu không tải được game vẫn chạy với font dự phòng.

## Đã có trong v0.1

- Một khu phố: dãy nhà mặt tiền phía bắc, đường chính có vạch qua đường, quảng trường có đài phun nước, công viên, bãi đỗ xe, đường nhánh đang thi công.
- 42 đồ vật phá được, thuộc 14 loại: cửa kính, thùng rác, chậu cây, hộp báo, trụ cứu hỏa, biển cấm, cột đèn, ghế đá, bảng quảng cáo, ATM, máy bán nước, ô tô, billboard, tượng đài bồ câu.
- Đồ vật lớn cần nhiều nhát (trạng thái intact, damaged, destroyed). Mỗi món chỉ tính điểm một lần mỗi lượt.
- Hiệu ứng: hit-stop, rung màn hình, mảnh vỡ bay rồi nằm lại trên mặt đất, nước phun từ trụ cứu hỏa, khói ô tô, tia lửa điện.
- Combo: phá liên tiếp trong 3 giây để nhân điểm, tối đa x5.
- Truy nã 5 mức: Bình yên, Chú ý, Truy tìm, Truy đuổi, Phong tỏa. Không phá gì trong 6 giây thì thanh hỗn loạn tụt dần, nhưng chỉ tụt được một mức so với mức cao nhất từng đạt.
- Cảnh sát: tuần tra, điều tra hiện trường, truy đuổi. Tìm đường bằng flow field trên lưới ô 16px. Xe trật tự chạy vào từ đầu đường, không spawn ngay cạnh người chơi. Tối đa 6 người.
- Bắt giữ: cảnh sát đứng sát người chơi đủ lâu thì vòng đỏ quanh người chơi đầy và người chơi bị tóm. Lướt (dash) làm tụt vòng bắt.
- Mũi tên ở mép màn hình chỉ hướng cảnh sát đang đuổi ngoài khung nhìn.
- Điểm lẩn trốn: từ mức Truy tìm trở lên, mỗi giây sống sót được cộng điểm.
- Phá hết 42 món: +1000 điểm và chuyển thẳng lên Phong tỏa.
- Màn hình kết thúc: điểm, số đồ đã phá, thời gian, mức truy nã cao nhất, combo dài nhất, kỷ lục (lưu localStorage), danh hiệu, hóa đơn bồi thường.
- Tạm dừng, tắt tiếng, tắt rung màn hình. Tự tạm dừng khi chuyển tab.
- Điều khiển cảm ứng: cần gạt ảo ở nửa trái, nút ĐẬP và LƯỚT ở bên phải.

## Điều khiển

| Hành động | Bàn phím / chuột | Cảm ứng |
|---|---|---|
| Di chuyển | WASD hoặc phím mũi tên | Kéo nửa trái màn hình |
| Đập | Space, J hoặc click chuột (đập về phía con trỏ) | Giữ nút ĐẬP |
| Lướt né | Shift hoặc K | Nút LƯỚT |
| Tạm dừng | P hoặc Esc | Nút II |
| Tắt tiếng | M | Nút ♪ |

## Chạy trên máy

Mở `index.html` bằng trình duyệt là chơi được. Không cần build.

Chế độ debug cho test tự động: mở `index.html?debug`, game sẽ gắn `window.__dapa` (state, player, props, officers).

## Deploy lên Vercel

1. Tạo repo GitHub và đẩy các file lên.
2. Trên Vercel, chọn Import repository.
3. Root Directory: thư mục gốc. Framework Preset: Other.
4. Để trống Build Command. Output Directory để trống hoặc `.`.
5. Deploy, rồi mở URL production trên cả máy tính và điện thoại để kiểm tra.

Không cần biến môi trường.

## Cấu trúc

```text
dapa/
├── index.html            # toàn bộ game: HTML + CSS + JS, một file
├── README.md
├── GDD.md                # tài liệu thiết kế gốc (BREAK THE CITY v0.1)
└── PROTOTYPE_SCOPE.md
```

Game hiện gói trong một file để deploy nhanh. Khi file quá nặng có thể tách JS theo các phần đã đánh dấu sẵn trong code: config, audio, world, input, flow field, fx, destruction, police, render, UI.

## Thông số cân bằng (chỉnh trong khối CONFIG)

| Thông số | Giá trị |
|---|---|
| Ngưỡng truy nã (điểm hỗn loạn) | 0 / 150 / 450 / 900 / 1500 |
| Số cảnh sát theo mức | 1 / 1 / 2 / 4 / 6 |
| Tốc độ người chơi / lướt | 66 / 175 px/s |
| Tốc độ cảnh sát đuổi theo mức 2–4 | 47 / 53 / 59 px/s |
| Thời gian bắt theo mức 2–4 | 1.15 / 1.05 / 0.8 giây |
| Điểm đồ nhỏ / vừa / lớn | 50 / 100 / 150 |

## Lộ trình tiếp theo

- **v0.2:** chỉnh cảm giác đánh, thêm frame animation, playtest cân bằng trên điện thoại thật.
- **v0.3:** thêm loại đồ vật và một khu phố thứ hai (chợ đêm hoặc phố mưa).
- **v1.0:** kiểm tra khả năng truy cập, tối ưu hiệu năng, credits đầy đủ.

## Nguyên tắc nội dung

Game trào phúng. Thành phố, thương hiệu, cơ quan và lực lượng trong game đều hư cấu. Búa chỉ tác động lên đồ vật, không có tương tác bạo lực với nhân vật.

## Lỗi đã biết

- Cảnh sát đôi khi đứng chồng lên nhau một lúc khi cùng đuổi từ một hướng.
- Font chữ trên biển hiệu trông thô hơn nếu Google Fonts không tải được.

## Credits

**Tác giả:** Vinh Làm Game
**Phiên bản:** v0.1 prototype

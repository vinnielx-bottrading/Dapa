# DAPA

**Game trào phúng bạo loạn kiểu châu Âu, phát triển bởi Vinh Làm Game.**
Tên gốc trong GDD: *BREAK THE CITY*.

> Đập. Phá. Nhậu. Bị tóm.

Bạn là du khách đội nón bảo hiểm vàng, lạc vào cuộc bạo loạn ở thành phố hư cấu **Saint-Paperasse**, nơi cả thành phố xuống đường đòi… giờ nghỉ trưa dài hơn. Bạn phá cùng đám đông, đập cảnh sát, lật xe, đá trả lựu đạn cay và nhậu mừng mỗi lần thắng. Càng quậy, tiền phạt càng cao. Game chơi vô tận cho tới khi bạn bị áp giải ra tòa.

## Trạng thái

- **Phiên bản:** v0.3 (gộp giai đoạn A, B, C)
- **Hình ảnh:** pixel art chi tiết, góc nhìn 3/4 (2.5D giả). Độ phân giải logic khoảng 640×360 trên desktop, pixel nhỏ hơn bản v0.1 khoảng 2 lần.
- **Nền tảng:** trình duyệt desktop và mobile (dọc lẫn ngang)
- **Triển khai:** GitHub + Vercel, site tĩnh, không backend
- **Asset:** mọi hình vẽ bằng code, âm thanh và nhạc tổng hợp bằng Web Audio (giai điệu tự sáng tác). Không có file ảnh hay âm thanh ngoài.
- **Ngôn ngữ:** giao diện và hướng dẫn bằng tiếng Việt. Biển hiệu, khẩu hiệu và lời thoại trong game pha tạp Anh, Pháp, Đức, Ý, Tây Ban Nha.

## Gameplay

### Vòng lặp
1. **Tuần hành:** đám đông tiến về rào chắn cảnh sát ở cuối khúc phố, vừa đi vừa đập phá.
2. **Giao tranh:** cảnh sát kéo tới theo đợt, từ sau rào chắn và từ các hẻm.
3. **Đám đông thắng:** cả đám kéo nhau đi nhậu. Xe "WURST · BIER · KEBAB" chạy tới, có bàn bia. Bạn được hồi sức, tiền phạt giảm 30%, sau đó rào chắn mở ra khúc phố mới.
4. **Cảnh sát thắng:** họ càn quét trong 14 giây và bạn phải sống sót. Sau đó cảnh sát rút, người mới từ quán bar kéo tới tiếp sức, và đợt sau mạnh hơn.
5. Lặp lại vô tận. Game chỉ kết thúc khi bạn bị áp giải lên xe.

### Bản đồ
- Tuyến phố sinh ngẫu nhiên vô tận, liên tục quẹo trái phải (Đông → Bắc/Nam → Đông…).
- Kiến trúc châu Âu gồm 5 kiểu nhà: Paris (mái kẽm, ban công sắt), Fachwerk (khung gỗ Đức), Hà Lan (gạch, đầu hồi bậc thang), Ý (cửa chớp xanh), hiện đại.
- Có quảng trường lát đá với tượng kỵ sĩ, có hẻm phụ (nơi cảnh sát và người tiếp viện xuất hiện), có biển tên đường men xanh.
- Có 15 loại đồ phá được: cửa kính tiệm, thùng rác, chậu hoa, ghế, bàn cà phê có dù, giá xe đạp, hòm thư, trụ nước, đèn đường Paris, bốt điện thoại đỏ, cột quảng cáo Morris, nhà chờ xe buýt, ô tô (lật), tượng đài, cùng xe vòi rồng và xe bắt người của cảnh sát.

### Đám đông (7 kiểu)
| Kiểu | Hành vi |
|---|---|
| Hippie | Ném bóng sơn, mang đàn guitar hoặc hoa |
| Găng tơ | Cầm gậy bóng chày, xông vào đánh cảnh sát |
| Punk | Đá trả lựu đạn cay, ném chai |
| Ông chú | Hôi đồ, khiêng TV từ cửa tiệm vỡ |
| Influencer | Không đánh ai, chỉ livestream, và bị bắt đầu tiên |
| Bà cụ cầm chảo | Chậm nhưng rất lì |
| Sinh viên | Giơ biểu ngữ phi lý, ném cà chua |

Đám đông tự đập phá, rủ nhau 3–4 người lật xe, giải cứu người bị bắt và hô khẩu hiệu.

### Cảnh sát (theo đợt, mạnh dần)
| Loại | Xuất hiện từ | Đặc điểm |
|---|---|---|
| Cảnh sát thường | Đợt 1 | Dùng dùi cui, **tóm người** |
| Khiên chống bạo động | Đợt 2 | Đỡ đòn từ phía trước, húc văng |
| Lính bắn hơi cay | Đợt 2 | Đeo mặt nạ, ném lựu đạn cay |
| Đội Thủ Tục | Đợt 3 | Phát giấy tờ làm mục tiêu đứng hình |
| Cảnh sát xe đạp | Đợt 4 | Nhanh. Bị đập là ngã xe |
| Xe vòi rồng | Đợt 4 | Xịt nước đẩy lùi, có thể phá hỏng |
| Kỵ binh | Đợt 5 | Giẫm ngã đám đông. Bị đập là ngã ngựa |

Từ đợt 2, máu cảnh sát tăng 12% mỗi đợt.

### Người chơi
- **Đập** đồ, cảnh sát và xe. Đập liên tục trong 3 giây để ăn combo, tối đa x5.
- **Ném:** ném cà chua vào cảnh sát. Đứng gần lựu đạn cay thì nút này **đá trả** lựu đạn.
- **Lướt:** né đòn và né bị tóm, hồi chiêu 1,3 giây.
- **Sức:** giảm khi trúng dùi cui, vòi rồng hoặc hơi cay. Sức thấp làm bạn chậm và khó vùng ra hơn.
- **Bị tóm:** bấm Đập liên tục để vùng ra trong khi bị kéo về xe. Đám đông đứng gần có thể giải cứu bạn.

### Tiền phạt và danh hiệu
Phá đồ, đập cảnh sát, lật xe hay phá xe đều cộng tiền phạt (€). Danh hiệu theo tiền phạt:

| Tiền phạt | Danh hiệu | Hệ quả |
|---|---|---|
| €0 | Du khách tò mò | |
| €6.000 | Côn đồ vỉa hè | Cảnh sát ưu tiên bạn hơn |
| €30.000 | Kẻ cầm đầu | Bị tóm khó vùng hơn |
| €100.000 | Kẻ thù nhà nước | Trên đầu hiện chữ WANTED |
| €300.000 | Huyền thoại Saint-Paperasse | |

Màn kết thúc là **phiên tòa**: bản án châm biếm theo danh hiệu, kèm thống kê.

### Âm nhạc (tự sáng tác, tổng hợp bằng code)
| Bài | Thể loại | Khi nào |
|---|---|---|
| *Polka der Pflastersteine* | Polka | Lúc tuần hành |
| *Les Flics Arrivent* | Nhạc rượt đuổi kiểu phim câm, kèn kazoo | Lúc giao tranh, càn quét |
| *Noch ein Bier, s'il vous plaît* | Bài nhậu oompah, có vỗ tay và hò "HEY!" | Lúc nhậu |
| *Café de la Paperasse* | Waltz accordion | Dành cho menu |

Hiệu ứng âm thanh gồm "boing" khi đập trúng cảnh sát, tiếng huýt sáo trượt, kèn trombone buồn khi bị bắt, chuông xe đạp, còi cảnh sát và tiếng ợ khi uống bia.

### Ủng hộ tác giả
- Lần đầu mở game (mỗi phiên trình duyệt): hiện bảng **Ủng hộ DAPA** với mã VietQR Vietcombank, số tài khoản và nút sao chép.
- Khi đang chơi: nút nhỏ **♥ Ủng hộ** ở góc phải trên. Bấm vào thì game tạm dừng, đóng bảng là chơi tiếp.
- Khi tạm dừng: nút **♥ ỦNG HỘ TÁC GIẢ** nằm ngay dưới nút Tiếp tục.
- Ảnh QR nhúng sẵn trong `src/shell.html` (base64). File gốc ở `assets/qr.webp`.

## Điều khiển

| Hành động | Bàn phím / chuột | Cảm ứng |
|---|---|---|
| Di chuyển | WASD / mũi tên | Kéo nửa trái màn hình |
| Đập | Space / J / click trái | Nút ĐẬP |
| Ném, đá trả lựu đạn | E / L / click phải | Nút NÉM |
| Lướt | Shift / K | Nút LƯỚT |
| Vùng ra khi bị tóm | Bấm Space liên tục | Bấm ĐẬP liên tục |
| Tạm dừng / tắt tiếng | P, Esc / M | Nút II / ♪ |

## Cấu trúc mã nguồn

```text
dapa/
├── index.html          # bản build hoàn chỉnh, deploy file này
├── build.sh            # ghép src/ thành index.html
├── src/
│   ├── shell.html      # HTML + CSS: HUD, menu, phiên tòa, nút cảm ứng
│   ├── 01_core.js      # cấu hình, canvas, tiện ích, âm thanh, nhạc
│   ├── 02_sprites.js   # sprite người/cảnh sát/xe/đồ vật vẽ bằng code, tự tạo viền
│   ├── 03_world.js     # tile theo chunk, sinh tuyến phố vô tận, nhà, đồ vật, vẽ nền
│   ├── 04_actors.js    # người chơi, đám đông, cảnh sát, vật ném, hơi cay, vùng vẫy
│   └── 05_game.js      # đợt cảnh sát, pha chơi, render, HUD, vòng lặp
├── GDD.md
└── PROTOTYPE_SCOPE.md
```

Sửa trong `src/` rồi chạy `sh build.sh` để tạo lại `index.html`. Mở `index.html?debug` sẽ có `window.__dapa` dùng để test.

## Deploy lên Vercel

1. Đẩy repo lên GitHub.
2. Vercel → Import → Framework: Other, Build Command để trống, Output Directory là `.`.
3. Deploy và kiểm tra trên điện thoại.

## Cân bằng (thông số chính)

- Ngưỡng danh hiệu: `TIERS` trong `01_core.js`.
- Thành phần mỗi đợt: `waveComp()` trong `05_game.js`.
- Máu, tốc độ, khả năng của cảnh sát: `CTYPES` trong `04_actors.js`.
- Tính cách đám đông: `RTYPES` trong `04_actors.js`.
- Giới hạn hiệu năng: tối đa 34 người biểu tình, 24 cảnh sát, 520 hạt hiệu ứng.

## Nguyên tắc nội dung

Saint-Paperasse, mọi nhân vật, cơ quan và thương hiệu đều hư cấu. Biểu ngữ là các yêu sách phi lý (nghỉ trưa, croissant, wifi), không có cờ, đảng phái hay sự kiện có thật. Bạo lực theo kiểu hoạt hình: cảnh sát bị choáng có sao quay trên đầu rồi tự đứng dậy, không có máu. Game châm biếm cả hai phe.

## Lỗi đã biết

- Đôi khi NPC kẹt góc tường vài giây ở khúc quẹo hẹp.
- Ở các đợt đầu, đám đông thường thắng dễ. Từ đợt 4 trở đi mới thật sự căng.

## Credits

**Tác giả:** Vinh Làm Game · **Phiên bản:** v0.3

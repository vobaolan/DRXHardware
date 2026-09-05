// Vietnam Administrative Divisions Data (Tỉnh / Thành Phố -> Quận / Huyện / TP -> Phường / Xã sau sáp nhập)

export interface DistrictItem {
  id: string;
  name: string;
  wards: string[];
}

export interface ProvinceItem {
  id: string;
  name: string;
  districts: DistrictItem[];
}

export const VIETNAM_PROVINCES: ProvinceItem[] = [
  {
    id: 'hcm',
    name: 'Thành phố Hồ Chí Minh',
    districts: [
      {
        id: 'hcm_thu_duc',
        name: 'Thành phố Thủ Đức (Sáp nhập Q2, Q9, Thủ Đức)',
        wards: [
          'Phường Thảo Điền', 'Phường An Phú', 'Phường Thủ Thiêm', 'Phường An Khánh',
          'Phường Bình Trưng Tây', 'Phường Bình Trưng Đông', 'Phường Cát Lái', 'Phường Thạnh Mỹ Lợi',
          'Phường Hiệp Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Phước Long A',
          'Phường Phước Long B', 'Phường Phước Bình', 'Phường Long Bình', 'Phường Long Thạnh Mỹ',
          'Phường Long Phước', 'Phường Long Trường', 'Phường Trường Thạnh', 'Phường Phú Hữu',
          'Phường Linh Trung', 'Phường Linh Chiểu', 'Phường Linh Tây', 'Phường Linh Đông',
          'Phường Linh Xuân', 'Phường Bình Chiểu', 'Phường Tam Bình', 'Phường Tam Phú',
          'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Trường Thọ'
        ]
      },
      {
        id: 'hcm_q1',
        name: 'Quận 1',
        wards: [
          'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cô Giang', 'Phường Cầu Kho',
          'Phường Cầu Ông Lãnh', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình',
          'Phường Phạm Ngũ Lão', 'Phường Tân Định'
        ]
      },
      {
        id: 'hcm_q3',
        name: 'Quận 3',
        wards: [
          'Phường Võ Thị Sáu (Sáp nhập P6, P7, P8)', 'Phường 1', 'Phường 2', 'Phường 3',
          'Phường 4', 'Phường 5', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
          'Phường 13', 'Phường 14'
        ]
      },
      {
        id: 'hcm_q4',
        name: 'Quận 4',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8',
          'Phường 9', 'Phường 10', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18'
        ]
      },
      {
        id: 'hcm_q5',
        name: 'Quận 5',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6',
          'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
          'Phường 13', 'Phường 14'
        ]
      },
      {
        id: 'hcm_q6',
        name: 'Quận 6',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6',
          'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
          'Phường 13', 'Phường 14'
        ]
      },
      {
        id: 'hcm_q7',
        name: 'Quận 7',
        wards: [
          'Phường Tân Thuận Đông', 'Phường Tân Thuận Tây', 'Phường Tân Kiểng', 'Phường Tân Hưng',
          'Phường Bình Thuận', 'Phường Tân Quy', 'Phường Phú Thuận', 'Phường Tân Phú',
          'Phường Tân Phong', 'Phường Phú Mỹ'
        ]
      },
      {
        id: 'hcm_q8',
        name: 'Quận 8',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6',
          'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
          'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'
        ]
      },
      {
        id: 'hcm_q10',
        name: 'Quận 10',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7',
          'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13',
          'Phường 14', 'Phường 15'
        ]
      },
      {
        id: 'hcm_q11',
        name: 'Quận 11',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6',
          'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
          'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'
        ]
      },
      {
        id: 'hcm_q12',
        name: 'Quận 12',
        wards: [
          'Phường An Phú Đông', 'Phường Đông Hưng Thuận', 'Phường Hiệp Thành', 'Phường Tân Chánh Hiệp',
          'Phường Tân Hưng Thuận', 'Phường Tân Thới Hiệp', 'Phường Tân Thới Nhất', 'Phường Thạnh Lộc',
          'Phường Thạnh Xuân', 'Phường Thới An', 'Phường Trung Mỹ Tây'
        ]
      },
      {
        id: 'hcm_binh_thanh',
        name: 'Quận Bình Thạnh',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7',
          'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17',
          'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26',
          'Phường 27', 'Phường 28'
        ]
      },
      {
        id: 'hcm_tan_binh',
        name: 'Quận Tân Bình',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6',
          'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12',
          'Phường 13', 'Phường 14', 'Phường 15'
        ]
      },
      {
        id: 'hcm_tan_phu',
        name: 'Quận Tân Phú',
        wards: [
          'Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Phú Thọ Hòa',
          'Phường Phú Trung', 'Phường Sơn Kỳ', 'Phường Tân Quý', 'Phường Tân Sơn Nhì',
          'Phường Tân Thành', 'Phường Tân Thới Hòa', 'Phường Tây Thạnh'
        ]
      },
      {
        id: 'hcm_phu_nhuan',
        name: 'Quận Phú Nhuận',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7',
          'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 13', 'Phường 15', 'Phường 17'
        ]
      },
      {
        id: 'hcm_go_vap',
        name: 'Quận Gò Vấp',
        wards: [
          'Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7',
          'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13',
          'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'
        ]
      },
      {
        id: 'hcm_binh_tan',
        name: 'Quận Bình Tân',
        wards: [
          'Phường An Lạc', 'Phường An Lạc A', 'Phường Bình Hưng Hòa', 'Phường Bình Hưng Hòa A',
          'Phường Bình Hưng Hòa B', 'Phường Bình Trị Đông', 'Phường Bình Trị Đông A',
          'Phường Bình Trị Đông B', 'Phường Tân Tạo', 'Phường Tân Tạo A'
        ]
      },
      {
        id: 'hcm_binh_chanh',
        name: 'Huyện Bình Chánh',
        wards: [
          'Thị trấn Tân Túc', 'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng',
          'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long', 'Xã Lê Minh Xuân',
          'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã Quy Đức', 'Xã Tân Kiên',
          'Xã Tân Nhựt', 'Xã Tân Quý Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B'
        ]
      },
      {
        id: 'hcm_hoc_mon',
        name: 'Huyện Hóc Môn',
        wards: [
          'Thị trấn Hóc Môn', 'Xã Bà Điểm', 'Xã Đông Thạnh', 'Xã Nhị Bình',
          'Xã Tân Hiệp', 'Xã Tân Thới Nhì', 'Xã Tân Xuân', 'Xã Thới Tam Thôn',
          'Xã Trung Chánh', 'Xã Xuân Thới Đông', 'Xã Xuân Thới Sơn', 'Xã Xuân Thới Thượng'
        ]
      },
      {
        id: 'hcm_cu_chi',
        name: 'Huyện Củ Chi',
        wards: [
          'Thị trấn Củ Chi', 'Xã An Nhơn Tây', 'Xã An Phú', 'Xã Bình Mỹ',
          'Xã Cây Thông', 'Xã Hòa Phú', 'Xã Nhuận Đức', 'Xã Phạm Văn Cội',
          'Xã Phú Hòa Đông', 'Xã Phú Mỹ Hưng', 'Xã Phước Hiệp', 'Xã Tân An Hội',
          'Xã Tân Phú Trung', 'Xã Tân Thạnh Đông', 'Xã Tân Thạnh Tây', 'Xã Tân Thông Hội',
          'Xã Thái Mỹ', 'Xã Trung An', 'Xã Trung Lập Hạ', 'Xã Trung Lập Thượng'
        ]
      },
      {
        id: 'hcm_nha_be',
        name: 'Huyện Nhà Bè',
        wards: [
          'Thị trấn Nhà Bè', 'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức',
          'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc'
        ]
      },
      {
        id: 'hcm_can_gio',
        name: 'Huyện Cần Giờ',
        wards: [
          'Thị trấn Cần Thạnh', 'Xã An Thới Đông', 'Xã Bình Khánh', 'Xã Long Hòa',
          'Xã Lý Nhơn', 'Xã Tam Thôn Hiệp', 'Xã Thạnh An'
        ]
      }
    ]
  },
  {
    id: 'hn',
    name: 'Thủ đô Hà Nội',
    districts: [
      {
        id: 'hn_ba_dinh',
        name: 'Quận Ba Đình',
        wards: [
          'Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ',
          'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh',
          'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công',
          'Phường Trúc Bạch', 'Phường Vĩnh Phúc'
        ]
      },
      {
        id: 'hn_hoan_kiem',
        name: 'Quận Hoàn Kiếm',
        wards: [
          'Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân',
          'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Bông',
          'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã',
          'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân',
          'Phường Tràng Tiền', 'Phường Trần Hưng Đạo'
        ]
      },
      {
        id: 'hn_cau_giay',
        name: 'Quận Cầu Giấy',
        wards: [
          'Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô',
          'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'
        ]
      },
      {
        id: 'hn_dong_da',
        name: 'Quận Đống Đa',
        wards: [
          'Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng',
          'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng',
          'Phường Ngã Tư Sở', 'Phường Ô Chợ Dừa', 'Phường Phương Liên', 'Phường Phương Mai',
          'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang', 'Phường Thổ Quan',
          'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự', 'Phường Văn Chương', 'Phường Văn Miếu'
        ]
      },
      {
        id: 'hn_hai_ba_trung',
        name: 'Quận Hai Bà Trưng',
        wards: [
          'Phường Bách Khoa', 'Phường Bạch Đằng', 'Phường Bạch Mai', 'Phường Cầu Dền',
          'Phường Đống Mác', 'Phường Đồng Nhân', 'Phường Đồng Tâm', 'Phường Lê Đại Hành',
          'Phường Minh Khai', 'Phường Nguyễn Du', 'Phường Phạm Đình Hổ', 'Phường Phố Huế',
          'Phường Quỳnh Lôi', 'Phường Quỳnh Mai', 'Phường Thanh Lương', 'Phường Thanh Nhàn',
          'Phường Trương Định', 'Phường Vĩnh Tuy'
        ]
      },
      {
        id: 'hn_tay_ho',
        name: 'Quận Tây Hồ',
        wards: [
          'Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An',
          'Phường Thụy Khuê', 'Phường Tứ Liên', 'Phường Xuân La', 'Phường Yên Phụ'
        ]
      },
      {
        id: 'hn_thanh_xuan',
        name: 'Quận Thanh Xuân',
        wards: [
          'Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung',
          'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc',
          'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình'
        ]
      },
      {
        id: 'hn_nam_tu_liem',
        name: 'Quận Nam Từ Liêm',
        wards: [
          'Phường Cầu Diễn', 'Phường Đại Mỗ', 'Phường Mễ Trì', 'Phường Mỹ Đình 1',
          'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Phương Canh', 'Phường Tây Mỗ',
          'Phường Trung Văn', 'Phường Xuân Phương'
        ]
      },
      {
        id: 'hn_bac_tu_liem',
        name: 'Quận Bắc Từ Liêm',
        wards: [
          'Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đông Ngạc', 'Phường Đức Thắng',
          'Phường Liên Mạc', 'Phường Minh Khai', 'Phường Phú Diễn', 'Phường Phúc Diễn',
          'Phường Tây Tựu', 'Phường Thượng Cát', 'Phường Thụy Phương', 'Phường Xuân Đỉnh', 'Phường Xuân Tảo'
        ]
      },
      {
        id: 'hn_ha_dong',
        name: 'Quận Hà Đông',
        wards: [
          'Phường Biên Giang', 'Phường Đồng Mai', 'Phường Dương Nội', 'Phường Hà Cầu',
          'Phường Kiến Hưng', 'Phường La Khê', 'Phường Mộ Lao', 'Phường Nguyễn Trãi',
          'Phường Phú La', 'Phường Phú Lãm', 'Phường Phú Lương', 'Phường Phúc La',
          'Phường Quang Trung', 'Phường Vạn Phúc', 'Phường Văn Quán', 'Phường Yên Nghĩa', 'Phường Yết Kiêu'
        ]
      },
      {
        id: 'hn_hoang_mai',
        name: 'Quận Hoàng Mai',
        wards: [
          'Phường Đại Kim', 'Phường Định Công', 'Phường Giáp Bát', 'Phường Hoàng Liệt',
          'Phường Hoàng Văn Thụ', 'Phường Lĩnh Nam', 'Phường Mai Động', 'Phường Tân Mai',
          'Phường Thanh Trì', 'Phường Thịnh Liệt', 'Phường Trần Phú', 'Phường Tương Mai',
          'Phường Vĩnh Hưng', 'Phường Yên Sở'
        ]
      },
      {
        id: 'hn_long_bien',
        name: 'Quận Long Biên',
        wards: [
          'Phường Bồ Đề', 'Phường Cự Khối', 'Phường Đức Giang', 'Phường Gia Thụy',
          'Phường Giang Biên', 'Phường Long Biên', 'Phường Ngọc Lâm', 'Phường Ngọc Thụy',
          'Phường Phúc Đồng', 'Phường Phúc Lợi', 'Phường Sài Đồng', 'Phường Thạch Bàn',
          'Phường Thượng Thanh', 'Phường Việt Hưng'
        ]
      }
    ]
  },
  {
    id: 'da_nang',
    name: 'Thành phố Đà Nẵng',
    districts: [
      {
        id: 'dn_hai_chau',
        name: 'Quận Hải Châu',
        wards: [
          'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thạch Thang', 'Phường Thanh Bình',
          'Phường Thuận Phước', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương',
          'Phường Phước Ninh', 'Phường Bình Thuận', 'Phường Bình Hiên', 'Phường Hòa Cường Bắc',
          'Phường Hòa Cường Nam'
        ]
      },
      {
        id: 'dn_thanh_khe',
        name: 'Quận Thanh Khê',
        wards: [
          'Phường Tam Thuận', 'Phường Thanh Khê Tây', 'Phường Thanh Khê Đông', 'Phường Xuân Hà',
          'Phường Tân Chính', 'Phường Chính Gián', 'Phường Vĩnh Trung', 'Phường Thạc Gián',
          'Phường An Khê', 'Phường Hòa Khê'
        ]
      },
      {
        id: 'dn_son_tra',
        name: 'Quận Sơn Trà',
        wards: [
          'Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái',
          'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang'
        ]
      },
      {
        id: 'dn_ngu_hanh_son',
        name: 'Quận Ngũ Hành Sơn',
        wards: ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hoà Hải', 'Phường Hoà Quý']
      },
      {
        id: 'dn_lien_chieu',
        name: 'Quận Liên Chiểu',
        wards: ['Phường Hoà Hiệp Bắc', 'Phường Hoà Hiệp Nam', 'Phường Hoà Khánh Bắc', 'Phường Hoà Khánh Nam', 'Phường Hoà Minh']
      },
      {
        id: 'dn_cam_le',
        name: 'Quận Cẩm Lệ',
        wards: ['Phường Khuê Trung', 'Phường Hoà Phát', 'Phường Hoà An', 'Phường Hoà Thọ Tây', 'Phường Hoà Thọ Đông', 'Phường Hoà Xuân']
      }
    ]
  },
  {
    id: 'binh_duong',
    name: 'Tỉnh Bình Dương',
    districts: [
      {
        id: 'bd_thu_dau_mot',
        name: 'Thành phố Thủ Dầu Một',
        wards: [
          'Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa', 'Phường Phú Thọ',
          'Phường Phú Hòa', 'Phường Phú Lợi', 'Phường Phú Mỹ', 'Phường Định Hòa',
          'Phường Hiệp An', 'Phường Tân An', 'Phường Tương Bình Hiệp', 'Phường Chánh Mỹ',
          'Phường Hòa Phú', 'Phường Phú Tân'
        ]
      },
      {
        id: 'bd_thuan_an',
        name: 'Thành phố Thuận An',
        wards: [
          'Phường Lái Thiêu', 'Phường An Thạnh', 'Phường Vĩnh Phú', 'Phường Bình Hòa',
          'Phường Thuận Giao', 'Phường An Phú', 'Phường Bình Chuẩn', 'Phường Bình Nhâm',
          'Phường Hưng Định', 'Xã An Sơn'
        ]
      },
      {
        id: 'bd_di_an',
        name: 'Thành phố Dĩ An',
        wards: [
          'Phường Dĩ An', 'Phường An Bình', 'Phường Bình An', 'Phường Bình Thắng',
          'Phường Đông Hòa', 'Phường Tân Bình', 'Phường Tân Đông Hiệp'
        ]
      },
      {
        id: 'bd_tan_uyen',
        name: 'Thành phố Tân Uyên',
        wards: [
          'Phường Uyên Hưng', 'Phường Tân Phước Khánh', 'Phường Thái Hòa', 'Phường Thạnh Phước',
          'Phường Tân Hiệp', 'Phường Khánh Bình', 'Phường Hội Nghĩa', 'Phường Vĩnh Tân',
          'Phường Phú Chánh', 'Xã Bạch Đằng', 'Xã Thạnh Hội'
        ]
      },
      {
        id: 'bd_ben_cat',
        name: 'Thành phố Bến Cát',
        wards: [
          'Phường Mỹ Phước', 'Phường Thới Hòa', 'Phường Tân Định', 'Phường Hòa Lợi',
          'Phường Chánh Phú Hòa', 'Phường An Điền', 'Phường An Tây', 'Xã Phú An'
        ]
      }
    ]
  },
  {
    id: 'dong_nai',
    name: 'Tỉnh Đồng Nai',
    districts: [
      {
        id: 'dn_bien_hoa',
        name: 'Thành phố Biên Hòa',
        wards: [
          'Phường Trung Dũng', 'Phường Thanh Bình', 'Phường Quyết Thắng', 'Phường Hòa Bình',
          'Phường Quang Vinh', 'Phường Bửu Long', 'Phường Tân Phong', 'Phường Tân Tiến',
          'Phường Tân Mai', 'Phường Thống Nhất', 'Phường Tam Hiệp', 'Phường Tam Hòa',
          'Phường Tân Hiệp', 'Phường Hố Nai', 'Phường Trảng Dài', 'Phường Tân Hạnh',
          'Phường Hiệp Hòa', 'Phường An Bình', 'Phường Bình Đa', 'Phường Long Bình',
          'Phường Long Bình Tân', 'Phường Phước Tân', 'Phường Tam Phước'
        ]
      },
      {
        id: 'dn_long_khanh',
        name: 'Thành phố Long Khánh',
        wards: ['Phường Xuân An', 'Phường Xuân Bình', 'Phường Xuân Hòa', 'Phường Xuân Trung', 'Phường Xuân Thanh', 'Phường Phú Bình', 'Phường Bảo Vinh', 'Phường Suối Tre', 'Phường Bàu Sen', 'Phường Xuân Tân', 'Phường Hàng Gòn']
      },
      {
        id: 'dn_long_thanh',
        name: 'Huyện Long Thành',
        wards: ['Thị trấn Long Thành', 'Xã An Phước', 'Xã Bàu Cạn', 'Xã Bình An', 'Xã Bình Sơn', 'Xã Cẩm Đường', 'Xã Lộc An', 'Xã Long An', 'Xã Long Đức', 'Xã Phước Bình', 'Xã Phước Thái', 'Xã Tam An', 'Xã Tân Hiệp']
      },
      {
        id: 'dn_nhon_trach',
        name: 'Huyện Nhơn Trạch',
        wards: ['Thị trấn Hiệp Phước', 'Xã Đại Phước', 'Xã Long Tân', 'Xã Long Thọ', 'Xã Phú Đông', 'Xã Phú Hội', 'Xã Phú Hữu', 'Xã Phú Thạnh', 'Xã Phước An', 'Xã Phước Khánh', 'Xã Phước Thiền', 'Xã Vĩnh Thanh']
      }
    ]
  },
  {
    id: 'ba_ria_vung_tau',
    name: 'Tỉnh Bà Rịa - Vũng Tàu',
    districts: [
      {
        id: 'vt_vung_tau',
        name: 'Thành phố Vũng Tàu',
        wards: [
          'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7',
          'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường Thắng Nhất',
          'Phường Thắng Nhì', 'Phường Thắng Tam', 'Phường Rạch Dừa', 'Phường Nguyễn An Ninh', 'Xã Long Sơn'
        ]
      },
      {
        id: 'vt_ba_ria',
        name: 'Thành phố Bà Rịa',
        wards: ['Phường Phước Hiệp', 'Phường Phước Hưng', 'Phường Phước Nguyên', 'Phường Phước Trung', 'Phường Long Hương', 'Phường Long Tâm', 'Phường Long Toàn', 'Phường Kim Dinh', 'Xã Hòa Long', 'Xã Long Phước', 'Xã Tân Hưng']
      },
      {
        id: 'vt_phu_my',
        name: 'Thị xã Phú Mỹ',
        wards: ['Phường Phú Mỹ', 'Phường Hắc Dịch', 'Phường Mỹ Xuân', 'Phường Phước Hòa', 'Phường Tân Phước', 'Xã Châu Pha', 'Xã Sông Xoài', 'Xã Tân Hải', 'Xã Tân Hòa', 'Xã Tóc Tiên']
      }
    ]
  },
  {
    id: 'hai_phong',
    name: 'Thành phố Hải Phòng',
    districts: [
      {
        id: 'hp_hong_bang',
        name: 'Quận Hồng Bàng',
        wards: ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Quán Toan', 'Phường Sở Dầu', 'Phường Thượng Lý', 'Phường Trại Chuối', 'Phường Hùng Vương', 'Phường Cù Chính Lan']
      },
      {
        id: 'hp_ngo_quyen',
        name: 'Quận Ngô Quyền',
        wards: ['Phường Cầu Đất', 'Phường Cầu Tre', 'Phường Đằng Giang', 'Phường Đông Khê', 'Phường Đồng Quốc Bình', 'Phường Gia Viên', 'Phường Lạc Viên', 'Phường Lạch Tray', 'Phường Lê Lợi', 'Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ']
      },
      {
        id: 'hp_le_chan',
        name: 'Quận Lê Chân',
        wards: ['Phường An Biên', 'Phường An Dương', 'Phường Cát Dài', 'Phường Đông Hải', 'Phường Dư Hàng', 'Phường Dư Hàng Kênh', 'Phường Hàng Kênh', 'Phường Hồ Nam', 'Phường Kênh Dương', 'Phường Lam Sơn', 'Phường Niệm Nghĩa', 'Phường Nghĩa Xá', 'Phường Trại Cau', 'Phường Trần Nguyên Hãn', 'Phường Vĩnh Niệm']
      },
      {
        id: 'hp_thuy_nguyen',
        name: 'Thành phố Thủy Nguyên (Sáp nhập & Nâng cấp)',
        wards: ['Phường Núi Đèo', 'Phường Minh Đức', 'Phường An Lư', 'Phường Dương Quan', 'Phường Hoa Động', 'Phường Hoàng Lâm', 'Phường Kiền Bái', 'Phường Lập Lễ', 'Phường Lưu Kiếm', 'Phường Nam Triệu Giang', 'Phường Quảng Thanh', 'Phường Tam Hưng', 'Phường Thiên Hương', 'Phường Thủy Đường', 'Phường Thủy Hà', 'Phường Thủy Sơn', 'Phường Trần Hưng Đạo']
      }
    ]
  },
  {
    id: 'can_tho',
    name: 'Thành phố Cần Thơ',
    districts: [
      {
        id: 'ct_ninh_kieu',
        name: 'Quận Ninh Kiều',
        wards: ['Phường An Cư', 'Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường An Phú', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình', 'Phường Xuân Khánh']
      },
      {
        id: 'ct_cai_rang',
        name: 'Quận Cái Răng',
        wards: ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Phú Thứ', 'Phường Tân Phú', 'Phường Thường Thạnh']
      },
      {
        id: 'ct_binh_thuy',
        name: 'Quận Bình Thủy',
        wards: ['Phường An Thới', 'Phường Bình Thủy', 'Phường Bùi Hữu Nghĩa', 'Phường Long Hòa', 'Phường Long Tuyền', 'Phường Thới An Đông', 'Phường Trà An', 'Phường Trà Nóc']
      }
    ]
  },
  {
    id: 'khanh_hoa',
    name: 'Tỉnh Khánh Hòa',
    districts: [
      {
        id: 'kh_nha_trang',
        name: 'Thành phố Nha Trang',
        wards: ['Phường Lộc Thọ', 'Phường Ngọc Hiệp', 'Phường Phước Hải', 'Phường Phước Hòa', 'Phường Phước Long', 'Phường Phước Tân', 'Phường Phước Tiến', 'Phường Phương Sài', 'Phường Phương Sơn', 'Phường Tân Lập', 'Phường Vạn Thắng', 'Phường Vạn Thạnh', 'Phường Vĩnh Hải', 'Phường Vĩnh Hòa', 'Phường Vĩnh Phước', 'Phường Vĩnh Thọ', 'Phường Vĩnh Nguyên', 'Phường Vĩnh Trường', 'Phường Xương Huân']
      },
      {
        id: 'kh_cam_ranh',
        name: 'Thành phố Cam Ranh',
        wards: ['Phường Ba Ngòi', 'Phường Cam Linh', 'Phường Cam Lộc', 'Phường Cam Lợi', 'Phường Cam Nghĩa', 'Phường Cam Phú', 'Phường Cam Phúc Bắc', 'Phường Cam Phúc Nam', 'Phường Cam Thuận']
      }
    ]
  },
  {
    id: 'lam_dong',
    name: 'Tỉnh Lâm Đồng',
    districts: [
      {
        id: 'ld_da_lat',
        name: 'Thành phố Đà Lạt',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Xã Tà Nung', 'Xã Trạm Hành', 'Xã Xuân Thọ', 'Xã Xuân Trường']
      },
      {
        id: 'ld_bao_loc',
        name: 'Thành phố Bảo Lộc',
        wards: ['Phường 1', 'Phường 2', 'Phường B\'Lao', 'Phường Lộc Phát', 'Phường Lộc Sơn', 'Phường Lộc Tiến', 'Xã Đại Lào', 'Xã Đambri', 'Xã Lộc Châu', 'Xã Lộc Nga', 'Xã Lộc Thanh']
      }
    ]
  },
  {
    id: 'other',
    name: 'Các Tỉnh / Thành Phố Khác',
    districts: [
      {
        id: 'other_general',
        name: 'Thành phố / Thị xã / Huyện trực thuộc',
        wards: ['Phường / Xã trung tâm', 'Phường 1', 'Phường 2', 'Phường 3', 'Thị trấn trung tâm']
      }
    ]
  }
];

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanProvincePrefix(str: string): string {
  return str
    .toLowerCase()
    .replace(/^(thành phố|thành pho|thanh pho|tỉnh|tinh|thủ đô|thu do)\s+/i, '')
    .trim();
}

function cleanDistrictPrefix(str: string): string {
  return str
    .toLowerCase()
    .replace(/^(quận|quan|huyện|huyen|thị xã|thi xa|thành phố|thanh pho)\s+/i, '')
    .trim();
}

function cleanWardPrefix(str: string): string {
  return str
    .toLowerCase()
    .replace(/^(phường|phuong|xã|xa|thị trấn|thi tran)\s+/i, '')
    .trim();
}

/**
 * Parse a full address string back into structured Administrative locations
 */
export function parseFullAddress(rawAddress: string) {
  if (!rawAddress || typeof rawAddress !== 'string') {
    return {
      provinceId: 'hcm',
      districtId: 'hcm_thu_duc',
      wardName: 'Phường Thảo Điền',
      street: '',
    };
  }

  const trimmed = rawAddress.trim();

  // 1. Try segment parsing if separated by commas (Format: "Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/TP")
  const segments = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  if (segments.length >= 3) {
    const lastSeg = segments[segments.length - 1].toLowerCase();
    const secondLastSeg = segments[segments.length - 2].toLowerCase();
    const thirdLastSeg = segments.length >= 4 ? segments[segments.length - 3].toLowerCase() : '';

    const matchedProv = VIETNAM_PROVINCES.find((p) => {
      const pNameLower = p.name.toLowerCase();
      const pClean = cleanProvincePrefix(p.name);
      const segClean = cleanProvincePrefix(lastSeg);
      return (
        pNameLower === lastSeg ||
        pClean === segClean ||
        lastSeg.includes(pClean) ||
        pClean.includes(segClean)
      );
    });

    if (matchedProv) {
      const matchedDist = matchedProv.districts.find((d) => {
        const dNameLower = d.name.toLowerCase();
        const dClean = cleanDistrictPrefix(d.name);
        const segClean = cleanDistrictPrefix(secondLastSeg);
        return (
          dNameLower === secondLastSeg ||
          dClean === segClean ||
          new RegExp('(^|[^a-zA-Z0-9À-ỹ])' + escapeRegExp(d.name) + '([^a-zA-Z0-9À-ỹ]|$)', 'i').test(secondLastSeg) ||
          new RegExp('(^|[^a-zA-Z0-9À-ỹ])' + escapeRegExp(dClean) + '([^a-zA-Z0-9À-ỹ]|$)', 'i').test(segClean)
        );
      });

      if (matchedDist) {
        const matchedW = thirdLastSeg ? matchedDist.wards.find((w) => {
          const wNameLower = w.toLowerCase();
          const wClean = cleanWardPrefix(w);
          const segClean = cleanWardPrefix(thirdLastSeg);
          return (
            wNameLower === thirdLastSeg ||
            wClean === segClean ||
            new RegExp('(^|[^a-zA-Z0-9À-ỹ])' + escapeRegExp(w) + '([^a-zA-Z0-9À-ỹ]|$)', 'i').test(thirdLastSeg) ||
            new RegExp('(^|[^a-zA-Z0-9À-ỹ])' + escapeRegExp(wClean) + '([^a-zA-Z0-9À-ỹ]|$)', 'i').test(segClean)
          );
        }) : null;

        const street = segments.slice(0, thirdLastSeg ? segments.length - 3 : segments.length - 2).join(', ');

        return {
          provinceId: matchedProv.id,
          districtId: matchedDist.id,
          wardName: matchedW || matchedDist.wards[0] || '',
          street,
        };
      }
    }
  }

  // 2. Fallback matching with word boundaries & length-descending sort
  let matchedProvince = VIETNAM_PROVINCES[0];
  const sortedProvinces = [...VIETNAM_PROVINCES].sort((a, b) => b.name.length - a.name.length);
  for (const prov of sortedProvinces) {
    const provClean = cleanProvincePrefix(prov.name);
    const rx = new RegExp('(^|[^a-zA-Z0-9À-ỹ])' + escapeRegExp(provClean) + '([^a-zA-Z0-9À-ỹ]|$)', 'i');
    if (rx.test(trimmed) || trimmed.toLowerCase().includes(prov.name.toLowerCase())) {
      matchedProvince = prov;
      break;
    }
  }

  let matchedDistrict = matchedProvince.districts[0];
  if (matchedProvince) {
    const sortedDistricts = [...matchedProvince.districts].sort((a, b) => b.name.length - a.name.length);
    for (const dist of sortedDistricts) {
      const rx = new RegExp('(^|[^a-zA-Z0-9À-ỹ])' + escapeRegExp(dist.name) + '([^a-zA-Z0-9À-ỹ]|$)', 'i');
      if (rx.test(trimmed)) {
        matchedDistrict = dist;
        break;
      }
    }
  }

  let matchedWard = matchedDistrict?.wards[0] || '';
  if (matchedDistrict) {
    const sortedWards = [...matchedDistrict.wards].sort((a, b) => b.length - a.length);
    for (const ward of sortedWards) {
      const rx = new RegExp('(^|[^a-zA-Z0-9À-ỹ])' + escapeRegExp(ward) + '([^a-zA-Z0-9À-ỹ]|$)', 'i');
      if (rx.test(trimmed)) {
        matchedWard = ward;
        break;
      }
    }
  }

  // Extract street address (part before ward, district, province)
  let remaining = trimmed;
  if (matchedWard && trimmed.includes(matchedWard)) {
    const parts = trimmed.split(matchedWard);
    remaining = parts[0].replace(/,\s*$/, '').trim();
  } else if (matchedDistrict && trimmed.includes(matchedDistrict.name)) {
    const parts = trimmed.split(matchedDistrict.name);
    remaining = parts[0].replace(/,\s*$/, '').trim();
  } else if (matchedProvince && trimmed.includes(matchedProvince.name)) {
    const parts = trimmed.split(matchedProvince.name);
    remaining = parts[0].replace(/,\s*$/, '').trim();
  }

  return {
    provinceId: matchedProvince.id,
    districtId: matchedDistrict?.id || '',
    wardName: matchedWard || '',
    street: remaining,
  };
}


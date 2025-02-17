package request

type AddressRequest struct {
	Street            string `json:"street" validate:"required"`
	ProvinceID        int    `json:"province_id" validate:"required"`
	ProvinceNameTH    string `json:"province_name_th"`
	ProvinceNameEN    string `json:"province_name_en"`
	DistrictID        int    `json:"district_id" validate:"required"`
	DistrictNameTH    string `json:"district_name_th"`
	DistrictNameEN    string `json:"district_name_en"`
	SubDistrictID     int    `json:"sub_district_id" validate:"required"`
	SubDistrictNameTH string `json:"sub_district_name_th"`
	SubDistrictNameEN string `json:"sub_district_name_en"`
	PostalCode        int    `json:"postal_code" validate:"required"`
	AddressDetail     string `json:"address_detail"`
	UserID            int    `json:"user_id" validate:"required"` // เชื่อมโยงกับผู้ใช้
}

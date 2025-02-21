package repositories

import (
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	addressModel "github.com/baimhons/nom-naa-shop.git/internal/models/address_models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AddressRepository interface {
	BaseRepository[models.Address]
	GetAllByUserID(userID uuid.UUID, items *[]models.Address) error

	// Add methods for province, districts, sub-districts
	GetProvinceByID(provinceID int, province *addressModel.Province) error
	GetDistrictByID(districtID int, district *addressModel.Districts) error
	GetSubDistrictByID(subDistrictID int, subDistrict *addressModel.SubDistricts) error
	GetAllByProvinceCode(provinceCode int, districts *[]addressModel.Districts) error
	GetAllByDistrictCode(districtCode int, subDistricts *[]addressModel.SubDistricts) error
}

type addressRepository struct {
	BaseRepository[models.Address]
	DB *gorm.DB
}

func NewAddressRepository(db *gorm.DB) AddressRepository {
	return &addressRepository{
		BaseRepository: NewBaseRepository[models.Address](db),
		DB:             db,
	}
}

func (ar *addressRepository) GetAllByUserID(userID uuid.UUID, items *[]models.Address) error {
	return ar.DB.Where("user_id = ?", userID).Find(items).Error
}

func (ar *addressRepository) GetProvinceByID(provinceID int, province *addressModel.Province) error {
	return ar.DB.Where("id = ?", provinceID).First(province).Error
}

func (ar *addressRepository) GetDistrictByID(districtID int, district *addressModel.Districts) error {
	return ar.DB.Where("id = ?", districtID).First(district).Error
}

func (ar *addressRepository) GetSubDistrictByID(subDistrictID int, subDistrict *addressModel.SubDistricts) error {
	return ar.DB.Where("id = ?", subDistrictID).First(subDistrict).Error
}

func (ar *addressRepository) GetAllByProvinceCode(provinceCode int, districts *[]addressModel.Districts) error {
	return ar.DB.Where("province_code = ?", provinceCode).Find(districts).Error
}

func (ar *addressRepository) GetAllByDistrictCode(districtCode int, subDistricts *[]addressModel.SubDistricts) error {
	return ar.DB.Where("district_code = ?", districtCode).Find(subDistricts).Error
}

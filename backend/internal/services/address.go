package services

import (
	"fmt"
	"time"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	addressModel "github.com/baimhons/nom-naa-shop.git/internal/models/address_models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/google/uuid"
)

type AddressService interface {
	CreateAddress(req request.CreateAddressRequest, userContext models.UserContext) (models.Address, error)
	UpdateAddress(req request.UpdateAddressRequest, userContext models.UserContext) (models.Address, error)
	DeleteAddress(addressID uuid.UUID) error
	GetAddressByID(addressID uuid.UUID, userContext models.UserContext) (models.Address, error)
	GetAllAddressByUserID(userID uuid.UUID, userContext models.UserContext) ([]models.Address, error)

	GetProvinceByCode(provinceCode int) (addressModel.Province, error)
	GetDistrictByCode(districtCode int) (addressModel.Districts, error)
	GetSubDistrictByCode(subDistrictCode int) (addressModel.SubDistricts, error)
	GetAllProvince() ([]addressModel.Province, error)
	GetAllDistrictsByProvinceCode(provinceCode int) ([]addressModel.Districts, error)
	GetAllSubDistrictsByDistrictCode(districtCode int) ([]addressModel.SubDistricts, error)
	GetPostalCode(subDistrictCode int) (int, error)
}

type addressServiceImpl struct {
	addressRepository repositories.AddressRepository
	provinceRepo      repositories.RegionRepository[addressModel.Province]
	districtRepo      repositories.RegionRepository[addressModel.Districts]
	subDistrictRepo   repositories.RegionRepository[addressModel.SubDistricts]
}

func NewAddressService(
	addressRepository repositories.AddressRepository,
	provinceRepo repositories.RegionRepository[addressModel.Province],
	districtRepo repositories.RegionRepository[addressModel.Districts],
	subDistrictRepo repositories.RegionRepository[addressModel.SubDistricts],
) AddressService {
	return &addressServiceImpl{
		addressRepository: addressRepository,
		provinceRepo:      provinceRepo,
		districtRepo:      districtRepo,
		subDistrictRepo:   subDistrictRepo,
	}
}

func (as *addressServiceImpl) GetProvinceByCode(provinceCode int) (addressModel.Province, error) {
	var province addressModel.Province
	if err := as.provinceRepo.GetByCode(provinceCode, &province); err != nil {
		return addressModel.Province{}, err
	}
	return province, nil
}

func (as *addressServiceImpl) GetDistrictByCode(districtCode int) (addressModel.Districts, error) {
	var district addressModel.Districts
	if err := as.districtRepo.GetByCode(districtCode, &district); err != nil {
		return addressModel.Districts{}, err
	}
	return district, nil
}

func (as *addressServiceImpl) GetSubDistrictByCode(subDistrictCode int) (addressModel.SubDistricts, error) {
	var subDistrict addressModel.SubDistricts
	if err := as.subDistrictRepo.GetByCode(subDistrictCode, &subDistrict); err != nil {
		return addressModel.SubDistricts{}, err
	}
	return subDistrict, nil
}

func (as *addressServiceImpl) CreateAddress(req request.CreateAddressRequest, userContext models.UserContext) (models.Address, error) {
	if userContext.ID == "" {
		return models.Address{}, fmt.Errorf("unauthorized user")
	}

	userUUID, err := uuid.Parse(userContext.ID)
	if err != nil {
		return models.Address{}, fmt.Errorf("invalid user context")
	}

	address := models.Address{
		ProvinceCode:    req.ProvinceCode,
		DistrictCode:    req.DistrictCode,
		SubDistrictCode: req.SubDistrictCode,
		AddressDetail:   req.AddressDetail,
		UserID:          userUUID,
	}

	provinceNameTH, err := as.GetNameProvince(address.ProvinceCode)
	if err != nil {
		return models.Address{}, err
	}
	address.ProvinceNameTH = provinceNameTH

	districtNameTH, err := as.GetNameDistrict(address.DistrictCode)
	if err != nil {
		return models.Address{}, err
	}
	address.DistrictNameTH = districtNameTH

	subDistrictNameTH, err := as.GetNameSubDistrict(address.SubDistrictCode)
	if err != nil {
		return models.Address{}, err
	}
	address.SubDistrictNameTH = subDistrictNameTH

	postalCode, err := as.GetPostalCode(address.SubDistrictCode)
	if err != nil {
		return models.Address{}, err
	}
	address.PostalCode = postalCode

	if err := as.addressRepository.Create(&address); err != nil {
		return models.Address{}, err
	}

	return address, nil
}

func (as *addressServiceImpl) UpdateAddress(req request.UpdateAddressRequest, userContext models.UserContext) (models.Address, error) {
	if userContext.ID == "" {
		return models.Address{}, fmt.Errorf("unauthorized user")
	}

	userUUID, err := uuid.Parse(userContext.ID)
	if err != nil {
		return models.Address{}, fmt.Errorf("invalid user context")
	}

	address := models.Address{
		BaseModel: models.BaseModel{
			ID:       req.ID,
			UpdateAt: time.Now(),
		},
		ProvinceCode:    req.ProvinceCode,
		DistrictCode:    req.DistrictCode,
		SubDistrictCode: req.SubDistrictCode,
		AddressDetail:   req.AddressDetail,
		UserID:          userUUID,
	}

	provinceNameTH, err := as.GetNameProvince(address.ProvinceCode)
	if err != nil {
		return models.Address{}, err
	}
	address.ProvinceNameTH = provinceNameTH

	districtNameTH, err := as.GetNameDistrict(address.DistrictCode)
	if err != nil {
		return models.Address{}, err
	}
	address.DistrictNameTH = districtNameTH

	subDistrictNameTH, err := as.GetNameSubDistrict(address.SubDistrictCode)
	if err != nil {
		return models.Address{}, err
	}
	address.SubDistrictNameTH = subDistrictNameTH

	postalCode, err := as.GetPostalCode(address.SubDistrictCode)
	if err != nil {
		return models.Address{}, err
	}
	address.PostalCode = postalCode

	if err := as.addressRepository.Update(&address); err != nil {
		return models.Address{}, err
	}

	return address, nil
}

func (as *addressServiceImpl) DeleteAddress(addressID uuid.UUID) error {
	address := models.Address{
		BaseModel: models.BaseModel{
			ID: addressID,
		},
	}
	return as.addressRepository.Delete(&address)
}

func (as *addressServiceImpl) GetAddressByID(addressID uuid.UUID, userContext models.UserContext) (models.Address, error) {
	if userContext.ID == "" {
		return models.Address{}, fmt.Errorf("unauthorized user")
	}

	var address models.Address
	if err := as.addressRepository.GetByID(&address, addressID); err != nil {
		return models.Address{}, err
	}
	return address, nil
}

func (as *addressServiceImpl) GetAllAddressByUserID(userID uuid.UUID, userContext models.UserContext) ([]models.Address, error) {
	if userContext.ID == "" {
		return nil, fmt.Errorf("unauthorized user")
	}

	userUUID, err := uuid.Parse(userContext.ID)
	if err != nil {
		return nil, fmt.Errorf("invalid user context")
	}

	if userUUID != userID {
		return nil, fmt.Errorf("unauthorized user")
	}

	var addresses []models.Address
	if err := as.addressRepository.GetAllByUserID(userID, &addresses); err != nil {
		return nil, err
	}
	return addresses, nil
}

func (as *addressServiceImpl) GetNameProvince(provinceCode int) (string, error) {
	province, err := as.GetProvinceByCode(provinceCode)
	if err != nil {
		return "", err
	}
	return province.NameTH, nil
}

func (as *addressServiceImpl) GetNameDistrict(districtCode int) (string, error) {
	district, err := as.GetDistrictByCode(districtCode)
	if err != nil {
		return "", err
	}
	return district.NameTH, nil
}

func (as *addressServiceImpl) GetNameSubDistrict(subDistrictCode int) (string, error) {
	subDistrict, err := as.GetSubDistrictByCode(subDistrictCode)
	if err != nil {
		return "", err
	}
	return subDistrict.NameTH, nil
}

func (as *addressServiceImpl) GetAllProvince() ([]addressModel.Province, error) {
	var provinces []addressModel.Province
	if err := as.provinceRepo.GetAll(&provinces); err != nil {
		return nil, err
	}
	return provinces, nil
}

func (as *addressServiceImpl) GetAllDistrictsByProvinceCode(provinceCode int) ([]addressModel.Districts, error) {
	var districts []addressModel.Districts
	if err := as.addressRepository.GetAllDistrictsByProvinceCode(provinceCode, &districts); err != nil {
		return nil, err
	}
	return districts, nil
}

func (as *addressServiceImpl) GetAllSubDistrictsByDistrictCode(districtCode int) ([]addressModel.SubDistricts, error) {
	var subDistricts []addressModel.SubDistricts
	if err := as.addressRepository.GetAllSubDistrictsByDistrictCode(districtCode, &subDistricts); err != nil {
		return nil, err
	}
	return subDistricts, nil
}

func (as *addressServiceImpl) GetPostalCode(subDistrictCode int) (int, error) {
	subDistrict, err := as.GetSubDistrictByCode(subDistrictCode)
	if err != nil {
		return 0, err
	}
	return subDistrict.PostalCode, nil
}

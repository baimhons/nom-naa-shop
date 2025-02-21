package services

import (
	"time"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	addressModel "github.com/baimhons/nom-naa-shop.git/internal/models/address_models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/google/uuid"
)

type AddressService interface {
	CreateAddress(req request.CreateAddressRequest) (models.Address, error)
	UpdateAddress(req request.UpdateAddressRequest) (models.Address, error)
	DeleteAddress(addressID uuid.UUID) error
	GetAddressByID(addressID uuid.UUID) (models.Address, error)
	GetAllAddressByUserID(userID uuid.UUID) ([]models.Address, error)

	// Add region lookups
	GetProvinceByID(provinceID int) (addressModel.Province, error)
	GetDistrictByID(districtID int) (addressModel.Districts, error)
	GetSubDistrictByID(subDistrictID int) (addressModel.SubDistricts, error)
	GetAllDistrictsByProvinceID(provinceID int) ([]addressModel.Districts, error)
	GetAllSubDistrictsByDistrictID(districtID int) ([]addressModel.SubDistricts, error)
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

func (as *addressServiceImpl) GetProvinceByID(provinceID int) (addressModel.Province, error) {
	var province addressModel.Province
	if err := as.provinceRepo.GetByID(provinceID, &province); err != nil {
		return addressModel.Province{}, err
	}
	return province, nil
}

func (as *addressServiceImpl) GetDistrictByID(districtID int) (addressModel.Districts, error) {
	var district addressModel.Districts
	if err := as.districtRepo.GetByID(districtID, &district); err != nil {
		return addressModel.Districts{}, err
	}
	return district, nil
}

func (as *addressServiceImpl) GetSubDistrictByID(subDistrictID int) (addressModel.SubDistricts, error) {
	var subDistrict addressModel.SubDistricts
	if err := as.subDistrictRepo.GetByID(subDistrictID, &subDistrict); err != nil {
		return addressModel.SubDistricts{}, err
	}
	return subDistrict, nil
}

func (as *addressServiceImpl) CreateAddress(req request.CreateAddressRequest) (models.Address, error) {
	address := models.Address{
		Street:        req.Street,
		ProvinceID:    req.ProvinceID,
		DistrictID:    req.DistrictID,
		SubDistrictID: req.SubDistrictID,
		PostalCode:    req.PostalCode,
		AddressDetail: req.AddressDetail,
		UserID:        uuid.MustParse(req.UserID),
	}

	if err := as.addressRepository.Create(&address); err != nil {
		return models.Address{}, err
	}

	return address, nil
}

func (as *addressServiceImpl) UpdateAddress(req request.UpdateAddressRequest) (models.Address, error) {
	address := models.Address{
		BaseModel: models.BaseModel{
			ID:       req.ID,
			UpdateAt: time.Now(),
		},
		ProvinceID:    req.ProvinceID,
		DistrictID:    req.DistrictID,
		SubDistrictID: req.SubDistrictID,
		PostalCode:    req.PostalCode,
		AddressDetail: req.AddressDetail,
	}

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

func (as *addressServiceImpl) GetAddressByID(addressID uuid.UUID) (models.Address, error) {
	var address models.Address
	if err := as.addressRepository.GetByID(&address, addressID.String()); err != nil {
		return models.Address{}, err
	}
	return address, nil
}

func (as *addressServiceImpl) GetAllAddressByUserID(userID uuid.UUID) ([]models.Address, error) {
	var addresses []models.Address
	if err := as.addressRepository.GetAllByUserID(userID, &addresses); err != nil {
		return nil, err
	}
	return addresses, nil
}

func (as *addressServiceImpl) GetAllDistrictsByProvinceID(provinceCode int) ([]addressModel.Districts, error) {
	var districts []addressModel.Districts
	if err := as.addressRepository.GetAllByProvinceCode(provinceCode, &districts); err != nil {
		return nil, err
	}
	return districts, nil
}

func (as *addressServiceImpl) GetAllSubDistrictsByDistrictID(districtCode int) ([]addressModel.SubDistricts, error) {
	var subDistricts []addressModel.SubDistricts
	if err := as.addressRepository.GetAllByDistrictCode(districtCode, &subDistricts); err != nil {
		return nil, err
	}
	return subDistricts, nil
}

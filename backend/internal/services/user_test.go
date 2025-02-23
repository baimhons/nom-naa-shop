package services_test

import (
	"net/http"
	"testing"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	mock_repository "github.com/baimhons/nom-naa-shop.git/internal/mock/repository"
	mock_utils "github.com/baimhons/nom-naa-shop.git/internal/mock/utils"
	"github.com/baimhons/nom-naa-shop.git/internal/services"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type RegisterUserTestSuite struct {
	suite.Suite
	service      services.UserService
	mockRedis    *mock_utils.MockRedis
	mockBcrypt   *mock_utils.MockBcrypt
	mockUserRepo *mock_repository.MockUserRepository
}

func (s *RegisterUserTestSuite) SetupTest() {
	s.mockUserRepo = new(mock_repository.MockUserRepository)
	s.mockRedis = new(mock_utils.MockRedis)
	s.mockBcrypt = new(mock_utils.MockBcrypt)
	s.service = services.NewUserService(s.mockUserRepo, s.mockRedis)
}

func (s *RegisterUserTestSuite) TestRegisterUserSuccess() {
	// Mock GetBy ตรวจสอบ username ก่อน
	s.mockUserRepo.On("GetBy", "username", "testuser", mock.AnythingOfType("*models.User")).Return(gorm.ErrRecordNotFound)

	// Mock GetBy ตรวจสอบ email
	s.mockUserRepo.On("GetBy", "email", "test@example.com", mock.AnythingOfType("*models.User")).Return(gorm.ErrRecordNotFound)

	// Mock Create ให้สำเร็จ
	s.mockUserRepo.On("Create", mock.AnythingOfType("*models.User")).Return(nil)

	// เรียกใช้งานฟังก์ชัน RegisterUser
	_, status, err := s.service.RegisterUser(request.RegisterUser{
		Username:        "testuser",
		Email:           "test@example.com",
		Password:        "password123",
		ConfirmPassword: "password123",
		PhoneNumber:     "08123456",
		FirstName:       "John",
		LastName:        "Doe",
	})

	// ตรวจสอบว่าไม่มี error และ status เป็น 201 Created
	s.Require().NoError(err)
	s.Require().Equal(http.StatusCreated, status)

	// ตรวจสอบว่า mock ถูกเรียกตามที่คาดหวัง
	s.mockUserRepo.AssertCalled(s.T(), "GetBy", "username", "testuser", mock.AnythingOfType("*models.User"))
	s.mockUserRepo.AssertCalled(s.T(), "GetBy", "email", "test@example.com", mock.AnythingOfType("*models.User"))
	s.mockUserRepo.AssertCalled(s.T(), "Create", mock.AnythingOfType("*models.User"))
}

func (s *RegisterUserTestSuite) TestRegisterUserExist() {
	s.mockUserRepo.On("GetBy", "email", "test@example.com", mock.Anything).Return(nil)

	_, status, err := s.service.RegisterUser(request.RegisterUser{
		Username:        "testuser",
		Email:           "test@example.com",
		Password:        "password123",
		ConfirmPassword: "password123",
		PhoneNumber:     "08123456",
		FirstName:       "John",
		LastName:        "Doe",
	})

	s.Require().Error(err)
	s.Require().Equal(http.StatusConflict, status)
	s.mockUserRepo.AssertCalled(s.T(), "GetBy", "email", "test@example.com", mock.Anything)
}

func TestRegisterUser(t *testing.T) {
	suite.Run(t, new(RegisterUserTestSuite))
}

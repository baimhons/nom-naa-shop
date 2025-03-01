package mock_repository

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) GetAll(items *[]models.User, pagination *request.PaginationQuery) error {
	args := m.Called(items, pagination)
	return args.Error(0)
}

func (m *MockUserRepository) GetByID(user *models.User, id uuid.UUID) error {
	args := m.Called(user, id)
	return args.Error(0)
}

func (m *MockUserRepository) Create(item *models.User) error {
	args := m.Called(item)
	return args.Error(0)
}

func (m *MockUserRepository) CreateMany(items *[]models.User) error {
	args := m.Called(items)
	return args.Error(0)
}

func (m *MockUserRepository) Update(item *models.User) error {
	args := m.Called(item)
	return args.Error(0)
}

func (m *MockUserRepository) UpdateMany(items *[]models.User) error {
	args := m.Called(items)
	return args.Error(0)
}

func (m *MockUserRepository) Save(item *models.User) error {
	args := m.Called(item)
	return args.Error(0)
}

func (m *MockUserRepository) SaveMany(items *[]models.User) error {
	args := m.Called(items)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(item *models.User) error {
	args := m.Called(item)
	return args.Error(0)
}

func (m *MockUserRepository) GetBy(field string, value string, item *models.User) error {
	args := m.Called(field, value, item)
	return args.Error(0)
}

func (m *MockUserRepository) Begin() *gorm.DB {

	return &gorm.DB{} // ✅ ป้องกัน panic โดยคืน *gorm.DB เสมอ
}

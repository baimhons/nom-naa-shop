package repositories

import (
	"gorm.io/gorm"
)

type OrderRepository interface {
	GetDB() *gorm.DB
}

type OrderRepositoryImpl struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &OrderRepositoryImpl{
		db: db,
	}
}

func (r *OrderRepositoryImpl) GetDB() *gorm.DB {
	return r.db
}

// ... other methods

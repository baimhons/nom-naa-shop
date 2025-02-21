package repositories

import "gorm.io/gorm"

type RegionRepository[T any] interface {
	GetByID(id int, item *T) error
}

type regionRepository[T any] struct {
	DB *gorm.DB
}

func NewRegionRepository[T any](db *gorm.DB) RegionRepository[T] {
	return &regionRepository[T]{DB: db}
}

func (r *regionRepository[T]) GetByID(id int, item *T) error {
	return r.DB.Where("id = ?", id).First(item).Error
}

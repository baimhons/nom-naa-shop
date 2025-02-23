package repositories

import "gorm.io/gorm"

type RegionRepository[T any] interface {
	GetByID(id int, item *T) error
	GetByCode(code int, item *T) error
	GetAll(items *[]T) error
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

func (r *regionRepository[T]) GetAll(items *[]T) error {
	return r.DB.Find(items).Error
}

func (r *regionRepository[T]) GetByCode(code int, item *T) error {
	return r.DB.Where("code = ?", code).First(item).Error
}

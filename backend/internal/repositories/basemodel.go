package repositories

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"gorm.io/gorm"
)

type BaseRepository[T any] interface {
}

type baseRepository[T any] struct {
	db *gorm.DB
}

func NewBaseRepository[T any](db *gorm.DB) BaseRepository[T] {
	return &baseRepository[T]{db: db}
}

func (r *baseRepository[T]) GetAll(items *[]T, pagination *request.PaginationQuery) error {
	query := r.db

	if pagination.Page != nil && pagination.PageSize != nil {
		offset := *pagination.Page * *pagination.PageSize
		query = query.Offset(offset).Limit(*pagination.PageSize)
	}

	if pagination.Sort != nil && pagination.Order != nil {
		orderClause := *pagination.Sort + " " + *pagination.Order
		query = query.Order(orderClause)
	}

	return query.Find(items).Error
}

func (r *baseRepository[T]) GetBy(field string, value string, item *T) error {
	return r.db.Where(field+" = ?", value).First(item).Error
}

func (r *baseRepository[T]) GetByID(item *T, id string) error {
	return r.db.Where("id = ?", id).First(item).Error
}

func (r *baseRepository[T]) Create(item *T) error {
	return r.db.Create(item).Error
}

func (r *baseRepository[T]) Update(item *T) error {
	return r.db.Save(item).Error
}

func (r *baseRepository[T]) Delete(item *T) error {
	return r.db.Delete(item).Error
}

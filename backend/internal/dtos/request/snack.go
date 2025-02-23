package request

import (
	"io"
	"mime/multipart"

	"github.com/baimhons/nom-naa-shop.git/internal/models"
)

type CreateSnackRequest struct {
	Name        string                  `form:"name" validate:"required" `
	Price       float64                 `form:"price" validate:"required"`
	Quantity    int                     `form:"quantity" validate:"required"`
	Type        string                  `form:"type" validate:"required"`
	Description string                  `form:"description" validate:"required"`
	Files       []*multipart.FileHeader `form:"files" `
}

func (r *CreateSnackRequest) ToModel() (*models.Snack, error) {

	imageFile, err := r.Files[0].Open()
	if err != nil {
		return nil, err
	}

	defer imageFile.Close()

	imageBytes, err := io.ReadAll(imageFile)
	if err != nil {
		return nil, err
	}

	return &models.Snack{
		Name:        r.Name,
		Price:       r.Price,
		Quantity:    r.Quantity,
		Type:        r.Type,
		Description: r.Description,
		Image:       imageBytes,
	}, nil
}

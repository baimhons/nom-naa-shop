package services

import (
	"net/http"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/google/uuid"
)

type SnackService interface {
	CreateSnack(req request.CreateSnackRequest) (resp response.SuccessResponse, statusCode int, err error)
	GetAllSnacks(querys request.PaginationQuery) (resp response.SuccessResponse, statusCode int, err error)
	GetSnackByID(id uuid.UUID) (resp response.SuccessResponse, statusCode int, err error)
}

type snackServiceImpl struct {
	snackRepository repositories.SnackRepository
}

func NewSnackService(snackRepository repositories.SnackRepository) SnackService {
	return &snackServiceImpl{snackRepository: snackRepository}
}

func (s *snackServiceImpl) CreateSnack(req request.CreateSnackRequest) (resp response.SuccessResponse, statusCode int, err error) {

	snack, err := req.ToModel()
	if err != nil {
		return resp, http.StatusInternalServerError, err
	}

	if err := s.snackRepository.Create(snack); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return response.SuccessResponse{
		Message: "Snack created successfully",
		Data:    snack,
	}, http.StatusCreated, nil
}

func (s *snackServiceImpl) GetAllSnacks(querys request.PaginationQuery) (resp response.SuccessResponse, statusCode int, err error) {
	snacks := []models.Snack{}
	if err := s.snackRepository.GetAll(&snacks, &querys); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return response.SuccessResponse{
		Message: "Snacks fetched successfully",
		Data:    snacks,
	}, http.StatusOK, nil
}

func (s *snackServiceImpl) GetSnackByID(id uuid.UUID) (resp response.SuccessResponse, statusCode int, err error) {
	snack := models.Snack{}
	if err := s.snackRepository.GetByID(&snack, id); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return response.SuccessResponse{
		Message: "Snack fetched successfully",
		Data:    snack,
	}, http.StatusOK, nil
}

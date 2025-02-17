package services

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
)

type UserService interface {
	RegisterUser(req request.RegisterUser) (resp response.CreateUserResponse, statusCode int, err error)
}

type userService struct {
	userRepository repositories.UserRepository
}

func NewUserService(userRepository repositories.UserRepository) UserService {
	return &userService{
		userRepository: userRepository,
	}
}
func (us *userService) RegisterUser(req request.RegisterUser) (resp response.CreateUserResponse, statusCode int, err error) {
	return resp, statusCode, err
}

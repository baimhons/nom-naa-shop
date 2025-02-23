package services

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/baimhons/nom-naa-shop.git/internal/utils"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService interface {
	RegisterUser(req request.RegisterUser) (resp response.SuccessResponse, statusCode int, err error)
	LoginUser(req request.LoginUser) (resp response.SuccessResponse, statusCode int, err error)
	LogoutUser(userContext models.UserContext) (statusCode int, err error)
	GetUserProfile(userContext models.UserContext) (resp response.SuccessResponse, statusCode int, err error)
	GetAllUsers() (resp response.SuccessResponse, statusCode int, err error)
	UpdateUser(req request.UpdateUser) (resp response.SuccessResponse, statusCode int, err error)
}

type userServiceImpl struct {
	userRepository repositories.UserRepository
	redis          utils.RedisClient
}

func NewUserService(userRepository repositories.UserRepository, redis utils.RedisClient) UserService {
	return &userServiceImpl{
		userRepository: userRepository,
		redis:          redis,
	}
}
func (us *userServiceImpl) RegisterUser(req request.RegisterUser) (resp response.SuccessResponse, statusCode int, err error) {
	user := models.User{}

	if err := us.userRepository.GetBy("email", req.Email, &user); err == nil {
		return resp, http.StatusConflict, errors.New("email already exists")
	}

	if err := us.userRepository.GetBy("username", req.Username, &user); err == nil {
		return resp, http.StatusConflict, errors.New("username already exists")
	}

	newUser := models.User{
		Username:    req.Username,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
		Role:        "user",
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return resp, http.StatusInternalServerError, err
	}

	newUser.Password = string(hashPassword)

	if err := us.userRepository.Create(&newUser); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return response.SuccessResponse{
		Message: "User registered successfully!",
		Data:    nil,
	}, http.StatusCreated, nil
}

func (us *userServiceImpl) LoginUser(req request.LoginUser) (resp response.SuccessResponse, statusCode int, err error) {
	user := models.User{}
	if err := us.userRepository.GetBy("email", req.Email, &user); err != nil {
		if err == gorm.ErrRecordNotFound {
			return resp, http.StatusNotFound, errors.New("user not found")
		}
		return resp, http.StatusInternalServerError, err
	}

	if user.Role == "user" {
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			return resp, http.StatusUnauthorized, err
		}
	}

	timeNow := time.Now()
	accessTokenExp := timeNow.Add(time.Hour * 1)
	refreshTokenExp := timeNow.Add(time.Hour * 24)

	accessToken, err := utils.GenerateToken(map[string]interface{}{
		"id":       user.ID,
		"email":    user.Email,
		"username": user.Username,
		"exp":      accessTokenExp.Unix(),
	}, accessTokenExp.Unix())

	if err != nil {
		return resp, http.StatusInternalServerError, err
	}

	refreshToken, err := utils.GenerateToken(map[string]interface{}{
		"id":       user.ID,
		"email":    user.Email,
		"username": user.Username,
		"exp":      refreshTokenExp.Unix(),
	}, refreshTokenExp.Unix())

	if err != nil {
		return resp, http.StatusInternalServerError, err
	}

	if err := us.redis.Set(context.Background(), fmt.Sprintf("access_token:%s", user.ID), accessToken, accessTokenExp.Sub(timeNow)); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	if err := us.redis.Set(context.Background(), fmt.Sprintf("refresh_token:%s", user.ID), refreshToken, refreshTokenExp.Sub(timeNow)); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return response.SuccessResponse{
		Message: "User logged in successfully!",
		Data: response.LoginUserResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	}, http.StatusOK, nil
}

func (us *userServiceImpl) LogoutUser(userContext models.UserContext) (statusCode int, err error) {
	if err := us.redis.Del(context.Background(), fmt.Sprintf("access_token:%s", userContext.ID)); err != nil {
		return http.StatusInternalServerError, err
	}

	if err := us.redis.Del(context.Background(), fmt.Sprintf("refresh_token:%s", userContext.ID)); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (us *userServiceImpl) GetUserProfile(userContext models.UserContext) (resp response.SuccessResponse, statusCode int, err error) {
	user := models.User{}
	if err := us.userRepository.GetBy("id", userContext.ID, &user); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return response.SuccessResponse{
		Message: "User fetched successfully",
		Data: response.UserProfileResponse{
			ID:          user.ID,
			Username:    user.Username,
			Email:       user.Email,
			PhoneNumber: user.PhoneNumber,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
		},
	}, http.StatusOK, nil
}

func (us *userServiceImpl) GetAllUsers() (resp response.SuccessResponse, statusCode int, err error) {
	users := []models.User{}
	if err := us.userRepository.GetAll(&users, nil); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return response.SuccessResponse{
		Message: "Users fetched successfully",
		Data:    users,
	}, http.StatusOK, nil
}

func (us *userServiceImpl) UpdateUser(req request.UpdateUser) (resp response.SuccessResponse, statusCode int, err error) {
	user := models.User{}
	if err := us.userRepository.GetBy("email", req.Email, &user); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	user.Username = req.Username
	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.Email = req.Email
	user.PhoneNumber = req.PhoneNumber

	if err := us.userRepository.Update(&user); err != nil {
		return resp, http.StatusInternalServerError, err
	}

	return resp, http.StatusOK, nil
}

package services

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	RegisterUser(c *fiber.Ctx) error
	LoginUser(c *fiber.Ctx) error
	SaveAddress(c *fiber.Ctx) error
}

type userService struct {
	userRepository repositories.UserRepository
}

func NewUserService(userRepository repositories.UserRepository) UserService {
	return &userService{
		userRepository: userRepository,
	}
}
func (us *userService) RegisterUser(c *fiber.Ctx) error {
	req := c.Locals("req").(request.RegisterUser)

	user := models.User{
		Username:    req.Username,
		Password:    req.Password,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Role:        "user",
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	user.Password = string(hashedPassword)

	if err := us.userRepository.Create(&user); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	var userResponse response.UserResponse
	userResponse.BaseModel = response.BaseModel{
		ID:       user.ID,
		CreateAt: user.CreateAt,
		UpdateAt: user.UpdateAt,
	}
	userResponse.Username = user.Username
	userResponse.Email = user.Email
	userResponse.PhoneNumber = user.PhoneNumber
	userResponse.FirstName = user.FirstName
	userResponse.LastName = user.LastName

	return c.Status(fiber.StatusCreated).JSON(response.SuccessResponse{
		Message: "user created successfully",
		Data:    userResponse,
	})
}

func (us *userService) LoginUser(c *fiber.Ctx) error {
	var req request.LoginUser

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	user, err := us.userRepository.FindUser(req.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Message: "login successful",
		Data:    user,
	})
}

func (us *userService) SaveAddress(c *fiber.Ctx) error {
	req := c.Locals("req").(request.AddressRequest)

	address := models.Address{
		Street:            req.Street,
		ProvinceID:        req.ProvinceID,
		ProvinceNameTH:    req.ProvinceNameTH,
		ProvinceNameEN:    req.ProvinceNameEN,
		DistrictID:        req.DistrictID,
		DistrictNameTH:    req.DistrictNameTH,
		DistrictNameEN:    req.DistrictNameEN,
		SubDistrictID:     req.SubDistrictID,
		SubDistrictNameTH: req.SubDistrictNameTH,
		SubDistrictNameEN: req.SubDistrictNameEN,
		PostalCode:        req.PostalCode,
		UserID:            req.UserID,
	}

	if err := us.userRepository.SaveAddress(&address); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	return c.Status(fiber.StatusCreated).JSON(response.SuccessResponse{
		Message: "address saved successfully",
		Data:    address,
	})
}

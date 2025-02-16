package validations

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type UserValiateImpl struct{}

type UserValidate interface {
	ValidateRegisterUser(c *fiber.Ctx) error
}

func NewUserValiateImpl() *UserValiateImpl {
	return &UserValiateImpl{}
}

func (u *UserValiateImpl) ValidateRegisterUser(c *fiber.Ctx) error {
	var req request.RegisterUser

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: err.Error(),
			Error:   err,
		})
	}

	c.Locals("req", req)
	return c.Next()
}

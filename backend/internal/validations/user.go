package validations

import (
	"fmt"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type UserValidateImpl struct{}

type UserValidate interface {
	ValidateRegisterUser(c *fiber.Ctx) error
	ValidateLoginUser(c *fiber.Ctx) error
	ValidateUpdateUser(c *fiber.Ctx) error
}

func NewUserValidate() *UserValidateImpl {
	return &UserValidateImpl{}
}

func (u *UserValidateImpl) ValidateRegisterUser(c *fiber.Ctx) error {
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

	if req.Username == "admin" {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "username cannot be admin",
		})
	}

	c.Locals("req", req)
	return c.Next()
}

func (u *UserValidateImpl) ValidateLoginUser(c *fiber.Ctx) error {
	var req request.LoginUser

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

func (u *UserValidateImpl) ValidateGetUsersRequest(c *fiber.Ctx) error {
	querys := request.PaginationQuery{}

	if err := validateCommonPaginationQuery(c, &querys); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: fmt.Sprintf("failed to validate request: %s", err.Error()),
		})
	}

	c.Locals("querys", querys)
	return c.Next()

}

func (u *UserValidateImpl) ValidateUpdateUser(c *fiber.Ctx) error {
	var req request.UpdateUser

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

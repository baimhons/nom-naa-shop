package validations

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type AddressValidate interface {
	ValidateCreateAddressRequest(req request.CreateAddressRequest) error
}

func NewAddressValidate() *AddressValidateImpl {
	return &AddressValidateImpl{}
}

type AddressValidateImpl struct{}

func (v *AddressValidateImpl) ValidateCreateAddressRequest(c *fiber.Ctx) error {
	var req request.CreateAddressRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid request",
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

func (v *AddressValidateImpl) ValidateUpdateAddressRequest(c *fiber.Ctx) error {
	var req request.UpdateAddressRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid request",
		})
	}

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: err.Error(),
		})
	}

	c.Locals("req", req)
	return c.Next()
}

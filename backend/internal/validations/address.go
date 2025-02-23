package validations

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
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

	validateCommonRequestBody(c, &req)

	c.Locals("req", req)
	return c.Next()
}

func (v *AddressValidateImpl) ValidateUpdateAddressRequest(c *fiber.Ctx) error {
	var req request.UpdateAddressRequest

	validateCommonRequestBody(c, &req)

	c.Locals("req", req)
	return c.Next()
}
